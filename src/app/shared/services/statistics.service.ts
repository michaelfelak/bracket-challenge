import { Injectable } from '@angular/core';
import { PickModel } from '../models/pick.model';
import { Seed } from '../models/seed';
import { Bracket } from '../models/bracket';

interface PickWithSeed extends PickModel {
  seedNumber?: number;
  regionId?: number;
}

interface PossiblePointsResult {
  pickId: string;
  seedNumber: number;
  schoolName: string;
  maxFeasibleRound: number;
  possiblePoints: number;
  isBonus?: boolean;
  isEliminated: boolean;
  eliminatedInRound?: number;
  conflictingPickSeedNumber?: number;
  conflictRound?: number;
}

interface EntryPossiblePointsResult {
  entryId: string;
  totalPossiblePoints: number;
  pickResults: PossiblePointsResult[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  constructor() { }

  /**
   * Calculates possible points for an entire entry
   */
  public calculateEntryPossiblePoints(
    picks: PickModel[],
    seeds: Seed[],
    eliminatedSeeds: number[] = []
  ): EntryPossiblePointsResult {
    
    const enrichedPicks: PickWithSeed[] = picks.map(pick => {
      const seed = seeds.find(s => s.id === pick.seed_id);
      return {
        ...pick,
        seedNumber: seed?.seed_number,
        regionId: seed?.region_id
      };
    });

    const pickResults = enrichedPicks.map(pick => {
      return this.calculatePossiblePointsForSeed(
        pick,
        enrichedPicks,
        eliminatedSeeds
      );
    });

    const totalPossiblePoints = pickResults.reduce(
      (sum, result) => sum + result.possiblePoints,
      0
    );

    return {
      entryId: picks[0]?.entry_id || '',
      totalPossiblePoints,
      pickResults
    };
  }

  /**
   * Calculates possible points for a single pick
   */
  private calculatePossiblePointsForSeed(
    pick: PickWithSeed,
    allPicks: PickWithSeed[],
    eliminatedSeeds: number[]
  ): PossiblePointsResult {
    
    const seedNumber = pick.seedNumber || 1;
    const schoolName = pick.school_name || '';
    const isBonus = pick.is_bonus || false;
    const multiplier = isBonus ? 1.5 : 1.0;
    const pickId = pick.id || '';

    // Check if this team is already eliminated
    const isEliminated = eliminatedSeeds.includes(pick.seed_id as number);
    
    if (isEliminated) {
      // For eliminated teams, calculate points up to where they lost
      // This requires knowing which round they lost in
      // For now, return a default of 1 round
      const eliminatedInRound = 1; // TODO: Get actual round from database
      const possiblePoints = this.calculatePointsForRound(seedNumber, eliminatedInRound, multiplier);
      
      return {
        pickId,
        seedNumber,
        schoolName,
        maxFeasibleRound: eliminatedInRound,
        possiblePoints,
        isBonus,
        isEliminated: true,
        eliminatedInRound
      };
    }

    // Get all other picks from the same region
    const otherPicksFromRegion = allPicks.filter(
      p => p.regionId === pick.regionId && p.seed_id !== pick.seed_id
    );
    
    let maxFeasibleRound = 6; // Default: can reach championship
    let conflictingPickSeedNumber: number | undefined;
    let conflictRound: number | undefined;

    // For each conflict with another pick from same region, determine if this pick wins
    for (const otherPick of otherPicksFromRegion) {
      const otherSeedNumber = otherPick.seedNumber || 1;
      const otherIsBonus = otherPick.is_bonus || false;
      const conflictInfo = this.getConflictRound(seedNumber, otherSeedNumber);
      
      if (conflictInfo !== null) {
        // Determine which pick has higher potential (better seed or has bonus)
        // Lower seed number = better seed
        // If this pick has bonus and other doesn't, this pick wins
        // If same bonus status, lower seed number wins
        const thisPickPotential = seedNumber * (isBonus ? 1.5 : 1.0);
        const otherPickPotential = otherSeedNumber * (otherIsBonus ? 1.5 : 1.0);
        
        if (thisPickPotential < otherPickPotential) {
          // This pick is weaker - it loses the conflict
          // Cap it at the conflict round (only gets points for winning up to that round)
          maxFeasibleRound = conflictInfo;
          conflictingPickSeedNumber = otherSeedNumber;
          conflictRound = conflictInfo;
          // Don't break - check other conflicts too
        }
        // If this pick is stronger, it wins the conflict and can advance past it
      }
    }

    // Calculate possible points
    const possiblePoints = this.calculatePointsUpToRound(seedNumber, maxFeasibleRound, multiplier);

    return {
      pickId,
      seedNumber,
      schoolName,
      maxFeasibleRound,
      possiblePoints,
      isBonus,
      isEliminated: false,
      conflictingPickSeedNumber,
      conflictRound
    };
  }

  /**
   * Gets the other pick from the same region
   */
  private getOtherPickFromRegion(pick: PickWithSeed, allPicks: PickWithSeed[]): PickWithSeed | null {
    const samRegionPicks = allPicks.filter(
      p => p.regionId === pick.regionId && p.seed_id !== pick.seed_id
    );
    return samRegionPicks.length > 0 ? samRegionPicks[0] : null;
  }

  /**
   * Determines what round two seeds from the same region would play each other.
   * This is based on a static 16-seed single-elimination bracket structure.
   * Returns: 1 (Round 1), 2 (Round 2), 3 (Round 3), 4 (Round 4 - Regional Final)
   * Every pair of seeds from the same region will eventually conflict by Round 4 at the latest.
   */
  private getConflictRound(seed1: number, seed2: number): number | null {
    const minSeed = Math.min(seed1, seed2);
    const maxSeed = Math.max(seed1, seed2);

    // Round 1 Pairings: 1-16, 2-15, 3-14, 4-13, 5-12, 6-11, 7-10, 8-9
    const round1Pairs = [
      [1, 16], [2, 15], [3, 14], [4, 13],
      [5, 12], [6, 11], [7, 10], [8, 9]
    ];

    for (const pair of round1Pairs) {
      if (minSeed === pair[0] && maxSeed === pair[1]) {
        return 1;
      }
    }

    // Round 2 Pairings:
    // Winner(1,16) vs Winner(8,9)
    // Winner(2,15) vs Winner(7,10)
    // Winner(3,14) vs Winner(6,11)
    // Winner(4,13) vs Winner(5,12)
    const round2Groups = [
      [[1, 16], [8, 9]],
      [[2, 15], [7, 10]],
      [[3, 14], [6, 11]],
      [[4, 13], [5, 12]]
    ];

    for (const group of round2Groups) {
      const group1Seeds = group[0];
      const group2Seeds = group[1];
      const seed1InGroup1 = this.seedInGroup(seed1, group1Seeds);
      const seed2InGroup2 = this.seedInGroup(seed2, group2Seeds);
      const seed1InGroup2 = this.seedInGroup(seed1, group2Seeds);
      const seed2InGroup1 = this.seedInGroup(seed2, group1Seeds);

      if ((seed1InGroup1 && seed2InGroup2) || (seed1InGroup2 && seed2InGroup1)) {
        return 2;
      }
    }

    // Round 3 Pairings:
    // Winner(1,16,8,9) vs Winner(4,13,5,12)
    // Winner(2,15,7,10) vs Winner(3,14,6,11)
    const round3Groups = [
      [[1, 16, 8, 9], [4, 13, 5, 12]],
      [[2, 15, 7, 10], [3, 14, 6, 11]]
    ];

    for (const group of round3Groups) {
      const group1Seeds = group[0];
      const group2Seeds = group[1];
      const seed1InGroup1 = this.seedInGroup(seed1, group1Seeds);
      const seed2InGroup2 = this.seedInGroup(seed2, group2Seeds);
      const seed1InGroup2 = this.seedInGroup(seed1, group2Seeds);
      const seed2InGroup1 = this.seedInGroup(seed2, group1Seeds);

      if ((seed1InGroup1 && seed2InGroup2) || (seed1InGroup2 && seed2InGroup1)) {
        return 3;
      }
    }

    // Round 4: Regional Final
    // Seeds from different R3 bracket halves (1-8 range vs 9-16 range generally)
    // will meet in the regional final if they haven't already
    // If we reach here, seeds are in the same R3 group pair (both in top or both in bottom half)
    // and don't meet in R1, R2, or R3, so they meet in Round 4
    return 4;
  }

  /**
   * Helper: Check if a seed number is in a group
   */
  private seedInGroup(seed: number, group: number[]): boolean {
    return group.includes(seed);
  }

  /**
   * Calculate points for winning up to and including a specific round
   * Formula: seed × (1 + 2 + ... + round) = seed × [round × (round + 1) / 2]
   */
  private calculatePointsUpToRound(seed: number, maxRound: number, multiplier: number): number {
    const sumOfRounds = (maxRound * (maxRound + 1)) / 2;
    return seed * sumOfRounds * multiplier;
  }

  /**
   * Calculate points for winning only a specific single round
   * Formula: seed × round
   */
  private calculatePointsForRound(seed: number, round: number, multiplier: number): number {
    return seed * round * multiplier;
  }
}
