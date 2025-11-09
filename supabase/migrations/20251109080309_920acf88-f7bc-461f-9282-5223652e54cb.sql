-- Add function to check pending request limit (10 requests per hour)
CREATE OR REPLACE FUNCTION check_pending_request_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM match_requests 
      WHERE sender_id = NEW.sender_id 
      AND status = 'pending'
      AND created_at > NOW() - INTERVAL '1 hour') >= 10 THEN
    RAISE EXCEPTION 'Too many pending requests. Please wait before sending more.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add trigger to enforce rate limit
CREATE TRIGGER limit_match_requests
BEFORE INSERT ON match_requests
FOR EACH ROW EXECUTE FUNCTION check_pending_request_limit();

-- Add unique constraint to prevent duplicate pending requests
ALTER TABLE match_requests 
ADD CONSTRAINT unique_pending_match_request 
UNIQUE (sender_id, receiver_id, status);