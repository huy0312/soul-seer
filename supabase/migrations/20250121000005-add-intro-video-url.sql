-- Thêm cột intro_video_url vào bảng games để lưu URL video intro cho phần khởi động
ALTER TABLE public.games
ADD COLUMN intro_video_url TEXT;

-- Thêm comment
COMMENT ON COLUMN public.games.intro_video_url IS 'URL video intro cho phần khởi động (có thể là YouTube, Vimeo, hoặc direct link)';

