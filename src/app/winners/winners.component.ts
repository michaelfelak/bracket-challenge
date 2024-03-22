import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from '../shared/services/bracket.service';
import { Winner } from '../shared/models/winner.model';
import { FooterComponent } from '../shared/footer/footer.component';
import { WinnersFlyoutContext } from './winners-flyout/winners-flyout.context';
import { SkyFlyoutService, SkyFlyoutConfig, SkyFlyoutInstance } from '@skyux/flyout';
import { StandingsFlyoutComponent } from '../standings/standings-flyout/standings-flyout.component';
import { StandingsFlyoutContext } from '../standings/standings-flyout/standings-flyout.context';
import { WinnersFlyoutComponent } from './winners-flyout/winners-flyout.component';

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [CommonModule, FooterComponent, SkyIconModule],
  templateUrl: './winners.component.html',
  styleUrls: ['./winners.component.scss'],
})
export class WinnersComponent implements OnInit {
  public bracketId = 3;
  public winners: Winner[] = [];

  public flyout: SkyFlyoutInstance<any> | undefined;

  constructor(
    private titleService: Title,
    private service: BracketService,
    private flyoutService: SkyFlyoutService
  ) {
    this.titleService.setTitle('Bracket Challenge - Winners');
  }

  ngOnInit() {
    this.service.getWinners(this.bracketId).subscribe((result) => {
      this.winners = result;
    });
  }

  public onNameClick(id: string, schoolName: string) {
    let record: WinnersFlyoutContext = new WinnersFlyoutContext();
    record.seedId = id!.toString();
    record.schoolName = schoolName;

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
}
