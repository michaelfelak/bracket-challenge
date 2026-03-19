import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BracketService } from '../../shared/services/bracket.service';
import { SettingsService } from '../../shared/services/settings.service';
import { Seed } from '../../shared/models/seed';
import { ScenarioWinner, ScenarioLoser, ScenarioStandingsRecord, ScenarioStandingsRequest } from '../../shared/models/scenario';
import { WinnerByRound } from '../../shared/models/winner.model';

interface RoundTeams {
  round: number;
  teams: Seed[];
}

interface RegionSeeds {
  regionId: number;
  regionName: string;
  seeds: Seed[];
}

interface TeamState {
  seedId: number;
  round: number;
  status: 'available' | 'winner' | 'loser'; // available, winner, or loser
}

@Component({
  selector: 'app-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [BracketService, SettingsService]
})
export class SimulatorComponent implements OnInit {
  public year: number = 2026;
  public allSeeds: Seed[] = [];
  public regions: RegionSeeds[] = [];
  public allRoundTeams: RoundTeams[] = [];
  public standings: ScenarioStandingsRecord[] = [];
  public isLoading = true;
  public errorMessage = '';

  private winners: ScenarioWinner[] = [];
  private losers: ScenarioLoser[] = [];
  private teamStates: Map<string, 'winner' | 'loser'> = new Map(); // 'seedId-round' -> 'winner' | 'loser'

  constructor(
    private bracketService: BracketService,
    private settingsService: SettingsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['year']) {
        this.year = parseInt(params['year'], 10);
      }
    });
    this.loadScenario();
  }

  private loadScenario(): void {
    this.bracketService.getSeedList(this.settingsService.CURRENT_BRACKET_ID).subscribe({
      next: (seeds: Seed[]) => {
        this.allSeeds = seeds;
        this.organizeSeedsByRegion();
        this.generateAllRoundTeams();
        this.loadActualResults();
      },
      error: () => {
        this.errorMessage = 'Failed to load seeds.';
        this.isLoading = false;
      }
    });
  }

  private organizeSeedsByRegion(): void {
    const regionMap = new Map<number, string>();
    this.allSeeds.forEach(seed => {
      if (seed.region_id && seed.region_name) {
        regionMap.set(seed.region_id, seed.region_name);
      }
    });

    const regionIds = Array.from(regionMap.keys()).sort();
    this.regions = regionIds.map(regionId => ({
      regionId,
      regionName: regionMap.get(regionId) || 'Unknown',
      seeds: this.allSeeds.filter(s => s.region_id === regionId)
    }));
  }

  private generateAllRoundTeams(): void {
    this.allRoundTeams = [];

    // Determine max round to generate
    let maxRoundToGenerate = 1;
    this.teamStates.forEach((_, key) => {
      const round = parseInt(key.split('-')[1], 10);
      maxRoundToGenerate = Math.max(maxRoundToGenerate, round + 1);
    });
    maxRoundToGenerate = Math.min(6, maxRoundToGenerate);

    for (let round = 1; round <= maxRoundToGenerate; round++) {
      const teams: Seed[] = [];

      if (round === 1) {
        // Round 1: All seeds
        teams.push(...this.allSeeds);
      } else {
        // Later rounds: Winners from previous round that haven't lost yet
        const prevRound = this.allRoundTeams[round - 2];
        if (!prevRound) continue;

        prevRound.teams.forEach(team => {
          const teamKey = `${team.id}-${round - 1}`;
          const status = this.teamStates.get(teamKey);
          
          // If team won in previous round, it advances
          if (status === 'winner') {
            teams.push(team);
          }
        });
      }

      // Sort by seed number ascending
      teams.sort((a, b) => (a.seed_number || 0) - (b.seed_number || 0));

      if (teams.length > 0) {
        this.allRoundTeams.push({ round, teams });
      }
    }
  }

  private loadActualResults(): void {
    this.bracketService.getWinnersByRound(this.settingsService.CURRENT_BRACKET_ID).subscribe({
      next: (winners: WinnerByRound[] | null) => {
        this.winners = [];
        this.losers = [];
        this.teamStates.clear();

        if (winners && Array.isArray(winners)) {
          winners.forEach((w: WinnerByRound) => {
            if (w.seed_id !== undefined && w.round !== undefined) {
              this.winners.push({
                seed_id: w.seed_id,
                round: w.round,
                is_bonus: false
              });
              
              // Mark as winner in team states
              const teamKey = `${w.seed_id}-${w.round}`;
              this.teamStates.set(teamKey, 'winner');
            }
          });
        }

        this.generateAllRoundTeams();
        this.updateStandings();
        this.isLoading = false;
      },
      error: () => {
        this.generateAllRoundTeams();
        this.updateStandings();
        this.isLoading = false;
      }
    });
  }

  public selectTeam(seedId: number, round: number, action: 'winner' | 'loser'): void {
    const selectedTeam = this.allSeeds.find(s => s.id === seedId);
    const teamKey = `${seedId}-${round}`;
    
    if (action === 'winner') {
      this.teamStates.set(teamKey, 'winner');
      console.log(`[Simulator] Team marked as WINNER: ${selectedTeam?.school_name || 'Unknown'} (Seed #${selectedTeam?.seed_number}, Round ${round})`);
    } else if (action === 'loser') {
      this.teamStates.set(teamKey, 'loser');
      console.log(`[Simulator] Team marked as LOSER: ${selectedTeam?.school_name || 'Unknown'} (Seed #${selectedTeam?.seed_number}, Round ${round})`);
    }

    // Update winners/losers arrays from team states
    this.winners = [];
    this.losers = [];
    
    this.teamStates.forEach((status, key) => {
      const [seedIdStr, roundStr] = key.split('-');
      const roundNum = parseInt(roundStr, 10);
      const seedIdNum = parseInt(seedIdStr, 10);
      
      if (status === 'winner') {
        this.winners.push({
          seed_id: seedIdNum,
          round: roundNum,
          is_bonus: false
        });
      } else if (status === 'loser') {
        this.losers.push({
          seed_id: seedIdNum,
          round: roundNum
        });
      }
    });

    console.log(`[Simulator] Updated - Winners: ${this.winners.length}, Losers: ${this.losers.length}`);

    // Regenerate teams for later rounds since selections changed
    this.generateAllRoundTeams();
  }

  public calculateScenarioStandings(): void {
    console.log('[Simulator] Calculate button clicked - triggering standings calculation');
    console.log(`[Simulator] Winners array:`, this.winners);
    console.log(`[Simulator] Losers array:`, this.losers);
    this.updateStandings();
  }

  public getTeamStatus(seedId: number, round: number): 'available' | 'winner' | 'loser' {
    const teamKey = `${seedId}-${round}`;
    return this.teamStates.get(teamKey) || 'available';
  }

  public resetScenario(): void {
    this.teamStates.clear();
    this.winners = [];
    this.losers = [];
    this.standings = [];
    this.loadActualResults();
  }

  private updateStandings(): void {
    const request: ScenarioStandingsRequest = {
      winners: this.winners,
      losers: this.losers
    };

    console.log(`[Simulator] Recalculating Standings with ${this.winners.length} winners and ${this.losers.length} losers`);
    console.log('[Simulator] Request payload:', JSON.stringify(request));
    console.log('[Simulator] Year:', this.year);

    this.bracketService.getScenarioStandings(this.year, request).subscribe({
      next: (standings: ScenarioStandingsRecord[]) => {
        console.log(`[Simulator] API Response received - ${standings?.length || 0} entries`);
        console.log('[Simulator] Standings data:', standings);
        this.standings = standings || [];
        console.log(`[Simulator] Standings Updated - ${this.standings.length} entries calculated`);
      },
      error: (error: any) => {
        console.error('[Simulator] Error fetching standings:', error);
        console.error('[Simulator] Error status:', error.status);
        console.error('[Simulator] Error statusText:', error.statusText);
        console.error('[Simulator] Full error:', error);
        this.standings = [];
      }
    });
  }

  public abbreviateSchoolName(name: string): string {
    if (!name || name.length <= 12) return name || '';
    
    // Split by space and take first letters
    const parts = name.split(' ');
    if (parts.length > 1) {
      // Multi-word: try to fit first two words
      const firstTwo = parts.slice(0, 2).join(' ');
      if (firstTwo.length <= 12) return firstTwo;
      
      // If first two words are too long, just take first word
      const firstWord = parts[0];
      if (firstWord.length <= 12) return firstWord;
      return firstWord.substring(0, 12);
    }
    
    // Single long word: abbreviate to 12 chars
    return name.substring(0, 12);
  }

  public getRegionAbbreviation(regionName: string): string {
    if (!regionName) return '';
    
    const abbrev = regionName.substring(0, 1).toUpperCase();
    return abbrev;
  }
}
