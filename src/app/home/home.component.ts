import { Component } from '@angular/core';
import { FooterComponent } from '../shared/footer/footer.component';
import { SkyBoxModule } from '@skyux/layout';
import { BlogDisplayComponent } from '../blog/blog-display.component';
import { FeedbackFormComponent } from '../shared/components/feedback-form/feedback-form.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [FooterComponent, SkyBoxModule, BlogDisplayComponent, FeedbackFormComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
