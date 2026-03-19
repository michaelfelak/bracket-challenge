import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private isDev = !environment.production;

  constructor() { }

  /**
   * Log info messages only in development
   */
  info(message: string, data?: any): void {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  /**
   * Log debug messages only in development
   */
  debug(message: string, data?: any): void {
    if (this.isDev) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log warning messages (all environments)
   */
  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data || '');
  }

  /**
   * Log error messages (all environments)
   */
  error(message: string, error?: any): void {
    console.error(`[ERROR] ${message}`, error || '');
  }

  /**
   * Log table data only in development
   */
  table(data: any): void {
    if (this.isDev) {
      console.table(data);
    }
  }

  /**
   * Log group message only in development
   */
  group(groupName: string): void {
    if (this.isDev) {
      console.group(groupName);
    }
  }

  /**
   * End log group only in development
   */
  groupEnd(): void {
    if (this.isDev) {
      console.groupEnd();
    }
  }

  /**
   * Log time measurement only in development
   */
  time(label: string): void {
    if (this.isDev) {
      console.time(label);
    }
  }

  /**
   * End time measurement only in development
   */
  timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(label);
    }
  }
}
