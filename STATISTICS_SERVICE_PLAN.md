# Bracket Challenge Statistics Service - Possible Points Calculation Plan

## Overview
Create a statistics service to calculate the **total possible points** a user can earn from their bracket picks, accounting for:
1. **Current tournament state** — which teams have already been eliminated
2. **Pairwise conflicts** — when 2 picks from the same region would play each other, only 1 can advance past that round
3. **Seed values** — higher seed numbers (1-16 within region) are worth more points per round

---

## Tournament Structure

### Format
- **64 teams** in 4 regions of 16 teams each
- **Regional seedings**: 1-16 in each region
- **Overall seedings**: 1-64 distributed across regions
- **Typical bracket entry**: 8 picks (1-2 per region, varies by entry style)

### Bracket Rounds and Natural Constraints
| Round | Name | Teams Playing | Winners | Key Constraint |
|-------|------|---|-------|-------|
| 1 | First Round | 64 | 32 | — |
| 2 | Second Round (Elite 8) | 32 | 16 | — |
| 3 | Regional Semifinals | 16 | 8 | — |
| 4 | Regional Finals | 8 | 4 | At most 1 pick per region can win |
| 5 | National Semifinals | 4 | 2 | **At most 2 picks can reach the Finals** |
| 6 | National Championship | 2 | 1 | **Only 1 pick can win** |

### Matchup Rules

**First Round (Round 1):**
- Standard seeding: 1 vs 16, 2 vs 15, 3 vs 14, ..., 8 vs 9
- Teams can include same-region matchups

**Second Round Onwards (Round 2+):**
- Winners of (1,16) vs (8,9) → Winner plays in Round 2
- Winners of (2,15) vs (7,10) → Winner plays in Round 2
- Winners of (3,14) vs (6,11) → Winner plays in Round 2
- Winners of (4,13) vs (5,12) → Winner plays in Round 2
- **Regional Constraint**: Only ONE team per region can advance past Round 2 (Elite 8)
  - After Round 1, up to 4 teams remain from each region
  - After Round 2, only 2 remain from each region (they must face each other in Round 3)
  - After Round 3, only 1 remains from each region (advances to Final 4)

---

## Current Data Model

### Key Entities
- **Seed** (bc_seed): Represents a team in the bracket
  - `id`: Unique identifier
  - `bracket_id`: Which bracket tournament
  - `region_id`: Which of 4 regions
  - `seed_number`: Regional seed (1-16)
  - `overall_seed_number`: Overall seed (1-64)
  - `school_id`: Reference to school
  - `school_name`: Team name
  - `possible_points`: **[TARGET FIELD]** - Maximum points this team can earn

- **Pick** (bc_pick): User's selection of a team
  - `id`: Unique identifier
  - `entry_id`: Which bracket entry
  - `seed_id`: Reference to seed
  - `is_bonus`: Whether bonus multiplier applies

- **Winner** (bc_winners): Tracks actual game results
  - `seed_id`: Team that won
  - `bracket_id`: Tournament reference
  - Records which teams have advanced to which rounds

---

## Point Calculation Logic

### Base Scoring Formula (Per Round Win)
```
Points per round win = Round Number × Seed Number × Multiplier
```

Where:
- **Round Number**: Which round the team wins (1-6)
- **Seed Number**: 1-16 (higher number = higher points per round)
- **Multiplier**: 1.0 normally, 1.5 if pick is marked as bonus

### Example of Individual Round Points
- A #6 seed that wins Round 1: 1 × 6 = 6 points
- A #6 seed that wins Round 2: 2 × 6 = 12 points
- A #6 seed that wins Round 3: 3 × 6 = 18 points
- A #6 seed that wins Round 6 (championship) with bonus: 6 × 6 × 1.5 = 54 points

### Possible Points Calculation
For a team that hasn't played yet, **possible points** = sum of all potential round wins up to max feasible round.

Formula:
```
Possible Points = Seed × (1 + 2 + ... + max_feasible_round) × Multiplier
                = Seed × [max_feasible_round × (max_feasible_round + 1) / 2] × Multiplier
```

### Examples of Possible Points
- #6 seed, no conflicts, no games played: 6 × (1+2+3+4+5+6) × 1.0 = 6 × 21 = **126 points**
- #6 seed, max_round = 3, no games played: 6 × (1+2+3) × 1.0 = 6 × 6 = **36 points**
- #6 seed, max_round = 2, no games played: 6 × (1+2) × 1.0 = 6 × 3 = **18 points**
- #6 seed, max_round = 1, no games played: 6 × 1 × 1.0 = **6 points**
- #6 seed with bonus, no conflicts: 6 × 21 × 1.5 = **189 points**

---

## Possible Points Calculation Algorithm

### Definition
**Possible Points** for a picked team = Maximum points that team can feasibly earn given:
1. Current tournament state (which teams have already been eliminated)
2. Bracket structure constraints (if this team plays another picked team from same region)
3. The team's current status (already won games, or still eligible)

**Important Note:** Possible points are calculated **per-pick individually**, assuming that pick wins all games up to its max_feasible_round. In practice, due to tournament structure:
- Only 2 picks total can actually reach the Finals (Round 5)
- Only 1 pick total can actually win the Championship (Round 6)

However, "possible points" represents the theoretical maximum for that single pick, not accounting for global tournament constraints.

### Key Insight: Maximum 2 Picks Per Region
Since users pick **at most 2 teams per region**, the constraint logic is simpler:
- If the 2 picked teams from a region would play each other, only 1 can advance past that round
- Otherwise, both can advance independently

### When Do Two Picked Teams Play Each Other?

**Round 1 Matchups (within region):**
- 1 vs 16
- 2 vs 15
- 3 vs 14
- 4 vs 13
- 5 vs 12
- 6 vs 11
- 7 vs 10
- 8 vs 9

If you pick two teams with seeds that match above, they meet in **Round 1**.

**Round 2 Matchups (within region, if both won Round 1):**
- Winner(1,16) vs Winner(8,9)
- Winner(2,15) vs Winner(7,10)
- Winner(3,14) vs Winner(6,11)
- Winner(4,13) vs Winner(5,12)

If you pick seeds like 1 and 8 (or 1 and 9), and both win Round 1, they meet in **Round 2**.

**Round 3 Matchups (within region, if both won Rounds 1 and 2):**
- Winner(1,16,8,9) vs Winner(4,13,5,12)
- Winner(2,15,7,10) vs Winner(3,14,6,11)

If you pick seeds from different Round 2 sub-brackets, they could meet in **Round 3**. Examples:
- Seeds 1 and 4 → meet in Round 3 (if both win first 2 games)
- Seeds 8 and 5 → meet in Round 3 (if both win first 2 games)
- Seeds 1 and 5 → meet in Round 3 (if both win first 2 games)

The potential Round 3 pairings are:
- Any seed from {1, 16, 8, 9} vs any seed from {4, 13, 5, 12}
- Any seed from {2, 15, 7, 10} vs any seed from {3, 14, 6, 11}

### Calculation Steps

#### Step 1: Determine Team's Current Status
For each picked team:
- Has it already been eliminated? (check bc_losers)
- If eliminated, find what round it lost in
- If still alive, proceed to Step 2

#### Step 2: Identify Conflicting Team from Same Region
Check if there's another pick from the same region:
- If yes: Determine if and when they would play each other
  - Calculate meeting round from seed pairings
- If no: Team has no conflict; can advance to Championship (Round 6)

#### Step 3: Calculate Maximum Feasible Round

**If team is eliminated:**
```
max_round = round_it_lost_in
```

**If no conflicting team from same region:**
```
max_round = 6 (Championship)
```

**If conflicting team exists:**
- Determine when they play (Round 1, Round 2, or Round 3 from seed pairing)
- If they play in Round 1:
  ```
  max_round = 1 (loser can't advance past R1)
  ```
- If they play in Round 2:
  ```
  max_round = 2 (loser can't advance past R2)
  ```
- If they play in Round 3:
  ```
  max_round = 3 (loser can't advance past R3)
  ```

#### Step 4: Calculate Possible Points

```
possible_points = seed_number × (1 + 2 + ... + max_round) × multiplier
                = seed_number × [max_round × (max_round + 1) / 2] × multiplier

where:
  seed_number = 1-16 (higher = more points)
  max_round = furthest round this team can advance
  multiplier = 1.0 normally, 1.5 if pick is_bonus = true
```

**Examples:**
- Seed 5, max_round 6, is_bonus=false: 5 × 21 = 105 points
- Seed 12, max_round 1 (R1 conflict), is_bonus=false: 12 × 1 = 12 points
- Seed 8, max_round 2 (R2 conflict), is_bonus=true: 8 × 3 × 1.5 = 36 points
- Seed 4, max_round 3 (R3 conflict), is_bonus=false: 4 × 6 = 24 points

#### Step 5: Aggregate Entry-Level Possible Points

```
Total Entry Possible Points = Sum of possible_points for all picks in entry
```

---

## Algorithm Implementation Details

### Key Functions to Create

#### 1. `calculatePossiblePointsForSeed(seed: Seed, entry: Entry, bracket: Bracket): number`
**Purpose:** Calculate possible points for a single picked team

**Logic:**
```
1. Check if seed has been eliminated (query bc_losers)
2. If eliminated: 
   - Find round it lost in
   - Return seed_number × lost_round × multiplier
3. If still alive:
   - Get the other pick from same region (if any)
   - Determine when these two teams would play (if at all)
   - Calculate max_feasible_round based on matchup
   - Return seed_number × max_feasible_round × multiplier
```

#### 2. `getOtherPickFromRegion(seed: Seed, entry: Entry, bracket: Bracket): Pick | null`
**Purpose:** Find if there's another pick from the same region

**Logic:**
```
1. Get region_id from seed
2. Query all picks for this entry
3. Find other pick(s) with same region_id
4. Return the other pick, or null if none
```

#### 3. `getConflictRound(seed1: Seed, seed2: Seed): number | null`
**Purpose:** Determine what round two seeds from same region would play

**Logic:**
```
1. Get seed numbers (1-16) for both seeds
2. Check Round 1 pairings:
   - If (s1, s2) match pairs (1,16), (2,15), ..., (8,9): return 1
3. Check Round 2 pairings (based on regional brackets):
   - If (s1, s2) would meet in Round 2: return 2
   - Example: seeds 1 and 8, or 1 and 9 would meet in R2
4. If seeds don't conflict: return null
```

#### 4. `calculateEntryPossiblePoints(entry: Entry, bracket: Bracket): number`
**Purpose:** Calculate total possible points for an entire user entry

**Logic:**
```
1. Get all picks for this entry
2. For each pick:
   - Call calculatePossiblePointsForSeed()
3. Sum all possible points
4. Return total
```

---

## Database Considerations

### Queries Needed

1. **Get all picks for an entry with seed details:**
   ```sql
   SELECT p.*, s.seed_number, s.overall_seed_number, s.region_id, s.school_id, s.school_name
   FROM bc_pick p
   JOIN bc_seed s ON p.seed_id = s.id
   WHERE p.entry_id = $1
   ```

2. **Check if a seed has been eliminated:**
   ```sql
   SELECT 1 FROM bc_losers 
   WHERE seed_id = $1 
   LIMIT 1
   ```

3. **Find which round a seed lost in:**
   ```sql
   SELECT MAX(round) as lost_round
   FROM bc_winners w
   JOIN rounds r ON ...  -- depends on schema
   WHERE seed_id = $1 AND ... eliminated in loss
   ```

4. **Get other pick from same region for an entry:**
   ```sql
   SELECT p.*, s.seed_number, s.region_id
   FROM bc_pick p
   JOIN bc_seed s ON p.seed_id = s.id
   WHERE p.entry_id = $1 
   AND s.region_id = $2
   AND p.seed_id != $3  -- exclude current seed
   ```

### Notes on Implementation
- The seed pairing logic for Round 1 and Round 2 conflicts can be **calculated in code**—no database query needed
- Just use the known pairings table: (1,16), (2,15), ..., (8,9) for Round 1
- And the bracket progression logic for Round 2 pairings

### Optional: Add Column to bc_seed
```sql
ALTER TABLE bc_seed ADD COLUMN possible_points INT;
```

However, **recommend calculating on-the-fly** rather than persisting, since:
- Possible points change as games are played
- More reliable for real-time accuracy
- Extra storage not needed for relatively small calculations

---

## Testing Scenarios

### Test Case 1: No Regional Conflicts
- Picks: Region 1 (#3), Region 2 (#5), Region 3 (#7), Region 4 (#2)
- All 4 from different regions, max_round = 6 for all
- No games played yet
- **Expected:** Each pick has possible points = seed × 21
  - #3: 3 × 21 = 63 points
  - #5: 5 × 21 = 105 points
  - #7: 7 × 21 = 147 points
  - #2: 2 × 21 = 42 points
  - Total: 357 points

### Test Case 2: Same Region, No Round 1 Conflict
- Picks: Region 1 (#3 and #5)
- These don't meet in any round, max_round = 6 for both
- No games played
- **Expected:** 
  - #3: 3 × 21 = 63 points
  - #5: 5 × 21 = 105 points
  - Total: 168 points

### Test Case 3: Same Region, Round 1 Conflict
- Picks: Region 1 (#8 and #9)
- They play each other in Round 1, max_round = 1 for both
- No games played yet
- **Expected:** Both max out at Round 1
  - #8: 8 × 1 = 8 points
  - #9: 9 × 1 = 9 points
  - Total: 17 points

### Test Case 4: Same Region, Round 2 Conflict
- Picks: Region 1 (#1 and #8)
- They meet in R2 if both win R1, max_round = 2 for both
- No games played yet
- **Expected:** Max = 1 + 2 = 3
  - #1: 1 × 3 = 3 points
  - #8: 8 × 3 = 24 points
  - Total: 27 points

### Test Case 5: Same Region, Round 3 Conflict
- Picks: Region 1 (#1 and #4)
- They meet in R3 if both win R1 and R2, max_round = 3 for both
- No games played yet
- **Expected:** Max = 1 + 2 + 3 = 6
  - #1: 1 × 6 = 6 points
  - #4: 4 × 6 = 24 points
  - Total: 30 points

### Test Case 6: Team Already Eliminated
- Pick: #7 seed, already lost in Round 2
- Possible points = points they could have earned if they won to round 2
- **Expected:** 7 × (1 + 2) = 7 × 3 = 21 points

### Test Case 7: Bonus Multiplier
- Pick: #5 seed, is_bonus = true, no conflicts, max_round = 6
- **Expected:** 5 × 21 × 1.5 = 157.5 points

### Test Case 8: Complex Entry
- Picks:
  - Region 1: #2 and #7 (R2 conflict, max_round = 2)
  - Region 2: #3 (no conflict, max_round = 6)
  - Region 3: #5 (no conflict, max_round = 6)
  - Region 4: #8 (no conflict, max_round = 6)

**Expected:**
- #2: 2 × 3 = 6 (max = 1 + 2)
- #7: 7 × 3 = 21 (max = 1 + 2)
- #3: 3 × 21 = 63 (max = 1+2+3+4+5+6)
- #5: 5 × 21 = 105 (max = 1+2+3+4+5+6)
- #8: 8 × 21 = 168 (max = 1+2+3+4+5+6)
- Total: 363 points

### Test Case 9: Partial Tournament with Conflicts
- Picks:
  - Region 1: #1 and #16 (R1 conflict, max_round = 1)
  - Region 2: #5 (no conflict, max_round = 6)
  - Region 3: #8 (already won R1 and R2, still max_round = 6)
  - Region 4: #3 (no conflict, max_round = 6)
- Games played: #8 has won R1 and R2
- **Expected:** Possible points are still the same (what they could earn if they win all remaining):
  - #1: 1 × 1 = 1
  - #16: 16 × 1 = 16
  - #5: 5 × 21 = 105
  - #8: 8 × 21 = 168 (max = 1+2+3+4+5+6, even though they've already earned 1×8 + 2×8)
  - #3: 3 × 21 = 63
  - Total: 353 points

### Test Case 10: Round 3 Conflict with Partial Results
- Picks:
  - Region 1: #1 and #4 (R3 conflict, max_round = 3)
  - Region 2: #2 (no conflict, max_round = 6)
- Games played: #1 has won R1, #4 has won R1
- **Expected:**
  - #1: 1 × 6 = 6 (max = 1+2+3)
  - #4: 4 × 6 = 24 (max = 1+2+3)
  - #2: 2 × 21 = 42 (max = 1+2+3+4+5+6)
  - Total: 72 points

---

## Implementation Order

1. **Create StatisticsService class** in Angular
2. **Implement seed pairing logic** (Round 1, Round 2, and Round 3 conflict detection)
3. **Implement core functions**:
   - `getOtherPickFromRegion()`
   - `getConflictRound()`
   - `calculatePossiblePointsForSeed()`
   - `calculateEntryPossiblePoints()`
4. **Create HTTP endpoint** in backend (if backend calculation preferred)
5. **Add unit tests** for each test scenario defined above
6. **Integrate with standings display** to show possible points per entry
7. **Cache/optimize** if performance needed

---

## Notes on Regional Constraints (Simplified)

### The Core Constraint
Since users pick **at most 2 teams per region**, the constraint is straightforward:

**If you pick 2 teams from the same region that would play each other, only 1 can advance past that matchup.**

### When Do They Play?

#### Round 1 Matchups
The seeding is: 1-16, 2-15, 3-14, 4-13, 5-12, 6-11, 7-10, 8-9

If you pick two seeds that form one of these pairs, they play in **Round 1**.

Examples:
- Pick #7 seed and #10 seed → Play in Round 1
- Pick #2 seed and #15 seed → Play in Round 1

#### Round 2 Matchups
After Round 1, the bracket advances seeds in pairs:
- Winner(1,16) plays Winner(8,9)
- Winner(2,15) plays Winner(7,10)
- Winner(3,14) plays Winner(6,11)
- Winner(4,13) plays Winner(5,12)

If you pick seeds like #1 and #8, both must win Round 1, then they play in **Round 2**.

Examples:
- Pick #1 seed and #8 seed → If both win R1, play in Round 2
- Pick #1 seed and #9 seed → If both win R1, play in Round 2
- Pick #3 seed and #6 seed → If both win R1, play in Round 2

#### Round 3 Matchups
After Round 2, winners from different sub-brackets play each other:
- Winner(1,16,8,9) plays Winner(4,13,5,12)
- Winner(2,15,7,10) plays Winner(3,14,6,11)

If you pick seeds from different Round 2 sub-brackets (e.g., one from {1,16,8,9} and one from {4,13,5,12}), they could meet in **Round 3** if both win their first 2 games.

Examples:
- Pick #1 seed and #4 seed → If both win R1 and R2, play in Round 3
- Pick #8 seed and #5 seed → If both win R1 and R2, play in Round 3
- Pick #1 seed and #5 seed → If both win R1 and R2, play in Round 3
- Pick #2 seed and #3 seed → If both win R1 and R2, play in Round 3

### Implication for Possible Points

**Example 1: Picks #7 and #10 from same region**
- They play in Round 1
- Possible points for #7: 7 × 1 = 7
- Possible points for #10: 10 × 1 = 10

**Example 2: Picks #1 and #8 from same region**
- They both can advance to Round 2 (no R1 conflict)
- Both beat their R1 opponents, meet in Round 2
- Possible points for #1: 1 × 2 = 2
- Possible points for #8: 8 × 2 = 16

**Example 3: Picks #1 and #4 from same region**
- #1 plays #16 in R1, #4 plays #13 in R1
- If both win R1:
  - #1 faces Winner(8,9) in R2
  - #4 faces Winner(5,12) in R2
- If both win R2, they meet in R3
- Possible points for #1: 1 × 3 = 3
- Possible points for #4: 4 × 3 = 12

**Example 4: Picks #5 and #3 from same region**
- #5 plays #12 in R1; #3 plays #14 in R1
- If both win R1:
  - #5 faces Winner(4,13) in R2
  - #3 faces Winner(6,11) in R2
- If both win R2:
  - #5 plays Winner(1,16,8,9) in R3
  - #3 plays Winner(2,15,7,10) in R3
- They are in separate Round 3 matchups, so they never play each other
- Possible points for #5: 5 × 6 = 30 (can reach championship)
- Possible points for #3: 3 × 6 = 18 (can reach championship)

### Algorithm Simplification

Because of this constraint, the algorithm is much simpler:

1. For each pick, check if there's another pick from the same region
2. If yes, determine when they'd play using seed pairing logic (Round 1, 2, or 3, or never)
3. That meeting round becomes the maximum round for both
4. If no conflict, maximum round is 6 (championship)

**No need** to consider region-wide constraints or multiple picks—just pairwise matchups.

### Global Tournament Constraints
While calculating individual pick possible points, note these natural tournament constraints:
- Only 1 pick per region can advance past Round 4 (Regional Finals)
- Only 2 picks total can reach Round 5 (National Semifinals)
- Only 1 pick total can win Round 6 (Championship)

These constraints are **naturally enforced** by regional brackets and tournament structure. Individual possible points calculations assume a pick wins all its feasible matchups, but the global constraints above mean that in practice, multiple picks cannot simultaneously achieve their maximum possible points.
