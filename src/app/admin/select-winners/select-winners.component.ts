import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { WinnerByRound } from 'src/app/shared/models/winner.model';
import { WinnersFlyoutContext } from 'src/app/winners/winners-flyout/winners-flyout.context';
import { SkyFlyoutService, SkyFlyoutConfig, SkyFlyoutInstance } from '@skyux/flyout';
import { WinnersFlyoutComponent } from 'src/app/winners/winners-flyout/winners-flyout.component';

interface Matchup {
  team1: WinnerByRound;
  team2: WinnerByRound;
  round: number;
  region: string;
}

interface RoundData {
  round: number;
  roundName: string;
  isCollapsed: boolean;
  regionData: Map<string, Matchup[]>;
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

  public flyout: SkyFlyoutInstance<any> | undefined;

  public get effectiveBracketId(): number {
    return this.bracketId || this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private service: BracketService,
    private settingsService: SettingsService,
    private authService: AuthService,
    private flyoutService: SkyFlyoutService,
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
    console.log('Loading winners for bracket ID:', this.effectiveBracketId);
    this.service.getWinnersByRound(this.effectiveBracketId).subscribe({
      next: (result) => {
        console.log('Winners data received:', result);
        if (!result || !Array.isArray(result)) {
          this.allTeams = [];
          this.roundsData = [];
          this.isLoading = false;
          return;
        }
        this.allTeams = result;
        this.organizeBracketByRoundAndRegion(result);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading winners:', error);
        this.errorMessage = 'Failed to load bracket data. Check the bracket ID.';
        this.isLoading = false;
      }
    });
  }

  private organizeBracketByRoundAndRegion(allTeams: WinnerByRound[]): void {
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
      const regionData = new Map<string, Matchup[]>();
      regions.forEach((region) => regionData.set(region, []));

      const teamsInRound = allTeams.filter((t) => (t.round || 1) === round);

      const teamsByRegion = new Map<string, WinnerByRound[]>();
      regions.forEach((region) => teamsByRegion.set(region, []));

      teamsInRound.forEach((team) => {
        const region = team.region_name || 'East';
        if (!teamsByRegion.has(region)) {
          teamsByRegion.set(region, []);
        }
        teamsByRegion.get(region)!.push(team);
      });

      teamsByRegion.forEach((teams, region) => {
        const matchups: Matchup[] = [];
        for (let i = 0; i < teams.length; i += 2) {
          if (i + 1 < teams.length) {
            matchups.push({
              team1: teams[i],
              team2: teams[i + 1],
              round: round,
              region: region,
            });
          }
        }
        regionData.set(region, matchups);
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

  public onTeamClick(team: WinnerByRound, opponent: WinnerByRound, round: number): void {
    if (!team.seed_id || !team.school_name) return;

    const record: WinnersFlyoutContext = {
      seedId: team.seed_id.toString(),
      schoolName: team.school_name,
      round: round,
      opponentSeedId: opponent.seed_id?.toString(),
      opponentSchoolName: opponent.school_name,
    };

    const flyoutConfig: SkyFlyoutConfig = {
      providers: [
        {
          provide: WinnersFlyoutContext,
          useValue: record,
        },
      ],
      defaultWidth: 500,
    };
    this.flyout = this.flyoutService.open(WinnersFlyoutComponent, flyoutConfig);

    // Refresh data when flyout closes
    if (this.flyout) {
      this.flyout.closed.subscribe(() => {
        this.refreshData();
      });
    }
  }

  public refreshData(): void {
    this.loadBracketData();
  }
}
