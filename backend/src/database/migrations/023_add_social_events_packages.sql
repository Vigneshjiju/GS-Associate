-- Migration to insert Social Events packages
INSERT INTO packages (event_type_id, name, description, price_range, features)
SELECT 3, 'Basic Social', 'Simple traditional or modern execution covering core decorations and setups.', '₹75,000 - ₹1,50,000', 'Standard theme decor, basic sound setup, stage coordination, guest management assistance'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Basic Social');

INSERT INTO packages (event_type_id, name, description, price_range, features)
SELECT 3, 'Premium Social', 'Beautiful celebrations with customized decorations and catering management.', '₹1,80,000 - ₹3,50,000', 'Exquisite floral decoration, premium sound & stage lights, full catering management, professional photography & videography'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Premium Social');

INSERT INTO packages (event_type_id, name, description, price_range, features)
SELECT 3, 'Luxury Social', 'Grand celebrations with bespoke layouts, entertainment, and top-tier guest logistics.', '₹3,50,000+', 'Bespoke designer themes, celebrity host/entertainment, multi-cuisine catering, cinematography & drone footage, full hospitality & guest logistics'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Luxury Social');
