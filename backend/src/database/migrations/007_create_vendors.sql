CREATE TABLE IF NOT EXISTS vendors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL, -- Caterer, Decorator, Photographer, Purohit
  contact_name VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  rating DECIMAL(3, 2) DEFAULT 5.0,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
