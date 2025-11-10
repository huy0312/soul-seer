-- Add options column to questions table for multiple choice questions
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS options JSONB;

-- Add comment
COMMENT ON COLUMN public.questions.options IS 'Array of 4 answer options for multiple choice questions, e.g. ["Option A", "Option B", "Option C", "Option D"]';

