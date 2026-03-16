import { Injectable } from '@angular/core';
import { BracketService } from './bracket.service';
import { Settings } from '../models/settings.model';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  // Current bracket ID - consolidate all references to this constant
  public readonly CURRENT_BRACKET_ID = 5;

  public settings$: Observable<Settings>;

  constructor(private bracketService: BracketService) {
    // Cache the settings observable so it's only fetched once
    this.settings$ = this.bracketService.getSettings().pipe(shareReplay(1));
  }
}
