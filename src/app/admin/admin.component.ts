import { Component, OnInit } from '@angular/core';
import { SkyFluidGridModule } from '@skyux/layout';
import { AddRecordComponent } from './add-record/add-record.component';
import { BracketService } from '../shared/services/bracket.service';
import { AddSeedComponent } from './add-seed/add-seed.component';
import { Bracket } from '../shared/models/bracket';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SkyPageModule } from '@skyux/pages';
import { Seed } from '../shared/models/seed';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SkyFluidGridModule,
    AddRecordComponent,
    AddSeedComponent,
    SkyPageModule,
  ],
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public selectedBracketId: number = 2024;

  public brackets: Bracket[] = [];
  public existingSeeds: Seed[] = [];

  public formGroup: FormGroup<{
    bracketId: FormControl<number | null>;
  }>;

  constructor(private service: BracketService, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      bracketId: new FormControl(0),
    });
    this.formGroup.controls.bracketId.valueChanges.subscribe((result) => {
      console.log('bracketid changed to ' + result);
      this.selectedBracketId = result!;
      this.updateSeeds();
    });
  }

  ngOnInit() {
    this.service.getBrackets().subscribe((result) => {
      this.brackets = result;
    });

    this.updateSeeds();
  }

  public updateSeeds() {
    this.service.getSeedList(this.selectedBracketId).subscribe((result) => {
      this.existingSeeds = result;
    });
  }
}
