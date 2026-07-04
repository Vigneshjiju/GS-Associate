-- Seed default admin user (password is bcrypt hash of 'admin123')
INSERT INTO users (name, email, password, role) VALUES 
('GS Admin', 'admin@gsassociates.com', '$2a$10$S7DOIMlId9OISUXa5GTpU.rNDNOsS/HhN7Z3w0flxESPNjoH6CeSG', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Seed event types
INSERT INTO event_types (id, name, slug, description) VALUES 
(1, 'Weddings', 'weddings', 'Traditional South Indian Muhurthams, grand receptions, and customized destination weddings.'),
(2, 'Corporate Events', 'corporate', 'Professional conferences, product launches, seminars, brand activations, and executive gatherings.'),
(3, 'Social Events', 'social', 'Personal milestones including birthdays, anniversaries, baby showers, and family get-togethers.'),
(4, 'Traditional Ceremonies', 'ceremonies', 'Lifecycle rituals, auspicious poojas, and homams performed by verified Vedic purohits.')
ON CONFLICT (id) DO NOTHING;

-- Seed packages (Basic=1, Premium=2, Luxury=3 for each category)
-- For Weddings
INSERT INTO packages (event_type_id, name, description, price_range, features) VALUES 
(1, 'Basic Wedding', 'Simple traditional wedding execution covering core rituals and setups.', '₹1,00,000 - ₹5,00,000', 'Essential Mandap decor, Muhurtham planning assistance, Standard sound setup, Core ritual coordination'),
(1, 'Premium Wedding', 'Elegant wedding celebrations with rich decorations and end-to-end support.', '₹5,00,000 - ₹10,00,000', 'Elegant thematic floral mandap, Bridal makeup, Professional sound & light, Full catering management, Muhurtham consultation'),
(1, 'Luxury Wedding', 'Grand majestic wedding experiences with top-tier details and custom hospitality.', '₹10,00,000+', 'Bespoke grand entrance & designer mandap, Pre-wedding photoshoot, Live traditional & fusion music, Premium catering, Full hospitality & guest logistics');

-- For Corporate Events
INSERT INTO packages (event_type_id, name, description, price_range, features) VALUES 
(2, 'Basic Corporate', 'Clean, professional setup for seminars and mid-sized conferences.', '₹1,50,000 - ₹3,00,000', 'Standard audio-visual gear, Stage & podium branding, Attendee registration support, Standard hi-tea'),
(2, 'Premium Corporate', 'Polished brand activations, exhibitions, and executive conferences.', '₹3,00,000 - ₹6,00,000', 'Advanced LED backdrop, Multi-camera live stream, Customized registration portal, Multi-cuisine buffet'),
(2, 'Luxury Corporate', 'Grand-scale product launches and VIP corporate galas.', '₹6,00,000+', 'Bespoke stage designs, 4K projection mapping, Celebrity emcee, Premium corporate gifting, 5-star catering');

-- For Ceremonies
INSERT INTO packages (event_type_id, name, description, price_range, features) VALUES 
(4, 'Basic Ceremony', 'Essential setups for domestic poojas and lifecycle rituals.', '₹30,000 - ₹60,000', 'Verified Purohit booking, Standard Puja kit & samagri, Basic home/venue decoration, Sattvic menu coordination'),
(4, 'Premium Ceremony', 'Traditional ceremonies with complete ritual kits and guest setups.', '₹60,000 - ₹1,50,000', 'Experienced Vedic Purohit team, Complete premium Puja kit, Vastu-compliant mandap, Traditional South Indian seating, Standard Sattvic buffet'),
(4, 'Luxury Ceremony', 'Grand traditional ceremonies with elaborate Vedic rituals and grand catering.', '₹1,50,000+', 'Senior Acharya & Vedic group, Grand floral & traditional themes, Custom ritual item arrangements, Premium traditional welcome, Grand organic Sattvic feast');

-- Seed package add-ons
INSERT INTO package_addons (name, description, base_price, category) VALUES 
('Classic Floral Decor', 'Traditional marigold and jasmine arrangements.', 30000.00, 'decor'),
('Grand Royal Mandap Decor', 'Ornate temple-style backdrop decorations with fresh flowers.', 95000.00, 'decor'),
('Standard South Indian Catering', 'Traditional banana leaf service with 18 items.', 450.00, 'catering'),
('Premium Sattvic Feast', 'Traditional pure vegetarian buffet with 26 items.', 750.00, 'catering'),
('Standard Photography', 'Traditional photo & video coverage of key rituals.', 25000.00, 'photography'),
('Cinematic Candid Showcase', 'Full DSLR coverage, cinematic video teaser, and high-res album.', 65000.00, 'photography'),
('Vedic Purohit Services', 'Verified purohit booking and Muhurtham timing consultation.', 10000.00, 'priest'),
('Maha Homam Priest Group', 'Lead Acharya with 4 assistant priests for elaborate homams.', 28000.00, 'priest');

-- Seed traditional ceremonies
INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) VALUES 
('Upanayanam', 'upanayanam', 'Life-cycle', 'Traditional sacred thread ceremony marking a young boy''s entry into formal education and spiritual life.', 'Symbolizes the second birth (spiritual birth) and eligibility to study the Vedas and perform Gayatri Japa.', 'Sacred thread, darbha grass, homam wood, ghee, new clothes, brass vessels'),
('Seemantham', 'seemantham', 'Life-cycle', 'Traditional South Indian baby shower conducted during the odd months of pregnancy (usually 7th or 9th) to bless the mother and unborn child.', 'Provides mental strength to the mother and invokes positive vibrations for the child''s health and intelligence.', 'Glass bangles, turmeric, kumkum, specialized sweets, coconut, fruits'),
('Griha Pravesh', 'griha-pravesh', 'Poojas', 'Auspicious housewarming ceremony performed before moving into a new home to purify it from negative energies.', 'Ensures prosperity, peace, and good health for the residents by seeking blessings of Vastu Purusha.', 'Milk, cow and calf, Ganga water, Navadhanya, copper kalasam'),
('Ganapati Homam', 'ganapati-homam', 'Homams', 'Powerful fire ritual dedicated to Lord Ganesha, the remover of obstacles, performed before starting any new venture.', 'Brings success, prosperity, and peace of mind by clearing hurdles and negative energies.', 'Modak, sugarcane, puffed rice, ghee, coconut, visual puja samagri'),
('Namakaranam', 'namakaranam', 'Life-cycle', 'Traditional baby-naming ceremony conducted on the 11th or 12th day after the child''s birth.', 'Formally welcomes the newborn into the family and community and introduces their astrological name.', 'Panchagavya, honey, gold ring, rice grains, new cradles'),
('Sashtiabdapoorthi (60th Birthday)', 'sashtiabdapoorthi', 'Milestone & Longevity', 'Celebration of the 60th birthday, marking the completion of the 60-year lunar cycle. Includes symbolic re-wedding (Kalyana Veduka).', 'Requires horoscope-based Muhurtham calculations using both spouses birth stars, mutt, and Veda affiliation to fix auspicious dates.', 'Yamuna Puja, Ganga Puja, Kalasha Sthapana, Navagraha and Ganapati Homa'),
('Bhima Ratha Shanti (70th Birthday)', 'bhima-ratha-shanti', 'Milestone & Longevity', '70th birthday celebration and peace rituals presided over by the Mrutyunjaya Bhima form of Lord Shiva.', 'Invokes physical health, longevity, and spiritual strength for the elder couple.', 'Mrutyunjaya Homa, Kalasa Sthapana, Vedic recitations'),
('Sathabhishekam (80th Birthday)', 'sathabhishekam', 'Milestone & Longevity', '80th birthday milestone celebration marking the transition to the final stage of life and spiritual seeking (Mumukshu phase).', 'Blessing of witnessing 1000 full moons. Requires birth star alignments for both spouses.', 'Kalashas, Sahasra Chandra Darshana Puja, gold coin offerings'),
('Shatabdi (100th Birthday)', 'shatabdi', 'Milestone & Longevity', '100th birthday celebration commemorating a century of life, wisdom, and cosmic blessings.', 'Highest longevity milestone invocation for family and future generations.', 'Ayushya Homa, Maha Puja, Sattvic feast'),
('Veda Parayanam Chanting', 'veda-parayanam', 'Vedic Recitations', 'Continuous Vedic recitation performed for health, prosperity, or remembrance. Available as Akhanda (uninterrupted multi-day) recitations.', 'Occasion-based recommendations (health recovery, housewarming, memorial shanti) with audio/video recording and remote relative livestream options.', 'Veda scholars team, audio/video recording setups, digital livestream options'),
('Sri Rudram & Chamakam Chanting', 'rudram-parayanam', 'Vedic Recitations', 'Powerful recitation of Sri Rudram and Chamakam from Yajurveda, dedicated to Lord Shiva.', 'Performed for general health recovery, obstacle removal, and planetary peace.', 'Shiva Puja samagri, kalasa, bilva leaves'),
('Shashthi Vrata', 'shashthi-vrata', 'Vrata & Fasting', 'Six-day fasting observance dedicated to Kartikeya, primarily observed by South Indian Hindus during Ashvin month.', 'Ends with puja involving a kalasha, Agni, and modak offerings to invoke family prosperity.', 'Kalasha setup, Agni Homa, modak offerings, Kartikeya photos'),
('Brahmotsavam Services', 'brahmotsavam-services', 'Temple-Style Festivals', 'Multi-day festival coordination including flag-hoisting ceremonies and processions following temple consecration traditions.', 'Useful for large community functions or temple-sponsored corporate CSR events.', 'Festival flags, chariot/procession setups, temple purohit panel'),
('Apara Kriya & Funeral Support', 'apara-kriya', 'Final Rites', 'Comprehensive coordination of traditional Vedic funeral rites (Antyeshti) guided by experienced purohits with utmost respect and sanctity.', 'Ensures dignified and scripturally accurate final rites according to traditional family customs (Sampradaya).', 'Darbha grass, sesame seeds (til), holy water, earthen pots, sacred samagri'),
('Asthi Visarjan Services', 'asthi-visarjan', 'Final Rites', 'Sacred ritual of immersing ashes in holy rivers (Kaveri, Ganga) or Rameshwaram seaside, complete with purohit assistance and boats.', 'Provides peace to the departed soul through holy immersion accompanied by Vedic chanting.', 'Immersion urn, floral offerings, thirtham, purohit guidance'),
('Karumandhiram & Shraddha Services', 'karumandhiram-shraddha', 'Final Rites', 'Remembrance rituals conducted on the 10th to 13th days and annual Shraddha observances presided over by senior priests.', 'Honors ancestors (Pitrus) and seeks their eternal blessings for family well-being and lineage peace.', 'Pinda samagri, sesame seeds, darbha grass, Sattvic meal offerings, dharmo-kumbha');

-- Seed panchang auspicious dates (2026 dates)
INSERT INTO panchang_entries (date, tithi, nakshatram, lagnam, auspicious_time, event_type) VALUES 
('2026-06-18', 'Dwitiya', 'Punarvasu', 'Mithuna Lagnam', '07:30 AM - 09:00 AM', 'Marriage'),
('2026-06-25', 'Dasami', 'Chitra', 'Simha Lagnam', '09:15 AM - 10:45 AM', 'Upanayanam'),
('2026-07-02', 'Dwitiya', 'Uttarashadha', 'Kanya Lagnam', '06:00 AM - 07:30 AM', 'Griha Pravesh'),
('2026-07-15', 'Tritiya', 'Pushya', 'Mithuna Lagnam', '08:00 AM - 09:30 AM', 'Seemantham'),
('2026-07-29', 'Prathama', 'Sravana', 'Simha Lagnam', '10:30 AM - 12:00 PM', 'Marriage'),
('2026-08-08', 'Dasami', 'Rohini', 'Vrishabha Lagnam', '07:15 AM - 08:45 AM', 'Griha Pravesh'),
('2026-08-20', 'Tritiya', 'Swati', 'Kanya Lagnam', '09:00 AM - 10:30 AM', 'Upanayanam');

-- Seed verified vendors
INSERT INTO vendors (name, category, contact_name, phone, email, rating, is_verified) VALUES 
('Sri Rama Catering Services', 'Caterer', 'Sundaram Iyer', '9840123456', 'catering@srirama.com', 4.9, true),
('Vasanth Florals & Decor', 'Decorator', 'Vasanth Kumar', '9840234567', 'decor@vasanth.com', 4.8, true),
('Pixel & Cine Studios', 'Photographer', 'Rakesh Pillai', '9840345678', 'photos@pixelcine.com', 4.7, true),
('Vaidika Purohit Group', 'Purohit', 'Srinivasa Sastry', '9840456789', 'sastry@vaidika.com', 5.0, true);

-- Seed testimonials
INSERT INTO testimonials (client_name, event_type, review_text, rating, event_date) VALUES 
('Meenakshi Sundaram', 'Weddings', 'GS Associates managed our daughter''s wedding in Madurai. They handled every detail from muhurtham coordination to the traditional catering flawlessly. Truly stress-free!', 5, '2025-11-20'),
('Karthik Raghavan', 'Traditional Ceremonies', 'Booked them for my son''s Upanayanam. The priest coordination was top class, and the Vastu-compliant setup was exactly as requested. Highly recommended!', 5, '2026-02-15'),
('Aditya Birla Group India', 'Corporate Events', 'We outsourced our annual regional summit setup to GS Associates. Very professional execution, beautiful LED backdrops, and great guest logistics.', 4, '2026-04-10');
