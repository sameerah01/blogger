/*
  # Add Categories and Tags Support

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
    - `tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `created_at` (timestamp)

  2. Changes
    - Add category_id to posts table
    - Add post_tags junction table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create post_tags junction table
CREATE TABLE IF NOT EXISTS post_tags (
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Add category_id to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES categories(id);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;

-- Policies for categories
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Categories are manageable by authenticated users" 
  ON categories FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Policies for tags
CREATE POLICY "Tags are viewable by everyone" 
  ON tags FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Tags are manageable by authenticated users" 
  ON tags FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Policies for post_tags
CREATE POLICY "Post tags are viewable by everyone" 
  ON post_tags FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Post tags are manageable by post authors" 
  ON post_tags FOR ALL 
  TO authenticated 
  USING (
    post_id IN (
      SELECT id FROM posts WHERE author_id = auth.uid()
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT id FROM posts WHERE author_id = auth.uid()
    )
  );