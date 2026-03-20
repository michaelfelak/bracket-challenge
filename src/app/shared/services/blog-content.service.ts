import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogContentService {
  private blogContentSubject = new BehaviorSubject<string>('');
  public blogContent$ = this.blogContentSubject.asObservable();

  public setBlogContent(content: string): void {
    this.blogContentSubject.next(content);
  }

  public getBlogContent(): string {
    return this.blogContentSubject.value;
  }

  public clearBlogContent(): void {
    this.blogContentSubject.next('');
  }
}
