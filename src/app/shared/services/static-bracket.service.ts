import { Injectable, OnInit } from '@angular/core';
import standings from '../../../assets/2024-standings.json';

@Injectable()
export class StaticBracketService {
  public standings: any[] = [];

  public getStandings(): any[] {
    return standings.standings;
  }
}
