import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BracketService } from '../../shared/services/bracket.service';
import { BlogEntry } from '../../shared/models/blog.model';

@Component({
  standalone: true,
  selector: 'app-add-blog',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-blog.component.html',
  styleUrls: ['./add-blog.component.scss'],
})
export class AddBlogComponent implements OnInit {
  public blogForm!: FormGroup;
  public isSubmitting = false;
  public successMessage = '';
  public errorMessage = '';

  private currentYear: number = new Date().getFullYear();
  private readonly CONTEST_TYPE = 2; // 2 = Bracket Challenge

  constructor(
    private fb: FormBuilder,
    private bracketService: BracketService
  ) {}

  public ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.blogForm = this.fb.group({
      title: [''],
      body: ['', [Validators.required, Validators.minLength(10)]],
      postedBy: ['', Validators.required],
    });
  }

  public submitBlog() {
    if (this.blogForm.invalid) {
      this.errorMessage =
        'Please fill in all required fields and ensure the blog content is at least 10 characters.';
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const blogEntry: BlogEntry = {
      title: this.blogForm.get('title')?.value || 'Blog Entry',
      body: this.blogForm.get('body')?.value,
      posted_by: this.blogForm.get('postedBy')?.value,
      created_date: new Date().toISOString(),
      id: '', // Will be assigned by backend
      year: this.currentYear,
      contest_type: this.CONTEST_TYPE,
    };

    this.bracketService.addBlogEntry(blogEntry, this.currentYear).subscribe({
      next: (response: BlogEntry) => {
        this.isSubmitting = false;
        this.successMessage = 'Blog entry posted successfully!';
        this.blogForm.reset();
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to post blog entry. Please try again.';
        
      },
    });
  }

  public resetForm() {
    this.blogForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
  }
}
