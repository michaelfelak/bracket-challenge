import { Component, OnInit } from '@angular/core';
import { AddRecordComponent } from './add-record/add-record.component';
import { BracketService } from '../shared/services/bracket.service';
import { AddSeedComponent } from './add-seed/add-seed.component';
import { Bracket } from '../shared/models/bracket';
import { ReactiveFormsModule } from '@angular/forms';
import { SkyPageModule } from '@skyux/pages';
import { Seed } from '../shared/models/seed';
import { CommonModule } from '@angular/common';
import { SelectWinnersComponent } from './select-winners/select-winners.component';
import { SkyRepeaterModule } from '@skyux/lists';
import { PaidStatusComponent } from './paid-status/paid-status.component';
import { Settings } from '../shared/models/settings.model';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AddRecordComponent,
    AddSeedComponent,
    SkyPageModule,
    SelectWinnersComponent,
    SkyRepeaterModule,
    PaidStatusComponent,
  ],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public selectedBracketId: number = 3;

  public settings: Settings | undefined;
  public brackets: Bracket[] = [];
  public existingSeeds: Seed[] = [];

  constructor(private service: BracketService) {}

  ngOnInit() {
    this.getSettings();
    this.service.getBracketList().subscribe((result) => {
      this.brackets = result;
    });
  }

  public toggleEntryVisible() {
    this.service.updateEntryEnabled().subscribe(() => {
      this.getSettings();
    });
  }
  public toggleFlyoutVisible() {
    this.service.updateFlyoutEnabled().subscribe(() => {
      this.getSettings();
    });
  }

  private getSettings() {
    this.service.getSettings().subscribe((settings) => {
      this.settings = settings;
    });
  }
}
