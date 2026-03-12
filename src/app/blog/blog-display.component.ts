import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogEntry } from '../shared/models/blog.model';
import { BracketService } from '../shared/services/bracket.service';
import { AuthService } from '../shared/services/auth.service';
import { SkyRepeaterModule } from '@skyux/lists';

interface ProcessedBlogEntry extends BlogEntry {
  created_date_formatted?: string;
  safe_body?: SafeHtml;
}

@Component({
  standalone: true,
  selector: 'app-blog-display',
  imports: [CommonModule, SkyRepeaterModule],
  templateUrl: './blog-display.component.html',
  styleUrls: ['./blog-display.component.scss'],
})
export class BlogDisplayComponent implements OnInit {
  public blogs: ProcessedBlogEntry[] = [];
  public isLoading = true;
  public isAdmin = false;
  private currentYear: number = new Date().getFullYear();

  constructor(
    private bracketService: BracketService,
    private sanitizer: DomSanitizer,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  public ngOnInit() {
    this.loadBlogs();
  }

  private loadBlogs() {
    this.isLoading = true;
    this.bracketService.getBlogEntries(this.currentYear).subscribe({
      next: (result: BlogEntry[]) => {
        if (result && result.length > 0) {
          // Process and sort blogs by date in descending order (newest first)
          this.blogs = result
            .map((b: BlogEntry) => {
              const processedBlog: ProcessedBlogEntry = {
                id: b.id,
                body: b.body,
                created_date: b.created_date,
                created_date_formatted: this.formatDate(b.created_date || ''),
                posted_by: b.posted_by,
                title: b.title,
                year: b.year,
                contest_type: b.contest_type,
                // Sanitize HTML content to allow proper rendering
                safe_body: this.sanitizer.bypassSecurityTrustHtml(
                  this.formatBlogContent(b.body || '')
                ),
              };
              return processedBlog;
            })
            .sort((a, b) => {
              // Sort by created_date in descending order (newest first)
              return (
                new Date(b.created_date || '').getTime() -
                new Date(a.created_date || '').getTime()
              );
            });
        } else {
          this.blogs = [];
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.blogs = [];
      },
    });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      return dateString;
    }
  }

  private formatBlogContent(content: string): string {
    // Convert line breaks to <br> tags and wrap in paragraphs
    if (!content) return '';

    // Split by double newlines to create paragraphs
    const paragraphs = content
      .split(/\n\n+/)
      .map((para) => {
        // Replace single newlines with <br> within paragraphs
        return `<p>${para.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return paragraphs;
  }

  public deleteBlogPost(id: string) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this blog post?')) {
      this.bracketService.deleteBlogEntry(id).subscribe({
        next: () => {
          this.blogs = this.blogs.filter((blog) => blog.id !== id);
        },
        error: (error) => {
          console.error('Error deleting blog post:', error);
          alert('Failed to delete blog post. Please try again.');
        },
      });
    }
  }
}
