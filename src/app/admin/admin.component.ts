import { Component, OnInit } from '@angular/core';
import { AddRecordComponent } from './add-record/add-record.component';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { AuthService } from '../shared/services/auth.service';
import { BracketGridComponent } from './bracket-grid/bracket-grid.component';
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
    BracketGridComponent,
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
  public activeTab: string = 'entries';
  public selectedBracketIdLocal: number = 0;
  public isAdmin: boolean = false;

  public tabs: Tab[] = [
    { id: 'entries', label: 'Entries' },
    { id: 'paid-status', label: 'Paid Status' },
    { id: 'winners', label: 'Select Winners' },
    { id: 'blog', label: 'Blog' },
    { id: 'settings', label: 'Settings' },
  ];

  public get selectedBracketId() {
    return this.selectedBracketIdLocal || this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private service: BracketService,
    private settingsService: SettingsService,
    private authService: AuthService
  ) {
    this.selectedBracketIdLocal = this.settingsService.CURRENT_BRACKET_ID;
    this.isAdmin = this.authService.isAdmin();
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
    if (this.isAdmin) return; // Admins always have entry enabled
    this.service.updateEntryEnabled().subscribe({
      next: () => {
        this.getSettings();
      }
    });
  }

  public toggleFlyoutVisible() {
    if (this.isAdmin) return; // Admins always have flyout enabled
    this.service.updateFlyoutEnabled().subscribe({
      next: () => {
        this.getSettings();
      }
    });
  }

  private getSettings() {
    this.service.getSettings().subscribe({
      next: (settings) => {
        this.settings = settings;
      }
    });
  }
}

