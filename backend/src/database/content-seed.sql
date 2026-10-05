-- Sample content for the horse blog
-- This file contains sample categories and articles

-- Blog categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Horse breeds', 'horse-breeds', 'Introduction to and review of different horse breeds in Iran and the world'),
('Diseases and health', 'health-diseases', 'Common horse diseases, prevention and treatment'),
('Equipment and supplies', 'equipment', 'Introduction to equipment needed for horse keeping and riding'),
('Equestrian sports', 'equestrian-sports', 'Various equestrian competitions and sports'),
('History and culture', 'history-culture', 'The history of the horse in Iran and the world, culture and literature'),
('Nutrition and care', 'nutrition-care', 'Diet, supplements and daily care'),
('Training and education', 'training-education', 'Methods of horse training and education'),
('Riding', 'riding', 'Riding techniques and skills')
ON CONFLICT (slug) DO NOTHING;

-- Sample articles (require author_id - must be added after creating a user)
-- These articles are templates

-- Sample article 1: Arabian horse breed
/*
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, category_id, author_id, is_published, published_at)
VALUES (
    'Arabian Horse: A Masterpiece of Nature',
    'arabian-horse',
    'The Arabian horse is one of the oldest and most beautiful horse breeds in the world, with a history spanning several thousand years.',
    'Content...',
    '/images/arabian-horse.jpg',
    (SELECT id FROM blog_categories WHERE slug = 'horse-breeds'),
    1,
    true,
    CURRENT_TIMESTAMP
);
*/

-- Product categories
INSERT INTO product_categories (name, slug, description) VALUES
('Riding equipment', 'riding-equipment', 'Saddles, tack, helmets and other riding equipment',
('Veterinary medicines', 'veterinary-medicines', 'Medicines needed for treating and preventing diseases'),
('Nutritional supplements', 'nutritional-supplements', 'Vitamins, minerals and nutritional supplements'),
('Care supplies', 'care-items', 'Brushes, shampoo, horseshoes and care supplies'),
('Feed and forage', 'feed-forage', 'Ready-made feed, alfalfa, barley and other forage'),
('Tools and equipment', 'tools-equipment', 'Tools needed for keeping and caring for horses')
ON CONFLICT (slug) DO NOTHING;

-- Sample products
/*
INSERT INTO products (name, slug, description, short_description, price, stock_quantity, category_id, is_active)
VALUES (
    'Standard English Saddle',
    'english-saddle-standard',
    'High-quality English saddle suitable for everyday riding...',
    'Standard English saddle with natural leather',
    15000000,
    10,
    (SELECT id FROM product_categories WHERE slug = 'riding-equipment'),
    true
);
*/

