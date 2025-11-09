-- Tạo function để tự động cập nhật updated_at (cần tạo trước khi dùng trong trigger)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo bảng games để lưu thông tin game
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  current_round TEXT DEFAULT 'khoi_dong' CHECK (current_round IN ('khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng players để lưu thông tin người chơi
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, name)
);

-- Tạo bảng questions để lưu câu hỏi
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  round TEXT NOT NULL CHECK (round IN ('khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich')),
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng answers để lưu câu trả lời của người chơi
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, question_id)
);

-- Tạo indexes để tối ưu performance
CREATE INDEX idx_games_code ON public.games(code);
CREATE INDEX idx_games_status ON public.games(status);
CREATE INDEX idx_players_game_id ON public.players(game_id);
CREATE INDEX idx_questions_game_id ON public.questions(game_id);
CREATE INDEX idx_questions_round ON public.questions(round);
CREATE INDEX idx_answers_player_id ON public.answers(player_id);
CREATE INDEX idx_answers_question_id ON public.answers(question_id);

-- Bật Row Level Security
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Tạo policies cho games
CREATE POLICY "Anyone can create games" 
  ON public.games 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view games" 
  ON public.games 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update games" 
  ON public.games 
  FOR UPDATE 
  USING (true);

-- Tạo policies cho players
CREATE POLICY "Anyone can create players" 
  ON public.players 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view players" 
  ON public.players 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update players" 
  ON public.players 
  FOR UPDATE 
  USING (true);

-- Tạo policies cho questions
CREATE POLICY "Anyone can create questions" 
  ON public.questions 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view questions" 
  ON public.questions 
  FOR SELECT 
  USING (true);

-- Tạo policies cho answers
CREATE POLICY "Anyone can create answers" 
  ON public.answers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can view answers" 
  ON public.answers 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can update answers" 
  ON public.answers 
  FOR UPDATE 
  USING (true);

-- Tạo trigger để tự động cập nhật updated_at cho games
CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON public.games 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Tạo trigger để tự động cập nhật updated_at cho players
CREATE TRIGGER update_players_updated_at 
    BEFORE UPDATE ON public.players 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function để tạo game code ngẫu nhiên
CREATE OR REPLACE FUNCTION generate_game_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

