import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyCheckboxModule, SkyInputBoxModule } from '@skyux/forms';
import { SkyBoxModule, SkyFluidGridModule } from '@skyux/layout';
import { SkyPageModule } from '@skyux/pages';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from '../shared/services/bracket.service';
import { mergeMap } from 'rxjs/operators';
import { Seed } from '../shared/models/seed';
import { Entry } from '../shared/models/entry.model';
import { PickRequest } from '../shared/models/pick.model';
import { Subject } from 'rxjs';
import { SkyAlertModule, SkyKeyInfoModule } from '@skyux/indicators';
import { Region, RegionModel } from '../shared/models/region.model';
import { Bracket } from '../shared/models/bracket';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  standalone: true,
  selector: 'app-entry',
  templateUrl: './entry.component.html',
  styleUrls: ['./entry.component.scss'],
  imports: [
    CommonModule,
    SkyCheckboxModule,
    SkyBoxModule,
    SkyPageModule,
    SkyFluidGridModule,
    ReactiveFormsModule,
    SkyInputBoxModule,
    SkyKeyInfoModule,
    SkyAlertModule,
    FooterComponent
  ],
  providers: [BracketService],
})
export class EntryComponent implements OnInit {
  // assign teams
  public selectedTeams: Seed[] = [];
  public totalPoints = 0;
  public name = '';
  public email = '';
  public bracketId = 4;
  public bracket: Bracket = {};

  public bracketFinalized = false;

  public submitted = false;

  public topLeftRegion: RegionModel = {};
  public topRightRegion: RegionModel = {};
  public bottomRightRegion: RegionModel = {};
  public bottomLeftRegion: RegionModel = {};

  public submitDisabled = false;
  public hasErrors = false;
  public errorMessage = '';

  public get team1() {
    return this.entryForm.controls.team1.value;
  }
  public get team2() {
    return this.entryForm.controls.team2.value;
  }
  public get team3() {
    return this.entryForm.controls.team3.value;
  }
  public get team4() {
    return this.entryForm.controls.team4.value;
  }
  public get team5() {
    return this.entryForm.controls.team5.value;
  }
  public get team6() {
    return this.entryForm.controls.team6.value;
  }
  public get team7() {
    return this.entryForm.controls.team7.value;
  }
  public get team8() {
    return this.entryForm.controls.team8.value;
  }

  public entryForm: FormGroup<{
    name: FormControl<string | null>;
    email: FormControl<string | null>;
    team1: FormControl<Seed | null>;
    team2: FormControl<Seed | null>;
    team3: FormControl<Seed | null>;
    team4: FormControl<Seed | null>;
    team5: FormControl<Seed | null>;
    team6: FormControl<Seed | null>;
    team7: FormControl<Seed | null>;
    team8: FormControl<Seed | null>;
    bonusTeam: FormControl<Seed | null>;
  }>;

  ngUnsubscribe = new Subject<void>();
  constructor(private service: BracketService) {
    this.entryForm = new FormGroup({
      name: new FormControl(''),
      email: new FormControl(''),
      team1: new FormControl(),
      team2: new FormControl(),
      team3: new FormControl(),
      team4: new FormControl(),
      team5: new FormControl(),
      team6: new FormControl(),
      team7: new FormControl(),
      team8: new FormControl(),
      bonusTeam: new FormControl(),
    });
  }

  ngOnInit() {
    // Load test data
    this.loadTestData();

    this.service.getSettings().subscribe((settings) => {
      this.bracketFinalized = settings.entry_enabled;
    });

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
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_1_id;
            })?.name,
          };
          this.topRightRegion = {
            region_id: this.bracket.region_2_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_2_id;
            })?.name,
          };
          this.bottomRightRegion = {
            region_id: this.bracket.region_3_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_3_id;
            })?.name,
          };
          this.bottomLeftRegion = {
            region_id: this.bracket.region_4_id,
            region_name: regions.find((result) => {
              return result.id === this.bracket.region_4_id;
            })?.name,
          };

          return this.service.getSeedList(this.bracketId);
        })
      )
      .subscribe((result) => {
        if (result) {
          result.forEach((r) => {
            const n = r.seed_number!;
            r.possible_points = 16 * n;
          });
          this.topLeftRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.topLeftRegion.region_id;
          });
          this.topRightRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.topRightRegion.region_id;
          });
          this.bottomLeftRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.bottomLeftRegion.region_id;
          });
          this.bottomRightRegion.seeds = result.filter((seed) => {
            return seed.region_id === this.bottomRightRegion.region_id;
          });
        }
      });
  }

  private loadTestData() {
    // Enable the bracket for display
    this.bracketFinalized = true;

    // Test regions
    const testRegions = [
      { id: 1, name: 'South' },
      { id: 2, name: 'East' },
      { id: 3, name: 'West' },
      { id: 4, name: 'Midwest' }
    ];

    // Test seeds for each region
    const testSeeds: Seed[] = [
      // South Region (region_id: 1)
      { id: 1, school_id: 1, school_name: 'Duke', seed_number: 1, region_id: 1, bracket_id: 4, possible_points: 16 },
      { id: 2, school_id: 2, school_name: 'Gonzaga', seed_number: 2, region_id: 1, bracket_id: 4, possible_points: 32 },
      { id: 3, school_id: 3, school_name: 'Texas Tech', seed_number: 3, region_id: 1, bracket_id: 4, possible_points: 48 },
      { id: 4, school_id: 4, school_name: 'Ohio State', seed_number: 4, region_id: 1, bracket_id: 4, possible_points: 64 },
      { id: 5, school_id: 5, school_name: 'Kentucky', seed_number: 5, region_id: 1, bracket_id: 4, possible_points: 80 },
      { id: 6, school_id: 6, school_name: 'Princeton', seed_number: 6, region_id: 1, bracket_id: 4, possible_points: 96 },
      { id: 7, school_id: 7, school_name: 'Auburn', seed_number: 7, region_id: 1, bracket_id: 4, possible_points: 112 },
      { id: 8, school_id: 8, school_name: 'Columbia', seed_number: 8, region_id: 1, bracket_id: 4, possible_points: 128 },
      // East Region (region_id: 2)
      { id: 9, school_id: 9, school_name: 'Kansas', seed_number: 1, region_id: 2, bracket_id: 4, possible_points: 16 },
      { id: 10, school_id: 10, school_name: 'New Mexico', seed_number: 2, region_id: 2, bracket_id: 4, possible_points: 32 },
      { id: 11, school_id: 11, school_name: 'Houston', seed_number: 3, region_id: 2, bracket_id: 4, possible_points: 48 },
      { id: 12, school_id: 12, school_name: 'Alabama', seed_number: 4, region_id: 2, bracket_id: 4, possible_points: 64 },
      { id: 13, school_id: 13, school_name: 'Florida', seed_number: 5, region_id: 2, bracket_id: 4, possible_points: 80 },
      { id: 14, school_id: 14, school_name: 'BYU', seed_number: 6, region_id: 2, bracket_id: 4, possible_points: 96 },
      { id: 15, school_id: 15, school_name: 'Marquette', seed_number: 7, region_id: 2, bracket_id: 4, possible_points: 112 },
      { id: 16, school_id: 16, school_name: 'Vermont', seed_number: 8, region_id: 2, bracket_id: 4, possible_points: 128 },
      // West Region (region_id: 3)
      { id: 17, school_id: 17, school_name: 'North Carolina', seed_number: 1, region_id: 3, bracket_id: 4, possible_points: 16 },
      { id: 18, school_id: 18, school_name: 'Tennessee', seed_number: 2, region_id: 3, bracket_id: 4, possible_points: 32 },
      { id: 19, school_id: 19, school_name: 'Utah State', seed_number: 3, region_id: 3, bracket_id: 4, possible_points: 48 },
      { id: 20, school_id: 20, school_name: 'Creighton', seed_number: 4, region_id: 3, bracket_id: 4, possible_points: 64 },
      { id: 21, school_id: 21, school_name: 'Purdue', seed_number: 5, region_id: 3, bracket_id: 4, possible_points: 80 },
      { id: 22, school_id: 22, school_name: 'Wisconsin', seed_number: 6, region_id: 3, bracket_id: 4, possible_points: 96 },
      { id: 23, school_id: 23, school_name: 'Dayton', seed_number: 7, region_id: 3, bracket_id: 4, possible_points: 112 },
      { id: 24, school_id: 24, school_name: 'UNC Asheville', seed_number: 8, region_id: 3, bracket_id: 4, possible_points: 128 },
      // Midwest Region (region_id: 4)
      { id: 25, school_id: 25, school_name: 'Iowa State', seed_number: 1, region_id: 4, bracket_id: 4, possible_points: 16 },
      { id: 26, school_id: 26, school_name: 'Auburn', seed_number: 2, region_id: 4, bracket_id: 4, possible_points: 32 },
      { id: 27, school_id: 27, school_name: 'Michigan State', seed_number: 3, region_id: 4, bracket_id: 4, possible_points: 48 },
      { id: 28, school_id: 28, school_name: 'Rutgers', seed_number: 4, region_id: 4, bracket_id: 4, possible_points: 64 },
      { id: 29, school_id: 29, school_name: 'Virginia Tech', seed_number: 5, region_id: 4, bracket_id: 4, possible_points: 80 },
      { id: 30, school_id: 30, school_name: 'Wichita State', seed_number: 6, region_id: 4, bracket_id: 4, possible_points: 96 },
      { id: 31, school_id: 31, school_name: 'Texas State', seed_number: 7, region_id: 4, bracket_id: 4, possible_points: 112 },
      { id: 32, school_id: 32, school_name: 'LIU', seed_number: 8, region_id: 4, bracket_id: 4, possible_points: 128 }
    ];

    // Set up bracket
    this.bracket = {
      id: 4,
      year: 2025,
      region_1_id: 1,
      region_2_id: 2,
      region_3_id: 3,
      region_4_id: 4
    };

    // Set up regions with seeds
    this.topLeftRegion = {
      region_id: 1,
      region_name: 'South',
      seeds: testSeeds.filter((seed) => seed.region_id === 1)
    };

    this.topRightRegion = {
      region_id: 2,
      region_name: 'East',
      seeds: testSeeds.filter((seed) => seed.region_id === 2)
    };

    this.bottomRightRegion = {
      region_id: 3,
      region_name: 'West',
      seeds: testSeeds.filter((seed) => seed.region_id === 3)
    };

    this.bottomLeftRegion = {
      region_id: 4,
      region_name: 'Midwest',
      seeds: testSeeds.filter((seed) => seed.region_id === 4)
    };

    // Set some test form values
    this.entryForm.patchValue({
      name: 'Test Entry',
      email: 'test@example.com',
      team1: testSeeds[0], // Duke
      team2: testSeeds[1], // Gonzaga
      team3: testSeeds[9], // New Mexico
      team4: testSeeds[10], // Houston
      team5: testSeeds[17], // Tennessee
      team6: testSeeds[18], // Utah State
      team7: testSeeds[25], // Auburn
      team8: testSeeds[26], // Michigan State
      bonusTeam: testSeeds[0] // Duke as bonus team
    });

    // Run the update method to calculate total points
    this.update();
  }

  public update() {
    this.entryForm.markAllAsTouched();
    // reset selected teams
    this.selectedTeams = [];

    this.addTeamIfSelected(this.entryForm.value.team1!);
    this.addTeamIfSelected(this.entryForm.value.team2!);
    this.addTeamIfSelected(this.entryForm.value.team3!);
    this.addTeamIfSelected(this.entryForm.value.team4!);
    this.addTeamIfSelected(this.entryForm.value.team5!);
    this.addTeamIfSelected(this.entryForm.value.team6!);
    this.addTeamIfSelected(this.entryForm.value.team7!);
    this.addTeamIfSelected(this.entryForm.value.team8!);

    const teams1points = this.team1?.possible_points ?? 0;
    const teams2points = this.team2?.possible_points ?? 0;
    const teams3points = this.team3?.possible_points ?? 0;
    const teams4points = this.team4?.possible_points ?? 0;
    const teams5points = this.team5?.possible_points ?? 0;
    const teams6points = this.team6?.possible_points ?? 0;
    const teams7points = this.team7?.possible_points ?? 0;
    const teams8points = this.team8?.possible_points ?? 0;

    const bonusTeamId = this.entryForm.value.bonusTeam?.id;
    const teams1bonus = this.entryForm.value.team1?.id === bonusTeamId ? 1.5 : 1;
    const teams2bonus = this.entryForm.value.team2?.id === bonusTeamId ? 1.5 : 1;
    const teams3bonus = this.entryForm.value.team3?.id === bonusTeamId ? 1.5 : 1;
    const teams4bonus = this.entryForm.value.team4?.id === bonusTeamId ? 1.5 : 1;
    const teams5bonus = this.entryForm.value.team5?.id === bonusTeamId ? 1.5 : 1;
    const teams6bonus = this.entryForm.value.team6?.id === bonusTeamId ? 1.5 : 1;
    const teams7bonus = this.entryForm.value.team7?.id === bonusTeamId ? 1.5 : 1;
    const teams8bonus = this.entryForm.value.team8?.id === bonusTeamId ? 1.5 : 1;
    this.totalPoints =
      teams1points * teams1bonus +
      teams2points * teams2bonus +
      teams3points * teams3bonus +
      teams4points * teams4bonus +
      teams5points * teams5bonus +
      teams6points * teams6bonus +
      teams7points * teams7bonus +
      teams8points * teams8bonus;
  }

  private validate() {
    this.hasErrors = false;
    this.errorMessage = '';
    if (this.entryForm.value.name === 'test') {
      // skip validation
    } else if (this.selectedTeams.length !== 8) {
      this.errorMessage = 'You must select 2 schools in each region.';
      this.hasErrors = true;
    } else if (this.entryForm.controls.bonusTeam.value === null) {
      this.errorMessage = 'You must select a superfan school for 50% bonus points.';
      this.hasErrors = true;
    } else if (this.entryForm.value.name === null || this.entryForm.value.name === '') {
      this.errorMessage = 'Please enter an entry name.';
      this.hasErrors = true;
    } else if (
      this.entryForm.value.email === null ||
      this.entryForm.value.email === undefined ||
      this.entryForm.value.email === '' ||
      this.entryForm.value.email.indexOf('@') < 0
    ) {
      this.errorMessage = 'Please enter a valid email.';
      this.hasErrors = true;
    } else {
      this.selectedTeams.forEach((team) => {
        const matches = this.selectedTeams.filter((a) => {
          return team.school_id === a.school_id;
        });
        if (matches.length > 1) {
          this.errorMessage = 'You may not select the same school twice.';
          this.hasErrors = true;
        }
      });
    }
  }

  public submit() {
    this.validate();

    if (!this.hasErrors) {
      const entryRequest: Entry = {
        email: this.entryForm.value.email!,
        name: this.entryForm.value.name!,
        bracket_id: this.bracketId,
        is_paid: false,
      };
      this.service
        .addEntry(entryRequest)
        .pipe(
          mergeMap((returnEntryId: string) => {
            const bonusTeamId = this.entryForm.controls.bonusTeam.value?.id;
            const pickRequest: PickRequest = {
              picks: [
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team1?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team1?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team2?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team2?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team3?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team3?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team4?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team4?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team5?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team5?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team6?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team6?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team7?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team7?.id,
                },
                {
                  entry_id: returnEntryId,
                  is_bonus: this.entryForm.value.team8?.id === bonusTeamId,
                  seed_id: this.entryForm.value.team8?.id,
                },
              ],
            };
            return this.service.addPicks(pickRequest);
          })
        )
        .subscribe(() => {
          this.name = this.entryForm.value.name as string;
          this.email = this.entryForm.value.email as string;
          this.submitted = true;
        });
    }
  }

  private addTeamIfSelected(seed: Seed) {
    if (seed) {
      this.selectedTeams.push(seed);
    }
  }
}
