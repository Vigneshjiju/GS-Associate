CREATE TABLE IF NOT EXISTS feedback_surveys (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
  overall_rating INTEGER NOT NULL,
  decor_rating INTEGER,
  catering_rating INTEGER,
  staff_rating INTEGER,
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
