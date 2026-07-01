-- Extend feedback_surveys with additional fields for the public feedback form
ALTER TABLE feedback_surveys ADD COLUMN best_comment TEXT;
ALTER TABLE feedback_surveys ADD COLUMN improve_comment TEXT;
ALTER TABLE feedback_surveys ADD COLUMN recommend INTEGER DEFAULT 1;
ALTER TABLE feedback_surveys ADD COLUMN photo_url TEXT;
ALTER TABLE feedback_surveys ADD COLUMN status TEXT DEFAULT 'pending';
