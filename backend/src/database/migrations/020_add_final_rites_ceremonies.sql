-- Migration to insert Final Rites ritual catalog rows
INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) 
SELECT 'Apara Kriya & Funeral Support', 'apara-kriya', 'Final Rites', 'Comprehensive coordination of traditional Vedic funeral rites (Antyeshti) guided by experienced purohits with utmost respect and sanctity.', 'Ensures dignified and scripturally accurate final rites according to traditional family customs (Sampradaya).', 'Darbha grass, sesame seeds (til), holy water, earthen pots, sacred samagri'
WHERE NOT EXISTS (SELECT 1 FROM ceremonies WHERE slug = 'apara-kriya');

INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) 
SELECT 'Asthi Visarjan Services', 'asthi-visarjan', 'Final Rites', 'Sacred ritual of immersing ashes in holy rivers (Kaveri, Ganga) or Rameshwaram seaside, complete with purohit assistance and boats.', 'Provides peace to the departed soul through holy immersion accompanied by Vedic chanting.', 'Immersion urn, floral offerings, thirtham, purohit guidance'
WHERE NOT EXISTS (SELECT 1 FROM ceremonies WHERE slug = 'asthi-visarjan');

INSERT INTO ceremonies (name, slug, category, description, significance, ritual_items) 
SELECT 'Karumandhiram & Shraddha Services', 'karumandhiram-shraddha', 'Final Rites', 'Remembrance rituals conducted on the 10th to 13th days and annual Shraddha observances presided over by senior priests.', 'Honors ancestors (Pitrus) and seeks their eternal blessings for family well-being and lineage peace.', 'Pinda samagri, sesame seeds, darbha grass, Sattvic meal offerings, dharmo-kumbha'
WHERE NOT EXISTS (SELECT 1 FROM ceremonies WHERE slug = 'karumandhiram-shraddha');
