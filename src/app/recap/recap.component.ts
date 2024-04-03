import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recap64Component } from './recap-64/recap-64.component';
import { Recap32Component } from './recap-32/recap-32.component';
import { Recap4Component } from './recap-4/recap-4.component';
import { RecapFinalComponent } from './recap-final/recap-final.component';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  selector: 'app-recap',
  standalone: true,
  imports: [
    CommonModule,
    Recap64Component,
    Recap32Component,
    Recap4Component,
    RecapFinalComponent,
    SkyBoxModule,
  ],
  templateUrl: './recap.component.html',
  styleUrls: ['./recap.component.scss'],
})
export class RecapComponent {}
