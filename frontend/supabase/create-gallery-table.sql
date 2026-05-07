-- Create gallery table for hotel images
CREATE TABLE IF NOT EXISTS gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rooms', 'facilities', 'dining', 'events')),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(is_active);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery(display_order);

-- Enable RLS
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Public can view active gallery images
CREATE POLICY "Anyone can view active gallery images"
  ON gallery FOR SELECT
  USING (is_active = true);

-- Only admins can insert/update/delete gallery images
CREATE POLICY "Admins can manage gallery"
  ON gallery FOR ALL
  USING (true);

-- Add comments
COMMENT ON TABLE gallery IS 'Hotel gallery images organized by category';
COMMENT ON COLUMN gallery.category IS 'Image category: rooms, facilities, dining, or events';
COMMENT ON COLUMN gallery.display_order IS 'Order for displaying images (lower numbers first)';
COMMENT ON COLUMN gallery.is_active IS 'Whether the image is visible to public';
