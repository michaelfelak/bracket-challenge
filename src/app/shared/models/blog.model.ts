export interface BlogEntry {
  id: string;
  title: string;
  body: string;
  posted_by: string;
  created_date: string;
  year?: number;
  contest_type?: number; // 1 = Bowl Pick'em, 2 = Bracket Challenge
}
