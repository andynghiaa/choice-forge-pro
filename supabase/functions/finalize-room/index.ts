import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Hedera SDK imports for Deno
import {
  Client,
  AccountId,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TransactionId,
} from "https://esm.sh/@hashgraph/sdk@2.51.0";

async function submitToHedera(winnerData: {
  roomId: string;
  winnerId: string;
  candidateId: string;
  finalScore: number;
  timestamp: string;
}) {
  const accountId = Deno.env.get('HEDERA_ACCOUNT_ID');
  const privateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

  if (!accountId || !privateKey) {
    console.log('Hedera credentials not configured, using simulation');
    return {
      transactionId: `simulated-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'simulated',
      network: 'hedera_testnet'
    };
  }

  try {
    console.log('Connecting to Hedera testnet with account:', accountId);
    
    // Create client for Hedera testnet
    const client = Client.forTestnet();
    
    // Parse private key - handle both DER and raw formats
    let parsedKey: PrivateKey;
    try {
      // Try DER format first (starts with 302e or 3030)
      if (privateKey.startsWith('302')) {
        console.log('Using DER format key');
        parsedKey = PrivateKey.fromStringDer(privateKey);
      } else {
        console.log('Using standard format key');
        parsedKey = PrivateKey.fromString(privateKey);
      }
    } catch (keyError) {
      console.error('Key parsing error, trying alternative:', keyError);
      // Fallback: try fromStringED25519 for ED25519 keys
      parsedKey = PrivateKey.fromStringED25519(privateKey);
    }
    
    client.setOperator(AccountId.fromString(accountId), parsedKey);
    console.log('Client configured successfully');
    
    // Prepare the message to submit
    const message = JSON.stringify({
      type: 'VOTECHAIN_WINNER',
      roomId: winnerData.roomId,
      winnerId: winnerData.winnerId,
      candidateId: winnerData.candidateId,
      finalScore: winnerData.finalScore,
      timestamp: winnerData.timestamp,
      app: 'VoteChain'
    });

    console.log('Creating Hedera topic...');
    
    // Create a new topic for this room's result
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo(`VoteChain Winner: Room ${winnerData.roomId.slice(0, 8)}`)
      .execute(client);

    const topicReceipt = await topicCreateTx.getReceipt(client);
    const topicId = topicReceipt.topicId;
    
    console.log('Topic created:', topicId?.toString());

    // Submit the winner data to the topic
    const submitTx = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId!)
      .setMessage(message)
      .execute(client);

    const submitReceipt = await submitTx.getReceipt(client);
    
    // Format transaction ID for HashScan compatibility
    const txId = submitTx.transactionId;
    const formattedTxId = `${txId?.accountId?.toString()}-${txId?.validStart?.seconds?.toString()}-${txId?.validStart?.nanos?.toString().padStart(9, '0')}`;

    console.log('Transaction ID:', formattedTxId);
    console.log('Receipt status:', submitReceipt.status.toString());

    client.close();

    return {
      transactionId: formattedTxId,
      status: submitReceipt.status.toString() === 'SUCCESS' ? 'confirmed' : 'pending',
      network: 'hedera_testnet',
      topicId: topicId?.toString()
    };
  } catch (error) {
    console.error('Hedera transaction failed:', error);
    // Fallback to simulation if Hedera fails
    return {
      transactionId: `failed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: 'failed',
      network: 'hedera_testnet',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client to verify user
    const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { roomId } = await req.json();
    
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    console.log('Finalizing room:', roomId, 'by user:', user.id);

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

    // Verify room ownership
    if (room.owner_id !== user.id) {
      console.log('Unauthorized: user', user.id, 'is not owner of room', roomId);
      return new Response(
        JSON.stringify({ error: 'Only room owner can finalize' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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

    // Create a mapping of index to candidate ID for reliable matching
    const candidateMap = new Map<number, string>();
    
    // Prepare data for AI with numbered indices
    const candidateData = candidates.map((candidate, index) => {
      const candidateEvals = evaluations?.filter(e => e.candidate_id === candidate.id) || [];
      const voteCount = votes?.filter(v => v.candidate_id === candidate.id).length || 0;
      
      candidateMap.set(index + 1, candidate.id); // 1-indexed
      
      return {
        index: index + 1,
        id: candidate.id,
        name: candidate.name,
        description: candidate.description || 'No description',
        voteCount,
        evaluations: candidateEvals.map(e => e.feedback)
      };
    });

    console.log('Prepared candidate data for AI');

    // Call Lovable AI for scoring - use tool calling for structured output
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an impartial AI judge. Evaluate candidates and return scores using the provided function.' 
          },
          { 
            role: 'user', 
            content: `Evaluate these candidates for a voting competition.

EVALUATION CRITERIA (defined by room owner):
${room.evaluation_criteria}

CANDIDATES TO EVALUATE:
${candidateData.map(c => `
[Candidate #${c.index}] ${c.name}
- UUID: ${c.id}
- Description: ${c.description}
- Vote Count: ${c.voteCount}
- Community Evaluations:
${c.evaluations.length > 0 ? c.evaluations.map((e, i) => `  ${i + 1}. ${e}`).join('\n') : '  No evaluations submitted'}
`).join('\n---\n')}

Score each candidate from 0 to 100 based on:
- How well they meet the stated criteria
- The quality and sentiment of community evaluations
- Vote count as a signal of community preference

IMPORTANT: Use the exact UUID provided for each candidate.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_scores",
              description: "Submit the final scores for all candidates",
              parameters: {
                type: "object",
                properties: {
                  scores: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        candidate_id: { type: "string", description: "The exact UUID of the candidate" },
                        score: { type: "integer", description: "Score from 0 to 100" },
                        reasoning: { type: "string", description: "Brief explanation for the score" }
                      },
                      required: ["candidate_id", "score", "reasoning"]
                    }
                  }
                },
                required: ["scores"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "submit_scores" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('AI evaluation failed');
    }

    const aiData = await response.json();
    console.log('AI response received');

    // Parse tool call response
    let scores: { scores: Array<{ candidate_id: string; score: number; reasoning: string }> };
    
    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        scores = JSON.parse(toolCall.function.arguments);
      } else {
        // Fallback: try to parse from content
        const content = aiData.choices?.[0]?.message?.content;
        if (content) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            scores = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No valid JSON in response');
          }
        } else {
          throw new Error('No tool call or content in response');
        }
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: assign scores based on vote count with actual UUIDs
      scores = {
        scores: candidateData.map(c => ({
          candidate_id: c.id,
          score: Math.min(100, c.voteCount * 15 + 50),
          reasoning: 'Score based on vote count (AI parsing failed)'
        }))
      };
    }

    // Validate and fix candidate IDs - ensure they are valid UUIDs
    const validatedScores = scores.scores.map(scoreData => {
      // Check if the candidate_id is a valid UUID from our candidates
      const isValidUUID = candidateIds.includes(scoreData.candidate_id);
      
      if (!isValidUUID) {
        // Try to find the candidate by name match
        const matchedCandidate = candidates.find(c => 
          c.name.toLowerCase() === scoreData.candidate_id.toLowerCase() ||
          scoreData.candidate_id.includes(c.name) ||
          c.name.includes(scoreData.candidate_id)
        );
        
        if (matchedCandidate) {
          console.log(`Mapped "${scoreData.candidate_id}" to UUID: ${matchedCandidate.id}`);
          return { ...scoreData, candidate_id: matchedCandidate.id };
        }
        
        // Last resort: use index if available
        console.warn(`Could not map candidate_id: ${scoreData.candidate_id}`);
        return null;
      }
      
      return scoreData;
    }).filter(Boolean) as Array<{ candidate_id: string; score: number; reasoning: string }>;

    // If we couldn't map any scores, create fallback
    if (validatedScores.length === 0) {
      console.log('No valid scores from AI, using fallback');
      for (const candidate of candidateData) {
        validatedScores.push({
          candidate_id: candidate.id,
          score: Math.min(100, candidate.voteCount * 15 + 50),
          reasoning: 'Fallback score based on vote count'
        });
      }
    }

    console.log('Validated scores:', validatedScores);

    // Insert AI scores
    for (const scoreData of validatedScores) {
      const { error: scoreError } = await supabase
        .from('ai_scores')
        .insert({
          candidate_id: scoreData.candidate_id,
          score: scoreData.score,
          reasoning: scoreData.reasoning
        });
      
      if (scoreError) {
        console.error('Error inserting score:', scoreError);
      }
    }

    // Determine winner (highest score)
    const sortedScores = [...validatedScores].sort((a, b) => b.score - a.score);
    const winnerScore = sortedScores[0];

    if (!winnerScore) {
      throw new Error('No valid scores to determine winner');
    }

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

    // Submit to Hedera blockchain
    console.log('Submitting to Hedera blockchain...');
    const blockchainResult = await submitToHedera({
      roomId: roomId,
      winnerId: winner.id,
      candidateId: winnerScore.candidate_id,
      finalScore: winnerScore.score,
      timestamp: new Date().toISOString()
    });

    console.log('Blockchain result:', blockchainResult);

    // Create blockchain record
    await supabase
      .from('blockchain_records')
      .insert({
        winner_id: winner.id,
        transaction_id: blockchainResult.transactionId,
        network: blockchainResult.network,
        status: blockchainResult.status,
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
        blockchain: blockchainResult
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