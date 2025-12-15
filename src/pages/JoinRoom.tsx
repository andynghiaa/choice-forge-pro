import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function JoinRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/join/${code}`);
      return;
    }

    joinRoom();
  }, [code, user, authLoading]);

  const joinRoom = async () => {
    if (!code || !user) return;

    try {
      // Find room by invite code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('invite_code', code)
        .single();

      if (roomError || !room) {
        toast({ title: 'Error', description: 'Invalid invite link', variant: 'destructive' });
        navigate('/dashboard');
        return;
      }

      // Join as participant
      await supabase
        .from('room_participants')
        .upsert({ room_id: room.id, user_id: user.id }, { onConflict: 'room_id,user_id' });

      toast({ title: 'Success', description: 'Joined room successfully!' });
      navigate(`/room/${room.id}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({ title: 'Error', description: 'Failed to join room', variant: 'destructive' });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Joining room...</p>
      </div>
    </div>
  );
}
