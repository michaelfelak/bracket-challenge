import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyBoxModule } from '@skyux/layout';

@Component({
  selector: 'app-recap-64',
  standalone: true,
  imports: [CommonModule, SkyBoxModule],
  templateUrl: './recap-64.component.html',
  styleUrls: ['../recap.component.scss'],
})
export class Recap64Component {}
