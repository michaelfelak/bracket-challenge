import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BracketService } from '../shared/services/bracket.service';
import { AuthService } from '../shared/services/auth.service';
import { Entry } from '../shared/models/entry.model';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.scss']
})
export class MyProfileComponent implements OnInit {
  public entries: Entry[] = [];
  public isAuthenticated = false;
  public isLoading = true;
  public showError = false;
  public errorMsg: string = '';
  public username: string = '';
  public email: string = '';
  public totalEntries: number = 0;

  constructor(
    private titleService: Title,
    private bracketService: BracketService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle('My Profile - Bracket Challenge');

    this.isAuthenticated = this.authService.isAuthenticated();
    if (!this.isAuthenticated) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserInfo();
    this.loadUserEntries();
  }

  private loadUserInfo(): void {
    this.username = this.authService.getCurrentUsername() || '';
    this.email = this.authService.getCurrentUserEmail() || '';
  }

  private loadUserEntries(): void {
    this.bracketService.getUserEntries().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.totalEntries = entries.length;
        this.isLoading = false;
      },
      error: (error) => {
        this.handleError('Failed to load entries');
        
        this.isLoading = false;
      }
    });
  }

  public formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return date;
    }
  }

  private handleError(message: string): void {
    this.showError = true;
    this.errorMsg = message;
  }
}
