-- First, let's create a function to map old conversation_ids to new ones
CREATE OR REPLACE FUNCTION migrate_message_conversation_ids()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  msg RECORD;
  new_conv_id UUID;
BEGIN
  -- Loop through all messages
  FOR msg IN SELECT DISTINCT conversation_id, sender_id, receiver_id FROM messages
  LOOP
    -- Find the matching conversation
    SELECT id INTO new_conv_id
    FROM conversations
    WHERE (user1_id = msg.sender_id AND user2_id = msg.receiver_id)
       OR (user1_id = msg.receiver_id AND user2_id = msg.sender_id)
       OR (user1_id = LEAST(msg.sender_id, msg.receiver_id) 
           AND user2_id = GREATEST(msg.sender_id, msg.receiver_id))
    LIMIT 1;
    
    -- If conversation doesn't exist, create it
    IF new_conv_id IS NULL THEN
      INSERT INTO conversations (user1_id, user2_id)
      VALUES (LEAST(msg.sender_id, msg.receiver_id), GREATEST(msg.sender_id, msg.receiver_id))
      RETURNING id INTO new_conv_id;
    END IF;
    
    -- Update messages with correct conversation_id
    UPDATE messages
    SET conversation_id = new_conv_id
    WHERE conversation_id = msg.conversation_id;
  END LOOP;
END;
$$;

-- Run the migration
SELECT migrate_message_conversation_ids();

-- Add foreign key constraint to prevent future issues
ALTER TABLE messages
ADD CONSTRAINT fk_messages_conversation
FOREIGN KEY (conversation_id) 
REFERENCES conversations(id) 
ON DELETE CASCADE;

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_message_conversation_ids();