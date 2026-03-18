import { Component, OnInit } from '@angular/core';
import { WinnersFlyoutContext } from './winners-flyout.context';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { SkyIconModule } from '@skyux/indicators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SkyFlyoutService } from '@skyux/flyout';
import { SeedPicks } from 'src/app/shared/models/pick.model';
import { AddWinnerRequest } from 'src/app/shared/models/winner.model';

@Component({
  standalone: true,
  imports: [CommonModule, SkyIconModule, FormsModule],
  templateUrl: './winners-flyout.component.html',
  styleUrls: ['./winners-flyout.component.scss'],
})
export class WinnersFlyoutComponent implements OnInit {
  public picks: SeedPicks[] = [];
  public schoolName!: string;
  public count = 0;
  public currentRound = 1;
  public isLoading = false;

  public get bracketId() {
    return this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    public context: WinnersFlyoutContext,
    private service: BracketService,
    private settingsService: SettingsService,
    private flyoutService: SkyFlyoutService,
  ) {}

  public ngOnInit() {
    this.currentRound = this.context.round || 1;
    this.service.getPicksBySchool(this.context.seedId).subscribe((result) => {
      this.picks = result;
      this.schoolName = this.context.schoolName;
      this.count = result.length;
    });
  }

  public addWinner(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    // Winner advances to the NEXT round, so round + 1
    const advancingRound = this.currentRound + 1;
    
    const request: AddWinnerRequest = {
      bracket_id: this.bracketId,
      seed_id: parseInt(this.context.seedId),
      round: advancingRound,
    };

    console.log(`[WINNERS-FLYOUT] Adding winner:`, request, {
      schoolName: this.context.schoolName,
      opponent: this.context.opponentSchoolName,
      advancingToRound: advancingRound
    });

    this.service.addWinner(request).subscribe({
      next: () => {
        console.log(`[WINNERS-FLYOUT] Winner added successfully for ${this.context.schoolName} advancing to round ${advancingRound}`);
        // After winner is added, automatically mark the opponent as loser
        if (this.context.opponentSeedId) {
          this.markOpponentAsLoser();
        } else {
          this.isLoading = false;
          this.flyoutService.close();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error(`[WINNERS-FLYOUT] Error adding winner:`, error);
        alert('Error adding winner: ' + error.message);
      },
    });
  }

  private markOpponentAsLoser(): void {
    const loserRequest: AddWinnerRequest = {
      bracket_id: this.bracketId,
      seed_id: parseInt(this.context.opponentSeedId!),
      round: this.currentRound,
    };

    console.log(`[WINNERS-FLYOUT] Marking opponent as loser:`, loserRequest, {
      opponentName: this.context.opponentSchoolName
    });

    this.service.addLoser(loserRequest).subscribe({
      next: () => {
        console.log(`[WINNERS-FLYOUT] Opponent marked as loser successfully for ${this.context.opponentSchoolName}`);
        this.isLoading = false;
        this.flyoutService.close();
        console.log(`[WINNERS-FLYOUT] Flyout closing, ready to refresh`);
      },
      error: (error) => {
        this.isLoading = false;
        console.error(`[WINNERS-FLYOUT] Error marking loser:`, error);
        alert('Error marking loser: ' + error.message);
      },
    });
  }
}
