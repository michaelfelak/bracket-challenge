import { Component, OnInit } from '@angular/core';
import { WinnersFlyoutContext } from './winners-flyout.context';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SkyIconModule } from '@skyux/indicators';
import { CommonModule } from '@angular/common';
import { SeedPicks } from 'src/app/shared/models/pick.model';

@Component({
  standalone: true,
  imports: [CommonModule, SkyIconModule],
  templateUrl: './winners-flyout.component.html',
  styleUrls: ['./winners-flyout.component.scss'],
})
export class WinnersFlyoutComponent implements OnInit {
  public picks: SeedPicks[] = [];
  public schoolName!: string;
  public count = 0;

  constructor(public context: WinnersFlyoutContext, private service: BracketService) {}
      
  public ngOnInit() {
    this.service.getPicksBySchool(this.context.seedId).subscribe((result) => {
      this.picks = result;
      this.schoolName = this.context.schoolName;
      this.count = result.length;
    });
  }
}
