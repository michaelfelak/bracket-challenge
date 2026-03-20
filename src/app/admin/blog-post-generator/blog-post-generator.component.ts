import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from 'src/app/shared/services/bracket.service';
import { SettingsService } from 'src/app/shared/services/settings.service';
import { LoggerService } from 'src/app/shared/services/logger.service';
import { BlogContentService } from 'src/app/shared/services/blog-content.service';
import { WinnerByRound } from 'src/app/shared/models/winner.model';
import { StandingsRecord } from 'src/app/shared/models/standings.model';
import { SkyPageModule } from '@skyux/pages';
import { FormsModule } from '@angular/forms';

interface TeamAnalysis {
  school_name: string;
  seed_number: number;
  region: string;
  point_value: number;
  users_picked: number;
  percentage_of_field: number;
}

@Component({
  selector: 'app-blog-post-generator',
  standalone: true,
  imports: [CommonModule, SkyPageModule, FormsModule],
  templateUrl: './blog-post-generator.component.html',
  styleUrls: ['./blog-post-generator.component.scss']
})
export class BlogPostGeneratorComponent implements OnInit {
  @Input()
  public bracketId = 5;

  public get effectiveBracketId(): number {
    return this.bracketId || this.settingsService.CURRENT_BRACKET_ID;
  }

  public isLoading = false;
  public blogPostContent = '';
  public isPromptExpanded = false;
  public showCopyPopover = false;
  public winners: WinnerByRound[] = [];
  public losers: WinnerByRound[] = [];
  public standings: StandingsRecord[] = [];
  public teamAnalysis: TeamAnalysis[] = [];
  public totalEntries = 0;
  public totalPoints = 0;

  constructor(
    private bracketService: BracketService,
    private settingsService: SettingsService,
    private logger: LoggerService,
    private blogContentService: BlogContentService
  ) {}

  ngOnInit(): void {
    this.generateBlogPost();
  }

  public generateBlogPost(): void {
    this.isLoading = true;
    this.blogPostContent = '';

    // Load all required data
    Promise.all([
      this.bracketService.getWinnersByRound(this.effectiveBracketId).toPromise(),
      this.bracketService.getLosersByRound(this.effectiveBracketId).toPromise(),
      this.bracketService.getSettings().toPromise(),
      this.bracketService.getEntryList(this.effectiveBracketId).toPromise()
    ]).then(([winners, losers, settings, entries]) => {
      this.winners = winners || [];
      this.losers = losers || [];
      this.totalEntries = entries?.length || 0;

      // Get current year from settings
      const year = settings?.current_year || new Date().getFullYear();

      // Load standings with the correct year
      this.bracketService.getStandings(year).toPromise().then(standings => {
        this.standings = standings || [];

        // Calculate total points in the field
        this.totalPoints = this.standings.reduce((sum, record) => sum + (record.current_points || 0), 0);

        // Analyze winners
        this.analyzeWinners();
        
        // Generate blog post
        this.createBlogPost();
        
        this.isLoading = false;
      }).catch(error => {
        this.logger.error('Error loading standings:', error);
        this.blogPostContent = 'Error loading standings data.';
        this.isLoading = false;
      });
    }).catch(error => {
      this.logger.error('Error generating blog post:', error);
      this.blogPostContent = 'Error loading data. Please try again.';
      this.isLoading = false;
    });
  }

  private analyzeWinners(): void {
    const teamMap = new Map<string, TeamAnalysis>();

    // Process winners
    this.winners.forEach(winner => {
      const key = `${winner.seed_id}`;
      if (!teamMap.has(key)) {
        teamMap.set(key, {
          school_name: winner.school_name || 'Unknown',
          seed_number: winner.seed_number || 0,
          region: winner.region_name || 'Unknown',
          point_value: (winner.seed_number || 0) * (winner.round || 1),
          users_picked: 0,
          percentage_of_field: 0
        });
      }
    });

    // Count how many users picked each team
    this.standings.forEach(entry => {
      const picks = this.extractTeamPicks(entry);
      picks.forEach(pick => {
        const winner = this.winners.find(w => w.seed_id === pick.seed_id);
        if (winner) {
          const key = `${winner.seed_id}`;
          const team = teamMap.get(key);
          if (team) {
            team.users_picked++;
          }
        }
      });
    });

    // Calculate percentages
    teamMap.forEach(team => {
      if (this.totalEntries > 0) {
        team.percentage_of_field = (team.users_picked / this.totalEntries) * 100;
      }
    });

    this.teamAnalysis = Array.from(teamMap.values())
      .sort((a, b) => b.users_picked - a.users_picked);
  }

  private extractTeamPicks(entry: StandingsRecord): Array<{seed_id?: number}> {
    // Since we don't have direct access to picks, we'll use superfan as a sample
    // In a real scenario, you'd need to fetch picks separately
    const picks: Array<{seed_id?: number}> = [];
    if (entry.superfan_seed_id) {
      picks.push({ seed_id: entry.superfan_seed_id });
    }
    return picks;
  }

  private createBlogPost(): void {
    const date = new Date();
    const yesterdayDate = new Date(date);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const dateStr = yesterdayDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let prompt = `Generate an engaging blog post for a March Madness bracket challenge contest. Use the following data as context:\n\n`;

    prompt += `## Tournament Update Date\n`;
    prompt += `${dateStr}\n\n`;

    // Winners section
    if (this.winners.length > 0) {
      prompt += `## Yesterday's Winning Teams (${this.winners.length} teams)\n`;
      this.winners.forEach(winner => {
        prompt += `- #${winner.seed_number} ${winner.school_name} (${winner.region_name}) - Advanced from Round ${winner.round}\n`;
      });
      prompt += `\n`;
    }

    // Losers section
    if (this.losers.length > 0) {
      prompt += `## Eliminated Teams (${this.losers.length} teams)\n`;
      this.losers.forEach(loser => {
        prompt += `- #${loser.seed_number} ${loser.school_name} (${loser.region_name}) - Lost in Round ${loser.round}\n`;
      });
      prompt += `\n`;
    }

    // Team analysis section
    if (this.teamAnalysis.length > 0) {
      prompt += `## Winning Teams - Popularity Analysis\n`;
      prompt += `Total contest entries: ${this.totalEntries}\n`;
      prompt += `Total points earned across field: ${this.totalPoints}\n\n`;
      
      prompt += `Most popular winning teams:\n`;
      this.teamAnalysis.slice(0, 10).forEach((team, idx) => {
        prompt += `${idx + 1}. #${team.seed_number} ${team.school_name} (${team.region}) - Picked by ${team.users_picked} entrants (${team.percentage_of_field.toFixed(1)}% of field)\n`;
      });
      prompt += `\n`;
    }

    // Standings context
    if (this.standings.length > 0) {
      const topEntries = this.standings.slice(0, 5);
      prompt += `## Top 5 Standings\n`;
      topEntries.forEach((entry, index) => {
        const teamsLeft = entry.teams_remaining || 0;
        prompt += `${index + 1}. ${entry.entry_name} - ${entry.current_points} points | ${entry.win_total} wins | ${teamsLeft} teams remaining\n`;
      });
      prompt += `\n`;

      // Calculate some stats
      const avgPoints = this.totalPoints / this.totalEntries;
      const medianPoints = this.standings[Math.floor(this.standings.length / 2)]?.current_points || 0;
      prompt += `Contest Statistics:\n`;
      prompt += `- Average points per entry: ${avgPoints.toFixed(1)}\n`;
      prompt += `- Median points: ${medianPoints}\n`;
      prompt += `- Leader's points: ${topEntries[0]?.current_points || 0}\n\n`;
    }

    prompt += `## Blog Post Guidelines\n`;
    prompt += `Create an engaging, upbeat blog post that:\n`;
    prompt += `1. Opens with a brief tournament update for ${dateStr}\n`;
    prompt += `2. Highlights the exciting outcomes (which teams won, unexpected upsets, etc.)\n`;
    prompt += `3. Provides analysis on:\n`;
    prompt += `   - Which teams were most widely picked and how they performed\n`;
    prompt += `   - Popular vs unpopular winners\n`;
    prompt += `4. Discusses implications for the top contenders going forward\n`;
    prompt += `5. Builds anticipation for upcoming games\n`;
    prompt += `6. Uses friendly, conversational tone appropriate for a sports contest\n\n`;

    prompt += `## Format Requirements\n`;
    prompt += `- Use HTML formatting with <h2>, <h3>, <p>, <ul>, <li> tags\n`;
    prompt += `- Include 3-4 paragraphs minimum\n`;
    prompt += `- Make it scannable with clear sections\n`;
    prompt += `- Include bold emphasis on key stats and team names\n`;
    prompt += `- Keep it to 300-500 words\n`;

    this.blogPostContent = prompt;
  }

  public togglePromptExpanded(): void {
    this.isPromptExpanded = !this.isPromptExpanded;
  }

  public copyPromptToContentBox(): void {
    this.blogContentService.setBlogContent(this.blogPostContent);
    this.showCopyPopover = true;
    this.logger.debug('Blog post prompt copied to blog content service');
    
    // Hide popover after 2 seconds
    setTimeout(() => {
      this.showCopyPopover = false;
    }, 2000);
  }

  public copyToClipboard(): void {
    const textarea = document.createElement('textarea');
    textarea.value = this.blogPostContent;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    this.logger.debug('Blog post prompt copied to clipboard');
    alert('Blog post prompt copied to clipboard!');
  }
}
