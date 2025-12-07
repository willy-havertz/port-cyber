-- Writeup Comments Table
CREATE TABLE IF NOT EXISTS writeup_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  writeup_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE writeup_comments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read comments
CREATE POLICY "Allow public read access"
ON writeup_comments FOR SELECT
TO anon, authenticated
USING (true);

-- Policy: Anyone can insert comments
CREATE POLICY "Allow public insert"
ON writeup_comments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_writeup_id ON writeup_comments(writeup_id);
CREATE INDEX idx_created_at ON writeup_comments(created_at DESC);
