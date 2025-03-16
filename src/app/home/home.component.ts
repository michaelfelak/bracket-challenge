import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FooterComponent, SkyBoxModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
