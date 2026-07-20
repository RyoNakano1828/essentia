-- habit_templates: ユーザーが管理する習慣リスト
CREATE TABLE IF NOT EXISTS habit_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'その他',
  icon TEXT NOT NULL DEFAULT '✅',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- habit_logs: 習慣の日次チェック記録
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habit_templates(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  done BOOLEAN DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, date)
);

-- daily_focusにPERMAスコアと習慣チェック完了フラグを追加
ALTER TABLE daily_focus
  ADD COLUMN IF NOT EXISTS perma_positive SMALLINT CHECK (perma_positive BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS perma_meaning  SMALLINT CHECK (perma_meaning  BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS perma_achieve  SMALLINT CHECK (perma_achieve  BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS habits_checked BOOLEAN DEFAULT false;

-- RLS
ALTER TABLE habit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own habit_templates" ON habit_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own habit_logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER update_habit_templates_updated_at
  BEFORE UPDATE ON habit_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_habit_logs_updated_at
  BEFORE UPDATE ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
