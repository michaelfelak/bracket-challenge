import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BracketService } from '../../shared/services/bracket.service';
import { SettingsService } from '../../shared/services/settings.service';
import { LoggerService } from '../../shared/services/logger.service';
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
    private logger: LoggerService,
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
    const winnersObservable = this.bracketService.getWinnersByRound(this.settingsService.CURRENT_BRACKET_ID);
    const losersObservable = this.bracketService.getLosersByRound(this.settingsService.CURRENT_BRACKET_ID);
    
    this.logger.debug(`[Simulator] Bracket ID: ${this.settingsService.CURRENT_BRACKET_ID}`);
    this.logger.debug('[Simulator] Fetching winners and losers...');

    forkJoin({
      winners: winnersObservable,
      losers: losersObservable
    }).subscribe({
      next: (results: { winners: WinnerByRound[] | null; losers: WinnerByRound[] | null }) => {
        this.logger.debug('[Simulator] Loaded results from API');
        this.logger.debug('[Simulator] Winners from API:', results.winners);
        this.logger.debug('[Simulator] Losers from API:', results.losers);
        
        this.winners = [];
        this.losers = [];
        this.teamStates.clear();

        // Process winners
        if (results.winners && Array.isArray(results.winners)) {
          this.logger.debug(`[Simulator] Processing ${results.winners.length} winners`);
          results.winners.forEach((w: WinnerByRound) => {
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

        // Process losers
        if (results.losers && Array.isArray(results.losers)) {
          this.logger.debug(`[Simulator] Processing ${results.losers.length} losers`);
          results.losers.forEach((l: WinnerByRound) => {
            this.logger.debug(`[Simulator] Loser details - seed_id: ${l.seed_id}, round: ${l.round}`);
            if (l.seed_id !== undefined && l.round !== undefined) {
              this.losers.push({
                seed_id: l.seed_id,
                round: l.round
              });
              
              // Mark as loser in team states
              const teamKey = `${l.seed_id}-${l.round}`;
              this.teamStates.set(teamKey, 'loser');
              this.logger.debug(`[Simulator] Marked ${teamKey} as loser`);
            }
          });
        } else {
          this.logger.debug('[Simulator] No losers returned from API');
        }

        this.logger.debug(`[Simulator] Final state - Winners: ${this.winners.length}, Losers: ${this.losers.length}`);
        this.logger.debug('[Simulator] Team states map:', Array.from(this.teamStates.entries()));

        this.generateAllRoundTeams();
        this.updateStandings();
        this.isLoading = false;
      },
      error: (error) => {
        this.logger.error('[Simulator] Error in forkJoin:', error);
        this.logger.error('[Simulator] Error details:', error);
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
      this.logger.debug(`[Simulator] Team marked as WINNER: ${selectedTeam?.school_name || 'Unknown'} (Seed #${selectedTeam?.seed_number}, Round ${round})`);
    } else if (action === 'loser') {
      this.teamStates.set(teamKey, 'loser');
      this.logger.debug(`[Simulator] Team marked as LOSER: ${selectedTeam?.school_name || 'Unknown'} (Seed #${selectedTeam?.seed_number}, Round ${round})`);
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

    this.logger.debug(`[Simulator] Updated - Winners: ${this.winners.length}, Losers: ${this.losers.length}`);

    // Regenerate teams for later rounds since selections changed
    this.generateAllRoundTeams();
  }

  public calculateScenarioStandings(): void {
    this.logger.debug('[Simulator] Calculate button clicked - triggering standings calculation');
    this.logger.debug(`[Simulator] Winners array:`, this.winners);
    this.logger.debug(`[Simulator] Losers array:`, this.losers);
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

    this.logger.debug(`[Simulator] Recalculating Standings with ${this.winners.length} winners and ${this.losers.length} losers`);
    this.logger.debug('[Simulator] Request payload:', JSON.stringify(request));
    this.logger.debug('[Simulator] Year:', this.year);

    this.bracketService.getScenarioStandings(this.year, request).subscribe({
      next: (standings: ScenarioStandingsRecord[]) => {
        this.logger.debug(`[Simulator] API Response received - ${standings?.length || 0} entries`);
        this.logger.debug('[Simulator] Standings data:', standings);
        this.standings = standings || [];
        this.logger.debug(`[Simulator] Standings Updated - ${this.standings.length} entries calculated`);
      },
      error: (error: any) => {
        this.logger.error('[Simulator] Error fetching standings:', error);
        this.logger.error('[Simulator] Error status:', error.status);
        this.logger.error('[Simulator] Error statusText:', error.statusText);
        this.logger.error('[Simulator] Full error:', error);
        this.standings = [];
      }
    });
  }

  public abbreviateSchoolName(name: string): string {
    // Don't abbreviate - allow text wrapping
    return name || '';
  }

  public getRegionAbbreviation(regionName: string): string {
    if (!regionName) return '';
    
    const abbrev = regionName.substring(0, 1).toUpperCase();
    return abbrev;
  }
}
