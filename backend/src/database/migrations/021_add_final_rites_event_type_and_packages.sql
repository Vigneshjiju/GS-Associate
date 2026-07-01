-- Migration to insert Final Rites into event_types and packages tables
INSERT INTO event_types (id, name, slug, description)
SELECT 5, 'Final Rites', 'final-rites', 'Dignified Apara Kriya, Asthi Visarjan, and Karumandhiram rites guided by experienced Vedic priests.'
WHERE NOT EXISTS (SELECT 1 FROM event_types WHERE slug = 'final-rites' OR id = 5);

INSERT INTO packages (event_type_id, name, description, price_range, features)
SELECT 5, 'Basic Final Rites', 'Essential coordination for Apara Kriya and funeral rites.', '₹25,000 - ₹50,000', 'Verified Acharya booking, Core ritual samagri kit, Earthen pots & dharmo-kumbha, Assistance at cremation ground'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Basic Final Rites');

INSERT INTO packages (event_type_id, name, description, price_range, features)
SELECT 5, 'Premium Final Rites', 'Comprehensive 10th-13th day Karumandhiram and remembrance services.', '₹50,000 - ₹1,20,000', 'Senior Vedic Purohit panel, Complete Karumandhiram setup, Pinda danam & thirtham arrangements, Sattvic memorial meal coordination'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Premium Final Rites');

INSERT INTO packages (event_type_id, name, description, price_range, features)
SELECT 5, 'Luxury Final Rites', 'Complete end-to-end Apara Kriya, holy Asthi Visarjan, and annual Shraddha coordination.', '₹1,20,000+', 'Lead Acharya with assistant priests, Holy river Asthi Visarjan boat & rituals, Full memorial guest logistics, Annual Shraddha remembrance reminder setup'
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'Luxury Final Rites');
