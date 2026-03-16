import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { Bracket } from '../shared/models/bracket';
import { Region, RegionModel } from '../shared/models/region.model';
import { Seed } from '../shared/models/seed';
import { mergeMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-bracket',
  templateUrl: './bracket.component.html',
  styleUrls: ['./bracket.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [BracketService]
})
export class BracketComponent implements OnInit, OnDestroy {
  public bracket: Bracket = {};
  public topLeftRegion: RegionModel = {};
  public topRightRegion: RegionModel = {};
  public bottomRightRegion: RegionModel = {};
  public bottomLeftRegion: RegionModel = {};
  public isLoading = true;
  public errorMessage = '';

  private ngUnsubscribe = new Subject<void>();

  public get bracketId() {
    return this.settingsService.CURRENT_BRACKET_ID;
  }

  constructor(
    private service: BracketService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.loadBracket();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private loadBracket(): void {
    this.service
      .getBracket(this.bracketId)
      .pipe(
        mergeMap((result: Bracket) => {
          
          this.bracket = result;
          return this.service.getRegions();
        }),
        mergeMap((result: Region[]) => {
          
          const regions = result;

          this.topLeftRegion = {
            region_id: this.bracket.region_1_id,
            region_name: regions.find((r) => r.id === this.bracket.region_1_id)?.name,
            seeds: []
          };
          this.topRightRegion = {
            region_id: this.bracket.region_2_id,
            region_name: regions.find((r) => r.id === this.bracket.region_2_id)?.name,
            seeds: []
          };
          this.bottomRightRegion = {
            region_id: this.bracket.region_3_id,
            region_name: regions.find((r) => r.id === this.bracket.region_3_id)?.name,
            seeds: []
          };
          this.bottomLeftRegion = {
            region_id: this.bracket.region_4_id,
            region_name: regions.find((r) => r.id === this.bracket.region_4_id)?.name,
            seeds: []
          };

          return this.service.getSeedList(this.bracketId);
        })
      )
      .subscribe({
        next: (seeds: Seed[]) => {
          
          this.organizeSeedsByRegion(seeds);
          this.isLoading = false;
        },
        error: (error) => {
          
          this.errorMessage = 'Failed to load bracket. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private organizeSeedsByRegion(seeds: Seed[]): void {
    this.topLeftRegion.seeds = seeds.filter((seed) => seed.region_id === this.topLeftRegion.region_id);
    this.topRightRegion.seeds = seeds.filter((seed) => seed.region_id === this.topRightRegion.region_id);
    this.bottomLeftRegion.seeds = seeds.filter((seed) => seed.region_id === this.bottomLeftRegion.region_id);
    this.bottomRightRegion.seeds = seeds.filter((seed) => seed.region_id === this.bottomRightRegion.region_id);

    // Sort seeds by seed number within each region
    [this.topLeftRegion, this.topRightRegion, this.bottomLeftRegion, this.bottomRightRegion].forEach((region) => {
      if (region.seeds) {
        region.seeds.sort((a, b) => (a.seed_number || 0) - (b.seed_number || 0));
      }
    });
  }
}
