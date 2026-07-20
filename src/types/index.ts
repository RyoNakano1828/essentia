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

export interface HabitTemplate {
  id: string;
  user_id: string;
  name: string;
  category: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  habit_id: string;
  date: string;
  done: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface HabitWithStreak extends HabitTemplate {
  streak: number;
  done_today: boolean;
  log_id: string | null;
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

export interface DailyFocus {
  id: string;
  user_id: string;
  date: string;
  essential_task: string;
  ai_suggestion: string | null;
  completed: boolean;
  reflection: string | null;
  perma_positive: number | null;
  perma_meaning: number | null;
  perma_achieve: number | null;
  habits_checked: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  focus_completion_rate: number;
  top_habits: { name: string; icon: string; streak: number }[];
  avg_perma_meaning: number | null;
  ai_summary: string;
  essential_action: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Default habit seeds for new users
export const DEFAULT_HABITS: Omit<HabitTemplate, "id" | "user_id" | "created_at" | "updated_at">[] = [
  { name: "キックボクシング", category: "運動", icon: "🥊", is_active: true, sort_order: 1 },
  { name: "ストレッチ",       category: "運動", icon: "🧘", is_active: true, sort_order: 2 },
  { name: "英語学習",         category: "学習", icon: "📚", is_active: true, sort_order: 3 },
  { name: "睡眠記録",         category: "健康", icon: "😴", is_active: true, sort_order: 4 },
  { name: "食事記録",         category: "食事", icon: "🍽️", is_active: true, sort_order: 5 },
  { name: "体重記録",         category: "健康", icon: "⚖️", is_active: true, sort_order: 6 },
  { name: "家事",             category: "生活", icon: "🏠", is_active: true, sort_order: 7 },
  { name: "家計記録",         category: "生活", icon: "💰", is_active: true, sort_order: 8 },
];
