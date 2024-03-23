import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, SkyBoxModule],
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent {

}
