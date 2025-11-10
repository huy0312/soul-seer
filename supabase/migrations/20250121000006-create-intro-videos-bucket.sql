-- Tạo storage bucket cho intro videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('intro-videos', 'intro-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Tạo RLS policies cho bucket intro-videos
-- Cho phép mọi người xem video (vì bucket là public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'intro-videos');

-- Cho phép authenticated users upload video
CREATE POLICY "Authenticated users can upload intro videos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'intro-videos' 
  AND auth.role() = 'authenticated'
);

-- Cho phép authenticated users update/delete video của họ
CREATE POLICY "Authenticated users can update intro videos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'intro-videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete intro videos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'intro-videos' 
  AND auth.role() = 'authenticated'
);

