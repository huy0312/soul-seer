-- Create question_sets table to store question templates for each user
CREATE TABLE IF NOT EXISTS question_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  round VARCHAR(50) NOT NULL CHECK (round IN ('khoi_dong', 'vuot_chuong_ngai_vat', 'tang_toc', 've_dich')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name, round)
);

-- Create question_templates table to store individual questions in a set
CREATE TABLE IF NOT EXISTS question_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL,
  question_type VARCHAR(50) DEFAULT 'normal',
  hang_ngang_index INTEGER,
  goi_diem INTEGER,
  hint TEXT, -- For storing image URLs
  options JSONB, -- For storing multiple choice options
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(set_id, order_index)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_sets_user_id ON question_sets(user_id);
CREATE INDEX IF NOT EXISTS idx_question_sets_round ON question_sets(round);
CREATE INDEX IF NOT EXISTS idx_question_templates_set_id ON question_templates(set_id);

-- Enable RLS
ALTER TABLE question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_sets
-- Users can only see their own question sets
CREATE POLICY "Users can view their own question sets"
  ON question_sets FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own question sets
CREATE POLICY "Users can insert their own question sets"
  ON question_sets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own question sets
CREATE POLICY "Users can update their own question sets"
  ON question_sets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own question sets
CREATE POLICY "Users can delete their own question sets"
  ON question_sets FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for question_templates
-- Users can only see question templates from their own sets
CREATE POLICY "Users can view their own question templates"
  ON question_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM question_sets
      WHERE question_sets.id = question_templates.set_id
      AND question_sets.user_id = auth.uid()
    )
  );

-- Users can insert question templates to their own sets
CREATE POLICY "Users can insert their own question templates"
  ON question_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM question_sets
      WHERE question_sets.id = question_templates.set_id
      AND question_sets.user_id = auth.uid()
    )
  );

-- Users can update question templates in their own sets
CREATE POLICY "Users can update their own question templates"
  ON question_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM question_sets
      WHERE question_sets.id = question_templates.set_id
      AND question_sets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM question_sets
      WHERE question_sets.id = question_templates.set_id
      AND question_sets.user_id = auth.uid()
    )
  );

-- Users can delete question templates from their own sets
CREATE POLICY "Users can delete their own question templates"
  ON question_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM question_sets
      WHERE question_sets.id = question_templates.set_id
      AND question_sets.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_question_sets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_question_sets_updated_at
  BEFORE UPDATE ON question_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_question_sets_updated_at();

