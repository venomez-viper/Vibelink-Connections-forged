-- personality_answers table
CREATE TABLE IF NOT EXISTS personality_answers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL UNIQUE,
  -- Page 2: Lifestyle & Values
  life_goals text,
  work_ethic text,
  ambition_level int,
  -- Page 3: Communication
  conflict_style text,
  love_language text[],
  -- Page 4: Social Preferences
  social_battery text,
  ideal_weekend text,
  -- Page 5: Relationship Goals
  relationship_goal text,
  relationship_pace text,
  -- Page 7: Emotional Intelligence
  empathy_score int,
  self_awareness int,
  emotional_openness int,
  -- Page 8: Humor & Fun
  humor_type text,
  fun_activity text[],
  -- Page 9: Deal-breakers
  dealbreakers text[],
  created_at timestamptz DEFAULT now()
);

-- RLS for personality_answers
ALTER TABLE personality_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all personality answers" ON personality_answers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own personality answers" ON personality_answers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality answers" ON personality_answers
  FOR UPDATE USING (auth.uid() = user_id);

-- Add photo_unlock_status to conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS
  photo_unlock_status text DEFAULT 'locked';
