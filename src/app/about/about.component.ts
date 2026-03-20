import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BracketService } from '../shared/services/bracket.service';
import { FooterComponent } from '../shared/footer/footer.component';

interface SiteUpdate {
  date: string;
  description: string;
}

@Component({
  standalone: true,
  selector: 'app-about',
  imports: [CommonModule, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  public showRules = true;

  public siteUpdates: SiteUpdate[] = [
    {
      date: '3/20/2026',
      description: 'Enhanced admin dashboard with drag-and-drop tab reordering. Users can now customize the order of admin tabs, with the preference saved to local storage and automatically restored on subsequent visits. Additionally, the system now remembers which tab was active and restores it when the page is reloaded.'
    },
    {
      date: '3/20/2026',
      description: 'Improved admin select-winners interface by adding visual distinction for loser teams. Teams marked as losers now display with a red background and are automatically sorted to the bottom of each region\'s list, making it easier to manage bracket outcomes.'
    },
    {
      date: '3/19/2026',
      description: 'Optimized standings display for mobile devices with abbreviated column headers ("Remaining" → "Rem", "Superfan Team" → "Superfan") and improved responsive layout that hides school names on smaller screens while preserving team identification through seed numbers and logos.'
    },
    {
      date: '3/19/2026',
      description: 'Integrated school logos throughout the standings display to enhance visual representation. Logos are automatically loaded from assets and fall back gracefully with console logging if unavailable. Database schema updated to support logo associations in the bracket challenge system.'
    },
    {
      date: '3/16/2026',
      description: 'Enhanced navigation with prominent "Submit Entry" link at the top of every page. The link is intelligently hidden when entry submissions are closed and requires users to be logged in to access the submission form—unregistered users are automatically redirected to the login page.'
    },
    {
      date: '3/16/2026',
      description: 'Improved entry submission workflow by integrating authentication checks with the navigation system. The dataservice now controls entry submission availability across the entire application, ensuring a consistent experience whether submissions are active or closed.'
    },
    {
      date: '3/16/2024',
      description: 'Updated site for 2025 tournament.'
    },
    {
      date: '3/27/2024',
      description: 'Added sort options to standings and points page.'
    },
    {
      date: '3/21/2024',
      description: 'Added teams remaining, Fixed points earned page, sorted flyout by points desc, if a team is eliminated'
    },
    {
      date: '3/21/2024',
      description: 'Points earned page added, flyout fixed'
    },
    {
      date: '3/17/2024',
      description: 'Site updated for 2024 bracket contest.'
    },
    {
      date: '3/12/2024',
      description: 'Site created.'
    }
  ];

  constructor(private service: BracketService) {}

  public toggleRules(): void {
    this.showRules = !this.showRules;
  }
}
