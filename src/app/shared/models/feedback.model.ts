export interface Feedback {
  id?: number;
  user_id?: number;
  username?: string;
  email?: string;
  feedback_text: string;
  bracket_id?: number;
  contest_type?: number;
  is_addressed?: boolean;
  created_at?: string;
}

export interface FeedbackRequest {
  feedback_text: string;
  bracket_id?: number;
  contest_type?: number;
}

export interface UpdateFeedbackStatusRequest {
  is_addressed: boolean;
}
