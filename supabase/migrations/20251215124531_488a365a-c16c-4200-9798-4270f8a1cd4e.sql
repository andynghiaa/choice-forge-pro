-- Create custom types
CREATE TYPE public.room_status AS ENUM ('draft', 'active', 'voting_ended', 'finalized');

-- Profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  evaluation_criteria TEXT NOT NULL,
  voting_deadline TIMESTAMPTZ NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  status room_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Candidates table
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, user_id)
);

-- Evaluations (text feedback per candidate per user)
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(candidate_id, user_id)
);

-- AI Scores table
CREATE TABLE public.ai_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  reasoning TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Winners table
CREATE TABLE public.winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  final_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blockchain records table
CREATE TABLE public.blockchain_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  winner_id UUID NOT NULL REFERENCES public.winners(id) ON DELETE CASCADE UNIQUE,
  transaction_id TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'hedera_testnet',
  status TEXT NOT NULL DEFAULT 'pending',
  block_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Room participants (for tracking who joined a room)
CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Create indexes for performance
CREATE INDEX idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_invite_code ON public.rooms(invite_code);
CREATE INDEX idx_candidates_room ON public.candidates(room_id);
CREATE INDEX idx_votes_candidate ON public.votes(candidate_id);
CREATE INDEX idx_votes_user ON public.votes(user_id);
CREATE INDEX idx_evaluations_candidate ON public.evaluations(candidate_id);
CREATE INDEX idx_ai_scores_candidate ON public.ai_scores(candidate_id);
CREATE INDEX idx_room_participants_room ON public.room_participants(room_id);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blockchain_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for rooms
CREATE POLICY "Rooms are viewable by everyone" ON public.rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their rooms" ON public.rooms
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their rooms" ON public.rooms
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for candidates
CREATE POLICY "Candidates are viewable by everyone" ON public.candidates
  FOR SELECT USING (true);

CREATE POLICY "Room owners can manage candidates" ON public.candidates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND owner_id = auth.uid())
  );

CREATE POLICY "Room owners can update candidates" ON public.candidates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND owner_id = auth.uid())
  );

CREATE POLICY "Room owners can delete candidates" ON public.candidates
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND owner_id = auth.uid())
  );

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by everyone" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for evaluations
CREATE POLICY "Evaluations are viewable by everyone" ON public.evaluations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can submit evaluations" ON public.evaluations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own evaluations" ON public.evaluations
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ai_scores
CREATE POLICY "AI scores are viewable by everyone" ON public.ai_scores
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert AI scores" ON public.ai_scores
  FOR INSERT WITH CHECK (true);

-- RLS Policies for winners
CREATE POLICY "Winners are viewable by everyone" ON public.winners
  FOR SELECT USING (true);

CREATE POLICY "Service role can insert winners" ON public.winners
  FOR INSERT WITH CHECK (true);

-- RLS Policies for blockchain_records
CREATE POLICY "Blockchain records are viewable by everyone" ON public.blockchain_records
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage blockchain records" ON public.blockchain_records
  FOR ALL USING (true);

-- RLS Policies for room_participants
CREATE POLICY "Participants are viewable by everyone" ON public.room_participants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join rooms" ON public.room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;