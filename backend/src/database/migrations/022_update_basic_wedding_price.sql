-- Migration to update Basic Wedding price range
UPDATE packages 
SET price_range = '₹1,00,000 - ₹5,00,000' 
WHERE name = 'Basic Wedding';
