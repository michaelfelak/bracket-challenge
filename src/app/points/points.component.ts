import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { FooterComponent } from '../shared/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { Winner } from '../shared/models/winner.model';

export interface SchoolPoints extends Winner {}

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule, FooterComponent, FormsModule],
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.scss'],
})
export class PointsComponent implements OnInit {
  public pointsData: SchoolPoints[] = [];
  public isLoading = true;
  public showAliveOnly = false;
  public errorMessage = '';

  public sortByPoints = false;
  public sortByWins = false;
  public sortByEntries = false;

  public pointsDesc = false;
  public winsDesc = true;
  public entriesDesc = true;

  public get bracketId() {
    return this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private titleService: Title,
    private bracketService: BracketService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Bracket Challenge - Team Points');
    this.loadPoints();
  }

  private loadPoints(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.bracketService.getWinners(this.bracketId).subscribe({
      next: (data) => {
        this.pointsData = data;
        this.sortByPointsValue();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading points data:', error);
        this.errorMessage = 'Failed to load team points data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  public get filteredPointsData(): SchoolPoints[] {
    if (this.showAliveOnly) {
      return this.pointsData.filter(team => !team.eliminated);
    }
    return this.pointsData;
  }

  public toggleAliveFilter(): void {
    this.showAliveOnly = !this.showAliveOnly;
  }

  public sortByPointsValue(): void {
    this.sortByPoints = true;
    this.sortByWins = false;
    this.sortByEntries = false;
    this.pointsDesc = !this.pointsDesc;

    if (this.pointsData) {
      if (this.pointsDesc) {
        this.pointsData.sort((a, b) => {
          return b.points - a.points;
        });
      } else {
        this.pointsData.sort((a, b) => {
          return a.points - b.points;
        });
      }
    }
  }

  public sortByWinsValue(): void {
    this.sortByWins = true;
    this.sortByPoints = false;
    this.sortByEntries = false;
    this.winsDesc = !this.winsDesc;

    if (this.pointsData) {
      if (this.winsDesc) {
        this.pointsData.sort((a, b) => {
          return b.wins - a.wins;
        });
      } else {
        this.pointsData.sort((a, b) => {
          return a.wins - b.wins;
        });
      }
    }
  }

  public sortByEntriesValue(): void {
    this.sortByEntries = true;
    this.sortByPoints = false;
    this.sortByWins = false;
    this.entriesDesc = !this.entriesDesc;

    if (this.pointsData) {
      if (this.entriesDesc) {
        this.pointsData.sort((a, b) => {
          return b.entries_selected - a.entries_selected;
        });
      } else {
        this.pointsData.sort((a, b) => {
          return a.entries_selected - b.entries_selected;
        });
      }
    }
  }
}

