# Guide to Loading Content on the Site

## Steps

### 1. Making sure an Admin User exists

First an admin user must exist:

```bash
cd backend
npm run seed
```

This command:
- Creates an admin user (email: `admin@steedly.ir`, password: `admin123`)
- Creates the blog and product categories
- Then adds the full content

### 2. Added content

#### Articles (6 articles):
1. ✅ Arabian horse - a masterpiece of nature
2. ✅ Colic in horses - symptoms and treatment
3. ✅ Guide to buying a suitable saddle
4. ✅ Dressage - the art of riding
5. ✅ Proper horse nutrition
6. ✅ History of the horse in Iran

#### Products (3 products):
1. ✅ Standard English saddle (15,000,000 Toman)
2. ✅ Vitamin E for horses (500,000 Toman)
3. ✅ Horse cleaning brush (250,000 Toman)

#### Competitions (1 competition):
1. ✅ Iran Dressage Championship

### 3. Images

All images are from **Unsplash**, which is:
- ✅ Free and needs no license
- ✅ High quality
- ✅ Suitable for commercial use
- ✅ Has suitable Alt text

### 4. Checking the content

After running the seed script, you can view the content on the site:

- **Articles**: `/blog`
- **Products**: `/shop`
- **Competitions**: `/competitions`

### 5. Commands

```bash
# Run the seed script
cd backend
npm run seed

# Or directly:
npx ts-node src/database/seed.ts
```

## Important Notes

1. **Images**: Images from Unsplash are used. For production, it is better to download the images and put them in `public/images/`.

2. **Alt Text**: All images have suitable Alt text with keywords.

3. **Content**: The content is stored in the database as HTML.

4. **SEO**: All pages have:
   - Suitable Title
   - Meta description (excerpt)
   - Alt text for images
   - Structured content

## Adding more content

To add more content, edit the file `backend/src/database/content-seed-full.ts` and run the seed script again.

## Troubleshooting

If a problem occurs:

1. Check that PostgreSQL and Redis are running
2. Check that the `.env` file is set correctly
3. Check the seed script logs

## Result

After a successful seed script run, you will have:
- ✅ 6 complete articles with images
- ✅ 3 products with images
- ✅ 1 competition with an image
- ✅ All with suitable Alt text
- ✅ SEO-friendly content

