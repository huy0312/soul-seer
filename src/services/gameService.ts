import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Game = Database['public']['Tables']['games']['Row'];
type Player = Database['public']['Tables']['players']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Answer = Database['public']['Tables']['answers']['Row'];

export type RoundType = 'khoi_dong' | 'vuot_chuong_ngai_vat' | 'tang_toc' | 've_dich';

// Generate random game code
function generateGameCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new game
export async function createGame(): Promise<{ game: Game | null; error: Error | null }> {
  try {
    const code = generateGameCode();
    const { data, error } = await supabase
      .from('games')
      .insert({ code, status: 'waiting', current_round: 'khoi_dong' })
      .select()
      .single();

    if (error) throw error;
    return { game: data, error: null };
  } catch (error) {
    return { game: null, error: error as Error };
  }
}

// Join a game by code
export async function joinGame(
  code: string,
  playerName: string
): Promise<{ player: Player | null; error: Error | null }> {
  try {
    // First, find the game by code
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('id, status')
      .eq('code', code.toUpperCase())
      .single();

    if (gameError || !game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game has already started');
    }

    // Check if game already has 4 players
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.id);

    if (playersError) throw playersError;

    if (players && players.length >= 4) {
      throw new Error('Game is full (4 players maximum)');
    }

    // Check if player name already exists in this game
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('game_id', game.id)
      .eq('name', playerName)
      .single();

    if (existingPlayer) {
      throw new Error('Player name already taken in this game');
    }

    // Create player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        game_id: game.id,
        name: playerName,
        score: 0,
      })
      .select()
      .single();

    if (playerError) throw playerError;
    return { player, error: null };
  } catch (error) {
    return { player: null, error: error as Error };
  }
}

// Get game by code
export async function getGameByCode(code: string): Promise<{ game: Game | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error) throw error;
    return { game: data, error: null };
  } catch (error) {
    return { game: null, error: error as Error };
  }
}

// Get game by ID
export async function getGameById(id: string): Promise<{ game: Game | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { game: data, error: null };
  } catch (error) {
    return { game: null, error: error as Error };
  }
}

// Get players for a game
export async function getPlayers(gameId: string): Promise<{ players: Player[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId)
      .order('score', { ascending: false });

    if (error) throw error;
    return { players: data, error: null };
  } catch (error) {
    return { players: null, error: error as Error };
  }
}

// Start game
export async function startGame(gameId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('games')
      .update({ status: 'playing', current_round: 'khoi_dong' })
      .eq('id', gameId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Get questions for a round
export async function getQuestions(
  gameId: string,
  round: RoundType
): Promise<{ questions: Question[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .eq('round', round)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return { questions: data, error: null };
  } catch (error) {
    return { questions: null, error: error as Error };
  }
}

// Create questions for a game
export async function createQuestions(
  gameId: string,
  questions: Array<{
    round: RoundType;
    question_text: string;
    correct_answer: string;
    points: number;
    order_index: number;
  }>
): Promise<{ error: Error | null }> {
  try {
    const questionsWithGameId = questions.map((q) => ({ ...q, game_id: gameId }));
    const { error } = await supabase.from('questions').insert(questionsWithGameId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Submit answer
export async function submitAnswer(
  playerId: string,
  questionId: string,
  answerText: string
): Promise<{ answer: Answer | null; error: Error | null }> {
  try {
    // Get question to check correct answer
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer, points')
      .eq('id', questionId)
      .single();

    if (questionError || !question) throw new Error('Question not found');

    const isCorrect = answerText.trim().toLowerCase() === question.correct_answer.trim().toLowerCase();
    const pointsEarned = isCorrect ? question.points : 0;

    // Get existing answer to calculate score difference
    const { data: existingAnswer } = await supabase
      .from('answers')
      .select('id, points_earned')
      .eq('player_id', playerId)
      .eq('question_id', questionId)
      .single();

    let answer: Answer | null = null;
    let oldPoints = 0;

    if (existingAnswer) {
      oldPoints = existingAnswer.points_earned || 0;
      // Update existing answer
      const { data, error } = await supabase
        .from('answers')
        .update({
          answer_text: answerText,
          is_correct: isCorrect,
          points_earned: pointsEarned,
        })
        .eq('id', existingAnswer.id)
        .select()
        .single();

      if (error) throw error;
      answer = data;
    } else {
      // Create new answer
      const { data, error } = await supabase
        .from('answers')
        .insert({
          player_id: playerId,
          question_id: questionId,
          answer_text: answerText,
          is_correct: isCorrect,
          points_earned: pointsEarned,
        })
        .select()
        .single();

      if (error) throw error;
      answer = data;
    }

    // Update player score (subtract old points, add new points)
    const { data: player } = await supabase
      .from('players')
      .select('score')
      .eq('id', playerId)
      .single();

    if (player) {
      const newScore = player.score - oldPoints + pointsEarned;
      await supabase.from('players').update({ score: newScore }).eq('id', playerId);
    }

    return { answer, error: null };
  } catch (error) {
    return { answer: null, error: error as Error };
  }
}

// Get answer for a player and question
export async function getAnswer(
  playerId: string,
  questionId: string
): Promise<{ answer: Answer | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .eq('player_id', playerId)
      .eq('question_id', questionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { answer: data || null, error: null };
  } catch (error) {
    return { answer: null, error: error as Error };
  }
}

// Move to next round
export async function nextRound(gameId: string, round: RoundType): Promise<{ error: Error | null }> {
  try {
    const roundOrder: RoundType[] = ['khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich'];
    const currentIndex = roundOrder.indexOf(round);
    const nextRound = currentIndex < roundOrder.length - 1 ? roundOrder[currentIndex + 1] : 've_dich';

    const { error } = await supabase
      .from('games')
      .update({ current_round: nextRound })
      .eq('id', gameId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Finish game
export async function finishGame(gameId: string): Promise<{ error: Error | null }> {
  try {
    // Update player positions based on score
    const { data: players } = await supabase
      .from('players')
      .select('id, score')
      .eq('game_id', gameId)
      .order('score', { ascending: false });

    if (players) {
      for (let i = 0; i < players.length; i++) {
        await supabase
          .from('players')
          .update({ position: i + 1 })
          .eq('id', players[i].id);
      }
    }

    const { error } = await supabase
      .from('games')
      .update({ status: 'finished', current_round: 've_dich' })
      .eq('id', gameId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Subscribe to game changes
export function subscribeToGame(
  gameId: string,
  callback: (game: Game) => void
): () => void {
  const channelName = `game:${gameId}:${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        console.log('Game changed:', payload);
        if (payload.new) {
          callback(payload.new as Game);
        }
      }
    )
    .subscribe((status) => {
      console.log('Game subscription status:', status);
      if (status === 'SUBSCRIBED') {
        // Immediately fetch game when subscribed
        getGameById(gameId).then(({ game: gameData, error }) => {
          if (!error && gameData) {
            callback(gameData);
          }
        });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to players changes
export function subscribeToPlayers(
  gameId: string,
  callback: (players: Player[]) => void
): () => void {
  const channelName = `players:${gameId}:${Date.now()}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`,
      },
      async (payload) => {
        console.log('Players changed:', payload);
        // Fetch fresh data when any change occurs
        const { players: playersData, error } = await getPlayers(gameId);
        if (!error && playersData) {
          callback(playersData);
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        // Immediately fetch players when subscribed
        getPlayers(gameId).then(({ players: playersData, error }) => {
          if (!error && playersData) {
            callback(playersData);
          }
        });
      }
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

