import { Component } from '@angular/core';
import { BracketService } from '../shared/services/bracket.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  constructor(private service: BracketService) {}

  ngOnInit() {
    this.service.addPageVisit('bracket/about', 'load').subscribe();
  }
}
