-- Thêm cột avatar_url vào bảng players để lưu ảnh nhân vật
ALTER TABLE public.players
ADD COLUMN avatar_url TEXT;

COMMENT ON COLUMN public.players.avatar_url IS 'URL ảnh nhân vật mà người chơi đã chọn';

