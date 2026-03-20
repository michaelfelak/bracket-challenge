import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BracketService } from '../shared/services/bracket.service';
import { TrackingService } from '../shared/services/tracking.service';
import { SkyFlyoutService, SkyFlyoutInstance, SkyFlyoutConfig } from '@skyux/flyout';
import { StandingsFlyoutComponent } from './standings-flyout/standings-flyout.component';
import { StandingsFlyoutContext } from './standings-flyout/standings-flyout.context';
import { StandingsRecord } from '../shared/models/standings.model';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { SkyIconModule } from '@skyux/indicators';

@Component({
  standalone: true,
  imports: [CommonModule, FooterComponent, FormsModule, SkyIconModule],
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
})
export class StandingsComponent implements OnInit {
  public standings: StandingsRecord[] = [];
  public userEntries: StandingsRecord[] = [];
  public flyout: SkyFlyoutInstance<any> | undefined;
  public showStandingsLink = false;
  public currentYear: number = 2026;
  public years: number[] = [2026, 2025, 2024];
  public currentUserId: string | null = null;
  public isLoggedIn = false;

  public sortCurrentPoints = false;
  public sortRemainingPoints = false;
  public sortPossiblePoints = false;
  public sortCorrectPicks = false;

  public currentPointsDesc = false;
  public remainingPointsDesc = false;
  public possiblePointsDesc = false;
  public correctPicksDesc = false;

  constructor(
    private titleService: Title,
    private service: BracketService,
    private trackingService: TrackingService,
    private flyoutService: SkyFlyoutService,
    private authService: AuthService
  ) {
    // Check if user is logged in and get current user ID
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.currentUserId = userId;
      this.isLoggedIn = true;
    }
  }

  public ngOnInit() {
    this.titleService.setTitle('Bracket Challenge - Standings');
    this.trackingService.trackEvent('standings_view', { year: this.currentYear });

    this.service.getSettings().subscribe({
      next: (settings) => {
        // Allow admins to always view the flyout, otherwise respect the setting
        this.showStandingsLink = this.authService.isAdmin() || settings.flyout_enabled;
        this.currentYear = settings.current_year;
        this.retrieveLiveStandings(this.currentYear);
      },
      error: (_error) => {
        this.currentYear = this.years[0];
        this.retrieveLiveStandings(this.currentYear);
      }
    });
  }

  private retrieveLiveStandings(year: number) {
    // this.waitSvc.beginNonBlockingPageWait();

    this.service.getStandings(year).subscribe({
      next: (result: StandingsRecord[]) => {
        this.standings = result;
        
        // Filter user entries if logged in
        if (this.isLoggedIn && this.currentUserId) {
          const userIdNum = parseInt(this.currentUserId, 10);
          this.userEntries = result.filter(
            (entry) => entry.user_id === userIdNum
          );
        }
        
        this.assignRank();
      },
      error: (error) => {
        
        this.standings = [];
      }
    });
  }

  public assignRank() {
    if (this.standings) {
      this.standings = this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
        if (a.current_points! > b.current_points!) {
          return -1;
        }

        if (a.current_points! < b.current_points!) {
          return 1;
        }

        return 0;
      });

      let rank = 1;
      let nextRank = 1;
      let lastPoints = -1;
      this.standings.forEach(function (entry) {
        if (entry.current_points === lastPoints) {
          entry.rank = rank;
          nextRank += 1;
        } else {
          rank = nextRank;
          nextRank += 1;
          entry.rank = rank;
        }
        lastPoints = entry.current_points!;
      });
    }
  }

  public onNameClick(id: string | undefined, userId?: number | undefined) {
    this.trackingService.trackEvent('standings_flyout_opened', { 
      entryId: id,
      userId: userId
    });
    
    const record: StandingsFlyoutContext = {
      entryId: id!.toString(),
    };

    const flyoutConfig: SkyFlyoutConfig = {
      providers: [
        {
          provide: StandingsFlyoutContext,
          useValue: record,
        },
      ],
      defaultWidth: 500,
    };
    this.flyout = this.flyoutService.open(StandingsFlyoutComponent, flyoutConfig);

    this.flyout.closed.subscribe(() => {
      this.flyout = undefined;
    });
  }

  public updateYear(year: number) {
    this.trackingService.trackEvent('standings_year_changed', { 
      year: year,
      previousYear: this.currentYear
    });
    
    this.currentYear = year;
    this.sortCurrentPoints = false;
    this.sortCorrectPicks = false;
    this.sortRemainingPoints = false;
    this.sortPossiblePoints = false;
    
    this.retrieveLiveStandings(year);
  }

  public sortByCurrentPoints() {
    this.trackingService.trackEvent('standings_sort_changed', { 
      sortBy: 'current_points',
      descending: !this.currentPointsDesc
    });
    
    this.sortCurrentPoints = true;
    this.sortRemainingPoints = this.sortPossiblePoints = this.sortCorrectPicks = false;
    this.currentPointsDesc = !this.currentPointsDesc;

    if (this.standings) {
      if (this.currentPointsDesc) {
        this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
          return a.current_points! > b.current_points! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
          return a.current_points! < b.current_points! ? -1 : 1;
        });
      }
    }
  }

  public sortByCorrectPicks() {
    this.trackingService.trackEvent('standings_sort_changed', { 
      sortBy: 'correct_picks',
      descending: !this.correctPicksDesc
    });
    
    this.sortCorrectPicks = true;
    this.sortRemainingPoints = this.sortPossiblePoints = this.sortCurrentPoints = false;
    this.correctPicksDesc = !this.correctPicksDesc;

    if (this.standings) {
      if (this.correctPicksDesc) {
        this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
          return a.win_total! > b.win_total! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
          return a.win_total! < b.win_total! ? -1 : 1;
        });
      }
    }
  }

  public sortByRemainingPoints() {
    this.trackingService.trackEvent('standings_sort_changed', { 
      sortBy: 'remaining_points',
      descending: !this.remainingPointsDesc
    });
    
    this.sortRemainingPoints = true;
    this.sortPossiblePoints = this.sortCorrectPicks = this.sortCurrentPoints = false;
    this.remainingPointsDesc = !this.remainingPointsDesc;

    if (this.standings) {
      if (this.remainingPointsDesc) {
        this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
          return a.teams_remaining! > b.teams_remaining! ? -1 : 1;
        });
      } else {
        this.standings.sort((a: StandingsRecord, b: StandingsRecord) => {
          return a.teams_remaining! < b.teams_remaining! ? -1 : 1;
        });
      }
    }
  }

  public onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    const src = img.src || 'unknown';
    const alt = img.alt || 'unknown';
    console.warn(`[Bracket Challenge] Superfan logo not found - School: ${alt}, Path: ${src}`);
    img.style.display = 'none';
  }
}
