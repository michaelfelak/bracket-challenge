import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from '../shared/services/bracket.service';
import { Winner } from '../shared/models/winner.model';
import { FooterComponent } from '../shared/footer/footer.component';
import { WinnersFlyoutContext } from './winners-flyout/winners-flyout.context';
import { SkyFlyoutService, SkyFlyoutConfig, SkyFlyoutInstance } from '@skyux/flyout';
import { WinnersFlyoutComponent } from './winners-flyout/winners-flyout.component';
import { StaticBracketService } from '../shared/services/static-bracket.service';

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [CommonModule, FooterComponent, SkyIconModule],
  templateUrl: './winners.component.html',
  styleUrls: ['./winners.component.scss'],
})
export class WinnersComponent implements OnInit {
  public useStatic = true;
  public bracketId = 4;
  public winners: Winner[] = [];

  public flyout: SkyFlyoutInstance<any> | undefined;

  public sortRegion = false;
  public sortSeedNumber = false;
  public sortSchool = false;
  public sortPoints = false;
  public sortWins = false;
  public sortEntriesSelected = false;
  public sortBonusSelected = false;
  public sortLost = false;

  public regionDesc = false;
  public seedNumberDesc = false;
  public schoolDesc = false;
  public pointsDesc = false;
  public winsDesc = false;
  public entriesSelectedDesc = false;
  public bonusSelectedDesc = false;
  public lostDesc = false;

  constructor(
    private titleService: Title,
    private service: BracketService,
    private flyoutService: SkyFlyoutService,
    private staticService: StaticBracketService
  ) {
    this.titleService.setTitle('Bracket Challenge - Winners');
  }

  ngOnInit() {
    console.log(this.useStatic);
    if (this.useStatic) {
      this.winners = this.staticService.getPoints();
    } else {
      this.service.getWinners(this.bracketId).subscribe((result) => {
        this.winners = result;
      });
    }
  }

  public onNameClick(id: string, schoolName: string) {
    const record: WinnersFlyoutContext = {
      seedId: id!.toString(),
      schoolName: schoolName,
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

    // this.flyout.closed.subscribe(() => {
    //   this.flyout = undefined;
    // });
  }

  private resetSort() {
    this.sortPoints =
      this.sortBonusSelected =
      this.sortEntriesSelected =
      this.sortLost =
      this.sortRegion =
      this.sortSchool =
      this.sortSeedNumber =
      this.sortWins =
        false;
  }

  public sortBySeedNumber() {
    this.resetSort();
    this.sortSeedNumber = true;

    this.seedNumberDesc = !this.seedNumberDesc;

    if (this.winners) {
      if (this.seedNumberDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.seed_number! > b.seed_number! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.seed_number! < b.seed_number! ? -1 : 1;
        });
      }
    }
  }

  public sortBySchool() {
    this.resetSort();
    this.sortSchool = true;

    this.schoolDesc = !this.schoolDesc;

    if (this.winners) {
      if (this.schoolDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.school_name! > b.school_name! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.school_name! < b.school_name! ? -1 : 1;
        });
      }
    }
  }
  public sortByPoints() {
    this.resetSort();
    this.sortPoints = true;

    this.pointsDesc = !this.pointsDesc;

    if (this.winners) {
      if (this.pointsDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.points! > b.points! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.points! < b.points! ? -1 : 1;
        });
      }
    }
  }
  public sortByWins() {
    this.resetSort();
    this.sortWins = true;

    this.winsDesc = !this.winsDesc;

    if (this.winners) {
      if (this.winsDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.wins! > b.wins! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.wins! < b.wins! ? -1 : 1;
        });
      }
    }
  }
  public sortByEntriesSelected() {
    this.resetSort();
    this.sortEntriesSelected = true;

    this.entriesSelectedDesc = !this.entriesSelectedDesc;

    if (this.winners) {
      if (this.entriesSelectedDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.entries_selected! > b.entries_selected! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.entries_selected! < b.entries_selected! ? -1 : 1;
        });
      }
    }
  }
  public sortByBonusSelected() {
    this.resetSort();
    this.sortBonusSelected = true;

    this.bonusSelectedDesc = !this.bonusSelectedDesc;

    if (this.winners) {
      if (this.bonusSelectedDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.bonus_selected! > b.bonus_selected! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.bonus_selected! < b.bonus_selected! ? -1 : 1;
        });
      }
    }
  }
  public sortByLost() {
    this.resetSort();
    this.sortLost = true;

    this.lostDesc = !this.lostDesc;

    if (this.winners) {
      if (this.lostDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.eliminated! > b.eliminated! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.eliminated! < b.eliminated! ? -1 : 1;
        });
      }
    }
  }

  public sortByRegion() {
    this.resetSort();
    this.sortRegion = true;

    this.regionDesc = !this.regionDesc;

    if (this.winners) {
      if (this.regionDesc) {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.region_name! > b.region_name! ? -1 : 1;
        });
      } else {
        this.winners.sort((a: Winner, b: Winner) => {
          return a.region_name! < b.region_name! ? -1 : 1;
        });
      }
    }
  }
}
