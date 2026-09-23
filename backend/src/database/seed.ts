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
      ['admin@steedly.ir', adminPassword, 'مدیر سیستم', 'admin']
    );

    console.log('✅ Admin user created');

    // Create blog categories
    const categories = [
      { name: 'نژادهای اسب', slug: 'horse-breeds', description: 'معرفی و بررسی نژادهای مختلف اسب در ایران و جهان' },
      { name: 'بیماری‌ها و سلامت', slug: 'health-diseases', description: 'بیماری‌های رایج اسب، پیشگیری و درمان' },
      { name: 'تجهیزات و لوازم', slug: 'equipment', description: 'معرفی تجهیزات مورد نیاز برای نگهداری و سوارکاری' },
      { name: 'ورزش‌های سوارکاری', slug: 'equestrian-sports', description: 'مسابقات و ورزش‌های مختلف سوارکاری' },
      { name: 'تاریخ و فرهنگ', slug: 'history-culture', description: 'تاریخ اسب در ایران و جهان، فرهنگ و ادبیات' },
      { name: 'تغذیه و مراقبت', slug: 'nutrition-care', description: 'رژیم غذایی، مکمل‌ها و مراقبت‌های روزانه' },
      { name: 'آموزش و تربیت', slug: 'training-education', description: 'روش‌های آموزش و تربیت اسب' },
      { name: 'سوارکاری', slug: 'riding', description: 'تکنیک‌ها و مهارت‌های سوارکاری' }
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
      { name: 'تجهیزات سوارکاری', slug: 'riding-equipment', description: 'زین، یراق، کلاه ایمنی و سایر تجهیزات سوارکاری' },
      { name: 'داروهای دامپزشکی', slug: 'veterinary-medicines', description: 'داروهای مورد نیاز برای درمان و پیشگیری از بیماری‌ها' },
      { name: 'مکمل‌های غذایی', slug: 'nutritional-supplements', description: 'ویتامین‌ها، مواد معدنی و مکمل‌های غذایی' },
      { name: 'وسایل مراقبت', slug: 'care-items', description: 'برس، شامپو، نعل و وسایل نگهداری' },
      { name: 'خوراک و علوفه', slug: 'feed-forage', description: 'خوراک آماده، یونجه، جو و سایر علوفه‌ها' },
      { name: 'ابزار و تجهیزات', slug: 'tools-equipment', description: 'ابزارهای مورد نیاز برای نگهداری و مراقبت' }
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
      { full_name: 'دکتر سارا احمدی', specialization: 'جراحی و ارتوپدی اسب', region: 'تهران - لواسان', phone: '09120000001', lat: 35.8219, lng: 51.6336, address: 'لواسان، خیابان امام' },
      { full_name: 'دکتر رضا کریمی', specialization: 'بیماری‌های داخلی و گوارش (کولیک)', region: 'کرج', phone: '09120000002', lat: 35.8400, lng: 50.9391, address: 'کرج، بلوار جمهوری' },
      { full_name: 'دکتر مریم حسینی', specialization: 'دندانپزشکی و مراقبت سم', region: 'تهران - شهریار', phone: '09120000003', lat: 35.6597, lng: 51.0590, address: 'شهریار، جاده باغستان' },
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
      { company_name: 'اسب‌کش امین', contact_name: 'علی امینی', region: 'تهران', phone: '09120000011', lat: 35.7219, lng: 51.3347, equipment: 'تریلر دو اسبه با کف ضدلغزش', transport_info: 'حمل بین‌شهری با همراه دامپزشک' },
      { company_name: 'حمل اسب البرز', contact_name: 'حسن رضایی', region: 'کرج', phone: '09120000012', lat: 35.8327, lng: 50.9915, equipment: 'کامیون چهار اسبه با تهویه', transport_info: 'حمل مسابقات و نمایشگاه‌ها' },
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

