-- Tạo bảng chat_messages để lưu tin nhắn trong game
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_id ON public.chat_messages(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_player_id ON public.chat_messages(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);

-- Bật Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies cho chat_messages
CREATE POLICY "Anyone can view chat messages" 
  ON public.chat_messages 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create chat messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (true);

