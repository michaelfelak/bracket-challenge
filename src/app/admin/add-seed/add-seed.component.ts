import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { School } from 'src/app/shared/models/school.model';
import { Seed } from 'src/app/shared/models/seed';
import { SkyInputBoxModule } from '@skyux/forms';
import { SkyPageModule } from '@skyux/pages';
import { SkyRepeaterModule } from '@skyux/lists';
import { Subject, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-add-seed',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SkyInputBoxModule, SkyPageModule, SkyRepeaterModule],
  templateUrl: './add-seed.component.html',
  styleUrls: ['./add-seed.component.scss'],
})
export class AddSeedComponent implements OnInit {
  @Input()
  public bracketId = 0;

  @Output()
  public seedAdded = new EventEmitter();

  public formGroup: FormGroup<{
    schoolId: FormControl<number | null>;
    seedNumber: FormControl<number | null>;
    regionId: FormControl<number | null>;
    overallSeedNumber: FormControl<number | null>;
  }>;

  public schoolList: School[] = [];
  public seeds: Seed[] = [];

  private selectedSchoolId = 0;

  private ngUnsubscribe = new Subject<void>();

  constructor(private service: BracketService, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      schoolId: new FormControl(0),
      seedNumber: new FormControl(0),
      regionId: new FormControl(0),
      overallSeedNumber: new FormControl(0),
    });

    this.formGroup.controls.schoolId.valueChanges
      .pipe(distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
      .subscribe((result) => {
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
    this.updateSeeds();
  }

  public updateSeeds() {
    this.service.getSeedList(this.bracketId).subscribe((result) => {
      this.seeds = result;
    });
  }

  public submit() {
    const seed: Seed = {
      bracket_id: this.bracketId,
      school_id: this.selectedSchoolId,
      seed_number: this.formGroup.controls.seedNumber?.value!,
      overall_seed_number: this.formGroup.controls.overallSeedNumber.value!,
      region_id: this.formGroup.controls.regionId.value!,
    };

    if (seed.school_id && seed.seed_number && seed.overall_seed_number && seed.region_id) {
      this.service.addSeed(seed).subscribe(() => {
        this.seedAdded.emit();
        this.updateSeeds();
      });
    } else {
      alert('info missing');
    }
  }
}
