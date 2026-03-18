import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { WinnerByRound } from 'src/app/shared/models/winner.model';
import { Seed } from 'src/app/shared/models/seed';
import { AddWinnerRequest } from 'src/app/shared/models/winner.model';

interface TeamWithStatus extends WinnerByRound {
  isWinner?: boolean;
}

interface RoundData {
  round: number;
  roundName: string;
  isCollapsed: boolean;
  regionData: Map<string, TeamWithStatus[]>;
}

@Component({
  selector: 'app-select-winners',
  standalone: true,
  imports: [CommonModule, SkyIconModule],
  templateUrl: './select-winners.component.html',
  styleUrls: ['./select-winners.component.scss'],
})
export class SelectWinnersComponent implements OnInit {
  @Input()
  public bracketId = 5;

  public roundsData: RoundData[] = [];
  public allTeams: WinnerByRound[] = [];
  public isAdmin: boolean = false;
  public isLoading = true;
  public errorMessage = '';

  public get effectiveBracketId(): number {
    return this.bracketId || this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private service: BracketService,
    private settingsService: SettingsService,
    private authService: AuthService,
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    if (!this.isAdmin) {
      return; // Only admins can access this
    }
    this.loadBracketData();
  }

  private loadBracketData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Loading bracket for ID:', this.effectiveBracketId);

    // Load seeds for Round 1
    this.service.getSeedList(this.effectiveBracketId).subscribe({
      next: (seeds) => {
        console.log('Seeds loaded:', seeds);
        console.log('Sample seed regions:', seeds.slice(0, 10).map(s => ({ name: s.school_name, region: s.region_name, seed: s.seed_number })));
        
        // Generate Round 1 matchups from all seeds
        const round1Teams = this.service.generateRound1Matchups(seeds);
        console.log('Round 1 teams generated:', round1Teams.length);
        console.log('Sample round1 teams:', round1Teams.slice(0, 10).map(t => ({ name: t.school_name, region: t.region_name, seed: t.seed_number })));
        
        // Load existing winners for rounds 2-6
        this.service.getWinnersByRound(this.effectiveBracketId).subscribe({
          next: (winnersData) => {
            console.log('Winners data received (raw):', winnersData);
            console.log('Winners data type:', typeof winnersData);
            console.log('Winners data is array:', Array.isArray(winnersData));
            
            // Handle null or undefined
            const winnersList = winnersData || [];
            console.log('Winners list after null check:', winnersList);
            
            if (winnersList.length > 0) {
              console.log('Sample winners with rounds:', winnersList.slice(0, 5).map(w => ({ name: w.school_name, round: w.round, seedId: w.seed_id })));
              console.log('FULL winner object:', JSON.stringify(winnersList[0]));
            }
            
            // Create a Set of winning seed IDs for quick lookup
            const winningSeedIds = new Set<number>();
            if (winnersList) {
              winnersList.forEach(winner => {
                if (winner.seed_id) {
                  winningSeedIds.add(winner.seed_id);
                }
              });
            }
            console.log('Winning seed IDs:', Array.from(winningSeedIds));
            
            // Mark Round 1 teams that are winners
            const round1TeamsWithWinners = round1Teams.map(team => ({
              ...team,
              round: undefined, // Ensure Round 1 seeds don't have a round property
              isWinner: team.seed_id ? winningSeedIds.has(team.seed_id) : false
            }));
            
            // Keep Round 1 and winners separate for proper filtering
            this.allTeams = round1TeamsWithWinners;
            this.organizeBracketByRoundAndRegion([...round1TeamsWithWinners, ...winnersList], winningSeedIds);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading winners:', error);
            this.errorMessage = 'Failed to load tournament data.';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading seeds:', error);
        this.errorMessage = 'Failed to load bracket seeds. Check the bracket ID.';
        this.isLoading = false;
      }
    });
  }

  private organizeBracketByRoundAndRegion(allTeams: WinnerByRound[], winningSeedIds: Set<number>): void {
    this.roundsData = [];
    const roundNames = [
      'Round 1 (Field of 64)',
      'Round 2 (Round of 32)',
      'Round 3 (Sweet 16)',
      'Round 4 (Elite 8)',
      'Round 5 (Final Four)',
      'Round 6 (Championship)',
    ];
    const regions = ['East', 'South', 'Midwest', 'West'];

    for (let round = 1; round <= 6; round++) {
      const regionData = new Map<string, TeamWithStatus[]>();
      regions.forEach((region) => regionData.set(region, []));

      // Get teams for this round
      // Round 1: Show initial seeds that haven't been marked as winners anywhere
      // Round N>1: Show teams that won in round N-1
      const teamsInRound = allTeams.filter((t) => {
        if (round === 1) {
          // Show seeds that are not yet in any winners list
          return !winningSeedIds.has(t.seed_id || 0);
        } else {
          return t.round === round - 1;
        }
      });

      // Group by region and sort by seed
      const teamsByRegion = new Map<string, TeamWithStatus[]>();
      regions.forEach((region) => teamsByRegion.set(region, []));

      teamsInRound.forEach((team) => {
        const region = team.region_name || 'East';
        if (!teamsByRegion.has(region)) {
          teamsByRegion.set(region, []);
        }
        // Mark teams that are winners
        const teamWithWinner: TeamWithStatus = {
          ...team,
          isWinner: team.seed_id ? winningSeedIds.has(team.seed_id) : false
        };
        teamsByRegion.get(region)!.push(teamWithWinner);
      });

      // Sort teams by seed number in ascending order
      teamsByRegion.forEach((teams, region) => {
        teams.sort((a, b) => (a.seed_number || 0) - (b.seed_number || 0));
        regionData.set(region, teams);
      });

      this.roundsData.push({
        round: round,
        roundName: roundNames[round - 1],
        isCollapsed: round > 1,
        regionData: regionData,
      });
    }
  }

  public toggleRound(roundData: RoundData): void {
    roundData.isCollapsed = !roundData.isCollapsed;
  }

  public markAsWinner(team: TeamWithStatus, round: number): void {
    if (!team.seed_id || !team.school_name) {
      console.warn(`[SELECT-WINNERS] Cannot mark as winner: invalid team data`);
      return;
    }

    const winnerRequest: AddWinnerRequest = {
      bracket_id: this.effectiveBracketId,
      seed_id: team.seed_id,
      round: round,
    };

    console.log(`[SELECT-WINNERS] Marking ${team.school_name} as winner in round ${round}`);
    
    this.service.addWinner(winnerRequest).subscribe({
      next: () => {
        console.log(`[SELECT-WINNERS] Winner added for ${team.school_name}`);
        this.refreshData();
      },
      error: (error) => {
        console.error(`[SELECT-WINNERS] Error marking winner:`, error);
        alert('Error marking winner: ' + error.message);
      }
    });
  }

  public markAsLoser(team: TeamWithStatus, round: number): void {
    if (!team.seed_id || !team.school_name) {
      console.warn(`[SELECT-WINNERS] Cannot mark as loser: invalid team data`);
      return;
    }

    const loserRequest: AddWinnerRequest = {
      bracket_id: this.effectiveBracketId,
      seed_id: team.seed_id,
      round: round,
    };

    console.log(`[SELECT-WINNERS] Marking ${team.school_name} as loser`);
    this.service.addLoser(loserRequest).subscribe({
      next: () => {
        console.log(`[SELECT-WINNERS] Loser marked for ${team.school_name}`);
        this.refreshData();
      },
      error: (error) => {
        console.error(`[SELECT-WINNERS] Error marking loser:`, error);
        alert('Error marking loser: ' + error.message);
      }
    });
  }

  public refreshData(): void {
    console.log(`[SELECT-WINNERS] Refreshing bracket data`);
    this.loadBracketData();
  }
}
