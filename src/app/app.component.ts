import { Component } from '@angular/core';
import { BracketService } from './shared/services/bracket.service';
import { AuthService } from './shared/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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

  constructor(
    private service: BracketService,
    private authService: AuthService,
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

    // Check admin status on initialization
    this.updateAdminStatus();
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

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  closeUserDropdown(): void {
    this.showUserDropdown = false;
  }
}
