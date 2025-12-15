import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { roomId } = await req.json();
    
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    console.log('Finalizing room:', roomId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch room data
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      throw new Error('Room not found');
    }

    console.log('Room found:', room.name);

    // Fetch candidates with evaluations
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('id, name, description')
      .eq('room_id', roomId);

    if (candidatesError || !candidates || candidates.length === 0) {
      throw new Error('No candidates found');
    }

    console.log('Found candidates:', candidates.length);

    // Fetch all evaluations
    const candidateIds = candidates.map(c => c.id);
    const { data: evaluations } = await supabase
      .from('evaluations')
      .select('candidate_id, feedback')
      .in('candidate_id', candidateIds);

    // Fetch vote counts
    const { data: votes } = await supabase
      .from('votes')
      .select('candidate_id')
      .in('candidate_id', candidateIds);

    // Prepare data for AI
    const candidateData = candidates.map(candidate => {
      const candidateEvals = evaluations?.filter(e => e.candidate_id === candidate.id) || [];
      const voteCount = votes?.filter(v => v.candidate_id === candidate.id).length || 0;
      
      return {
        id: candidate.id,
        name: candidate.name,
        description: candidate.description || 'No description',
        voteCount,
        evaluations: candidateEvals.map(e => e.feedback)
      };
    });

    console.log('Prepared candidate data for AI');

    // Call Lovable AI for scoring
    const aiPrompt = `You are an impartial judge evaluating candidates for a voting competition.

EVALUATION CRITERIA (defined by room owner):
${room.evaluation_criteria}

CANDIDATES TO EVALUATE:
${candidateData.map(c => `
Candidate: ${c.name}
Description: ${c.description}
Vote Count: ${c.voteCount}
Community Evaluations:
${c.evaluations.length > 0 ? c.evaluations.map((e, i) => `  ${i + 1}. ${e}`).join('\n') : '  No evaluations submitted'}
`).join('\n---\n')}

Based on the evaluation criteria and community feedback, score each candidate from 0 to 100.
Consider:
- How well they meet the stated criteria
- The quality and sentiment of community evaluations
- Vote count as a signal of community preference

Respond with a JSON object containing scores and reasoning for each candidate.
Format: {"scores": [{"candidate_id": "id", "score": number, "reasoning": "brief explanation"}]}

Only output valid JSON, no additional text.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an impartial AI judge. Always respond with valid JSON only.' },
          { role: 'user', content: aiPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('AI evaluation failed');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    console.log('AI response:', aiContent);

    // Parse AI response
    let scores;
    try {
      // Extract JSON from response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      scores = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: assign scores based on vote count
      scores = {
        scores: candidateData.map(c => ({
          candidate_id: c.id,
          score: Math.min(100, c.voteCount * 10 + 50),
          reasoning: 'Score based on vote count (AI parsing failed)'
        }))
      };
    }

    console.log('Parsed scores:', scores);

    // Insert AI scores
    for (const scoreData of scores.scores) {
      await supabase
        .from('ai_scores')
        .insert({
          candidate_id: scoreData.candidate_id,
          score: scoreData.score,
          reasoning: scoreData.reasoning
        });
    }

    // Determine winner (highest score)
    const sortedScores = [...scores.scores].sort((a, b) => b.score - a.score);
    const winnerScore = sortedScores[0];

    console.log('Winner:', winnerScore);

    // Create winner record
    const { data: winner, error: winnerError } = await supabase
      .from('winners')
      .insert({
        room_id: roomId,
        candidate_id: winnerScore.candidate_id,
        final_score: winnerScore.score
      })
      .select()
      .single();

    if (winnerError) {
      console.error('Error creating winner:', winnerError);
      throw winnerError;
    }

    // Create blockchain record (simulated for now)
    const transactionId = `0.0.${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    
    await supabase
      .from('blockchain_records')
      .insert({
        winner_id: winner.id,
        transaction_id: transactionId,
        network: 'hedera_testnet',
        status: 'confirmed',
        block_timestamp: new Date().toISOString()
      });

    // Update room status
    await supabase
      .from('rooms')
      .update({ status: 'finalized' })
      .eq('id', roomId);

    console.log('Room finalized successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        winner: {
          candidate_id: winnerScore.candidate_id,
          score: winnerScore.score,
          reasoning: winnerScore.reasoning
        },
        transactionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in finalize-room:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
