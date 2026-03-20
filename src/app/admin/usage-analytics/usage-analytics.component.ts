import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS } from '../../shared/constants/api.constants';
import { AuthService } from '../../shared/services/auth.service';
import { environment } from '../../../environments/environment';

interface EventSummary {
  totalEvents: number;
  uniqueUsers: number;
  uniquePages: number;
  uniqueEventTypes: number;
}

interface UserActivity {
  userId: string;
  eventCount: number;
  lastEvent: string;
}

interface DailyTrendRecord {
  day: string;
  count: number;
}

interface AnalyticsData {
  summary: EventSummary;
  eventCounts: Record<string, number>;
  userActivity: UserActivity[];
  dailyTrends: DailyTrendRecord[];
}

@Component({
  standalone: true,
  selector: 'app-usage-analytics',
  imports: [CommonModule],
  templateUrl: './usage-analytics.component.html',
  styleUrls: ['./usage-analytics.component.scss'],
})
export class UsageAnalyticsComponent implements OnInit {
  public analyticsData: AnalyticsData | null = null;
  public isLoading = false;
  public error: string | null = null;
  public selectedDay: number = 6; // Saturday by default (0=Sunday, 1=Monday, ..., 6=Saturday)
  public selectedDateDisplay: string = '';
  public Math = Math;
  public hideCurrentUser = true; // Filter off by default
  public currentUser: string | null = null;
  
  private baseUrl: string;
  private isDevelopment = environment.production === false && localStorage.getItem('ENVIRONMENT') === 'development';

  /**
   * Log only in development mode (requires ENVIRONMENT=development in localStorage)
   */
  private devLog(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(message, data || '');
    }
  }

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrl = API_CONSTANTS.BRACKET_API_URL;
  }

  public ngOnInit(): void {
    // Get current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.selectDay(6); // Load Saturday by default
  }

  /**
   * Select a specific day of the week and load analytics for that day
   */
  public selectDay(dayOfWeek: number): void {
    this.selectedDay = dayOfWeek;
    
    // Find the most recent occurrence of this day of the week
    const today = new Date();
    const todayDay = today.getDay();
    
    let daysBack = (todayDay - dayOfWeek + 7) % 7;
    if (daysBack === 0 && todayDay !== dayOfWeek) {
      daysBack = 7; // If it's today but not matching, go back a week
    }
    
    const selectedDate = new Date(today);
    selectedDate.setDate(selectedDate.getDate() - daysBack);
    
    this.selectedDateDisplay = `Data for ${this.getDayName(dayOfWeek)}, ${this.formatDateDisplay(selectedDate)}`;
    this.loadAnalyticsForDate(selectedDate);
  }

  /**
   * Get day name from day of week number
   */
  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  /**
   * Format date for display (e.g., "December 14, 2025")
   */
  private formatDateDisplay(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Load analytics data for a specific date
   */
  private loadAnalyticsForDate(selectedDate: Date): void {
    this.loadAnalytics(selectedDate, selectedDate);
  }

  /**
   * Load analytics data for the specified date range
   */
  private loadAnalytics(startDate: Date, endDate: Date): void {
    this.isLoading = true;
    this.error = null;

    const startDateStr = this.formatDate(startDate);
    const endDateStr = this.formatDate(endDate);

    const analyticsUrl = `${this.baseUrl}events/analytics?start_date=${startDateStr}&end_date=${endDateStr}`;
    this.devLog(`[UsageAnalyticsComponent] Loading analytics from ${analyticsUrl}`);

    this.http.get<AnalyticsData>(analyticsUrl).subscribe({
      next: (data) => {
        this.devLog(`[UsageAnalyticsComponent] Analytics data loaded successfully:`, data);
        this.analyticsData = data;
        this.isLoading = false;
      },
      error: (err) => {
        if (this.isDevelopment) {
          console.error(`[UsageAnalyticsComponent] Failed to load analytics:`, err);
        }
        const errorMsg = err.error?.message || err.message || 'Unknown error';
        this.error = `Failed to load analytics: ${errorMsg}`;
        this.isLoading = false;
      }
    });
  }



  /**
   * Format date as YYYY-MM-DD for API
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get top N items from an array
   */
  public topItems<T>(items: T[], n: number): T[] {
    return items.slice(0, n);
  }

  /**
   * Get filtered user activity based on current filter
   */
  public getFilteredUserActivity(users: UserActivity[]): UserActivity[] {
    if (!this.hideCurrentUser || !this.currentUser) {
      return users;
    }
    return users.filter(user => user.userId.toLowerCase() !== this.currentUser?.toLowerCase());
  }

  /**
   * Toggle showing/hiding current user
   */
  public toggleHideCurrentUser(): void {
    this.hideCurrentUser = !this.hideCurrentUser;
  }

  /**
   * Get max event count for bar width calculation
   */
  public getMaxEventCount(): number {
    if (!this.analyticsData || !this.analyticsData.eventCounts) return 0;
    return Math.max(...Object.values(this.analyticsData.eventCounts));
  }

  /**
   * Get max trend count for bar width calculation
   */
  public getMaxTrendCount(): number {
    if (!this.analyticsData || !this.analyticsData.dailyTrends) return 0;
    return Math.max(...this.analyticsData.dailyTrends.map(t => t.count));
  }
}
