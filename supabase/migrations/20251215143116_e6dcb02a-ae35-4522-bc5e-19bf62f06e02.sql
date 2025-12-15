-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Votes are viewable by everyone" ON public.votes;

-- Create policy: Users can always see their own votes
CREATE POLICY "Users can view own votes" ON public.votes
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy: Votes visible to room participants after deadline/finalization
CREATE POLICY "Votes viewable after deadline" ON public.votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM candidates c 
      JOIN rooms r ON c.room_id = r.id 
      WHERE c.id = votes.candidate_id 
      AND (r.voting_deadline < now() OR r.status IN ('voting_ended', 'finalized'))
    )
  );