import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyCheckboxModule, SkyInputBoxModule } from '@skyux/forms';
import { SkyBoxModule, SkyFluidGridModule } from '@skyux/layout';
import { SkyPageModule } from '@skyux/pages';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from '../shared/services/bracket.service';
import { mergeMap, takeUntil } from 'rxjs/operators';
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
  public totalPoints = 0;
  public name = '';
  public email = '';
  public bracketId = 2;

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
    teamBonus1: FormControl<boolean | null>;
    teamBonus2: FormControl<boolean | null>;
    teamBonus3: FormControl<boolean | null>;
    teamBonus4: FormControl<boolean | null>;
    teamBonus5: FormControl<boolean | null>;
    teamBonus6: FormControl<boolean | null>;
    teamBonus7: FormControl<boolean | null>;
    teamBonus8: FormControl<boolean | null>;
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
      teamBonus1: new FormControl(false),
      teamBonus2: new FormControl(false),
      teamBonus3: new FormControl(false),
      teamBonus4: new FormControl(false),
      teamBonus5: new FormControl(false),
      teamBonus6: new FormControl(false),
      teamBonus7: new FormControl(false),
      teamBonus8: new FormControl(false),
    });

    // this.entryForm.controls.teamBonus8.valueChanges
    // .pipe(takeUntil(this.ngUnsubscribe))
    // .subscribe((value)=>{
    //   this.entryForm.controls.teamBonus8.setValue(value);
    //   this.update();
    // })
  }

  ngOnInit() {
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
      this.teams3 = result.filter((seed) => {
        return seed.region_id === 3;
      });
      this.teams4 = result.filter((seed) => {
        return seed.region_id === 4;
      });

      console.log(result);
    });
  }

  public submit2() {
    console.log(this.entryForm);
  }

  private validate() {}

  public submit() {
    this.validate();
    const entryRequest: Entry = {
      email: 'email',
      name: 'name',
    };
    this.service
      .addEntry(entryRequest)
      .pipe(
        mergeMap((returnEntryId: string) => {
          let pickRequest: PickRequest = {
            picks: [
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus1?.valueOf(),
                seed_id: this.entryForm.value.team1?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus2?.valueOf(),
                seed_id: this.entryForm.value.team2?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus3?.valueOf(),
                seed_id: this.entryForm.value.team3?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus4?.valueOf(),
                seed_id: this.entryForm.value.team4?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus5?.valueOf(),
                seed_id: this.entryForm.value.team5?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus6?.valueOf(),
                seed_id: this.entryForm.value.team6?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus7?.valueOf(),
                seed_id: this.entryForm.value.team7?.id,
              },
              {
                entry_id: returnEntryId,
                is_bonus: this.entryForm.value.teamBonus8?.valueOf(),
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
  public update() {
    console.log(this.entryForm.value);
    this.entryForm.markAllAsTouched();
    const teams1points = this.entryForm.value.team1?.possible_points ?? 0;
    const teams2points = this.entryForm.value.team2?.possible_points ?? 0;
    const teams3points = this.entryForm.value.team3?.possible_points ?? 0;
    const teams4points = this.entryForm.value.team4?.possible_points ?? 0;
    const teams5points = this.entryForm.value.team5?.possible_points ?? 0;
    const teams6points = this.entryForm.value.team6?.possible_points ?? 0;
    const teams7points = this.entryForm.value.team7?.possible_points ?? 0;
    const teams8points = this.entryForm.value.team8?.possible_points ?? 0;
    const teams1bonus = this.entryForm.value.teamBonus1 ? 1.5 : 1;
    const teams2bonus = this.entryForm.value.teamBonus2 ? 1.5 : 1;
    const teams3bonus = this.entryForm.value.teamBonus3 ? 1.5 : 1;
    const teams4bonus = this.entryForm.value.teamBonus4 ? 1.5 : 1;
    const teams5bonus = this.entryForm.value.teamBonus5 ? 1.5 : 1;
    const teams6bonus = this.entryForm.value.teamBonus6 ? 1.5 : 1;
    const teams7bonus = this.entryForm.value.teamBonus7 ? 1.5 : 1;
    const teams8bonus = this.entryForm.value.teamBonus8 ? 1.5 : 1;
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
}
