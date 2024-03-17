import { Component, OnInit } from '@angular/core';
import { StandingsFlyoutContext } from './standings-flyout.context';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { CompletedEntry } from 'src/app/shared/models/standings.model';
import { SkyIconModule } from '@skyux/indicators';
import { CommonModule } from '@angular/common';
import { PickModel } from 'src/app/shared/models/pick.model';

@Component({
  standalone: true,
  imports: [CommonModule, SkyIconModule],
  selector: 'app-standings-flyout',
  templateUrl: './standings-flyout.component.html',
  styleUrls: ['./standings-flyout.component.scss'],
})
export class StandingsFlyoutComponent implements OnInit {
  public entry!: CompletedEntry;
  public picks: PickModel[] = [];
  public name!: string;
  public totalPoints: number = 0;

  constructor(public context: StandingsFlyoutContext, private service: BracketService) {}

  public ngOnInit() {
    this.service.getStandingsEntry(this.context.entryId).subscribe((result: any) => {
      this.entry = result;
      this.name = this.entry.entry_name;
      this.picks = this.entry.picks;
      this.picks.forEach((a: PickModel) => {
        if (a.earned_points) {
          this.totalPoints += a.earned_points;
        }
      });
    });

    this.service.addPageVisit('bracket/completedentry/' + this.context.entryId, 'load').subscribe();
  }
}
