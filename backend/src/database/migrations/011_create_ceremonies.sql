CREATE TABLE IF NOT EXISTS ceremonies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL, -- Life-cycle, Pooja, Homam
  description TEXT NOT NULL,
  significance TEXT,
  ritual_items TEXT, -- comma-separated list of items required
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
