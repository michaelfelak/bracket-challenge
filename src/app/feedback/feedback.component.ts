import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FeedbackService } from '../shared/services/feedback.service';
import { AuthService } from '../shared/services/auth.service';
import { SettingsService } from '../shared/services/settings.service';
import { LoggerService } from '../shared/services/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, FooterComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit, OnDestroy {
  feedbackForm: FormGroup;
  isAuthenticated = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  placeholderText = `• What feedback do you have?
• Are there any features you would like to see?
• Is something not working as expected?`;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private logger: LoggerService
  ) {
    this.feedbackForm = this.fb.group({
      feedback_text: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    // Subscribe to auth changes to update isAuthenticated dynamically
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isAuthenticated = this.authService.isAuthenticated();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitFeedback(): void {
    if (!this.feedbackForm.valid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const bracketId = this.settingsService.CURRENT_BRACKET_ID;

    this.feedbackService.submitFeedback(bracketId, this.feedbackForm.value).subscribe({
      next: () => {
        this.successMessage = 'Thank you for your feedback!';
        this.feedbackForm.reset();
        this.isSubmitting = false;

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to submit feedback. Please try again.';
        this.isSubmitting = false;
        this.logger.error('Feedback submission error:', err);
      }
    });
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
