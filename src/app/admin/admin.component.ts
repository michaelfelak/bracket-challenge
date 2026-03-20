import { Component, OnInit } from '@angular/core';
import { AddRecordComponent } from './add-record/add-record.component';
import { BracketService } from '../shared/services/bracket.service';
import { FeedbackService } from '../shared/services/feedback.service';
import { SettingsService } from '../shared/services/settings.service';
import { AuthService } from '../shared/services/auth.service';
import { LoggerService } from '../shared/services/logger.service';
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
import { BlogPostGeneratorComponent } from './blog-post-generator/blog-post-generator.component';
import { UsageAnalyticsComponent } from './usage-analytics/usage-analytics.component';

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
    BlogPostGeneratorComponent,
    UsageAnalyticsComponent,
  ],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public settings: Settings | undefined;
  public brackets: Bracket[] = [];
  public existingSeeds: Seed[] = [];
  public activeTab: string = 'winners';
  public selectedBracketIdLocal: number = 0;
  public isAdmin: boolean = false;
  public unaddressedFeedbackCount: number = 0;
  public draggedTabId: string | null = null;
  
  private readonly TAB_ORDER_KEY = 'admin_tab_order';
  private readonly ACTIVE_TAB_KEY = 'admin_active_tab';

  public tabs: Tab[] = [
    { id: 'winners', label: 'Select Winners' },
    { id: 'entries', label: 'Entries' },
    { id: 'paid-status', label: 'Paid Status' },
    { id: 'blog', label: 'Blog' },
    { id: 'usage', label: 'Usage Analytics' },
    { id: 'feedback', label: 'User Feedback' },
    { id: 'settings', label: 'Settings' },
  ];

  public get selectedBracketId() {
    return this.selectedBracketIdLocal || this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private service: BracketService,
    private feedbackService: FeedbackService,
    private settingsService: SettingsService,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    this.selectedBracketIdLocal = this.settingsService.CURRENT_BRACKET_ID;
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    this.loadTabOrder();
    this.loadActiveTab();
    this.getSettings();
    this.loadUnaddressedFeedbackCount();
    this.service.getBracketList().subscribe((result) => {
      this.brackets = result;
      if (result.length > 0 && this.selectedBracketIdLocal === 0) {
        this.selectedBracketIdLocal = result[0].id || 0;
      }
    });
  }

  public selectTab(tabId: string): void {
    this.activeTab = tabId;
    this.saveActiveTab();
  }

  public onUnaddressedFeedbackCountChange(count: number): void {
    this.unaddressedFeedbackCount = count;
    const feedbackTab = this.tabs.find(tab => tab.id === 'feedback');
    if (feedbackTab) {
      feedbackTab.label = count > 0 ? `User Feedback (${count})` : 'User Feedback';
    }
  }

  public onTabDragStart(event: DragEvent, tabId: string): void {
    this.draggedTabId = tabId;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  public onTabDragOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  public onTabDrop(event: DragEvent, targetTabId: string): void {
    event.preventDefault();
    if (!this.draggedTabId || this.draggedTabId === targetTabId) {
      this.draggedTabId = null;
      return;
    }

    const draggedIndex = this.tabs.findIndex(tab => tab.id === this.draggedTabId);
    const targetIndex = this.tabs.findIndex(tab => tab.id === targetTabId);

    if (draggedIndex > -1 && targetIndex > -1) {
      [this.tabs[draggedIndex], this.tabs[targetIndex]] = [this.tabs[targetIndex], this.tabs[draggedIndex]];
      this.saveTabOrder();
    }

    this.draggedTabId = null;
  }

  public onTabDragEnd(): void {
    this.draggedTabId = null;
  }

  private saveTabOrder(): void {
    const tabOrder = this.tabs.map(tab => tab.id);
    localStorage.setItem(this.TAB_ORDER_KEY, JSON.stringify(tabOrder));
  }

  private loadTabOrder(): void {
    const savedOrder = localStorage.getItem(this.TAB_ORDER_KEY);
    if (savedOrder) {
      try {
        const tabIds = JSON.parse(savedOrder) as string[];
        const tabMap = new Map(this.tabs.map(tab => [tab.id, tab]));
        this.tabs = tabIds
          .filter(id => tabMap.has(id))
          .map(id => tabMap.get(id) as Tab)
          .concat(this.tabs.filter(tab => !tabIds.includes(tab.id)));
      } catch (error) {
        this.logger.error('Error loading tab order:', error);
      }
    }
  }

  private saveActiveTab(): void {
    localStorage.setItem(this.ACTIVE_TAB_KEY, this.activeTab);
  }

  private loadActiveTab(): void {
    const savedTab = localStorage.getItem(this.ACTIVE_TAB_KEY);
    if (savedTab && this.tabs.some(tab => tab.id === savedTab)) {
      this.activeTab = savedTab;
    }
  }

  private loadUnaddressedFeedbackCount(): void {
    this.feedbackService.getAllFeedback().subscribe({
      next: (feedback) => {
        const unaddressedCount = feedback.filter(item => !item.is_addressed).length;
        this.onUnaddressedFeedbackCountChange(unaddressedCount);
      },
      error: (err) => {
        this.logger.error('Error loading feedback count:', err);
      }
    });
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

