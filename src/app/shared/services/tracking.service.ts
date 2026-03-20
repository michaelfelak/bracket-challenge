import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONSTANTS } from '../constants/api.constants';
import { environment } from '../../../environments/environment';

export interface TrackingEvent {
  eventType: string;
  metadata?: Record<string, any>;
}

export interface BatchEventRequest {
  events: BatchEvent[];
}

export interface BatchEvent {
  eventType: string;
  userId: string;
  metadata?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private baseUrl: string;
  private eventBuffer: TrackingEvent[] = [];
  private batchSize = 10;
  private batchIntervalMs = 30000; // 30 seconds
  private batchTimer: any = null;
  private sessionId: string;
  private userId: string | null = null;
  private requestCount = 0;
  private isDevelopment = environment.production === false && localStorage.getItem('ENVIRONMENT') === 'development';

  constructor(private http: HttpClient) {
    this.baseUrl = API_CONSTANTS.BRACKET_API_URL;
    this.sessionId = this.getOrCreateSessionId();
    this.devLog(`[TrackingService] Initialized with sessionId: ${this.sessionId}`);
    this.initBatchProcessing();
  }

  /**
   * Log only in development mode
   */
  private devLog(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(message, data || '');
    }
  }

  /**
   * Track a user event (page view, action, etc.)
   */
  public trackEvent(eventType: string, metadata?: Record<string, any>): void {
    this.devLog(`[TrackingService] Event tracked: ${eventType}`, metadata || '');
    this.eventBuffer.push({
      eventType,
      metadata
    });
    this.devLog(`[TrackingService] Buffer size: ${this.eventBuffer.length}/${this.batchSize}`);

    // Flush if buffer reaches batch size
    if (this.eventBuffer.length >= this.batchSize) {
      this.devLog(`[TrackingService] Buffer full, flushing...`);
      this.flush();
    }
  }

  /**
   * Set the current user ID (call after login)
   */
  public setUserId(userId: string): void {
    this.devLog(`[TrackingService] User ID set to: ${userId}`);
    this.userId = userId;
  }

  /**
   * Clear the current user ID (call on logout)
   */
  public clearUserId(): void {
    this.devLog(`[TrackingService] User ID cleared`);
    this.userId = null;
  }

  /**
   * Manually flush buffered events
   */
  public flush(): void {
    if (this.eventBuffer.length === 0) {
      this.devLog(`[TrackingService] No events to flush`);
      return;
    }

    const events = this.eventBuffer.map(event => this.convertToBatchEvent(event));
    const eventCount = this.eventBuffer.length;
    this.eventBuffer = [];

    // Reset batch timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    this.requestCount++;
    const requestId = this.requestCount;
    this.devLog(`[TrackingService] Flushing ${eventCount} events (request #${requestId})...`);

    // Send events asynchronously (fire and forget, 202 Accepted)
    this.http.post(`${this.baseUrl}events/batch`, { events } as BatchEventRequest)
      .subscribe({
        next: (response) => {
          this.devLog(`[TrackingService] Request #${requestId} successful (202 Accepted). Sent ${eventCount} events.`);
        },
        error: (err) => {
          if (this.isDevelopment) {
            console.warn(`[TrackingService] Request #${requestId} failed:`, err);
          }
        }
      });

    // Restart batch processing timer
    this.initBatchProcessing();
  }

  /**
   * Get or create a session ID for guest tracking
   */
  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('tracking_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('tracking_session_id', sessionId);
      this.devLog(`[TrackingService] Generated new sessionId: ${sessionId}`);
    } else {
      this.devLog(`[TrackingService] Retrieved existing sessionId: ${sessionId}`);
    }
    return sessionId;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `guest:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert event to batch format
   */
  private convertToBatchEvent(event: TrackingEvent): BatchEvent {
    return {
      eventType: event.eventType,
      userId: this.userId || this.sessionId,
      metadata: event.metadata ? JSON.stringify(event.metadata) : undefined,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * Initialize batch processing with periodic flush
   */
  private initBatchProcessing(): void {
    if (this.batchTimer) {
      return;
    }

    this.batchTimer = setTimeout(() => {
      this.devLog(`[TrackingService] Batch timer expired, flushing ${this.eventBuffer.length} events...`);
      this.flush();
    }, this.batchIntervalMs);
    this.devLog(`[TrackingService] Batch timer started (${this.batchIntervalMs}ms)`);
  }
}
