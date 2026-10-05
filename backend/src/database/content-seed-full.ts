import { query } from './connection';
import bcrypt from 'bcryptjs';

// This file contains the full content with images and Alt text
// Images are from Unsplash and other free sources

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_slug: string;
}

interface Product {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category_slug: string;
}

interface Competition {
  title: string;
  slug: string;
  description: string;
  competition_type: string;
  location: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prize_info: string;
  conditions: string;
  image_url: string;
  is_international: boolean;
}

const blogPosts: BlogPost[] = [
  {
    title: 'Arabian Horse - A Masterpiece of Nature',
    slug: 'arabian-horse',
    excerpt: 'The Arabian horse is one of the oldest and most beautiful horse breeds in the world, with a history spanning several thousand years.',
    content: `
      <h2>Introduction</h2>
      <p>The Arabian horse is one of the oldest and best-known horse breeds in the world, with its roots in the Arabian Peninsula. This breed was bred by the Bedouin Arabs more than 4500 years ago and is found all over the world today.</p>
      
      <h2>Physical characteristics</h2>
      <ul>
        <li><strong>Height:</strong> 145 to 155 centimeters</li>
        <li><strong>Weight:</strong> 400 to 500 kilograms</li>
        <li><strong>Head:</strong> Small and elegant with a prominent forehead</li>
        <li><strong>Eyes:</strong> Large and shiny</li>
        <li><strong>Neck:</strong> Arched and graceful</li>
        <li><strong>Tail:</strong> Carried high and elegant</li>
      </ul>
      
      <h2>Temperament</h2>
      <p>The Arabian horse is known for its high intelligence, sensitivity and loyalty. These horses are very intelligent and quick learners and form a deep bond with humans.</p>
      
      <h2>Uses</h2>
      <p>The Arabian horse is used in dressage, jumping and endurance competitions. It is also popular as a show and leisure horse.</p>
    `,
    featured_image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop',
    category_slug: 'horse-breeds'
  },
  {
    title: 'Colic in Horses - Symptoms and Treatment',
    slug: 'colic-in-horses',
    excerpt: 'Colic is one of the most common and dangerous horse diseases and, if not treated in time, can lead to death.',
    content: `
      <h2>What is colic?</h2>
      <p>Colic refers to abdominal pain in a horse, which can have various causes. This disease is one of the most important causes of death in horses worldwide.</p>
      
      <h2>Symptoms of colic</h2>
      <ul>
        <li>Restlessness and agitation</li>
        <li>Looking at the abdomen</li>
        <li>Kicking at the abdomen</li>
        <li>Rolling</li>
        <li>Sweating</li>
        <li>Reduced or stopped eating</li>
        <li>Increased heart rate</li>
      </ul>
      
      <h2>Common causes</h2>
      <ul>
        <li>Improper nutrition</li>
        <li>Sudden change in diet</li>
        <li>Water shortage</li>
        <li>Intestinal parasites</li>
        <li>Stress</li>
        <li>Dental problems</li>
      </ul>
      
      <h2>Treatment</h2>
      <p>If symptoms are observed, a veterinarian must be contacted immediately. Treatment includes painkillers, intravenous fluids and, in severe cases, surgery.</p>
      
      <h2>Prevention</h2>
      <ul>
        <li>Regular, high-quality feeding</li>
        <li>Constant access to clean water</li>
        <li>Regular antiparasitic program</li>
        <li>Regular dental examination</li>
      </ul>
    `,
    featured_image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=800&h=600&fit=crop',
    category_slug: 'health-diseases'
  },
  {
    title: 'Guide to Buying a Suitable Saddle',
    slug: 'saddle-buying-guide',
    excerpt: 'Choosing the right saddle is one of the most important decisions for a rider. A suitable saddle not only provides comfort but also ensures the horse\'s health.',
    content: `
      <h2>The importance of choosing the right saddle</h2>
      <p>The saddle is one of the most important pieces of riding equipment and must be chosen carefully. A suitable saddle must be comfortable for both the rider and the horse.</p>
      
      <h2>Types of saddles</h2>
      <h3>1. English saddle</h3>
      <p>Used for classical riding and competitions. Light and suitable for jumping and dressage.</p>
      
      <h3>2. Western saddle</h3>
      <p>Used for Western riding and cattle work. Heavier and more comfortable.</p>
      
      <h3>3. Dressage saddle</h3>
      <p>Designed specifically for dressage competitions. It allows the rider to sit in an upright position.</p>
      
      <h3>4. Jumping saddle</h3>
      <p>Designed specifically for show jumping. Designed to allow the horse to jump freely.</p>
      
      <h2>Buying tips</h2>
      <ul>
        <li><strong>Size for the horse:</strong> The saddle must sit properly on the horse's back</li>
        <li><strong>Size for the rider:</strong> It must be comfortable and sit properly</li>
        <li><strong>Leather quality:</strong> Quality leather lasts longer</li>
        <li><strong>Price:</strong> Consider your budget</li>
        <li><strong>Brand:</strong> Reputable brands have better quality</li>
      </ul>
    `,
    featured_image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop',
    category_slug: 'equipment'
  },
  {
    title: 'Dressage - The Art of Riding',
    slug: 'dressage-equestrian-sport',
    excerpt: 'Dressage is one of the most beautiful and technical equestrian sports and is known as "horse ballet".',
    content: `
      <h2>What is dressage?</h2>
      <p>Dressage is an equestrian discipline in which the rider and horse must perform predefined movements and patterns with precision and finesse. This sport is known as "horse ballet".</p>
      
      <h2>Competition levels</h2>
      <ul>
        <li><strong>Beginner:</strong> For getting started</li>
        <li><strong>Intermediate:</strong> For experienced riders</li>
        <li><strong>Advanced:</strong> For professionals</li>
        <li><strong>Olympic:</strong> The highest level</li>
      </ul>
      
      <h2>Main movements</h2>
      <ul>
        <li><strong>Walk:</strong> The basic gait</li>
        <li><strong>Trot:</strong> A two-beat gait</li>
        <li><strong>Canter:</strong> A three-beat gait</li>
        <li><strong>Piaffe:</strong> Trot in place</li>
        <li><strong>Passage:</strong> Slow, elevated trot</li>
      </ul>
      
      <h2>Benefits of dressage</h2>
      <p>Dressage helps improve the connection between rider and horse, increases the horse's flexibility and improves riding technique.</p>
    `,
    featured_image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop',
    category_slug: 'equestrian-sports'
  },
  {
    title: 'Proper Horse Nutrition',
    slug: 'proper-horse-nutrition',
    excerpt: 'Proper nutrition is the foundation of a horse\'s health. A balanced diet of forage, grains and supplements can ensure the horse\'s health and performance.',
    content: `
      <h2>The importance of proper nutrition</h2>
      <p>A horse's diet must be adjusted based on age, weight, activity level and health condition. An adult horse needs on average 1.5 to 2.5 percent of its body weight in forage per day.</p>
      
      <h2>Components of the diet</h2>
      <h3>1. Forage (60-80% of the diet)</h3>
      <ul>
        <li>Alfalfa</li>
        <li>Straw</li>
        <li>Fresh grass</li>
      </ul>
      
      <h3>2. Grains (20-30% of the diet)</h3>
      <ul>
        <li>Barley</li>
        <li>Corn</li>
        <li>Wheat</li>
      </ul>
      
      <h3>3. Supplements</h3>
      <ul>
        <li>Vitamins</li>
        <li>Minerals</li>
        <li>Probiotics</li>
      </ul>
      
      <h3>4. Water</h3>
      <p>Constant access to clean, fresh water is essential.</p>
      
      <h2>Important tips</h2>
      <ul>
        <li>Feed in small, frequent meals</li>
        <li>Avoid sudden diet changes</li>
        <li>Pay attention to forage quality</li>
        <li>Consult a veterinarian</li>
      </ul>
    `,
    featured_image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=800&h=600&fit=crop',
    category_slug: 'nutrition-care'
  },
  {
    title: 'The History of the Horse in Iran',
    slug: 'horse-history-iran',
    excerpt: 'Iran is one of the oldest horse-breeding centers in the world. The horse has a special place in Iranian history and culture.',
    content: `
      <h2>History of the horse in Iran</h2>
      <p>Iran has long been known as one of the most important horse-breeding centers in the world. The horse has played an important role in Iranian culture and history.</p>
      
      <h2>Iranian breeds</h2>
      <h3>Turkmen horse</h3>
      <p>One of the oldest horse breeds in Iran, known for its speed and endurance.</p>
      
      <h3>Kurdish horse</h3>
      <p>A hardy breed suitable for mountainous regions.</p>
      
      <h3>Karabakh horse</h3>
      <p>A beautiful breed suitable for riding.</p>
      
      <h3>Darehshuri horse</h3>
      <p>A native Iranian breed found in certain regions.</p>
      
      <h2>Place in culture</h2>
      <p>The horse has a special place in Persian literature, art and Iranian culture. From Ferdowsi's Shahnameh to miniature paintings, the horse has always been present.</p>
      
      <h2>Traditional competitions</h2>
      <p>Iran has a long tradition of holding horse racing competitions that continues from ancient times to today.</p>
    `,
    featured_image: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop',
    category_slug: 'history-culture'
  }
];

const products: Product[] = [
  {
    name: 'Standard English Saddle',
    slug: 'english-saddle-standard',
    description: `
      <h2>High-quality standard English saddle</h2>
      <p>This saddle is made of high-quality natural leather. Suitable for everyday riding and competitions.</p>
      <h3>Features:</h3>
      <ul>
        <li>High-quality natural leather</li>
        <li>Ergonomic design for rider comfort</li>
        <li>Suitable for medium to large horses</li>
        <li>2-year warranty</li>
      </ul>
    `,
    short_description: 'Standard English saddle with high-quality natural leather',
    price: 15000000,
    stock_quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&h=600&fit=crop',
    category_slug: 'riding-equipment'
  },
  {
    name: 'Vitamin E for Horses',
    slug: 'vitamin-e-horse',
    description: `
      <h2>Vitamin E horse supplement</h2>
      <p>Vitamin E supplement for the general health of the horse and improved muscle function.</p>
      <h3>Benefits:</h3>
      <ul>
        <li>Improved general health</li>
        <li>Strengthened immune system</li>
        <li>Improved muscle function</li>
        <li>Strong antioxidant</li>
      </ul>
    `,
    short_description: 'Vitamin E supplement for better horse health and performance',
    price: 500000,
    stock_quantity: 50,
    image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=600&h=600&fit=crop',
    category_slug: 'nutritional-supplements'
  },
  {
    name: 'Horse Cleaning Brush',
    slug: 'horse-grooming-brush',
    description: `
      <h2>Professional horse cleaning brush</h2>
      <p>High-quality brush for daily horse cleaning. Suitable for the horse's coat and skin.</p>
      <h3>Features:</h3>
      <ul>
        <li>Natural bristles</li>
        <li>Comfortable handle</li>
        <li>Washable</li>
        <li>Durable and long-lasting</li>
      </ul>
    `,
    short_description: 'Professional brush for daily horse cleaning',
    price: 250000,
    stock_quantity: 30,
    image_url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&h=600&fit=crop',
    category_slug: 'care-items'
  }
];

const competitions: Competition[] = [
  {
    title: 'Iran Dressage Championship',
    slug: 'iran-dressage-championship',
    description: `
      <h2>Iran Dressage Championship</h2>
      <p>The Iran Dressage Championship is held with the participation of the country's best riders.</p>
      <p>These competitions are held at different levels from beginner to advanced.</p>
    `,
    competition_type: 'dressage',
    location: 'Tehran, Equestrian Club',
    start_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(),
    registration_deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    prize_info: `
      <h3>Prizes:</h3>
      <ul>
        <li>First place: 50,000,000 Toman</li>
        <li>Second place: 30,000,000 Toman</li>
        <li>Third place: 20,000,000 Toman</li>
      </ul>
    `,
    conditions: `
      <h3>Entry conditions:</h3>
      <ul>
        <li>Minimum age 16</li>
        <li>Holding a riding certificate</li>
        <li>The horse must be healthy and vaccinated</li>
      </ul>
    `,
    image_url: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop',
    is_international: false
  }
];

export async function seedContent() {
  try {
    console.log('🌱 Starting content seed...');

    // Get admin user ID
    const adminResult = await query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@steedly.ir']
    );
    
    if (adminResult.rows.length === 0) {
      console.error('❌ Admin user not found. Please run seed.ts first.');
      return;
    }
    
    const adminId = adminResult.rows[0].id;

    // Insert blog posts
    for (const post of blogPosts) {
      const categoryResult = await query(
        'SELECT id FROM blog_categories WHERE slug = $1',
        [post.category_slug]
      );
      
      if (categoryResult.rows.length > 0) {
        await query(
          `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, category_id, author_id, is_published, published_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, true, CURRENT_TIMESTAMP)
           ON CONFLICT (slug) DO NOTHING`,
          [
            post.title,
            post.slug,
            post.excerpt,
            post.content,
            post.featured_image,
            categoryResult.rows[0].id,
            adminId
          ]
        );
        console.log(`✅ Blog post created: ${post.title}`);
      }
    }

    // Insert products
    for (const product of products) {
      const categoryResult = await query(
        'SELECT id FROM product_categories WHERE slug = $1',
        [product.category_slug]
      );
      
      if (categoryResult.rows.length > 0) {
        await query(
          `INSERT INTO products (name, slug, description, short_description, price, stock_quantity, category_id, images, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
           ON CONFLICT (slug) DO NOTHING`,
          [
            product.name,
            product.slug,
            product.description,
            product.short_description,
            product.price,
            product.stock_quantity,
            categoryResult.rows[0].id,
            // products.images is TEXT[]; node-postgres converts JS arrays
            [product.image_url]
          ]
        );
        console.log(`✅ Product created: ${product.name}`);
      }
    }

    // Insert competitions
    for (const competition of competitions) {
      await query(
        `INSERT INTO competitions (title, slug, description, competition_type, location, start_date, end_date, registration_deadline, prize_info, conditions, image_url, is_international, is_published)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true)
         ON CONFLICT (slug) DO NOTHING`,
        [
          competition.title,
          competition.slug,
          competition.description,
          competition.competition_type,
          competition.location,
          competition.start_date,
          competition.end_date,
          competition.registration_deadline,
          competition.prize_info,
          competition.conditions,
          competition.image_url,
          competition.is_international
        ]
      );
      console.log(`✅ Competition created: ${competition.title}`);
    }

    console.log('🎉 Content seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding content:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedContent()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

