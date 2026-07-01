CREATE TABLE IF NOT EXISTS panchang_entries (
  id SERIAL PRIMARY KEY,
  date VARCHAR(50) NOT NULL, -- YYYY-MM-DD
  tithi VARCHAR(100),
  nakshatram VARCHAR(100),
  lagnam VARCHAR(100),
  auspicious_time VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL, -- Marriage, Upanayanam, Griha Pravesh, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
