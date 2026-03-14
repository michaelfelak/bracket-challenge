import { Component, OnInit } from '@angular/core';
import { AddRecordComponent } from './add-record/add-record.component';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { AddSeedComponent } from './add-seed/add-seed.component';
import { Bracket } from '../shared/models/bracket';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SkyPageModule } from '@skyux/pages';
import { Seed } from '../shared/models/seed';
import { CommonModule } from '@angular/common';
import { SelectWinnersComponent } from './select-winners/select-winners.component';
import { SkyRepeaterModule } from '@skyux/lists';
import { PaidStatusComponent } from './paid-status/paid-status.component';
import { Settings } from '../shared/models/settings.model';
import { AddBlogComponent } from './add-blog/add-blog.component';

interface Tab {
  id: string;
  label: string;
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AddRecordComponent,
    AddSeedComponent,
    SkyPageModule,
    SelectWinnersComponent,
    SkyRepeaterModule,
    PaidStatusComponent,
    AddBlogComponent,
  ],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public settings: Settings | undefined;
  public brackets: Bracket[] = [];
  public existingSeeds: Seed[] = [];
  public activeTab: string = 'settings';
  public selectedBracketIdLocal: number = 0;

  public tabs: Tab[] = [
    { id: 'settings', label: 'Settings' },
    { id: 'entries', label: 'Entries' },
    { id: 'winners', label: 'Select Winners' },
    { id: 'blog', label: 'Blog' },
  ];

  public get selectedBracketId() {
    return this.selectedBracketIdLocal || this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(private service: BracketService, private settingsService: SettingsService) {
    this.selectedBracketIdLocal = this.settingsService.CURRENT_BRACKET_ID;
  }

  ngOnInit() {
    this.getSettings();
    this.service.getBracketList().subscribe((result) => {
      this.brackets = result;
      if (result.length > 0 && this.selectedBracketIdLocal === 0) {
        this.selectedBracketIdLocal = result[0].id || 0;
      }
    });
  }

  public selectTab(tabId: string): void {
    this.activeTab = tabId;
  }

  public onBracketSelect(): void {
    this.getSettings();
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

