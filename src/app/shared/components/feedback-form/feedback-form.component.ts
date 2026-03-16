import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [FeedbackService],
  template: `
    <div class="feedback-button-container" *ngIf="isAuthenticated">
      <button 
        class="feedback-button"
        (click)="togglePopover()"
        title="Send feedback"
        aria-label="Send feedback"
      >
        📢
      </button>
      <span class="feedback-label">Feedback</span>

      <div class="feedback-popover" [class.open]="isPopoverOpen">
        <div class="popover-content">
          <div class="popover-header">
            <h4>Share Your Feedback</h4>
            <button 
              class="close-button"
              (click)="togglePopover()"
              aria-label="Close feedback form"
            >
              ✕
            </button>
          </div>

          <form [formGroup]="feedbackForm" (ngSubmit)="submitFeedback()">
            <div class="form-group">
              <textarea
                formControlName="feedback_text"
                class="feedback-input"
                [placeholder]="placeholderText"
                rows="5"
                (focus)="onTextareaFocus()"
              ></textarea>
            </div>
            <button 
              type="submit" 
              class="submit-btn"
              [disabled]="!feedbackForm.valid || isSubmitting"
            >
              {{ isSubmitting ? 'Submitting...' : 'Submit Feedback' }}
            </button>
            <div class="feedback-message" *ngIf="successMessage" class="success">
              {{ successMessage }}
            </div>
            <div class="feedback-message" *ngIf="errorMessage" class="error">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>

      <div class="popover-backdrop" [class.open]="isPopoverOpen" (click)="togglePopover()"></div>
    </div>
  `,
  styles: [`
    .feedback-button-container {
      position: fixed;
      top: 100px;
      right: 20px;
      z-index: 1000;
      font-family: inherit;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .feedback-label {
      font-size: 12px;
      color: #0066cc;
      font-weight: 500;
      white-space: nowrap;
    }

    .feedback-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #0066cc;
      border: none;
      cursor: pointer;
      font-size: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
      transition: all 0.2s ease;
    }

    .feedback-button:hover {
      background: #0052a3;
      box-shadow: 0 6px 16px rgba(0, 102, 204, 0.4);
      transform: scale(1.05);
    }

    .feedback-button:active {
      transform: scale(0.95);
    }

    .feedback-popover {
      position: absolute;
      top: 70px;
      right: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 5px 40px rgba(0, 0, 0, 0.16);
      width: 380px;
      max-height: 600px;
      overflow-y: auto;
      z-index: 1001;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
    }

    .feedback-popover.open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .popover-content {
      padding: 20px;
    }

    .popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .popover-header h4 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .close-button:hover {
      color: #333;
    }

    .form-group {
      margin-bottom: 16px;
      min-height: 150px;
    }

    .feedback-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
      box-sizing: border-box;
      color: #333;
      background-color: #fff;
      line-height: 1.5;
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      min-height: 120px;
      display: block;
      vertical-align: top;
    }

    .feedback-input::placeholder {
      color: #999;
      opacity: 1;
      line-height: 1.5;
      white-space: pre-line;
    }

    .feedback-input::-webkit-input-placeholder {
      color: #999;
      opacity: 1;
      line-height: 1.5;
      white-space: pre-line;
    }

    .feedback-input::-moz-placeholder {
      color: #999;
      opacity: 1;
      line-height: 1.5;
      white-space: pre-line;
    }

    .feedback-input:-ms-input-placeholder {
      color: #999;
      opacity: 1;
      line-height: 1.5;
      white-space: pre-line;
    }

    .feedback-input:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
    }

    .submit-btn {
      background: #0066cc;
      color: white;
      padding: 10px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
      width: 100%;
      margin-bottom: 12px;
    }

    .submit-btn:hover:not(:disabled) {
      background: #0052a3;
    }

    .submit-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .feedback-message {
      padding: 10px 12px;
      border-radius: 4px;
      font-size: 13px;
      margin-top: 12px;
    }

    .feedback-message.success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .feedback-message.error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .popover-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    }

    .popover-backdrop.open {
      opacity: 1;
      visibility: visible;
    }

    @media (max-width: 600px) {
      .feedback-popover {
        width: calc(100vw - 40px);
        right: 20px;
      }

      .feedback-button-container {
        top: auto;
        bottom: 20px;
      }

      .feedback-popover {
        top: auto;
        bottom: 70px;
      }
    }
  `]
})
export class FeedbackFormComponent {
  feedbackForm: FormGroup;
  isAuthenticated = false;
  isPopoverOpen = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  placeholderText = `• What feedback do you have?
• Are there any features you would like to see?
• Is something not working as expected?`;

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    private authService: AuthService,
    private settingsService: SettingsService
  ) {
    this.feedbackForm = this.fb.group({
      feedback_text: ['', [Validators.required, Validators.minLength(10)]]
    });

    this.isAuthenticated = this.authService.isAuthenticated();
  }

  togglePopover(): void {
    this.isPopoverOpen = !this.isPopoverOpen;
    if (!this.isPopoverOpen) {
      this.successMessage = '';
      this.errorMessage = '';
    }
  }

  onTextareaFocus(): void {
    // This triggers a refresh of the placeholder visibility
    // Some browsers need a focus event to properly render placeholders
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

        // Close popover after 2 seconds
        setTimeout(() => {
          this.isPopoverOpen = false;
          this.successMessage = '';
        }, 2000);
      },
      error: (err: any) => {
        this.errorMessage = 'Failed to submit feedback. Please try again.';
        this.isSubmitting = false;
        console.error('Feedback submission error:', err);
      }
    });
  }
}
