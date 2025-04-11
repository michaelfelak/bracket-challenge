import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BracketService } from '../shared/services/bracket.service';
import { SkyFlyoutService, SkyFlyoutInstance, SkyFlyoutConfig } from '@skyux/flyout';
import { StandingsFlyoutComponent } from './standings-flyout/standings-flyout.component';
import { StandingsFlyoutContext } from './standings-flyout/standings-flyout.context';
import { SkyWaitService } from '@skyux/indicators';
import { StandingsRecord } from '../shared/models/standings.model';
import { CommonModule } from '@angular/common';
import { FooterComponent } from '../shared/footer/footer.component';
import { StaticBracketService } from '../shared/services/static-bracket.service';

@Component({
  standalone: true,
  imports: [CommonModule, FooterComponent],
  selector: 'app-standings',
  templateUrl: './standings.component.html',
  styleUrls: ['./standings.component.scss'],
})
export class StandingsComponent implements OnInit {
  private useStatic = true;

  public standings: StandingsRecord[] = [];
  public flyout: SkyFlyoutInstance<any> | undefined;
  public showStandingsLink = false;
  public currentYear!: number;
  public years: number[] = [2025, 2024];

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
    private waitSvc: SkyWaitService,
    private staticService: StaticBracketService
  ) {}

  public ngOnInit() {
    this.titleService.setTitle('Bracket Challenge - Standings');

    this.service.getSettings().subscribe((settings) => {
      this.showStandingsLink = settings.flyout_enabled && !this.useStatic;
      this.currentYear = settings.current_year;
      this.retrieveStandings(this.currentYear);
    });
  }

  public retrieveStandings(year: number) {
    if (this.useStatic) {
      this.standings = this.staticService.getStandings();
      this.assignRank();
    } else {
      this.retrieveLiveStandings(year);
    }
  }

  public retrieveLiveStandings(year: number) {
    // this.waitSvc.beginNonBlockingPageWait();

    this.service.getStandings(year).subscribe((result: StandingsRecord[]) => {
      this.standings = result;
      this.assignRank();
      console.log(this.standings);
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
    this.currentYear = year;
    this.retrieveStandings(year);
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
