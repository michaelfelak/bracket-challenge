import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-school-logo',
  imports: [CommonModule],
  template: `
    <div class="school-with-logo">
      <img
        *ngIf="logoId"
        [src]="getLogoPath()"
        [alt]="schoolName"
        class="school-logo"
        (error)="onImageError($event)"
      />
      <span class="school-name" *ngIf="!hideSchoolName">{{ schoolName }}</span>
    </div>
  `,
  styles: [
    `
      .school-with-logo {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .school-logo {
        height: 24px;
        width: auto;
        max-width: 40px;
        object-fit: contain;
      }

      .school-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `,
  ],
})
export class SchoolLogoComponent {
  @Input() schoolName: string | undefined = '';
  @Input() logoId: string | number | undefined;
  @Input() hideSchoolName: boolean = false;

  getLogoPath(): string {
    if (!this.logoId) {
      console.warn(
        `[Bracket Challenge] School logo not found - School: ${this.schoolName}, Logo ID: ${this.logoId}`,
      );
      return '';
    }
    return `assets/logos/${this.logoId}.png`;
  }

  onImageError(event: Event): void {
    // Log to console if logo is not available
    const img = event.target as HTMLImageElement;
    const logoPath = this.getLogoPath();
    const school = this.schoolName || 'unknown';
    console.warn(
      `[Bracket Challenge] School logo not found - School: ${school}, Path: ${logoPath}`,
    );
    // Hide the image if it fails to load
    img.style.display = 'none';
  }
}
