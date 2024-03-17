import { Component, OnInit } from '@angular/core';
import { BracketService } from '../shared/services/bracket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private service: BracketService) {}

  ngOnInit() {
    this.service.addPageVisit('bracket/home', 'load').subscribe();
  }
}
