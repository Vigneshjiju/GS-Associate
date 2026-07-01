CREATE TABLE IF NOT EXISTS gallery_items (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  media_url VARCHAR(255) NOT NULL,
  media_type VARCHAR(20) DEFAULT 'image', -- image or video
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
