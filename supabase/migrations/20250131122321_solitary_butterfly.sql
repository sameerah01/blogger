/*
  # Blog Posts Schema

  1. New Tables
    - `posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique, required)
      - `content` (text)
      - `excerpt` (text)
      - `featured_image` (text)
      - `status` (text: draft/published)
      - `meta_title` (text)
      - `meta_description` (text)
      - `meta_keywords` (text)
      - `category` (text)
      - `tags` (text[])
      - `author_id` (uuid, references auth.users)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `posts` table
    - Add policies for authenticated users to manage their posts
*/

CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  featured_image text,
  status text NOT NULL DEFAULT 'draft',
  meta_title text,
  meta_description text,
  meta_keywords text,
  category text,
  tags text[],
  author_id uuid REFERENCES auth.users(id) NOT NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy for full access to own posts
CREATE POLICY "Users can manage own posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);