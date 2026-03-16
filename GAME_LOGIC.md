# Bracket Challenge Game Logic Documentation

This document explains the complete game mechanics of the Bracket Challenge application. Use this as a reference when implementing features or debugging issues.

## Tournament Structure

### Teams & Rounds
- **Total Teams**: 68 teams
  - 8 teams compete in play-in games
  - 4 play-in winners advance to the main bracket (First Four)
  - 60 teams get automatic bids to the main bracket
  - **Main Bracket**: 64 teams total

- **Tournament Format**: Single elimination
- **Number of Rounds**: 6 rounds
  - Round 1: 32 games (64 teams → 32 winners) - Field of 64
  - Round 2: 16 games (32 teams → 16 winners) - Round of 32
  - Round 3: 8 games (16 teams → 8 winners) - Sweet Sixteen
  - Round 4: 4 games (8 teams → 4 winners) - Elite Eight
  - Round 5: 2 games (4 teams → 2 winners) - Final Four
  - Round 6: 1 game (2 teams → 1 winner) - Championship

### Regions
- The 64-team bracket is divided into **4 regions**
- Each region has 16 teams (seeds 1-16)
- Seeds are ranked from best (1) to worst (16)

### Play-In Tournament
- 8 teams compete in the play-in round
- 4 teams are eliminated, 4 teams advance
- **Do NOT count toward the main bracket rounds**
- Play-in winners are seeded 16 in their respective regions

## Bracket Matchups

### Region Configuration
The 64-team bracket is divided into **4 regions**: East, South, Midwest, and West. The specific region assignments may vary by year, but each region always follows the same seed matchup structure described below.

### First Round (Field of 64)
Each region has 8 games following this seeding pattern:

| Matchup | Seeds |
|---------|-------|
| Game 1  | 1 vs. 16 |
| Game 2  | 8 vs. 9  |
| Game 3  | 4 vs. 13 |
| Game 4  | 5 vs. 12 |
| Game 5  | 3 vs. 14 |
| Game 6  | 6 vs. 11 |
| Game 7  | 7 vs. 10 |
| Game 8  | 2 vs. 15 |

**Total Games**: 32 games (8 games × 4 regions) = 32 winners advance

### Second Round (Round of 32)
Winners from First Round face off within each region:

| Matchup | Winners |
|---------|---------|
| Game 1  | Winner (1 vs. 16) vs. Winner (8 vs. 9) |
| Game 2  | Winner (4 vs. 13) vs. Winner (5 vs. 12) |
| Game 3  | Winner (3 vs. 14) vs. Winner (6 vs. 11) |
| Game 4  | Winner (7 vs. 10) vs. Winner (2 vs. 15) |

**Total Games**: 16 games (4 games × 4 regions) = 16 winners advance

### Third Round (Sweet Sixteen)
Within each region, the bracket narrows to 2 games:

| Matchup | Winners |
|---------|---------|
| Game 1  | Winner (1/16/8/9 path) vs. Winner (4/13/5/12 path) |
| Game 2  | Winner (3/14/6/11 path) vs. Winner (7/10/2/15 path) |

**Total Games**: 8 games (2 games × 4 regions) = 8 winners advance

### Fourth Round (Elite Eight)
Each region narrows to 1 game:

| Matchup | Winners |
|---------|---------|
| 1 game per region | Winner of Games 1&2 vs. Winner of Games 3&4 |

**Total Games**: 4 games (1 game × 4 regions) = 4 regional champions advance

### Fifth Round (Final Four)
The 4 regional champions compete in 2 semifinal games:

- **Semifinal 1**: Champion of Region 1 vs. Champion of Region 4
- **Semifinal 2**: Champion of Region 2 vs. Champion of Region 3

**Total Games**: 2 games = 2 winners advance to Championship

### Sixth Round (Championship)
The 2 Final Four winners compete in the championship game for the title.

**Total Games**: 1 game = 1 champion crowned

## Entries & Picks

### What is an Entry?
- An entry is one player's complete bracket submission
- Multiple players can create entries for the same bracket
- Each entry is independent and scored separately

### How Players Pick Teams
- Each player picks **2 teams per region** (4 regions total)
- **Total picks per entry: 8 teams**
- Players can pick any 8 teams from the 64-team bracket (including play-in winners)
- **Multiple entries may pick the same team** - no restrictions
- Players manually select their teams through the "Entries" page
- Players can update their picks before the first game starts

### Superfan Pick (Bonus Pick)
- Each player can designate **ONE of their 8 picked teams** as the "Superfan" pick (bonus pick)
- The Superfan pick gives a **50% bonus multiplier** to points earned
- Formula: `points = (seed_number × round_number) × 1.5`
- If a player doesn't select a Superfan pick, no bonus is applied to any team

## Scoring System

### Points Calculation
- **Formula**: `points = seed_number × round_number`
- **Round 1**: seed × 1
- **Round 2**: seed × 2
- **Round 3**: seed × 3
- **Round 4 (Elite Eight)**: seed × 4
- **Round 5 (Final Four)**: seed × 5
- **Round 6 (Championship)**: seed × 6

### Superfan Scoring
- **Formula with Superfan**: `points = (seed_number × round_number) × 1.5`
- Example: A #1 seed with Superfan pick winning Round 2 = (1 × 2) × 1.5 = 3 points

### Examples
- #1 seed wins Round 1: 1 × 1 = **1 point**
- #1 seed wins Round 2: 1 × 2 = **2 points**
- #5 seed wins Round 1: 5 × 1 = **5 points**
- #16 seed wins Round 1: 16 × 1 = **16 points**
- #16 seed wins Round 3: 16 × 3 = **48 points**
- #16 seed with Superfan wins Round 3: 16 × 3 × 1.5 = **72 points**

### Key Points
- Players **earn points only for teams they picked**
- If a player didn't pick a team, they don't earn points when that team wins
- If a player's picked team loses, they **stop earning points** for that team
- Points are cumulative throughout the tournament

## Winner Selection & Advancement

### How Winners Are Selected
1. **Admins control the "Select Winners" page**
2. The page displays the tournament in rounds:
   - Initially shows **only Round 1** with all 64 teams
   - As winners are selected, subsequent rounds appear progressively
3. Admin clicks on a team name in the flyout:
   - **Green checkmark** = Mark as winner (advances to next round)
   - **Red X** = Mark as loser (eliminated from tournament)
4. **First selection per round must be a winner**
5. Each matchup will have one winner and one loser selected

### Advancement Rules
- When a team is marked as a winner, it advances to the next round
- The next round only shows teams that have won their previous matchup
- Losers are eliminated and cannot advance

### Eliminations
- When a team is marked as a loser, it is eliminated
- **Eliminated teams cannot earn any more points**
- All entries that picked that team stop earning points from it
- Admin can change loser selections if needed

## Entries & Results

### Entry States
- **Active Entry**: Entry created but game not yet started
- **In-Progress Entry**: Tournament started, still in middle of games
- **Completed Entry**: Tournament finished

### Paid Status
- Admins can mark entries as "Paid" or "Unpaid"
- This tracks which players have paid their entry fee
- Paid status does not affect scoring or tournament play

### Entry Results
- Final score is the **sum of all points earned** across all 8 picked teams
- If a team loses before Round 6, scoring stops for that team
- Entries can view their standings and how they compare to other entries

## Admin Functions

### System Settings
- **Flyout Enabled**: Controls whether admins can see player pick details
- **Entry Registration Enabled**: Controls whether new entries can be created/edited by players

### Admin Dashboard Tabs
1. **Entries**: Add/view teams in the bracket (setup)
2. **Paid Status**: Mark entries as paid/unpaid
3. **Select Winners**: Choose game winners round-by-round
4. **Blog**: Manage tournament announcement/updates
5. **Settings**: View database configuration

### Select Winners Workflow
1. Navigate to "Select Winners" tab
2. Click on a team name to open details flyout
3. Review who picked that team (if flyout enabled)
4. Choose winner (✓) or loser (✗)
5. Select the appropriate round if needed
6. Repeat until all games are finalized

## Data Relationships

### bc_seeds Table
- Stores all 68 teams in the tournament
- Fields: seed_id, seed_number (1-16), region_id, school_name, year, region_name

### bc_entries Table
- Stores player bracket submissions
- Fields: entry_id, user, bracket_id, year, paid (boolean)

### bc_picks Table
- Stores which teams a player picked
- Fields: pick_id, entry_id, seed_id, round (optional), is_bonus (boolean)
- **Note**: Round field may not always be populated; seed appears in however many rounds they win

### bc_winners Table
- Stores game results and points earned
- Fields: seed_id, region_name, seed_number, school_name, points, wins, entries_selected, bonus_selected, eliminated

### bc_losers Table
- Stores losers and what round they were eliminated in
- Used to prevent eliminated teams from earning more points

## Common Implementation Considerations

### Conflicts in Picks
- **No automatic conflict resolution** - multiple entries can pick the same team
- All entries that picked an eliminated team stop earning points simultaneously

### Partial Tournament State
- Tournament starts mid-way (some games already played)
- **Don't assume Round 1** is always the current round
- Admin must be able to inject historical results

### Points Recalculation
- If a game result is changed, points **must be recalculated** for affected entries
- Check bc_picks to find which entries are affected
- Recalculate points based on new tournament state

### Edge Cases
- What if a #1 seed never gets picked? → No one earns points from that seed's wins
- What if all entries pick the same team? → Everyone's score depends on that team's performance
- What if a team's result is wrong? → Admin must correct it and recalculate affected entries

## Terminology

- **Entry**: One player's complete bracket/set of picks
- **Pick/Selection**: A single team chosen by a player
- **Superfan/Bonus Pick**: One designated pick with 1.5x point multiplier
- **Winner**: Team that won the game and advances
- **Loser**: Team that lost and is eliminated
- **Region**: One of 4 sections of the bracket with 16 teams each
- **Seed Number**: Ranking within region (1-16, where 1 is strongest)
- **Round**: Stage of tournament (Play-in, Round 1-6)
- **Eliminated**: Team that lost and can no longer earn points
- **Flyout**: Detail panel showing player picks for a team

## Notes for Developers

- Always validate seed numbers are 1-16 per region
- Remember 68 total teams (64 main + 4 from play-in winners)
- Play-in games are separate from Round 1
- Superfan multiplier is 1.5 (50% bonus)
- Single elimination: one loss = elimination
- Points only earned by entry if they picked the team
- Multiple entries can pick the same teams
- Admin controls all tournament results, not players

## Development Workflow Instructions

### Build & Test Protocol
- **Do NOT write tests** unless explicitly instructed to do so
- **Do NOT run builds** (ng build, npm run build, etc.) unless explicitly instructed to do so
- **Do NOT run the development server** unless explicitly instructed to do so
- Wait for specific instructions from the user before performing any build, test, or development server operations

### Implementation Approach
- Focus on code implementation based on game logic requirements
- Make changes to component files, services, templates, and styles as needed
- Assume the user will trigger builds and tests when appropriate
- If you need to verify changes, request user permission before running any commands

### File Modifications
- Feel free to create, edit, and delete files as needed for implementation
- Use the available tools to make source code changes
- Do NOT use terminal commands to modify files (use file editing tools instead)
- Terminal commands should only be used with explicit user permission

