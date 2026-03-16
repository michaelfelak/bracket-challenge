import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-winners',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select-winners.component.html',
  styleUrls: ['./select-winners.component.scss'],
})
export class SelectWinnersComponent implements OnInit {
  @Input()
  public bracketId = 0;

  constructor() {}

  public ngOnInit() {
    // Bracket tree handles all logic
  }
}
