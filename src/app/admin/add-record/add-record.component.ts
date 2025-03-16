import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkyInputBoxModule } from '@skyux/forms';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SkyRepeaterModule } from '@skyux/lists';
import { School } from 'src/app/shared/models/school.model';

@Component({
  selector: 'app-add-record',
  standalone: true,
  imports: [CommonModule, SkyInputBoxModule, SkyRepeaterModule, ReactiveFormsModule],
  templateUrl: './add-record.component.html',
  styleUrls: ['./add-record.component.scss'],
})
export class AddRecordComponent {
  public formGroup: FormGroup<{
    schoolName: FormControl<string | null>;
    year: FormControl<number | null>;
  }>;

  constructor(private service: BracketService, private formBuilder: FormBuilder) {
    this.formGroup = this.formBuilder.group({
      schoolName: new FormControl(''),
      year: new FormControl(2025)
    });
  }

  public addSchool() {
    const request: School = {
      name: this.formGroup.value.schoolName!,
    };
    this.service.addSchool(request).subscribe(() => {
      // console.log(result);
    });
  }
  public addBracket() {
    this.service
      .addBracket({ year: this.formGroup.value.year!, region_1_id: 1, region_2_id: 2, region_3_id: 3, region_4_id: 4 })
      .subscribe((result) => {
        console.log(result);
      });
  }
}
