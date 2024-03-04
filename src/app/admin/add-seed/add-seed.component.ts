import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { School } from 'src/app/shared/models/school.model';
import { Seed } from 'src/app/shared/models/seed';
import { SkyInputBoxModule } from '@skyux/forms';
import { SkyPageModule } from '@skyux/pages';

@Component({
  selector: 'app-add-seed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SkyInputBoxModule, SkyPageModule],
  templateUrl: './add-seed.component.html',
  styleUrls: ['./add-seed.component.scss'],
})
export class AddSeedComponent implements OnInit {
  @Input()
  public bracketId: number = 0;

  public formGroup: FormGroup<{
    schoolId: FormControl<number | null>;
    seedNumber: FormControl<number | null>;
    regionId: FormControl<number | null>;
    overallSeedNumber: FormControl<number | null>;
  }>;

  public schoolList: School[] = [];
  public seeds: Seed[] = [];

  private selectedSchoolId = 0;

  constructor(private service: BracketService, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      schoolId: new FormControl(0),
      seedNumber: new FormControl(0),
      regionId: new FormControl(0),
      overallSeedNumber: new FormControl(0),
    });

    this.formGroup.controls.schoolId.valueChanges.subscribe((result) => {
      this.selectedSchoolId = result!;
    });
  }

  public ngOnInit() {
    this.initializeData();
  }

  private initializeData() {
    this.service.getSchools().subscribe((result) => {
      this.schoolList = result;
    });

    // this.service.getSeeds().subscribe((result) => {
    //   this.seeds = result;
    //   console.log(result);
    // });
  }
  public submit() {
    const seed: Seed = {
      bracket_id: this.bracketId,
      school_id: this.selectedSchoolId,
      seed_number: this.formGroup.controls.seedNumber?.value!,
      overall_seed_number: this.formGroup.controls.overallSeedNumber.value!,
    };

    this.service.addSeed(seed).subscribe((result) => {
      console.log(result);
    });
  }
}
