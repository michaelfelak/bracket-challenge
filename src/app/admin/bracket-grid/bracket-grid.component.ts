import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { School } from 'src/app/shared/models/school.model';
import { Seed } from 'src/app/shared/models/seed';
import { Bracket } from 'src/app/shared/models/bracket';
import { Region } from 'src/app/shared/models/region.model';

interface SeedRow {
  seedPosition: number;
  seedNumber: number;
  overallSeedNumber: number;
  formControl: FormControl<number | null>;
  searchControl: FormControl<string | null>;
  selectedSchoolName: string;
  filteredSchools: School[];
  showDropdown: boolean;
}

interface BracketPosition {
  positionId: number; // 1, 2, 3, 4
  regionControl: FormControl<number | null>;
  selectedRegionId: number | null;
  seeds: SeedRow[];
}

// Seed numbers in bracket order for all 16 seeds per region
const SEED_NUMBERS = [1, 16, 8, 9, 5, 12, 4, 13, 3, 14, 6, 11, 7, 10, 2, 15];

// Map region, seed position, and overall seed numbers for 64-team NCAA bracket
// Format: [regionId][seedPosition] = overallSeedNumber
const SEED_TO_OVERALL_MAP: { [regionId: number]: { [seedPosition: number]: number } } = {
  // South region (regionId=1)
  1: {
    0: 2, 1: 63, 2: 31, 3: 34, 4: 18, 5: 47, 6: 15, 7: 50,
    8: 10, 9: 55, 10: 23, 11: 42, 12: 26, 13: 39, 14: 7, 15: 58,
  },
  // East region (regionId=2)
  2: {
    0: 4, 1: 61, 2: 29, 3: 36, 4: 20, 5: 45, 6: 13, 7: 52,
    8: 12, 9: 53, 10: 21, 11: 44, 12: 28, 13: 37, 14: 5, 15: 60,
  },
  // Midwest region (regionId=3)
  3: {
    0: 1, 1: 64, 2: 32, 3: 33, 4: 17, 5: 48, 6: 16, 7: 49,
    8: 9, 9: 56, 10: 24, 11: 41, 12: 25, 13: 40, 14: 8, 15: 57,
  },
  // West region (regionId=4)
  4: {
    0: 3, 1: 62, 2: 30, 3: 35, 4: 19, 5: 46, 6: 14, 7: 57,
    8: 11, 9: 54, 10: 22, 11: 43, 12: 27, 13: 38, 14: 6, 15: 59,
  },
};

@Component({
  selector: 'app-bracket-grid',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bracket-grid.component.html',
  styleUrls: ['./bracket-grid.component.scss'],
})
export class BracketGridComponent implements OnInit, OnChanges {
  @Input()
  public bracketId = 0;

  public schoolList: School[] = [];
  public regionList: Region[] = [];
  public bracketPositions: BracketPosition[] = [];
  public successMessage = '';
  public errorMessage = '';
  public isLoading = false;

  private bracket: Bracket | null = null;
  private existingSeeds: Map<string, Seed> = new Map();

  constructor(private service: BracketService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bracketId']) {
      this.loadData();
    }
  }

  private loadData() {
    this.isLoading = true;

    // Load schools and regions in parallel
    this.service.getSchools().subscribe((schools) => {
      this.schoolList = schools;
    });

    this.service.getRegions().subscribe((regions) => {
      this.regionList = regions;
    });

    // Load bracket info
    this.service.getBracket(this.bracketId).subscribe((bracket) => {
      this.bracket = bracket;
      this.initializeBracketPositions();
    });

    // Load existing seeds
    this.service.getSeedList(this.bracketId).subscribe((seeds) => {
      this.mapExistingSeeds(seeds);
      this.initializeBracketPositions();
      this.isLoading = false;
    });
  }

  private mapExistingSeeds(seeds: Seed[]) {
    this.existingSeeds.clear();
    if (!seeds) return;
    seeds.forEach((seed) => {
      const key = `${seed.region_id}_${seed.seed_number}`;
      this.existingSeeds.set(key, seed);
    });
  }

  private initializeBracketPositions() {
    if (!this.bracket) return;

    this.bracketPositions = [1, 2, 3, 4].map((positionId) => {
      // Get the region assigned to this position from the bracket
      const regionIdField = `region_${positionId}_id` as keyof Bracket;
      const assignedRegionId = this.bracket![regionIdField] as number;

      const regionControl = this.formBuilder.control<number | null>(
        assignedRegionId || null
      );

      // Initialize seeds for this position
      const seeds = this.getSeeds(assignedRegionId);

      return {
        positionId,
        regionControl,
        selectedRegionId: assignedRegionId || null,
        seeds,
      };
    });
  }

  private getSeeds(regionId: number | null): SeedRow[] {
    if (!regionId) return [];

    return SEED_NUMBERS.map((seedNumber, position) => {
      const key = `${regionId}_${seedNumber}`;
      const existingSeed = this.existingSeeds.get(key);
      const overallSeed = SEED_TO_OVERALL_MAP[regionId]?.[position] || 0;

      const control = this.formBuilder.control<number | null>(
        existingSeed?.school_id || null
      );

      // Initialize search control (for typing)
      const searchControl = this.formBuilder.control<string | null>(null);
      
      const seedRow = {
        seedPosition: position,
        seedNumber: seedNumber,
        overallSeedNumber: overallSeed,
        formControl: control,
        searchControl,
        selectedSchoolName: existingSeed?.school_name || '',
        filteredSchools: [...this.schoolList],
        showDropdown: false,
      };
      
      // Setup listener for search input
      searchControl.valueChanges.subscribe(() => {
        this.updateFilteredSchools(seedRow);
      });

      return seedRow;
    });
  }

  public updateFilteredSchools(seedRow: SeedRow) {
    const searchText = (seedRow.searchControl.value || '').toLowerCase();
    if (!searchText) {
      seedRow.filteredSchools = [...this.schoolList];
    } else {
      seedRow.filteredSchools = this.schoolList.filter((school) =>
        school.name.toLowerCase().includes(searchText)
      );
    }
  }

  public selectSchool(position: BracketPosition, seedRow: SeedRow, school: School) {
    if (school.id) {
      seedRow.formControl.setValue(school.id);
      seedRow.selectedSchoolName = school.name;
      seedRow.searchControl.setValue(null, { emitEvent: false });
      seedRow.showDropdown = false;
      this.onSeedChange(position, seedRow);
    }
  }

  public clearSelection(seedRow: SeedRow) {
    seedRow.selectedSchoolName = '';
    seedRow.formControl.setValue(null);
    seedRow.searchControl.setValue(null, { emitEvent: false });
  }

  public toggleDropdown(seedRow: SeedRow, show: boolean) {
    seedRow.showDropdown = show;
    if (show && !seedRow.searchControl.value) {
      seedRow.filteredSchools = [...this.schoolList];
    }
  }

  public onSearchFocus(seedRow: SeedRow) {
    seedRow.showDropdown = true;
    if (!seedRow.searchControl.value) {
      seedRow.filteredSchools = [...this.schoolList];
    }
  }

  public onRegionChange(position: BracketPosition) {
    const newRegionId = position.regionControl.value;
    if (!newRegionId) return;

    // Update the bracket with the new region assignment
    const regionIdField = `region_${position.positionId}_id`;
    const updatePayload = {
      [regionIdField]: newRegionId,
      id: this.bracketId,
    };

    this.service.updateBracket(updatePayload).subscribe({
      next: () => {
        position.selectedRegionId = newRegionId;
        position.seeds = this.getSeeds(newRegionId);

        const region = this.regionList.find((r) => r.id === newRegionId);
        this.successMessage = `Updated bracket position ${position.positionId} to ${region?.name || 'selected region'}`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.errorMessage = `Failed to update bracket: ${err.message || 'Unknown error'}`;
        // Reset the control to previous value
        const regionIdField = `region_${position.positionId}_id` as keyof Bracket;
        position.regionControl.setValue(this.bracket![regionIdField] as number);
      },
    });
  }

  public onSeedChange(position: BracketPosition, seedRow: SeedRow) {
    if (!seedRow.formControl.value || !position.selectedRegionId) {
      return;
    }

    const schoolId = seedRow.formControl.value;
    const school = this.schoolList.find((s) => s.id === schoolId);

    if (!school) {
      this.errorMessage = 'School not found';
      return;
    }

    const seedRequest: Seed = {
      bracket_id: this.bracketId,
      school_id: schoolId,
      seed_number: seedRow.seedNumber,
      overall_seed_number: seedRow.overallSeedNumber,
      region_id: position.selectedRegionId,
    };

    this.service.addSeed(seedRequest).subscribe({
      next: () => {
        this.successMessage = `${school.name} added as #${seedRow.seedNumber} seed`;
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);

        // Update local cache
        const key = `${position.selectedRegionId}_${seedRow.seedNumber}`;
        this.existingSeeds.set(key, seedRequest);
      },
      error: (err) => {
        this.errorMessage = `Failed to add seed: ${err.message || 'Unknown error'}`;
      },
    });
  }

  public getSchoolName(position: BracketPosition, seedRow: SeedRow): string {
    return seedRow.selectedSchoolName;
  }

  public getRegionName(regionId: number | null): string {
    if (!regionId) return 'Select Region';
    return this.regionList.find((r) => r.id === regionId)?.name || 'Unknown';
  }
}
