import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Vote, 
  Users, 
  Clock, 
  Copy, 
  Check,
  Brain,
  Shield,
  Trophy,
  X,
  ThumbsUp,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface Room {
  id: string;
  name: string;
  description: string | null;
  evaluation_criteria: string;
  voting_deadline: string;
  invite_code: string;
  status: 'draft' | 'active' | 'voting_ended' | 'finalized';
  owner_id: string;
}

interface Candidate {
  id: string;
  name: string;
  description: string | null;
  vote_count: number;
  user_voted: boolean;
  user_evaluation: string | null;
  ai_score?: number;
}

interface Winner {
  id: string;
  candidate_id: string;
  final_score: number;
  candidate_name: string;
  blockchain_record?: {
    transaction_id: string;
    status: string;
  };
}

export default function RoomDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [winner, setWinner] = useState<Winner | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Input length limits
  const MAX_CANDIDATE_NAME_LENGTH = 200;
  const MAX_CANDIDATE_DESC_LENGTH = 1000;
  const MAX_EVALUATION_LENGTH = 2000;

  // New candidate form
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateDesc, setNewCandidateDesc] = useState('');
  const [addingCandidate, setAddingCandidate] = useState(false);

  // Evaluation form
  const [evaluatingCandidate, setEvaluatingCandidate] = useState<string | null>(null);
  const [evaluationText, setEvaluationText] = useState('');
  const [submittingEvaluation, setSubmittingEvaluation] = useState(false);

  const isOwner = user?.id === room?.owner_id;
  const isExpired = room ? new Date(room.voting_deadline) < new Date() : false;
  const canVote = room?.status === 'active' && !isExpired;

  useEffect(() => {
    if (id) {
      fetchRoomData();
      setupRealtimeSubscription();
    }
  }, [id, user]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`room-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        fetchCandidates();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidates' }, () => {
        fetchCandidates();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchRoomData = async () => {
    try {
      // Fetch room
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      // Join room as participant if not owner
      if (user && roomData.owner_id !== user.id) {
        await supabase
          .from('room_participants')
          .upsert({ room_id: id, user_id: user.id }, { onConflict: 'room_id,user_id' });
      }

      await fetchCandidates();

      // Fetch participant count
      const { count } = await supabase
        .from('room_participants')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', id);
      setParticipantCount(count || 0);

      // Fetch winner if finalized
      if (roomData.status === 'finalized') {
        const { data: winnerData } = await supabase
          .from('winners')
          .select(`
            id,
            candidate_id,
            final_score,
            candidates (name)
          `)
          .eq('room_id', id)
          .maybeSingle();

        if (winnerData) {
          const { data: blockchainData } = await supabase
            .from('blockchain_records')
            .select('transaction_id, status')
            .eq('winner_id', winnerData.id)
            .maybeSingle();

          setWinner({
            id: winnerData.id,
            candidate_id: winnerData.candidate_id,
            final_score: winnerData.final_score,
            candidate_name: (winnerData.candidates as any)?.name || 'Unknown',
            blockchain_record: blockchainData || undefined
          });
        }
      }
    } catch (error) {
      console.error('Error fetching room:', error);
      toast({ title: 'Error', description: 'Failed to load room', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    if (!id) return;

    const { data: candidatesData, error } = await supabase
      .from('candidates')
      .select('id, name, description')
      .eq('room_id', id);

    if (error) {
      console.error('Error fetching candidates:', error);
      return;
    }

    // Enrich with vote counts and user data
    const enriched = await Promise.all(
      (candidatesData || []).map(async (candidate) => {
        const { count: voteCount } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('candidate_id', candidate.id);

        let userVoted = false;
        let userEvaluation = null;
        let aiScore = undefined;

        if (user) {
          const { data: voteData } = await supabase
            .from('votes')
            .select('id')
            .eq('candidate_id', candidate.id)
            .eq('user_id', user.id)
            .maybeSingle();
          userVoted = !!voteData;

          const { data: evalData } = await supabase
            .from('evaluations')
            .select('feedback')
            .eq('candidate_id', candidate.id)
            .eq('user_id', user.id)
            .maybeSingle();
          userEvaluation = evalData?.feedback || null;
        }

        const { data: scoreData } = await supabase
          .from('ai_scores')
          .select('score')
          .eq('candidate_id', candidate.id)
          .maybeSingle();
        aiScore = scoreData?.score;

        return {
          ...candidate,
          vote_count: voteCount || 0,
          user_voted: userVoted,
          user_evaluation: userEvaluation,
          ai_score: aiScore
        };
      })
    );

    setCandidates(enriched);
  };

  const handleCopyInvite = () => {
    if (!room) return;
    const inviteUrl = `${window.location.origin}/join/${room.invite_code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Invite link copied to clipboard' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCandidate = async () => {
    if (!newCandidateName.trim() || !id) return;

    // Input validation
    if (newCandidateName.length > MAX_CANDIDATE_NAME_LENGTH) {
      toast({ title: 'Error', description: `Candidate name must be ${MAX_CANDIDATE_NAME_LENGTH} characters or less`, variant: 'destructive' });
      return;
    }
    if (newCandidateDesc && newCandidateDesc.length > MAX_CANDIDATE_DESC_LENGTH) {
      toast({ title: 'Error', description: `Description must be ${MAX_CANDIDATE_DESC_LENGTH} characters or less`, variant: 'destructive' });
      return;
    }

    setAddingCandidate(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .insert({
          room_id: id,
          name: newCandidateName.trim(),
          description: newCandidateDesc.trim() || null
        });

      if (error) throw error;

      setNewCandidateName('');
      setNewCandidateDesc('');
      setShowAddCandidate(false);
      toast({ title: 'Success', description: 'Candidate added' });
      fetchCandidates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleVote = async (candidateId: string) => {
    if (!user || !canVote) return;

    try {
      const candidate = candidates.find(c => c.id === candidateId);
      if (candidate?.user_voted) {
        // Remove vote
        await supabase
          .from('votes')
          .delete()
          .eq('candidate_id', candidateId)
          .eq('user_id', user.id);
      } else {
        // Add vote
        await supabase
          .from('votes')
          .insert({ candidate_id: candidateId, user_id: user.id });
      }
      fetchCandidates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmitEvaluation = async (candidateId: string) => {
    if (!user || !evaluationText.trim()) return;

    // Input validation
    if (evaluationText.length > MAX_EVALUATION_LENGTH) {
      toast({ title: 'Error', description: `Evaluation must be ${MAX_EVALUATION_LENGTH} characters or less`, variant: 'destructive' });
      return;
    }

    setSubmittingEvaluation(true);
    try {
      await supabase
        .from('evaluations')
        .upsert({
          candidate_id: candidateId,
          user_id: user.id,
          feedback: evaluationText.trim()
        }, { onConflict: 'candidate_id,user_id' });

      setEvaluatingCandidate(null);
      setEvaluationText('');
      toast({ title: 'Success', description: 'Evaluation submitted' });
      fetchCandidates();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSubmittingEvaluation(false);
    }
  };

  const handleFinalizeRoom = async () => {
    if (!isOwner || !room) return;

    toast({ title: 'Processing', description: 'Finalizing room with AI evaluation...' });

    try {
      const { error } = await supabase.functions.invoke('finalize-room', {
        body: { roomId: room.id }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Room finalized! Winner determined.' });
      fetchRoomData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to finalize', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!room) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Room not found</h1>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Room Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold">{room.name}</h1>
                <Badge variant={room.status === 'finalized' ? 'success' : isExpired ? 'warning' : 'info'}>
                  {room.status === 'finalized' ? 'Finalized' : isExpired ? 'Voting Ended' : 'Active'}
                </Badge>
              </div>
              {room.description && (
                <p className="text-muted-foreground">{room.description}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopyInvite}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? 'Copied!' : 'Copy Invite'}
              </Button>
              {isOwner && isExpired && room.status !== 'finalized' && (
                <Button variant="hero" onClick={handleFinalizeRoom}>
                  <Brain className="w-4 h-4 mr-2" />
                  Finalize with AI
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {participantCount} participants
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Deadline: {format(new Date(room.voting_deadline), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
        </div>

        {/* Winner Banner */}
        {winner && (
          <Card variant="glow" className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Winner</p>
                    <h2 className="text-2xl font-display font-bold">{winner.candidate_name}</h2>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-display font-bold text-primary">{winner.final_score}</div>
                  <p className="text-sm text-muted-foreground">AI Score</p>
                </div>
              </div>
              {winner.blockchain_record && (
                <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-muted-foreground">Blockchain verified:</span>
                  <code className="text-xs bg-secondary px-2 py-1 rounded">
                    {winner.blockchain_record.transaction_id.slice(0, 24)}...
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => window.open(`https://hashscan.io/testnet/transaction/${winner.blockchain_record?.transaction_id}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on HashScan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Evaluation Criteria */}
        <Card variant="glass" className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Evaluation Criteria</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{room.evaluation_criteria}</p>
          </CardContent>
        </Card>

        {/* Candidates */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold">Candidates ({candidates.length})</h2>
          {isOwner && canVote && (
            <Button variant="outline" onClick={() => setShowAddCandidate(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          )}
        </div>

        {/* Add Candidate Form */}
        {showAddCandidate && (
          <Card variant="glass" className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Add New Candidate</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddCandidate(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Name <span className="text-xs text-muted-foreground">({newCandidateName.length}/{MAX_CANDIDATE_NAME_LENGTH})</span></Label>
                  <Input
                    placeholder="Candidate name"
                    value={newCandidateName}
                    onChange={(e) => setNewCandidateName(e.target.value)}
                    maxLength={MAX_CANDIDATE_NAME_LENGTH}
                  />
                </div>
                <div>
                  <Label>Description (optional) <span className="text-xs text-muted-foreground">({newCandidateDesc.length}/{MAX_CANDIDATE_DESC_LENGTH})</span></Label>
                  <Input
                    placeholder="Brief description"
                    value={newCandidateDesc}
                    maxLength={MAX_CANDIDATE_DESC_LENGTH}
                    onChange={(e) => setNewCandidateDesc(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddCandidate} disabled={addingCandidate || !newCandidateName.trim()}>
                  {addingCandidate ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Add Candidate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {candidates.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <CardContent>
              <Vote className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No candidates yet</h3>
              <p className="text-muted-foreground">
                {isOwner ? 'Add candidates to start collecting votes' : 'Waiting for the room owner to add candidates'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {candidates.map((candidate) => (
              <Card 
                key={candidate.id} 
                variant={candidate.ai_score !== undefined ? 'gradient' : 'elevated'}
                className="relative overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{candidate.name}</CardTitle>
                      {candidate.description && (
                        <CardDescription>{candidate.description}</CardDescription>
                      )}
                    </div>
                    {candidate.ai_score !== undefined && (
                      <div className="text-right">
                        <div className="text-2xl font-display font-bold text-primary">{candidate.ai_score}</div>
                        <p className="text-xs text-muted-foreground">AI Score</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="secondary">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {candidate.vote_count} votes
                    </Badge>
                    {candidate.user_evaluation && (
                      <Badge variant="info">Evaluated</Badge>
                    )}
                  </div>

                  {user && canVote && (
                    <div className="space-y-3">
                      <Button
                        variant={candidate.user_voted ? 'default' : 'outline'}
                        className="w-full"
                        onClick={() => handleVote(candidate.id)}
                      >
                        {candidate.user_voted ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Voted
                          </>
                        ) : (
                          <>
                            <Vote className="w-4 h-4 mr-2" />
                            Vote
                          </>
                        )}
                      </Button>

                      {evaluatingCandidate === candidate.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Write your evaluation..."
                            value={evaluationText}
                            onChange={(e) => setEvaluationText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleSubmitEvaluation(candidate.id)}
                              disabled={submittingEvaluation || !evaluationText.trim()}
                            >
                              {submittingEvaluation ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => { setEvaluatingCandidate(null); setEvaluationText(''); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setEvaluatingCandidate(candidate.id);
                            setEvaluationText(candidate.user_evaluation || '');
                          }}
                        >
                          {candidate.user_evaluation ? 'Edit Evaluation' : 'Add Evaluation'}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
