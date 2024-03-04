import { Component } from '@angular/core';
import { TestData } from '../shared/test-data';
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
  ],
  providers: [TestData, BracketService],
})
export class EntryComponent {
  // assign teams
  public teams1 = this.testData.TEAMS.filter((team) => {
    return team.bracket_id === 1;
  });
  public teams2 = this.testData.TEAMS.filter((team) => {
    return team.bracket_id === 2;
  });
  public teams3 = this.testData.TEAMS.filter((team) => {
    return team.bracket_id === 3;
  });
  public teams4 = this.testData.TEAMS.filter((team) => {
    return team.bracket_id === 4;
  });
  public selectedB: any;
  public selectedA: any;
  public totalPoints = 0;
  public name = '';
  public email = '';

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

  constructor(private testData: TestData, private service: BracketService) {
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
      teamBonus1: new FormControl(),
      teamBonus2: new FormControl(),
      teamBonus3: new FormControl(),
      teamBonus4: new FormControl(),
      teamBonus5: new FormControl(),
      teamBonus6: new FormControl(),
      teamBonus7: new FormControl(),
      teamBonus8: new FormControl(),
    });
  }

  ngOnInit() {}

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
  public changeTeam(s: any, i: number) {
    console.log(s);
    console.log(this.entryForm.value);
  }
}
