# Content Scraper Script Usage Guide

## 📋 Introduction

The content scraper script is designed to collect horse-related content from Persian websites. This script:
- Extracts SEO-optimized content and text
- Downloads and optimizes images
- Saves data in JSON and SQL formats

## 🚀 Installation and Setup

### 1. Install Python

```bash
# Check the Python version (must be 3.8 or higher)
python --version
```

### 2. Install dependencies

```bash
cd scripts/content-scraper
pip install -r requirements.txt
```

### 3. Settings (optional)

Edit the file `scripts/content-scraper/sites_config.json` to:
- Add the desired sites
- Change general settings (delay, number of articles, image quality)
- Define custom CSS Selectors for each site

For more details, see the [⚙️ Settings](#-settings) section.

## 📖 Usage

### Method 1: Simple usage

```bash
# Windows
python content_scraper.py

# Linux/Mac
python3 content_scraper.py
```

Or use the ready scripts:

```bash
# Windows
run_scraper.bat

# Linux/Mac
chmod +x run_scraper.sh
./run_scraper.sh
```

### Method 2: Advanced usage with Selenium

For sites where content is loaded with JavaScript:

```bash
# First install ChromeDriver
# Windows: download from https://chromedriver.chromium.org/
# Linux: sudo apt-get install chromium-chromedriver
# Mac: brew install chromedriver

python advanced_scraper.py
```

**Note**: In `sites_config.json` you can set `use_selenium: true` separately for each site. The main script automatically uses Selenium if this option is enabled.

## ⚙️ Settings

All settings are read from the `sites_config.json` file. No code change is needed!

### Adding a new site

Edit the file `scripts/content-scraper/sites_config.json`:

```json
{
  "sites": [
    {
      "name": "Site name",
      "base_url": "https://example.com",
      "search_paths": ["/articles", "/blog", "/news"],
      "keywords": ["horse", "riding", "horse competitions"],
      "article_selectors": {
        "title": "h1, .article-title, .post-title",
        "content": ".article-content, .post-content, .entry-content",
        "images": "img",
        "date": ".date, .publish-date, time"
      },
      "use_selenium": false
    }
  ],
  "settings": {
    "max_articles_per_site": 50,
    "delay_between_requests": 3,
    "max_images_per_article": 10,
    "min_content_length": 200,
    "image_quality": 85,
    "max_image_size": [1920, 1920]
  }
}
```

### Configurable parameters

#### Site parameters (`sites`):

- **`name`**: Site name (for display only)
- **`base_url`**: Main site address
- **`search_paths`**: Search paths to find articles (example: `/articles`, `/blog`)
- **`keywords`**: Keywords for filtering related articles
- **`article_selectors`** (optional): Custom CSS Selectors for extracting content
  - `title`: Selector for the article title
  - `content`: Selector for the main content
  - `images`: Selector for images
  - `date`: Selector for the publication date
- **`use_selenium`**: Use Selenium for JavaScript-heavy sites

#### General settings (`settings`):

- **`max_articles_per_site`**: Maximum number of articles from each site (default: 50)
- **`delay_between_requests`**: Delay between requests in seconds (default: 3)
- **`max_images_per_article`**: Maximum number of images per article (default: 10)
- **`min_content_length`**: Minimum content length for validation (default: 200 characters)
- **`image_quality`**: Optimized image quality (0-100, default: 85)
- **`max_image_size`**: Maximum image size [width, height] (default: [1920, 1920])

### Complete settings example

```json
{
  "sites": [
    {
      "name": "Iran Horse",
      "base_url": "https://www.asbiran.com",
      "search_paths": ["/articles", "/blog", "/news"],
      "keywords": ["horse", "riding", "horse competitions", "horse breed"],
      "article_selectors": {
        "title": "h1.article-title",
        "content": ".article-body",
        "images": ".article-content img",
        "date": ".publish-date"
      },
      "use_selenium": false
    }
  ],
  "settings": {
    "max_articles_per_site": 100,
    "delay_between_requests": 5,
    "max_images_per_article": 15,
    "min_content_length": 300,
    "image_quality": 90,
    "max_image_size": [2560, 2560]
  }
}
```

## 📁 Output structure

After running the scraper, the following files are created in the `scraped_content/` folder:

```
scraped_content/
├── data/
│   ├── scraped_content.json          # data in JSON format (raw)
│   ├── scraped_content.sql           # data for import into the database
│   └── scraped_content_validated.json # validated data (after validate_content.py)
└── images/
    ├── abc123def456.jpg              # downloaded images (hash-based naming)
    ├── 789ghi012jkl.png
    └── ...
```

### File descriptions:

- **`scraped_content.json`**: Contains all collected content in JSON format (raw)
- **`scraped_content.sql`**: SQL commands for direct import into PostgreSQL
- **`scraped_content_validated.json`**: Valid content after validation (only content that meets the quality criteria)
- **`images/`**: All downloaded and optimized images with hash-based naming to prevent duplicates

## 📊 Data format

### JSON Format

```json
{
  "id": "abc123def456",
  "url": "https://example.com/article",
  "slug": "article-title",
  "title": "Article title",
  "meta_description": "SEO description",
  "meta_keywords": "horse, riding, competitions",
  "content": "Full article text...",
  "excerpt": "Article summary...",
  "headings": [
    {"level": 1, "text": "Main heading"},
    {"level": 2, "text": "Subheading"}
  ],
  "images": [
    {
      "path": "images/image1.jpg",
      "alt": "Image description",
      "title": "Image title"
    }
  ],
  "scraped_at": "2024-01-15T10:30:00",
  "source": "example.com"
}
```

## 🔄 Import into the database

### Method 1: Using the Python Script

```bash
# Edit the database settings in import_to_database.py
python import_to_database.py
```

### Method 2: Using SQL

```bash
# Import the SQL file
psql -U postgres -d steedly -f scraped_content/data/scraped_content.sql
```

### Method 3: Using the Backend API

You can use an API endpoint for import:

```typescript
// In backend/src/database/seed.ts
import fs from 'fs';
import { query } from './connection';

const contentData = JSON.parse(
  fs.readFileSync('scraped_content/data/scraped_content.json', 'utf-8')
);

for (const item of contentData) {
  await query(`
    INSERT INTO blog_posts (title, slug, excerpt, content, ...)
    VALUES ($1, $2, $3, $4, ...)
  `, [item.title, item.slug, ...]);
}
```

## ✅ Content validation

After collection, validate the content:

```bash
python validate_content.py
```

This script:
- Identifies invalid content
- Saves valid content in a separate file
- Shows validation errors

## ⚠️ Important Notes

### 1. Following the rules

- ✅ Always check `robots.txt`
- ✅ Put a delay between requests
- ✅ Limit the number of requests
- ✅ Use only sites that allow it

### 2. Copyright

- ⚠️ Use the collected content in compliance with copyright
- ⚠️ Cite the source if necessary
- ⚠️ A license is required for commercial use

### 3. Optimization

All optimization settings can be changed in `sites_config.json`:

- Images are optimized automatically (default: max 1920x1920 in `settings.max_image_size`)
- Image quality: configurable in `settings.image_quality` (default: 85%)
- Maximum number of images: configurable in `settings.max_images_per_article` (default: 10)

## 🔧 Troubleshooting

### Connection error

```bash
# Check the internet connection
ping google.com

# Check the firewall
# On Windows: Windows Defender Firewall
# On Linux: sudo ufw status
```

### Encoding error

If texts are not displayed correctly:

```python
# In content_scraper.py
response.encoding = 'utf-8'  # or 'windows-1256'
```

### ChromeDriver error

```bash
# Install ChromeDriver
# Windows: download from https://chromedriver.chromium.org/
# Linux: sudo apt-get install chromium-chromedriver
# Mac: brew install chromedriver
```

## 📝 Usage example

### Usage in Python code

```python
from content_scraper import ContentScraper

# Create the scraper
scraper = ContentScraper(output_dir="my_content")

# Scrape a specific page
data = scraper.scrape_page("https://example.com/article")

if data:
    print(f"Title: {data['title']}")
    print(f"Content: {data['content'][:100]}...")

# Save the results
scraper.save_to_json("my_data.json")
scraper.save_to_sql("my_data.sql")
```

### Usage in the Backend

```typescript
// In backend/src/database/seed.ts
import fs from 'fs';
import path from 'path';

const scrapedContentPath = path.join(__dirname, '../../scraped_content/data/scraped_content.json');

if (fs.existsSync(scrapedContentPath)) {
  const contentData = JSON.parse(fs.readFileSync(scrapedContentPath, 'utf-8'));
  
  for (const item of contentData) {
    await query(`
      INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, ...)
      VALUES ($1, $2, $3, $4, $5, ...)
    `, [
      item.title,
      item.slug,
      item.excerpt,
      item.content,
      item.images[0]?.path || null,
      // ...
    ]);
  }
}
```

## 🎯 Best practices

1. **Initial test**: First test on a small site (`max_articles_per_site: 5` in `sites_config.json`)
2. **Validation**: Always validate the content before import (`validate_content.py`)
3. **Backup**: Back up the database before import
4. **Manual check**: Manually review some content
5. **Updates**: Update old content
6. **Settings**: Use `sites_config.json` to manage settings (not direct code changes)
7. **Ethical compliance**: Increase the delay between requests (`delay_between_requests: 5`)
8. **Custom Selectors**: For specific sites, set `article_selectors` in `sites_config.json`

## 📚 Resources

- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Requests Documentation](https://requests.readthedocs.io/)

---

**Creation date**: 1403/12/15 (Solar Hijri)
**Version**: 1.0

