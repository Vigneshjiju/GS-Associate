-- Migration to insert missing ceremony catalog rows
INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) 
SELECT 'Annaprasanam', 'annaprasanam', 'Life-cycle', 'Traditional South Indian ceremony marking the baby''s first intake of solid food (usually sweet payasam/rice pudding) to bless their physical growth and digestive health.', 'Invokes good digestion, physical strength, and sweet speech for the baby.', 'Rice payasam, silver spoon, gold ring, books, pen, gold jewelry, clay, food grains'
WHERE NOT EXISTS (SELECT 1 FROM ceremonies WHERE slug = 'annaprasanam');

INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) 
SELECT 'Akhanda Parayanam', 'akhanda-parayanam', 'Vedic Recitations', 'Continuous 24-hour uninterrupted recitation of sacred scriptures (such as Srimad Sundarakanda, Bhagavad Gita, or Upanishads) performed by a dedicated panel of Vedic scholars.', 'Locks positive cosmic energy in the home and purifies the surroundings from deep negative vibes.', 'Altar, deity portraits, prasad offerings, continuous ghee lamp, scriptural books, seating mats'
WHERE NOT EXISTS (SELECT 1 FROM ceremonies WHERE slug = 'akhanda-parayanam');

INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) 
SELECT 'Group Parayanam', 'group-parayanam', 'Vedic Recitations', 'Collective, mass chanting of powerful Vedic mantras and hymns performed by a large group of scholars and devotees to invoke collective blessings.', 'Amplifies the spiritual resonance and power of the chants through unified voice and energy.', 'Microphone setup, seating mats, chanting books, sound amplification, group prasad distribution'
WHERE NOT EXISTS (SELECT 1 FROM ceremonies WHERE slug = 'group-parayanam');
