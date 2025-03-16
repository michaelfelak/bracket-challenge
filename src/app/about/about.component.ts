import { Component } from '@angular/core';
import { BracketService } from '../shared/services/bracket.service';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  constructor(private service: BracketService) {}
}
