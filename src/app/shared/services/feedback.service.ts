import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feedback, FeedbackRequest, UpdateFeedbackStatusRequest } from '../models/feedback.model';
import { API_CONSTANTS } from '../constants/api.constants';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private baseUrl: string;
  private readonly CONTEST_TYPE = 2; // 2 = Bracket Challenge

  constructor(private http: HttpClient, private authService: AuthService) {
    this.baseUrl = API_CONSTANTS.BRACKET_API_URL + 'bracket/';
  }

  /**
   * Get HTTP headers with Authorization token
   */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Submit user feedback
   */
  submitFeedback(bracketId: number, request: FeedbackRequest): Observable<Feedback> {
    const feedbackRequest = {
      ...request,
      bracket_id: bracketId,
      contest_type: this.CONTEST_TYPE
    };
    return this.http.post<Feedback>(
      this.baseUrl + 'feedback',
      feedbackRequest,
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Get all feedback (admin only)
   */
  getAllFeedback(): Observable<Feedback[]> {
    return this.http.get<Feedback[]>(
      this.baseUrl + 'feedback',
      { headers: this.getAuthHeaders() }
    );
  }

  /**
   * Update feedback status (admin only)
   */
  updateFeedbackStatus(feedbackId: number, isAddressed: boolean): Observable<any> {
    const request: UpdateFeedbackStatusRequest = { is_addressed: isAddressed };
    return this.http.patch(
      `${this.baseUrl}feedback?id=${feedbackId}`,
      request,
      { headers: this.getAuthHeaders() }
    );
  }
}
