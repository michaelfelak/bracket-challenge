import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { WinnerByRound } from 'src/app/shared/models/winner.model';
import { Seed } from 'src/app/shared/models/seed';
import { AddWinnerRequest } from 'src/app/shared/models/winner.model';

interface TeamWithStatus extends WinnerByRound {
  isWinner?: boolean;
  isLoser?: boolean;
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
    private logger: LoggerService,
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
    this.logger.debug('Loading bracket for ID:', this.effectiveBracketId);

    // Load seeds for Round 1
    this.service.getSeedList(this.effectiveBracketId).subscribe({
      next: (seeds) => {
        this.logger.debug('Seeds loaded:', seeds);
        this.logger.debug('Sample seed regions:', seeds.slice(0, 10).map(s => ({ name: s.school_name, region: s.region_name, seed: s.seed_number })));
        
        // Generate Round 1 matchups from all seeds
        const round1Teams = this.service.generateRound1Matchups(seeds);
        this.logger.debug('Round 1 teams generated:', round1Teams.length);
        this.logger.debug('Sample round1 teams:', round1Teams.slice(0, 10).map(t => ({ name: t.school_name, region: t.region_name, seed: t.seed_number })));
        
        // Load existing winners and losers 
        const winnersObservable = this.service.getWinnersByRound(this.effectiveBracketId);
        const losersObservable = this.service.getLosersByRound(this.effectiveBracketId);

        Promise.all([
          winnersObservable.toPromise(),
          losersObservable.toPromise()
        ]).then(([winnersData, losersData]) => {
          this.logger.debug('Winners data received (raw):', winnersData);
          this.logger.debug('Losers data received (raw):', losersData);
          
          // Handle null or undefined
          const winnersList = winnersData || [];
          const losersList = losersData || [];
          
          this.logger.debug('Winners list after null check:', winnersList);
          this.logger.debug('Losers list after null check:', losersList);
          
          // Create Sets for quick lookup
          const winningSeedIds = new Set<number>();
          const losingSeedIds = new Set<number>();
          
          winnersList.forEach(winner => {
            if (winner.seed_id) {
              winningSeedIds.add(winner.seed_id);
            }
          });
          
          losersList.forEach(loser => {
            if (loser.seed_id) {
              losingSeedIds.add(loser.seed_id);
            }
          });
          
          this.logger.debug('Winning seed IDs:', Array.from(winningSeedIds));
          this.logger.debug('Losing seed IDs:', Array.from(losingSeedIds));
          
          // Mark Round 1 teams that are winners or losers
          const round1TeamsWithStatus = round1Teams.map(team => ({
            ...team,
            round: undefined, // Ensure Round 1 seeds don't have a round property
            isWinner: team.seed_id ? winningSeedIds.has(team.seed_id) : false,
            isLoser: team.seed_id ? losingSeedIds.has(team.seed_id) : false
          }));
          
          // Keep Round 1 and winners separate for proper filtering
          this.allTeams = round1TeamsWithStatus;
          this.organizeBracketByRoundAndRegion([...round1TeamsWithStatus, ...winnersData || []], winningSeedIds, losingSeedIds);
          this.isLoading = false;
        }).catch(error => {
          this.logger.error('Error loading winners/losers:', error);
          this.errorMessage = 'Failed to load tournament data.';
          this.isLoading = false;
        });
      },
      error: (error) => {
        this.logger.error('Error loading seeds:', error);
        this.errorMessage = 'Failed to load bracket seeds. Check the bracket ID.';
        this.isLoading = false;
      }
    });
  }

  private organizeBracketByRoundAndRegion(allTeams: WinnerByRound[], winningSeedIds: Set<number>, losingSeedIds: Set<number>): void {
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
        // Mark teams that are winners or losers
        const teamWithStatus: TeamWithStatus = {
          ...team,
          isWinner: team.seed_id ? winningSeedIds.has(team.seed_id) : false,
          isLoser: team.seed_id ? losingSeedIds.has(team.seed_id) : false
        };
        teamsByRegion.get(region)!.push(teamWithStatus);
      });

      // Sort teams by: 1) loser status (losers at bottom), 2) seed number
      teamsByRegion.forEach((teams, region) => {
        teams.sort((a, b) => {
          // Losers go to bottom
          if (a.isLoser && !b.isLoser) return 1;
          if (!a.isLoser && b.isLoser) return -1;
          // Sort by seed number
          return (a.seed_number || 0) - (b.seed_number || 0);
        });
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
      this.logger.warn(`[SELECT-WINNERS] Cannot mark as winner: invalid team data`);
      return;
    }

    const winnerRequest: AddWinnerRequest = {
      bracket_id: this.effectiveBracketId,
      seed_id: team.seed_id,
      round: round,
    };

    this.logger.debug(`[SELECT-WINNERS] Marking ${team.school_name} as winner in round ${round}`);
    
    this.service.addWinner(winnerRequest).subscribe({
      next: () => {
        this.logger.debug(`[SELECT-WINNERS] Winner added for ${team.school_name}`);
        this.refreshData();
      },
      error: (error) => {
        this.logger.error(`[SELECT-WINNERS] Error marking winner:`, error);
        alert('Error marking winner: ' + error.message);
      }
    });
  }

  public markAsLoser(team: TeamWithStatus, round: number): void {
    if (!team.seed_id || !team.school_name) {
      this.logger.warn(`[SELECT-WINNERS] Cannot mark as loser: invalid team data`);
      return;
    }

    const loserRequest: AddWinnerRequest = {
      bracket_id: this.effectiveBracketId,
      seed_id: team.seed_id,
      round: round,
    };

    this.logger.debug(`[SELECT-WINNERS] Marking ${team.school_name} as loser`);
    this.service.addLoser(loserRequest).subscribe({
      next: () => {
        this.logger.debug(`[SELECT-WINNERS] Loser marked for ${team.school_name}`);
        this.refreshData();
      },
      error: (error) => {
        this.logger.error(`[SELECT-WINNERS] Error marking loser:`, error);
        alert('Error marking loser: ' + error.message);
      }
    });
  }

  public refreshData(): void {
    this.logger.debug(`[SELECT-WINNERS] Refreshing bracket data`);
    this.loadBracketData();
  }
}
