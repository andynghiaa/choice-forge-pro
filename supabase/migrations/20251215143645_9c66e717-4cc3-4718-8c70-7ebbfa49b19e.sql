-- Fix 1: Allow users to leave rooms they've joined
CREATE POLICY "Users can leave rooms" ON public.room_participants
  FOR DELETE USING (auth.uid() = user_id);

-- Fix 2: Restrict AI scores visibility to room participants only
DROP POLICY IF EXISTS "AI scores are viewable by everyone" ON public.ai_scores;

CREATE POLICY "Room participants can view AI scores" ON public.ai_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM candidates c
      JOIN rooms r ON c.room_id = r.id
      WHERE c.id = ai_scores.candidate_id
      AND (r.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM room_participants rp
        WHERE rp.room_id = r.id AND rp.user_id = auth.uid()
      ))
    )
  );