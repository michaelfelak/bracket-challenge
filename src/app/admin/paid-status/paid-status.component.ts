import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { Entry } from 'src/app/shared/models/entry.model';
import { SkyRepeaterModule } from '@skyux/lists';
import { SkyIconModule } from '@skyux/indicators';
import { mergeMap } from 'rxjs';
import {
  SkyConfirmInstance,
  SkyConfirmService,
  SkyConfirmType,
  SkyModalModule,
} from '@skyux/modals';

@Component({
  selector: 'app-paid-status',
  standalone: true,
  imports: [CommonModule, SkyRepeaterModule, SkyIconModule, SkyModalModule],
  templateUrl: './paid-status.component.html',
  styleUrls: ['./paid-status.component.scss'],
})
export class PaidStatusComponent implements OnInit {
  @Input()
  public bracketId: number = -1;
  public numUnpaidEntries: number = 0;
  public numPaidEntries: number = 0;
  public selectedAction: any;
  public selectedText: any;

  public entries: Entry[] = [];

  constructor(private service: BracketService, private confirmService: SkyConfirmService) {}

  ngOnInit() {
    this.refresh();
  }

  public refresh() {
    this.service.getEntryList(this.bracketId).subscribe(
      (result) => {
        this.entries = result;
        this.sortEntriesByPaidStatus();
        this.calculatePaidTotal();
      },
      (err: Error) => {
        console.log('error reaching the web service: ', err);
      }
    );
  }

  // sorts entries by paid status, unpaid then paid
  public sortEntriesByPaidStatus() {
    if (this.entries) {
      this.entries.sort((a: Entry, b: Entry) => {
        return Number(a.is_paid) - Number(b.is_paid);
      });
    }
  }

  public togglePaid(id: string) {
    this.service
      .togglePaid(id)
      .pipe(
        mergeMap((result: any) => {
          return this.service.getEntryList(this.bracketId);
        })
      )
      .subscribe((result: Entry[]) => {
        this.entries = result;
        this.calculatePaidTotal();
        this.sortEntriesByPaidStatus();
      });
  }
  public deleteEntry(id: string) {
    const dialog: SkyConfirmInstance = this.confirmService.open({
      message: 'Delete entry ' + id,
      body: 'Are you sure you want to delete this entry?',
      type: SkyConfirmType.YesCancel,
    });

    dialog.closed.subscribe((result: any) => {
      if (result.action === 'yes') {
        this.service.deleteEntry(id).subscribe(() => {
          this.refresh();
          this.calculatePaidTotal();
        });
      }
    });
  }

  private calculatePaidTotal() {
    if (this.entries) {
      this.numPaidEntries = this.entries.filter(function (entry) {
        return entry.is_paid === true;
      }).length;

      this.numUnpaidEntries = this.entries.filter(function (entry) {
        return entry.is_paid === false;
      }).length;
    }
  }
}
