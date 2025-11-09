-- Add unique constraint for typing_status upsert
ALTER TABLE public.typing_status
ADD CONSTRAINT unique_conversation_user UNIQUE (conversation_id, user_id);