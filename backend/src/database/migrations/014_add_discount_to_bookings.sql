-- Migration to add discount column to bookings table
ALTER TABLE bookings ADD COLUMN discount INT DEFAULT 0;
