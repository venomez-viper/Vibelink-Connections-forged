-- conversation_starters table
-- Stores AI-generated icebreakers per conversation (cached, one-time generation)
CREATE TABLE IF NOT EXISTS conversation_starters (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE UNIQUE,
  starters text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE conversation_starters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view starters for their conversations" ON conversation_starters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_starters.conversation_id
      AND (conversations.user1_id = auth.uid() OR conversations.user2_id = auth.uid())
    )
  );
