-- Fix rooms table public exposure - restrict to owners and participants only
DROP POLICY IF EXISTS "Rooms are viewable by everyone" ON public.rooms;

CREATE POLICY "Owners and participants can view rooms" ON public.rooms
  FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.room_participants 
      WHERE room_id = rooms.id AND user_id = auth.uid()
    )
  );