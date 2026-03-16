import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { WinnerByRound } from '../shared/models/winner.model';
import { WinnersFlyoutContext } from './winners-flyout/winners-flyout.context';
import { SkyFlyoutService, SkyFlyoutConfig, SkyFlyoutInstance } from '@skyux/flyout';
import { WinnersFlyoutComponent } from './winners-flyout/winners-flyout.component';

@Component({
  selector: 'app-winners',
  standalone: true,
  imports: [CommonModule, SkyIconModule],
  templateUrl: './winners.component.html',
  styleUrls: ['./winners.component.scss'],
})
export class WinnersComponent implements OnInit {
  public winnersByRound: Map<number, WinnerByRound[]> = new Map();
  public roundNumbers: number[] = [];

  public get bracketId() {
    return this.settingsService.CURRENT_BRACKET_ID;
  }

  public flyout: SkyFlyoutInstance<any> | undefined;

  constructor(
    private titleService: Title,
    private service: BracketService,
    private flyoutService: SkyFlyoutService,
    private settingsService: SettingsService,
  ) {
    this.titleService.setTitle('Bracket Challenge - Select Winners');
  }

  ngOnInit() {
    this.service.getWinnersByRound(this.bracketId).subscribe((result) => {
      this.organizeWinnersByRound(result);
    });
  }

  private organizeWinnersByRound(winners: WinnerByRound[]): void {
    this.winnersByRound.clear();

    // First, check if there are any actual winners selected (teams with won_in_previous_round = true for round > 1)
    const hasWinners = winners.some(w => w.round && w.round > 1 && w.won_in_previous_round);
    
    // Group winners by round and filter appropriately
    for (const winner of winners) {
      const round = winner.round || 1;

      // Always show Round 1
      if (round === 1) {
        if (!this.winnersByRound.has(round)) {
          this.winnersByRound.set(round, []);
        }
        this.winnersByRound.get(round)!.push(winner);
      } else if (hasWinners && winner.won_in_previous_round) {
        // Only show future rounds if winners have been selected AND this team won
        if (!this.winnersByRound.has(round)) {
          this.winnersByRound.set(round, []);
        }
        this.winnersByRound.get(round)!.push(winner);
      }
    }

    // Get sorted round numbers
    this.roundNumbers = Array.from(this.winnersByRound.keys()).sort((a, b) => a - b);
  }

  public onNameClick(id: string | undefined, schoolName: string | undefined, round: number) {
    if (!id || !schoolName) return;

    const record: WinnersFlyoutContext = {
      seedId: id.toString(),
      schoolName: schoolName,
      round: round,
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
  }
}
