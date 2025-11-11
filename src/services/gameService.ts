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
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Bạn cần đăng nhập để tạo game');
    }

    const code = generateGameCode();
    const { data, error } = await supabase
      .from('games')
      .insert({ 
        code, 
        status: 'waiting', 
        current_round: 'khoi_dong',
        user_id: user.id 
      })
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
  playerName: string,
  isHost: boolean = false,
  avatarUrl?: string
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

    // Check if game already has a host
    if (isHost) {
      const { data: existingHost } = await supabase
        .from('players')
        .select('id')
        .eq('game_id', game.id)
        .eq('is_host', true)
        .single();

      if (existingHost) {
        throw new Error('Game already has a host');
      }
    }

    // Check if game already has 4 players (excluding host)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, is_host')
      .eq('game_id', game.id);

    if (playersError) throw playersError;

    // Count non-host players
    const nonHostPlayers = players?.filter((p) => !p.is_host) || [];
    if (!isHost && nonHostPlayers.length >= 4) {
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
        is_host: isHost,
        avatar_url: avatarUrl || null,
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

// Update game intro videos for all rounds
export async function updateGameIntroVideos(
  gameId: string,
  introVideos: Record<RoundType, string | null>
): Promise<{ error: Error | null }> {
  try {
    // Filter out null values to keep JSON clean
    const videosToSave: Record<string, string> = {};
    for (const [round, url] of Object.entries(introVideos)) {
      if (url && url.trim()) {
        videosToSave[round] = url.trim();
      }
    }
    
    console.log('Saving intro videos:', videosToSave);
    
    const { error } = await supabase
      .from('games')
      .update({ intro_videos: videosToSave })
      .eq('id', gameId);

    if (error) {
      console.error('Error updating intro videos:', error);
      throw error;
    }
    
    console.log('Intro videos saved successfully');
    return { error: null };
  } catch (error) {
    console.error('Exception updating intro videos:', error);
    return { error: error as Error };
  }
}

// Update VCNV config (cols, 4 words, central answer)
export async function updateVCNVConfig(
  gameId: string,
  config: { cols: number; words: [string, string, string, string]; central: string }
): Promise<{ error: Error | null }> {
  try {
    const sanitized = {
      cols: Math.max(1, Math.min(30, Math.floor(config.cols || 1))),
      rows: 4,
      words: config.words.map((w) => (w || '').trim()),
      central: (config.central || '').trim(),
    };
    const { error } = await supabase.from('games').update({ vcnv_config: sanitized }).eq('id', gameId);
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Upload video file to Supabase storage
export async function uploadQuestionImage(
  gameId: string,
  questionIndex: number,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { url: null, error: new Error('Bạn cần đăng nhập để upload hình ảnh') };
    }

    // Get file extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${gameId}-q${questionIndex}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload file to storage (using intro-videos bucket or create a new one)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('intro-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      // Provide more specific error messages
      if (uploadError.message.includes('Bucket not found')) {
        return { url: null, error: new Error('Storage bucket "intro-videos" chưa được tạo. Vui lòng tạo bucket trong Supabase Dashboard.') };
      }
      if (uploadError.message.includes('new row violates row-level security')) {
        return { url: null, error: new Error('Không có quyền upload. Vui lòng kiểm tra RLS policies.') };
      }
      return { url: null, error: new Error(uploadError.message || 'Lỗi khi upload hình ảnh') };
    }

    if (!uploadData) {
      return { url: null, error: new Error('Upload thành công nhưng không nhận được dữ liệu') };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('intro-videos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { url: null, error: new Error('Không thể lấy public URL của hình ảnh') };
    }

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

// Upload video file to Supabase storage
export async function uploadIntroVideo(
  gameId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { url: null, error: new Error('Bạn cần đăng nhập để upload video') };
    }

    // Get file extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${gameId}-${Date.now()}.${fileExt}`;
    const filePath = fileName; // Store directly in bucket root, not in subfolder

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('intro-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error details:', uploadError);
      // Provide more specific error messages
      if (uploadError.message.includes('Bucket not found')) {
        return { url: null, error: new Error('Storage bucket "intro-videos" chưa được tạo. Vui lòng tạo bucket trong Supabase Dashboard.') };
      }
      if (uploadError.message.includes('new row violates row-level security')) {
        return { url: null, error: new Error('Không có quyền upload. Vui lòng kiểm tra RLS policies.') };
      }
      return { url: null, error: new Error(uploadError.message || 'Lỗi khi upload video') };
    }

    if (!uploadData) {
      return { url: null, error: new Error('Upload thành công nhưng không nhận được dữ liệu') };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('intro-videos')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { url: null, error: new Error('Không thể lấy public URL của video') };
    }

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Upload video exception:', error);
    return { url: null, error: error instanceof Error ? error : new Error('Lỗi không xác định khi upload video') };
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

// Get all questions for a game, grouped by round
export async function getAllQuestionsByGame(
  gameId: string
): Promise<{ byRound: Record<RoundType, Question[]>; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('game_id', gameId)
      .order('round', { ascending: true })
      .order('order_index', { ascending: true });

    if (error) throw error;

    const byRound: Record<RoundType, Question[]> = {
      khoi_dong: [],
      vuot_chuong_ngai_vat: [],
      tang_toc: [],
      ve_dich: [],
    };

    (data || []).forEach((q) => {
      const r = (q.round as RoundType) || 'khoi_dong';
      byRound[r].push(q);
    });

    return { byRound, error: null };
  } catch (error) {
    return { byRound: { khoi_dong: [], vuot_chuong_ngai_vat: [], tang_toc: [], ve_dich: [] }, error: error as Error };
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
    options?: string | null;
  }>
): Promise<{ error: Error | null }> {
  try {
    const questionsWithGameId = questions.map((q) => {
      const questionData: any = {
        ...q,
        game_id: gameId,
      };
      // Parse options if it's a string (JSON)
      if (q.options && typeof q.options === 'string') {
        try {
          questionData.options = JSON.parse(q.options);
        } catch {
          questionData.options = q.options;
        }
      } else if (q.options) {
        questionData.options = q.options;
      }
      return questionData;
    });
    const { error } = await supabase.from('questions').insert(questionsWithGameId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

// Delete all questions for a game (for full replace on save)
export async function deleteQuestionsByGame(
  gameId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('questions').delete().eq('game_id', gameId);
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
  answerText: string,
  responseTime?: number,
  useStar?: boolean
): Promise<{ answer: Answer | null; error: Error | null }> {
  try {
    // Get question to check correct answer
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('correct_answer, points, goi_diem')
      .eq('id', questionId)
      .single();

    if (questionError || !question) throw new Error('Question not found');

    // Normalize Vietnamese for comparison (remove diacritics, lowercase, trim)
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .trim();
    const isCorrect = normalize(answerText) === normalize(question.correct_answer);
    
    // Calculate points based on round and special conditions
    let pointsEarned = 0;
    const basePoints = question.goi_diem || question.points;
    
    if (isCorrect) {
      if (useStar) {
        // Double points if using star and correct
        pointsEarned = basePoints * 2;
      } else {
        pointsEarned = basePoints;
      }
      
      // Adjust points based on response time for Tăng tốc (faster = more points)
      if (responseTime !== undefined && responseTime > 0) {
        // First responder gets full points, others get reduced
        // This logic can be enhanced based on actual response order
        const timeBonus = Math.max(0, 1 - responseTime / 30); // Bonus for speed
        pointsEarned = Math.floor(pointsEarned * (1 + timeBonus * 0.5)); // Up to 50% bonus
      }
    } else {
      // For Về đích, wrong answer subtracts points
      if (question.goi_diem) {
        pointsEarned = useStar ? -basePoints * 2 : -basePoints;
      }
    }

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
          response_time: responseTime || null,
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
          response_time: responseTime || null,
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

// Get all answers for a game and round
export async function getAnswersForRound(
  gameId: string,
  round: RoundType
): Promise<{ answers: Answer[] | null; error: Error | null }> {
  try {
    // First get all question IDs for this round
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id')
      .eq('game_id', gameId)
      .eq('round', round);

    if (questionsError) throw questionsError;
    if (!questions || questions.length === 0) {
      return { answers: [], error: null };
    }

    const questionIds = questions.map((q) => q.id);

    // Get all answers for these questions
    const { data, error } = await supabase
      .from('answers')
      .select('*')
      .in('question_id', questionIds);

    if (error) throw error;
    return { answers: data || [], error: null };
  } catch (error) {
    return { answers: null, error: error as Error };
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
          const updatedGame = payload.new as Game;
          console.log('Updated game status:', updatedGame.status);
          callback(updatedGame);
        }
      }
    )
    .subscribe((status) => {
      console.log('Game subscription status:', status);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to game changes');
        // Immediately fetch game when subscribed
        getGameById(gameId).then(({ game: gameData, error }) => {
          if (!error && gameData) {
            console.log('Initial game state:', gameData.status);
            callback(gameData);
          }
        });
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Channel error occurred');
      } else if (status === 'TIMED_OUT') {
        console.error('Subscription timed out');
      } else if (status === 'CLOSED') {
        console.log('Channel closed');
      }
    });

  return () => {
    console.log('Unsubscribing from game changes');
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

// Generic round event channel (broadcast)
export function createRoundEventChannel(
  gameId: string,
  onEvent: (event: { type: 'round_finished'; round: RoundType }) => void
): () => void {
  const channelName = `round_evt:${gameId}`;
  const channel = supabase
    .channel(channelName, { config: { broadcast: { self: true } } })
    .on('broadcast', { event: 'round:finished' }, (payload) => {
      const data = (payload as any)?.payload || {};
      if (data?.round) {
        onEvent({ type: 'round_finished', round: data.round as RoundType });
      }
    })
    .subscribe((status) => {
      console.log('Round event channel status:', status);
    });
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function emitRoundFinished(gameId: string, round: RoundType): Promise<void> {
  const channelName = `round_evt:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'round:finished',
    payload: { round },
  });
  supabase.removeChannel(channel);
}

// Realtime timer control for VCNV using broadcast channel (no schema changes)
export function createVCNVTimerChannel(
  gameId: string,
  onEvent: (event: { type: 'start' | 'stop'; payload?: any }) => void
): () => void {
  const channelName = `vcnv_timer:${gameId}`;
  const channel = supabase
    .channel(channelName, { config: { broadcast: { self: true } } })
    .on('broadcast', { event: 'timer:start' }, (payload) => {
      onEvent({ type: 'start', payload });
    })
    .on('broadcast', { event: 'timer:stop' }, (payload) => {
      onEvent({ type: 'stop', payload });
    })
    .subscribe((status) => {
      console.log('VCNV timer channel status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function startVCNVTimer(gameId: string, durationSec: number = 10): Promise<void> {
  const channelName = `vcnv_timer:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  const startedAt = Date.now();
  await channel.send({
    type: 'broadcast',
    event: 'timer:start',
    payload: { durationSec, startedAt },
  });
  // Do not keep channel open here; host UI will have its own listener
  supabase.removeChannel(channel);
}

export async function stopVCNVTimer(gameId: string): Promise<void> {
  const channelName = `vcnv_timer:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'timer:stop',
    payload: {},
  });
  supabase.removeChannel(channel);
}

// Signal when a player claims to have solved the central obstacle
export function createVCNVSignalChannel(
  gameId: string,
  onSignal: (event: { playerId: string; playerName?: string }) => void
): () => void {
  const channelName = `vcnv_signal:${gameId}`;
  const channel = supabase
    .channel(channelName, { config: { broadcast: { self: true } } })
    .on('broadcast', { event: 'signal:central' }, (payload) => {
      const data = (payload as any)?.payload || {};
      if (data?.playerId) {
        onSignal({ playerId: data.playerId, playerName: data.playerName });
      }
    })
    .subscribe((status) => {
      console.log('VCNV signal channel status:', status);
    });
  return () => {
    supabase.removeChannel(channel);
  };
}

export async function emitVCNVSignal(
  gameId: string,
  playerId: string,
  playerName?: string
): Promise<void> {
  const channelName = `vcnv_signal:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'signal:central',
    payload: { playerId, playerName },
  });
  supabase.removeChannel(channel);
}

// Realtime control for Tăng tốc round
export function createTangTocChannel(
  gameId: string,
  onEvent: (event: { type: 'show_question' | 'start_timer' | 'stop_timer'; payload?: any }) => void
): () => void {
  const channelName = `tangtoc:${gameId}`;
  const channel = supabase
    .channel(channelName, { config: { broadcast: { self: true } } })
    .on('broadcast', { event: 'question:show' }, (payload) => {
      onEvent({ type: 'show_question', payload });
    })
    .on('broadcast', { event: 'timer:start' }, (payload) => {
      onEvent({ type: 'start_timer', payload });
    })
    .on('broadcast', { event: 'timer:stop' }, (payload) => {
      onEvent({ type: 'stop_timer', payload });
    })
    .subscribe((status) => {
      console.log('TangToc channel status:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function showTangTocQuestion(gameId: string, questionIndex: number, questionId: string): Promise<void> {
  const channelName = `tangtoc:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'question:show',
    payload: { questionIndex, questionId },
  });
  supabase.removeChannel(channel);
}

export async function startTangTocTimer(gameId: string, durationSec: number = 20): Promise<void> {
  const channelName = `tangtoc:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  const startedAt = Date.now();
  await channel.send({
    type: 'broadcast',
    event: 'timer:start',
    payload: { durationSec, startedAt },
  });
  supabase.removeChannel(channel);
}

export async function stopTangTocTimer(gameId: string): Promise<void> {
  const channelName = `tangtoc:${gameId}`;
  const channel = supabase.channel(channelName, { config: { broadcast: { self: true } } });
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'timer:stop',
    payload: {},
  });
  supabase.removeChannel(channel);
}

export async function getVCNVState(gameId: string): Promise<{ state: { hang_ngang_index: number; is_revealed: boolean }[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('vcnv_state')
      .select('hang_ngang_index, is_revealed')
      .eq('game_id', gameId)
      .order('hang_ngang_index', { ascending: true });

    if (error) throw error;
    return { state: data || [], error: null };
  } catch (error) {
    return { state: [], error: error as Error };
  }
}

export async function revealHangNgang(gameId: string, index: number): Promise<{ error: Error | null }> {
  try {
    // Upsert reveal state for the specific hang ngang index
    const { error } = await supabase
      .from('vcnv_state')
      .upsert({ game_id: gameId, hang_ngang_index: index, is_revealed: true, revealed_at: new Date().toISOString() }, { onConflict: 'game_id,hang_ngang_index' });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function awardPoints(playerId: string, points: number): Promise<{ error: Error | null }> {
  try {
    // Preferred: server-side RPC if available
    const { error: rpcError } = await supabase.rpc('increment_player_score', { p_player_id: playerId, p_delta: points });
    if (!rpcError) {
      return { error: null };
    }
    // Fallback: read-modify-write
    const { data: playerData, error: readError } = await supabase
      .from('players')
      .select('score')
      .eq('id', playerId)
      .single();
    if (readError) throw readError;
    const currentScore = playerData?.score ?? 0;
    const { error: updateError } = await supabase
      .from('players')
      .update({ score: currentScore + points })
      .eq('id', playerId);
    if (updateError) throw updateError;
    return { error: null };
  } catch (e) {
    return { error: e as Error };
  }
}

