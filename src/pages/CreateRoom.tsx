import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Loader2, Calendar, FileText, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function CreateRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  // Input length limits
  const MAX_NAME_LENGTH = 200;
  const MAX_DESCRIPTION_LENGTH = 2000;
  const MAX_CRITERIA_LENGTH = 5000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in', variant: 'destructive' });
      return;
    }

    if (!name || !criteria || !deadline) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    // Input validation
    if (name.length > MAX_NAME_LENGTH) {
      toast({ title: 'Error', description: `Room name must be ${MAX_NAME_LENGTH} characters or less`, variant: 'destructive' });
      return;
    }
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      toast({ title: 'Error', description: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`, variant: 'destructive' });
      return;
    }
    if (criteria.length > MAX_CRITERIA_LENGTH) {
      toast({ title: 'Error', description: `Evaluation criteria must be ${MAX_CRITERIA_LENGTH} characters or less`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name,
          description: description || null,
          evaluation_criteria: criteria,
          voting_deadline: new Date(deadline).toISOString(),
          owner_id: user.id,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Success', description: 'Room created successfully!' });
      navigate(`/room/${data.id}`);
    } catch (error: any) {
      console.error('Error creating room:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create room', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Set minimum datetime to now
  const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-2xl font-display">Create Voting Room</CardTitle>
            <CardDescription>
              Set up a new room where participants can vote and submit evaluations
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Room Name * <span className="text-xs text-muted-foreground">({name.length}/{MAX_NAME_LENGTH})</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Best Product Design 2024"
                  value={name}
                  maxLength={MAX_NAME_LENGTH}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional) <span className="text-xs text-muted-foreground">({description.length}/{MAX_DESCRIPTION_LENGTH})</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this voting room is about..."
                  value={description}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="criteria" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Evaluation Criteria * <span className="text-xs text-muted-foreground">({criteria.length}/{MAX_CRITERIA_LENGTH})</span>
                </Label>
                <Textarea
                  id="criteria"
                  placeholder="Describe how candidates should be evaluated. The AI will use this to score each candidate.&#10;&#10;Example: Evaluate based on creativity, feasibility, impact on users, and technical innovation."
                  value={criteria}
                  maxLength={MAX_CRITERIA_LENGTH}
                  onChange={(e) => setCriteria(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The AI will use these criteria to analyze participant feedback and score candidates
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Voting Deadline *
                </Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  min={minDateTime}
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Room...
                  </>
                ) : (
                  'Create Room'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
