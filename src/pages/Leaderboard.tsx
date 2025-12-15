import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Users, 
  Calendar,
  Award,
  ArrowRight,
  Loader2,
  Crown,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface WinnerWithDetails {
  id: string;
  final_score: number;
  created_at: string;
  room: {
    id: string;
    name: string;
    description: string | null;
  };
  candidate: {
    id: string;
    name: string;
  };
  blockchain_record?: {
    transaction_id: string;
    status: string;
  };
  participant_count: number;
}

export default function Leaderboard() {
  const [winners, setWinners] = useState<WinnerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'score' | 'participants' | 'recent'>('recent');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data: winnersData, error: winnersError } = await supabase
        .from('winners')
        .select(`
          id,
          final_score,
          created_at,
          room_id,
          candidate_id,
          rooms (id, name, description),
          candidates (id, name)
        `)
        .order('created_at', { ascending: false });

      if (winnersError) throw winnersError;

      // Fetch blockchain records and participant counts
      const enrichedWinners = await Promise.all(
        (winnersData || []).map(async (winner) => {
          const { data: blockchainData } = await supabase
            .from('blockchain_records')
            .select('transaction_id, status')
            .eq('winner_id', winner.id)
            .maybeSingle();

          const { count } = await supabase
            .from('room_participants')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', winner.room_id);

          return {
            id: winner.id,
            final_score: winner.final_score,
            created_at: winner.created_at,
            room: winner.rooms as any,
            candidate: winner.candidates as any,
            blockchain_record: blockchainData || undefined,
            participant_count: count || 0
          };
        })
      );

      setWinners(enrichedWinners);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedWinners = [...winners].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.final_score - a.final_score;
      case 'participants':
        return b.participant_count - a.participant_count;
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Award className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-muted-foreground font-bold">#{index + 1}</span>;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 mb-4 shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Finalized voting rooms and their blockchain-verified winners
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { key: 'recent', label: 'Most Recent' },
            { key: 'score', label: 'Highest Score' },
            { key: 'participants', label: 'Most Participants' }
          ].map((option) => (
            <Button
              key={option.key}
              variant={sortBy === option.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy(option.key as any)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : winners.length === 0 ? (
          <Card variant="glass" className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No winners yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to create a voting room and finalize results
              </p>
              <Button asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {sortedWinners.map((winner, index) => (
              <Card 
                key={winner.id} 
                variant="elevated"
                className="group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(index)}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-display font-semibold text-lg truncate">
                          {winner.room?.name || 'Unknown Room'}
                        </h3>
                        {winner.blockchain_record?.status === 'confirmed' && (
                          <Badge variant="success" className="flex-shrink-0">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          Winner: <span className="text-foreground font-medium">{winner.candidate?.name || 'Unknown'}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {winner.participant_count} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(winner.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex-shrink-0 text-center">
                      <div className="text-3xl font-display font-bold text-primary">
                        {winner.final_score}
                      </div>
                      <div className="text-xs text-muted-foreground">AI Score</div>
                    </div>

                    {/* Action */}
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/room/${winner.room?.id}`}>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
