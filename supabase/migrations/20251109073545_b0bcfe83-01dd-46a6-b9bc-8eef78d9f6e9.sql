-- Add message_type and media_url columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_type text NOT NULL DEFAULT 'text',
ADD COLUMN IF NOT EXISTS media_url text;

-- Add check constraint for valid message types
ALTER TABLE public.messages 
ADD CONSTRAINT valid_message_type 
CHECK (message_type IN ('text', 'image', 'voice', 'emoji'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);