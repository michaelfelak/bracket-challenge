import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../shared/services/feedback.service';
import { LoggerService } from '../../shared/services/logger.service';
import { Feedback } from '../../shared/models/feedback.model';

@Component({
  selector: 'app-user-feedback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feedback-list-container">
      <h3>User Feedback</h3>
      
      <div *ngIf="isLoading" class="loading">
        Loading feedback...
      </div>

      <div *ngIf="!isLoading && feedbackList.length === 0" class="no-feedback">
        No feedback submitted yet.
      </div>

      <div *ngIf="!isLoading && feedbackList.length > 0" class="feedback-list">
        <div *ngFor="let item of feedbackList" class="feedback-item" [class.addressed]="item.is_addressed">
          <div class="feedback-header">
            <div class="user-info">
              <span class="username"><strong>{{ item.username }}</strong></span>
              <span class="email">{{ item.email }}</span>
            </div>
            <div class="feedback-timestamp">
              <span class="timestamp">{{ formatDate(item.created_at) }}</span>
              <button 
                class="mark-addressed-btn"
                [class.addressed]="item.is_addressed"
                (click)="toggleAddressedStatus(item)"
                [title]="item.is_addressed ? 'Mark as unaddressed' : 'Mark as addressed'"
              >
                {{ item.is_addressed ? '✓ Addressed' : 'Mark Addressed' }}
              </button>
            </div>
          </div>
          <div class="feedback-text">
            {{ item.feedback_text }}
          </div>
        </div>
      </div>

      <div *ngIf="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .feedback-list-container {
      padding: 16px;
    }

    h3 {
      margin-top: 0;
      color: #333;
      margin-bottom: 24px;
    }

    .loading, .no-feedback {
      padding: 24px;
      text-align: center;
      color: #666;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .feedback-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .feedback-item {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: background-color 0.2s;
    }

    .feedback-item.addressed {
      background: #f0f8f0;
      border-color: #c3e6cb;
    }

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .username {
      color: #0066cc;
      font-size: 14px;
    }

    .email {
      color: #666;
      font-size: 12px;
    }

    .feedback-timestamp {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .timestamp {
      color: #999;
      font-size: 12px;
      white-space: nowrap;
    }

    .mark-addressed-btn {
      padding: 6px 12px;
      border: 1px solid #ddd;
      background: white;
      color: #666;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .mark-addressed-btn:hover {
      border-color: #0066cc;
      color: #0066cc;
    }

    .mark-addressed-btn.addressed {
      background: #28a745;
      color: white;
      border-color: #28a745;
    }

    .mark-addressed-btn.addressed:hover {
      background: #218838;
      border-color: #218838;
    }

    .feedback-text {
      color: #333;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
    }

    .error-message {
      color: #721c24;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
    }
  `]
})
export class UserFeedbackComponent implements OnInit {
  feedbackList: Feedback[] = [];
  isLoading = true;
  errorMessage = '';

  @Output() unaddressedCountChange = new EventEmitter<number>();

  constructor(private feedbackService: FeedbackService, private logger: LoggerService) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.feedbackService.getAllFeedback().subscribe({
      next: (feedback) => {
        // Sort by created_at descending (newest first)
        this.feedbackList = feedback.sort((a, b) => {
          const dateA = new Date(a.created_at || '').getTime();
          const dateB = new Date(b.created_at || '').getTime();
          return dateB - dateA;
        });
        
        // Calculate unaddressed count and emit
        const unaddressedCount = this.feedbackList.filter(item => !item.is_addressed).length;
        this.unaddressedCountChange.emit(unaddressedCount);
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load feedback. Please try again.';
        this.isLoading = false;
        this.logger.error('Feedback load error:', err);
      }
    });
  }

  toggleAddressedStatus(feedback: Feedback): void {
    if (!feedback.id) return;

    const newStatus = !feedback.is_addressed;
    this.feedbackService.updateFeedbackStatus(feedback.id, newStatus).subscribe({
      next: () => {
        feedback.is_addressed = newStatus;
        
        // Recalculate unaddressed count and emit
        const unaddressedCount = this.feedbackList.filter(item => !item.is_addressed).length;
        this.unaddressedCountChange.emit(unaddressedCount);
      },
      error: (err) => {
        this.errorMessage = 'Failed to update feedback status. Please try again.';
        this.logger.error('Update feedback status error:', err);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }
}
