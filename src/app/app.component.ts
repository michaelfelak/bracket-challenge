import { Component } from '@angular/core';
import { BracketService } from './shared/services/bracket.service';
import { AuthService } from './shared/services/auth.service';
import { TrackingService } from './shared/services/tracking.service';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  public entriesLocked = false;
  public isAdmin = false;
  public isAuthenticated = false;
  public currentUser$: Observable<string | null>;
  public menuOpen = false;
  public showUserDropdown = false;
  public appSwitcherOpen = false;
  private isDevelopment = !environment.production && localStorage.getItem('ENVIRONMENT') === 'development';

  /**
   * Log only in development mode (requires ENVIRONMENT=development in localStorage)
   */
  private devLog(message: string): void {
    if (this.isDevelopment) {
      console.log(message);
    }
  }

  constructor(
    private service: BracketService,
    private authService: AuthService,
    private trackingService: TrackingService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
    this.isAuthenticated = this.authService.isAuthenticated();

    // Subscribe to auth status changes
    this.authService.currentUser$.subscribe(() => {
      this.isAuthenticated = this.authService.isAuthenticated();
      this.updateAdminStatus();
    });

    this.service.getSettings().subscribe((result) => {
      this.entriesLocked = result.entry_enabled;
    });

    // Track page navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const eventType = this.getEventTypeFromRoute(event.urlAfterRedirects);
        this.devLog(`[AppComponent] Event tracked: ${eventType} (url: ${event.urlAfterRedirects})`);
        this.trackingService.trackEvent(eventType);
      });

    // Check admin status on initialization
    this.updateAdminStatus();
  }

  /**
   * Map URL to specific event type
   */
  private getEventTypeFromRoute(url: string): string {
    const segments = url.split('/').filter(s => s);
    if (segments.length === 0) return 'home_view';
    
    const page = segments[0];
    const eventTypeMap: { [key: string]: string } = {
      'about': 'about_view',
      'standings': 'standings_view',
      'points': 'points_view',
      'home': 'home_view',
      'my-profile': 'my_profile_view',
      'simulator': 'simulator_view',
      'admin': 'admin_view',
      'scenario': 'scenario_view',
      'winners': 'winners_view',
      'scores': 'scores_view'
    };
    
    return eventTypeMap[page] || `${page}_view`;
  }

  /**
   * Update admin status based on logged-in user
   */
  private updateAdminStatus(): void {
    this.isAdmin = this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
    this.showUserDropdown = false;
    this.router.navigate(['/']);
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  navigateToMyProfile(): void {
    this.showUserDropdown = false;
    this.router.navigate(['/my-profile']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleAppSwitcher(): void {
    this.appSwitcherOpen = !this.appSwitcherOpen;
  }

  closeAppSwitcher(): void {
    this.appSwitcherOpen = false;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }
}
