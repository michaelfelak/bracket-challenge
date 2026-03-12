import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { SkyBoxModule } from '@skyux/layout';
import { BlogDisplayComponent } from '../blog/blog-display.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FooterComponent, SkyBoxModule, BlogDisplayComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
