import { Component } from '@angular/core';
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
  ],
  providers: [BracketService],
})
export class EntryComponent {
  // assign teams
  public teams1: Seed[] = [];
  public teams2: Seed[] = [];
  public teams3: Seed[] = [];
  public teams4: Seed[] = [];
  public selectedTeams: Seed[] = [];
  public totalPoints = 0;
  public name = '';
  public email = '';
  public bracketId = 2;

  public submitDisabled = false;

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
    name: FormControl<string>;
    email: FormControl<string>;
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
      name: new FormControl(),
      email: new FormControl(),
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
    // this.service.getBrackets().subscribe((brackets) => {
    //   console.log(brackets);
    // });
    this.service.getSeedList(this.bracketId).subscribe((result) => {
      result.forEach((r) => {
        const n = r.seed_number!;
        r.possible_points = 16 * n;
      });
      this.teams1 = result.filter((seed) => {
        return seed.region_id === 1;
      });
      this.teams2 = result.filter((seed) => {
        return seed.region_id === 2;
      });
      0;
      this.teams3 = result.filter((seed) => {
        return seed.region_id === 3;
      });
      this.teams4 = result.filter((seed) => {
        return seed.region_id === 4;
      });

      console.log(result);
    });
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

  private validate() {}

  public submit() {
    this.validate();
    const entryRequest: Entry = {
      email: this.entryForm.value.email!,
      name: this.entryForm.value.name!,
    };
    this.service
      .addEntry(entryRequest)
      .pipe(
        mergeMap((returnEntryId: string) => {
          let bonusTeamId = this.entryForm.controls.bonusTeam.value?.id;
          let pickRequest: PickRequest = {
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
      .subscribe((pickresult: any) => {
        console.log('pick result');
        console.log(pickresult);

        this.name = this.entryForm.value.name as string;
        this.email = this.entryForm.value.email as string;
      });
  }

  private addTeamIfSelected(seed: Seed) {
    if (seed) {
      this.selectedTeams.push(seed);
    }
  }
}
