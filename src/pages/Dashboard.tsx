import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Vote, 
  Users, 
  Calendar, 
  Clock,
  ArrowRight,
  Loader2,
  Trophy
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'voting_ended' | 'finalized';
  voting_deadline: string;
  created_at: string;
  updated_at: string;
  owner_id: string;
  invite_code: string;
  evaluation_criteria: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchRooms();
    }
  }, [user]);

  const fetchRooms = async () => {
    if (!user) return;

    try {
      // Fetch rooms I own
      const { data: owned, error: ownedError } = await supabase
        .from('rooms')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (ownedError) throw ownedError;
      setMyRooms(owned || []);

      // Fetch rooms I've joined
      const { data: participated, error: participatedError } = await supabase
        .from('room_participants')
        .select('room_id, rooms(*)')
        .eq('user_id', user.id);

      if (participatedError) throw participatedError;
      
      const joinedRoomsList = participated
        ?.map(p => p.rooms)
        .filter((room): room is Room => room !== null && (room as Room).owner_id !== user.id) || [];
      
      setJoinedRooms(joinedRoomsList);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rooms',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, deadline: string) => {
    const isExpired = new Date(deadline) < new Date();
    
    if (status === 'finalized') {
      return <Badge variant="success">Finalized</Badge>;
    }
    if (isExpired || status === 'voting_ended') {
      return <Badge variant="warning">Voting Ended</Badge>;
    }
    if (status === 'active') {
      return <Badge variant="info">Active</Badge>;
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage your voting rooms</p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/room/new">
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Link>
          </Button>
        </div>

        {/* My Rooms */}
        <section className="mb-12">
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Vote className="w-5 h-5 text-primary" />
            My Rooms
          </h2>
          
          {myRooms.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No rooms yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first voting room to get started
                </p>
                <Button asChild>
                  <Link to="/room/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Room
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myRooms.map((room) => (
                <Card 
                  key={room.id} 
                  variant="elevated" 
                  className="group cursor-pointer"
                  onClick={() => navigate(`/room/${room.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {room.name}
                      </CardTitle>
                      {getStatusBadge(room.status, room.voting_deadline)}
                    </div>
                    {room.description && (
                      <CardDescription className="line-clamp-2">
                        {room.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(room.created_at), 'MMM d')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(room.voting_deadline), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Joined Rooms */}
        <section>
          <h2 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            Rooms I've Joined
          </h2>
          
          {joinedRooms.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No rooms joined</h3>
                <p className="text-muted-foreground mb-4">
                  Join rooms using invite links shared with you
                </p>
                <Button variant="outline" asChild>
                  <Link to="/leaderboard">
                    <Trophy className="w-4 h-4 mr-2" />
                    Browse Leaderboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedRooms.map((room) => (
                <Card 
                  key={room.id} 
                  variant="elevated" 
                  className="group cursor-pointer"
                  onClick={() => navigate(`/room/${room.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {room.name}
                      </CardTitle>
                      {getStatusBadge(room.status, room.voting_deadline)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(new Date(room.voting_deadline), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}
