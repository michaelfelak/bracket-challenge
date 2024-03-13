import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { Seed } from 'src/app/shared/models/seed';
import { SkyTokensModule } from '@skyux/indicators';

@Component({
  selector: 'app-select-winners',
  standalone: true,
  imports: [CommonModule, SkyTokensModule],
  templateUrl: './select-winners.component.html',
  styleUrls: ['./select-winners.component.scss'],
})
export class SelectWinnersComponent implements OnInit {
  @Input()
  public bracketId!: number;

  public seedList: Seed[] | undefined;
  constructor(private service: BracketService) {}

  public ngOnInit() {
    // console.log(this.bracketId);
    this.service.getSeedList(this.bracketId!).subscribe((result) => {
      // console.log(result);
      this.seedList = result;
    });
  }
}
