import { Injectable } from '@angular/core';
import standings from '../../../assets/2025-standings.json';
import points from '../../../assets/2025-points.json';

@Injectable()
export class StaticBracketService {
  public standings: any[] = [];

  public getStandings(): any[] {
    return standings.standings;
  }

  public points: any[] = [];

  public getPoints(): any[]{
    return points.points;
  }
}
