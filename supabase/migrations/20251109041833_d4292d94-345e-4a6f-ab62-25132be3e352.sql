-- Create match_requests table for managing connection requests
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable RLS
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_requests
CREATE POLICY "Users can create their own requests"
ON public.match_requests
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view requests they sent or received"
ON public.match_requests
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can update requests they received"
ON public.match_requests
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Add trigger for updated_at
CREATE TRIGGER update_match_requests_updated_at
BEFORE UPDATE ON public.match_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create user_media table for profile photos/videos
CREATE TABLE IF NOT EXISTS public.user_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  caption TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_media
CREATE POLICY "Anyone can view media"
ON public.user_media
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own media"
ON public.user_media
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media"
ON public.user_media
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media"
ON public.user_media
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for user media
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-media', 'user-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user-media bucket
CREATE POLICY "Anyone can view user media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'user-media');

CREATE POLICY "Users can upload their own media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'user-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'user-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'user-media' AND
  auth.uid()::text = (storage.foldername(name))[1]
);