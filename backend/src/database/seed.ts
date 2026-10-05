import { query } from './connection';
import bcrypt from 'bcryptjs';

// Seed script for initial data
async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@steedly.ir', adminPassword, 'System Admin', 'admin']
    );

    console.log('✅ Admin user created');

    // Create blog categories
    const categories = [
      { name: 'Horse breeds', slug: 'horse-breeds', description: 'Introduction to and review of different horse breeds in Iran and the world' },
      { name: 'Diseases and health', slug: 'health-diseases', description: 'Common horse diseases, prevention and treatment' },
      { name: 'Equipment and supplies', slug: 'equipment', description: 'Introduction to equipment needed for horse keeping and riding' },
      { name: 'Equestrian sports', slug: 'equestrian-sports', description: 'Various equestrian competitions and sports' },
      { name: 'History and culture', slug: 'history-culture', description: 'The history of the horse in Iran and the world, culture and literature' },
      { name: 'Nutrition and care', slug: 'nutrition-care', description: 'Diet, supplements and daily care' },
      { name: 'Training and education', slug: 'training-education', description: 'Methods of horse training and education' },
      { name: 'Riding', slug: 'riding', description: 'Riding techniques and skills' }
    ];

    for (const cat of categories) {
      await query(
        `INSERT INTO blog_categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description]
      );
    }

    console.log('✅ Blog categories created');

    // Create product categories
    const productCategories = [
      { name: 'Riding equipment', slug: 'riding-equipment', description: 'Saddles, tack, helmets and other riding equipment' },
      { name: 'Veterinary medicines', slug: 'veterinary-medicines', description: 'Medicines needed for treating and preventing diseases' },
      { name: 'Nutritional supplements', slug: 'nutritional-supplements', description: 'Vitamins, minerals and nutritional supplements' },
      { name: 'Care supplies', slug: 'care-items', description: 'Brushes, shampoo, horseshoes and care supplies' },
      { name: 'Feed and forage', slug: 'feed-forage', description: 'Ready-made feed, alfalfa, barley and other forage' },
      { name: 'Tools and equipment', slug: 'tools-equipment', description: 'Tools needed for keeping and caring for horses' }
    ];

    for (const cat of productCategories) {
      await query(
        `INSERT INTO product_categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.slug, cat.description]
      );
    }

    console.log('✅ Product categories created');

    // Sample service providers around Tehran so the services list, map and booking can be tried out
    const veterinarians = [
      { full_name: 'Dr. Sara Ahmadi', specialization: 'Equine surgery and orthopedics', region: 'Tehran - Lavasan', phone: '09120000001', lat: 35.8219, lng: 51.6336, address: 'Lavasan, Emam Street' },
      { full_name: 'Dr. Reza Karimi', specialization: 'Internal medicine and digestive diseases (colic)', region: 'Karaj', phone: '09120000002', lat: 35.8400, lng: 50.9391, address: 'Karaj, Jomhouri Boulevard' },
      { full_name: 'Dr. Maryam Hosseini', specialization: 'Dentistry and hoof care', region: 'Tehran - Shahriar', phone: '09120000003', lat: 35.6597, lng: 51.0590, address: 'Shahriar, Baghestan Road' },
    ];
    for (const vet of veterinarians) {
      await query(
        `INSERT INTO veterinarians (full_name, specialization, region, phone, latitude, longitude, address, rating, total_reviews, is_verified)
         SELECT $1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::numeric, $6::numeric, $7::text, 4.6, 12, true
         WHERE NOT EXISTS (SELECT 1 FROM veterinarians WHERE phone = $4::varchar)`,
        [vet.full_name, vet.specialization, vet.region, vet.phone, vet.lat, vet.lng, vet.address]
      );
    }
    const transporters = [
      { company_name: 'Amin Horse Transport', contact_name: 'Ali Amini', region: 'Tehran', phone: '09120000011', lat: 35.7219, lng: 51.3347, equipment: 'Two-horse trailer with non-slip floor', transport_info: 'Intercity transport with a veterinarian on board' },
      { company_name: 'Alborz Horse Transport', contact_name: 'Hassan Rezaei', region: 'Karaj', phone: '09120000012', lat: 35.8327, lng: 50.9915, equipment: 'Four-horse truck with ventilation', transport_info: 'Transport to competitions and exhibitions' },
    ];
    for (const t of transporters) {
      await query(
        `INSERT INTO horse_transporters (company_name, contact_name, region, phone, latitude, longitude, equipment, transport_info, rating, total_reviews, is_verified)
         SELECT $1::varchar, $2::varchar, $3::varchar, $4::varchar, $5::numeric, $6::numeric, $7::text, $8::text, 4.4, 8, true
         WHERE NOT EXISTS (SELECT 1 FROM horse_transporters WHERE phone = $4::varchar)`,
        [t.company_name, t.contact_name, t.region, t.phone, t.lat, t.lng, t.equipment, t.transport_info]
      );
    }

    console.log('✅ Sample veterinarians and transporters created');

    console.log('🎉 Database seed completed successfully!');
    
    // Import and run content seed
    const { seedContent } = await import('./content-seed-full');
    await seedContent();
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();

