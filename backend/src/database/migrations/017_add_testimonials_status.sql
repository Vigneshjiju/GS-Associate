-- Add status column to testimonials for approval workflow
ALTER TABLE testimonials ADD COLUMN status TEXT DEFAULT 'approved';
ALTER TABLE testimonials ADD COLUMN feedback_id INTEGER;
