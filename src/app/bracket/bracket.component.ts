import { Component, OnInit } from '@angular/core';
import { BracketService } from '../shared/services/bracket.service';

@Component({
  selector: 'app-bracket',
  templateUrl: './bracket.component.html',
  styleUrls: ['./bracket.component.scss']
})
export class BracketComponent implements OnInit {
  constructor(private service: BracketService) {}

  ngOnInit() {
    this.service.addPageVisit('bracket/bracket', 'load').subscribe();
  }
}
