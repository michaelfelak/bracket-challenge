import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BracketService } from '../shared/services/bracket.service';
import { SkyFlyoutService, SkyFlyoutInstance, SkyFlyoutConfig } from '@skyux/flyout';
import { StandingsFlyoutComponent } from './standings-flyout/standings-flyout.component';
import { StandingsFlyoutContext } from './standings-flyout/standings-flyout.context';
import { StandingsRecord } from '../shared/models/standings.model';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { StaticBracketService } from '../shared/services/static-bracket.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FooterComponent, FormsModule],
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
})
export class StandingsComponent implements OnInit {
  private useStatic = false;

  public standings: StandingsRecord[] = [];
  public flyout: SkyFlyoutInstance<any> | undefined;
  public showStandingsLink = false;
  public currentYear: number = 2026;
  public years: number[] = [2026, 2025, 2024];

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
    private flyoutService: SkyFlyoutService,
    private staticService: StaticBracketService
  ) {}

  public ngOnInit() {
    this.titleService.setTitle('Bracket Challenge - Standings');
    console.log(`[Standings] Component initialized, available years:`, this.years);

    if (this.useStatic) {
      console.log(`[Standings] Using static data`);
      this.currentYear = this.years[0]; // Initialize to first year for static data
      this.loadStandings();
    } else {
      console.log(`[Standings] Fetching settings from service`);
      this.service.getSettings().subscribe({
        next: (settings) => {
          console.log(`[Standings] Settings retrieved:`, settings);
          this.showStandingsLink = settings.flyout_enabled && !this.useStatic;
          this.currentYear = settings.current_year;
          console.log(`[Standings] Set current year from bc_settings to: ${this.currentYear}`);
          this.retrieveLiveStandings(this.currentYear);
        },
        error: (error) => {
          console.error(`[Standings] Error fetching settings:`, error);
          // Fallback to first year if settings fetch fails
          this.currentYear = this.years[0];
          this.retrieveLiveStandings(this.currentYear);
        }
      });
    }
  }

  private loadStandings() {
    console.log(`[Standings] Loading static standings`);
    this.standings = this.staticService.getStandings();
    console.log(`[Standings] Static standings loaded, count: ${this.standings ? this.standings.length : 'null'}`);
    this.assignRank();
  }

  private retrieveLiveStandings(year: number) {
    // this.waitSvc.beginNonBlockingPageWait();
    console.log(`[Standings] Fetching standings for year: ${year}`);

    this.service.getStandings(year).subscribe({
      next: (result: StandingsRecord[]) => {
        console.log(`[Standings] Successfully retrieved standings for ${year}:`, result);
        console.log(`[Standings] Number of records: ${result ? result.length : 'null'}`);
        this.standings = result;
        this.assignRank();
      },
      error: (error) => {
        console.error(`[Standings] Error fetching standings for year ${year}:`, error);
        this.standings = [];
      }
    });
  }

  public assignRank() {
    console.log(`[Standings] Assigning ranks, standings count: ${this.standings ? this.standings.length : 'null'}`);
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
      console.log(`[Standings] Ranking complete, top entry:`, this.standings[0]);
    } else {
      console.warn(`[Standings] No standings to rank`);
    }
  }

  public onNameClick(id: string | undefined) {
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
    console.log(`[Standings] Year changed from ${this.currentYear} to ${year}`);
    this.currentYear = year;
    // Reset sorting when changing years
    this.sortCurrentPoints = false;
    this.sortCorrectPicks = false;
    this.sortRemainingPoints = false;
    this.sortPossiblePoints = false;
    
    if (this.useStatic) {
      console.log(`[Standings] Loading static standings for ${year}`);
      this.loadStandings();
    } else {
      console.log(`[Standings] Loading live standings for ${year}`);
      this.retrieveLiveStandings(year);
    }
  }

  public sortByCurrentPoints() {
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
}
