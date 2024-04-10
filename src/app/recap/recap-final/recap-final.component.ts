import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  selector: 'app-recap-final',
  standalone: true,
  imports: [CommonModule, SkyBoxModule],
  templateUrl: './recap-final.component.html',
  styleUrls: ['../recap.component.scss'],
})
export class RecapFinalComponent {}
