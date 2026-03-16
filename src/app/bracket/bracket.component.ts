import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from '../shared/services/bracket.service';
import { SettingsService } from '../shared/services/settings.service';
import { Bracket } from '../shared/models/bracket';
import { Region, RegionModel } from '../shared/models/region.model';
import { Seed } from '../shared/models/seed';
import { mergeMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Matchup {
  team1: Seed;
  team2: Seed;
}

interface RegionWithMatchups extends RegionModel {
  matchups?: Matchup[];
}

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
  public topLeftRegion: RegionWithMatchups = {};
  public topRightRegion: RegionWithMatchups = {};
  public bottomRightRegion: RegionWithMatchups = {};
  public bottomLeftRegion: RegionWithMatchups = {};
  public isLoading = true;
  public errorMessage = '';

  private ngUnsubscribe = new Subject<void>();

  // Matchup order according to game logic
  private readonly MATCHUP_SEED_PAIRS = [
    [1, 16],
    [8, 9],
    [4, 13],
    [5, 12],
    [3, 14],
    [6, 11],
    [7, 10],
    [2, 15]
  ];

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
            seeds: [],
            matchups: []
          };
          this.topRightRegion = {
            region_id: this.bracket.region_2_id,
            region_name: regions.find((r) => r.id === this.bracket.region_2_id)?.name,
            seeds: [],
            matchups: []
          };
          this.bottomRightRegion = {
            region_id: this.bracket.region_3_id,
            region_name: regions.find((r) => r.id === this.bracket.region_3_id)?.name,
            seeds: [],
            matchups: []
          };
          this.bottomLeftRegion = {
            region_id: this.bracket.region_4_id,
            region_name: regions.find((r) => r.id === this.bracket.region_4_id)?.name,
            seeds: [],
            matchups: []
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

    // Organize seeds into matchups for each region
    [this.topLeftRegion, this.topRightRegion, this.bottomLeftRegion, this.bottomRightRegion].forEach((region) => {
      region.matchups = this.createMatchups(region.seeds || []);
    });
  }

  private createMatchups(seeds: Seed[]): Matchup[] {
    const matchups: Matchup[] = [];
    
    // Create a map of seed numbers to seeds for quick lookup
    const seedMap = new Map<number, Seed>();
    seeds.forEach(seed => {
      if (seed.seed_number) {
        seedMap.set(seed.seed_number, seed);
      }
    });

    // Create matchups according to the seed pair order
    for (const [seed1Num, seed2Num] of this.MATCHUP_SEED_PAIRS) {
      const team1 = seedMap.get(seed1Num);
      const team2 = seedMap.get(seed2Num);
      
      if (team1 && team2) {
        matchups.push({ team1, team2 });
      }
    }

    return matchups;
  }
}

