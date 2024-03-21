import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SkyIconModule } from '@skyux/indicators';
import { BracketService } from '../shared/services/bracket.service';
import { Winner } from '../shared/models/winner.model';
import { FooterComponent } from '../shared/footer/footer.component';

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

  constructor(private titleService: Title, private service: BracketService) {
    this.titleService.setTitle('Bracket Challenge - Winners');
  }

  ngOnInit() {
    this.service.getWinners(this.bracketId).subscribe((result) => {
      this.winners = result;
    });
  }
}
