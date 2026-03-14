import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './statistics.service';
import { PickModel } from '../models/pick.model';
import { Seed } from '../models/seed';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatisticsService]
    });
    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Test Case 1: No Regional Conflicts', () => {
    it('should calculate possible points with no conflicts', () => {
      // 4 picks, all different regions, max_round = 6
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #3', is_bonus: false, seed_number: 3, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #5', is_bonus: false, seed_number: 5, region_name: 'Region 2' },
        { id: '3', seed_id: 3, entry_id: 'entry1', school_name: 'Team #7', is_bonus: false, seed_number: 7, region_name: 'Region 3' },
        { id: '4', seed_id: 4, entry_id: 'entry1', school_name: 'Team #2', is_bonus: false, seed_number: 2, region_name: 'Region 4' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 3, region_id: 1, school_name: 'Team #3' },
        { id: 2, seed_number: 5, region_id: 2, school_name: 'Team #5' },
        { id: 3, seed_number: 7, region_id: 3, school_name: 'Team #7' },
        { id: 4, seed_number: 2, region_id: 4, school_name: 'Team #2' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // #3: 3 × 21 = 63
      // #5: 5 × 21 = 105
      // #7: 7 × 21 = 147
      // #2: 2 × 21 = 42
      // Total: 357
      expect(result.totalPossiblePoints).toBe(357);
      expect(result.pickResults.length).toBe(4);
      expect(result.pickResults[0].possiblePoints).toBe(63);
      expect(result.pickResults[1].possiblePoints).toBe(105);
      expect(result.pickResults[2].possiblePoints).toBe(147);
      expect(result.pickResults[3].possiblePoints).toBe(42);
    });
  });

  describe('Test Case 2: Same Region, Round 4 Conflict', () => {
    it('should calculate points when two picks are from same region with R4 conflict', () => {
      // #3 and #5 from region 1 - They meet in Round 4 (Regional Final)
      // #3 is in Q4 [3,14,6,11], #5 is in Q2 [4,13,5,12]
      // R3 processes: Q1 vs Q2 (includes #5), Q3 vs Q4 (includes #3)
      // If both win R3, they meet in R4
      // #3 (seed 3) is stronger than #5 (seed 5)? NO - lower number is stronger
      // #3 is stronger, #5 is weaker, so #5 is capped at R4
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #3', is_bonus: false, seed_number: 3, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #5', is_bonus: false, seed_number: 5, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 3, region_id: 1, school_name: 'Team #3' },
        { id: 2, seed_number: 5, region_id: 1, school_name: 'Team #5' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // #3: 3 × (1+2+3+4+5+6) = 3 × 21 = 63
      // #5: 5 × (1+2+3+4) = 5 × 10 = 50 (capped at R4)
      // Total: 113
      expect(result.totalPossiblePoints).toBe(113);
      expect(result.pickResults[0].maxFeasibleRound).toBe(6); // #3 is stronger
      expect(result.pickResults[1].maxFeasibleRound).toBe(4); // #5 is weaker, capped at R4
      expect(result.pickResults[1].conflictRound).toBe(4);
    });
  });

  describe('Test Case 3: Round 1 Conflict', () => {
    it('should detect Round 1 conflict (8 vs 9)', () => {
      // #8 and #9 - they play in Round 1
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #8', is_bonus: false, seed_number: 8, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #9', is_bonus: false, seed_number: 9, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 8, region_id: 1, school_name: 'Team #8' },
        { id: 2, seed_number: 9, region_id: 1, school_name: 'Team #9' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // Both max out at round 1
      // #8: 8 × 1 = 8
      // #9: 9 × 1 = 9
      // Total: 17
      expect(result.totalPossiblePoints).toBe(17);
      expect(result.pickResults[0].maxFeasibleRound).toBe(1);
      expect(result.pickResults[0].conflictRound).toBe(1);
      expect(result.pickResults[1].maxFeasibleRound).toBe(1);
    });
  });

  describe('Test Case 4: Round 2 Conflict', () => {
    it('should detect Round 2 conflict (1 vs 8)', () => {
      // #1 and #8 - they play in Round 2 if both win R1
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #1', is_bonus: false, seed_number: 1, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #8', is_bonus: false, seed_number: 8, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 1, region_id: 1, school_name: 'Team #1' },
        { id: 2, seed_number: 8, region_id: 1, school_name: 'Team #8' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // Both max out at round 2
      // Max = 1 + 2 = 3
      // #1: 1 × 3 = 3
      // #8: 8 × 3 = 24
      // Total: 27
      expect(result.totalPossiblePoints).toBe(27);
      expect(result.pickResults[0].maxFeasibleRound).toBe(2);
      expect(result.pickResults[0].conflictRound).toBe(2);
      expect(result.pickResults[1].maxFeasibleRound).toBe(2);
    });
  });

  describe('Test Case 5: Round 3 Conflict', () => {
    it('should detect Round 3 conflict (1 vs 4)', () => {
      // #1 and #4 - they play in Round 3 if both win R1 and R2
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #1', is_bonus: false, seed_number: 1, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #4', is_bonus: false, seed_number: 4, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 1, region_id: 1, school_name: 'Team #1' },
        { id: 2, seed_number: 4, region_id: 1, school_name: 'Team #4' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // Both max out at round 3
      // Max = 1 + 2 + 3 = 6
      // #1: 1 × 6 = 6
      // #4: 4 × 6 = 24
      // Total: 30
      expect(result.totalPossiblePoints).toBe(30);
      expect(result.pickResults[0].maxFeasibleRound).toBe(3);
      expect(result.pickResults[0].conflictRound).toBe(3);
      expect(result.pickResults[1].maxFeasibleRound).toBe(3);
    });
  });

  describe('Test Case 6: Bonus Multiplier', () => {
    it('should apply 1.5x multiplier for bonus picks', () => {
      // #5 seed with bonus, no conflicts
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #5', is_bonus: true, seed_number: 5, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 5, region_id: 1, school_name: 'Team #5' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // #5: 5 × 21 × 1.5 = 157.5
      expect(result.totalPossiblePoints).toBe(157.5);
    });
  });

  describe('Test Case 7: Complex Entry', () => {
    it('should handle complex entry with multiple conflicts', () => {
      // Region 1: #2 and #7 (R2 conflict)
      // Region 2: #3 (no conflict)
      // Region 3: #5 (no conflict)
      // Region 4: #8 (no conflict)
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #2', is_bonus: false, seed_number: 2, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #7', is_bonus: false, seed_number: 7, region_name: 'Region 1' },
        { id: '3', seed_id: 3, entry_id: 'entry1', school_name: 'Team #3', is_bonus: false, seed_number: 3, region_name: 'Region 2' },
        { id: '4', seed_id: 4, entry_id: 'entry1', school_name: 'Team #5', is_bonus: false, seed_number: 5, region_name: 'Region 3' },
        { id: '5', seed_id: 5, entry_id: 'entry1', school_name: 'Team #8', is_bonus: false, seed_number: 8, region_name: 'Region 4' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 2, region_id: 1, school_name: 'Team #2' },
        { id: 2, seed_number: 7, region_id: 1, school_name: 'Team #7' },
        { id: 3, seed_number: 3, region_id: 2, school_name: 'Team #3' },
        { id: 4, seed_number: 5, region_id: 3, school_name: 'Team #5' },
        { id: 5, seed_number: 8, region_id: 4, school_name: 'Team #8' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);

      // #2: 2 × 3 = 6 (R2 conflict)
      // #7: 7 × 3 = 21 (R2 conflict)
      // #3: 3 × 21 = 63
      // #5: 5 × 21 = 105
      // #8: 8 × 21 = 168
      // Total: 363
      expect(result.totalPossiblePoints).toBe(363);
      expect(result.pickResults[0].possiblePoints).toBe(6);
      expect(result.pickResults[1].possiblePoints).toBe(21);
      expect(result.pickResults[2].possiblePoints).toBe(63);
      expect(result.pickResults[3].possiblePoints).toBe(105);
      expect(result.pickResults[4].possiblePoints).toBe(168);
    });
  });

  describe('Round 1 Pairings Detection', () => {
    it('should detect all Round 1 pairings', () => {
      const testCases = [
        [1, 16], [2, 15], [3, 14], [4, 13],
        [5, 12], [6, 11], [7, 10], [8, 9]
      ];

      testCases.forEach(pair => {
        const picks: PickModel[] = [
          { id: '1', seed_id: 1, entry_id: 'entry1', school_name: `Team #${pair[0]}`, is_bonus: false, seed_number: pair[0], region_name: 'Region 1' },
          { id: '2', seed_id: 2, entry_id: 'entry1', school_name: `Team #${pair[1]}`, is_bonus: false, seed_number: pair[1], region_name: 'Region 1' }
        ];

        const seeds: Seed[] = [
          { id: 1, seed_number: pair[0], region_id: 1, school_name: `Team #${pair[0]}` },
          { id: 2, seed_number: pair[1], region_id: 1, school_name: `Team #${pair[1]}` }
        ];

        const result = service.calculateEntryPossiblePoints(picks, seeds);
        expect(result.pickResults[0].maxFeasibleRound).toBe(1, `Pair [${pair}] should conflict in Round 1`);
        expect(result.pickResults[0].conflictRound).toBe(1);
      });
    });
  });

  describe('Round 2 Pairings Detection', () => {
    it('should detect Round 2 pairing (1 vs 9)', () => {
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #1', is_bonus: false, seed_number: 1, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #9', is_bonus: false, seed_number: 9, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 1, region_id: 1, school_name: 'Team #1' },
        { id: 2, seed_number: 9, region_id: 1, school_name: 'Team #9' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);
      expect(result.pickResults[0].maxFeasibleRound).toBe(2);
      expect(result.pickResults[0].conflictRound).toBe(2);
    });

    it('should detect Round 2 pairing (5 vs 12)', () => {
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #5', is_bonus: false, seed_number: 5, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #12', is_bonus: false, seed_number: 12, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 5, region_id: 1, school_name: 'Team #5' },
        { id: 2, seed_number: 12, region_id: 1, school_name: 'Team #12' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);
      expect(result.pickResults[0].maxFeasibleRound).toBe(2);
      expect(result.pickResults[0].conflictRound).toBe(2);
    });
  });

  describe('Round 3 Pairings Detection', () => {
    it('should detect Round 3 pairing (1 vs 5)', () => {
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #1', is_bonus: false, seed_number: 1, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #5', is_bonus: false, seed_number: 5, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 1, region_id: 1, school_name: 'Team #1' },
        { id: 2, seed_number: 5, region_id: 1, school_name: 'Team #5' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);
      expect(result.pickResults[0].maxFeasibleRound).toBe(3);
      expect(result.pickResults[0].conflictRound).toBe(3);
    });

    it('should detect Round 3 pairing (8 vs 13)', () => {
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #8', is_bonus: false, seed_number: 8, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #13', is_bonus: false, seed_number: 13, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 8, region_id: 1, school_name: 'Team #8' },
        { id: 2, seed_number: 13, region_id: 1, school_name: 'Team #13' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);
      expect(result.pickResults[0].maxFeasibleRound).toBe(3);
      expect(result.pickResults[0].conflictRound).toBe(3);
    });
  });

  describe('Non-Conflicting Seeds', () => {
    it('should detect Round 3 conflict for seeds in same R3 pairing', () => {
      // #2 vs #3: Both in [[2,15,7,10], [3,14,6,11]] groups - they meet in R3
      // #2 (seed 2) is stronger than #3 (seed 3)
      
      const picks: PickModel[] = [
        { id: '1', seed_id: 1, entry_id: 'entry1', school_name: 'Team #2', is_bonus: false, seed_number: 2, region_name: 'Region 1' },
        { id: '2', seed_id: 2, entry_id: 'entry1', school_name: 'Team #3', is_bonus: false, seed_number: 3, region_name: 'Region 1' }
      ];

      const seeds: Seed[] = [
        { id: 1, seed_number: 2, region_id: 1, school_name: 'Team #2' },
        { id: 2, seed_number: 3, region_id: 1, school_name: 'Team #3' }
      ];

      const result = service.calculateEntryPossiblePoints(picks, seeds);
      // #2: 2 × 21 = 42 (stronger, not capped)
      // #3: 3 × 6 = 18 (weaker, capped at R3)
      // Total: 60
      expect(result.totalPossiblePoints).toBe(60);
      expect(result.pickResults[0].maxFeasibleRound).toBe(6); // #2 is stronger
      expect(result.pickResults[0].conflictRound).toBe(3);
      expect(result.pickResults[1].maxFeasibleRound).toBe(3); // #3 is weaker, capped at R3
      expect(result.pickResults[1].conflictRound).toBe(3);
    });
  });
});
