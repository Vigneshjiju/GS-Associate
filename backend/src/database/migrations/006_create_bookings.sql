CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE SET NULL,
  package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  event_date VARCHAR(50) NOT NULL,
  guest_count INTEGER NOT NULL,
  addons TEXT, -- JSON string representing list of addon IDs or detail objects
  total_price DECIMAL(20, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
