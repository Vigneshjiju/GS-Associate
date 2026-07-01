-- Migration to add email status tracking columns to bookings table
ALTER TABLE bookings ADD COLUMN reminder_sent INTEGER DEFAULT 0;
ALTER TABLE bookings ADD COLUMN feedback_sent INTEGER DEFAULT 0;
