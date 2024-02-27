import { Component, inject } from '@angular/core';
import { TestData } from '../shared/test-data';
import { CommonModule } from '@angular/common';
import { SkyCheckboxModule } from '@skyux/forms';
import { SkyBoxModule, SkyFluidGridModule } from '@skyux/layout';
import { SkyPageModule } from '@skyux/pages';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from '../shared/services/bracket.service';
import { Entry, PickModel, PickRequest } from '../shared/services/bracket.model';
import { mergeMap } from 'rxjs/operators';
import { Seed } from '../shared/models/seed';

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
  ],
  providers: [TestData, BracketService],
})
export class EntryComponent {
  // assign teams
  public teams1 = this.testData.TEAMS.filter((team) => {
    return team.bracketId === 1;
  });
  public teams2 = this.testData.TEAMS.filter((team) => {
    return team.bracketId === 2;
  });
  public teams3 = this.testData.TEAMS.filter((team) => {
    return team.bracketId === 3;
  });
  public teams4 = this.testData.TEAMS.filter((team) => {
    return team.bracketId === 4;
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
    });
  }

  ngOnInit() {}

  public submit() {
    const entryRequest: Entry = {
      email: 'email',
      name: 'name',
    };
    this.service
      .addEntry(entryRequest)
      .pipe(
        mergeMap((returnEntryId: string) => {
          let pickRequest: PickRequest ={
            picks: [
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team1?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team2?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team3?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team4?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team5?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team6?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team7?.seedId,
              },
              {
                entry_id: returnEntryId,
                is_bonus: false,
                seed_id: this.entryForm.value.team8?.seedId,
              },
            ]
          }
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
