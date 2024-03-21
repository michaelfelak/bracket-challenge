import { Component, OnInit } from '@angular/core';
import { BracketService } from '../shared/services/bracket.service';
import { FooterComponent } from '../shared/footer/footer.component';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FooterComponent, SkyBoxModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  constructor(private service: BracketService) {}

  ngOnInit() {
    this.service.addPageVisit('bracket/home', 'load').subscribe();
  }
}
