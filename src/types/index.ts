export interface EssentialIntent {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  period_type: "quarterly" | "yearly";
  start_date: string;
  end_date: string;
  is_active: boolean;
  ai_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string | null;
  is_essential: boolean;
  notion_db_name: string | null;
  ai_analysis: string | null;
  created_at: string;
  updated_at: string;
}

export interface Commitment {
  id: string;
  user_id: string;
  title: string;
  requester: string | null;
  deadline: string | null;
  description: string | null;
  score: number | null;
  ai_verdict: "essential" | "non-essential" | "pending";
  ai_reasoning: string | null;
  decline_gentle: string | null;
  decline_clear: string | null;
  decline_final: string | null;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
}

export interface WeeklyReview {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  ai_summary: string | null;
  key_achievement: string | null;
  time_thief: string | null;
  commitments_to_drop: string | null;
  essential_action_next_week: string | null;
  pattern_warning: string | null;
  notion_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DailyFocus {
  id: string;
  user_id: string;
  date: string;
  essential_task: string;
  ai_suggestion: string | null;
  completed: boolean;
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotionDatabaseInfo {
  id: string;
  name: string;
  last_edited: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
