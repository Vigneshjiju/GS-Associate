CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_range VARCHAR(100) NOT NULL,
  features TEXT, -- Stored as comma-separated or JSON string
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
