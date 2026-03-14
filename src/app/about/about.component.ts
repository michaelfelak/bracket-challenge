import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from '../shared/services/bracket.service';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  public showRules = true;

  constructor(private service: BracketService) {}

  public toggleRules(): void {
    this.showRules = !this.showRules;
  }
}
