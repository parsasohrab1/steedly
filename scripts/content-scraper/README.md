# Horse-related Content Collection Script

This script collects SEO-optimized content, images and text from Persian horse-related websites.

## 📋 Features

- ✅ Collecting content from Persian websites
- ✅ Downloading and optimizing images
- ✅ Extracting Meta Tags for SEO
- ✅ Creating a Slug from the title
- ✅ Saving in JSON and SQL format
- ✅ Respecting robots.txt
- ✅ Delay between requests for ethical compliance
- ✅ Selenium support for JavaScript-heavy sites

## 🚀 Installation

### Prerequisites

```bash
# Python 3.8 or higher
python --version

# Install dependencies
pip install -r requirements.txt
```

### Using Selenium (optional)

```bash
# Install ChromeDriver
# Windows: download from https://chromedriver.chromium.org/
# Linux: sudo apt-get install chromium-chromedriver
# Mac: brew install chromedriver
```

## 📖 Usage

### Basic usage

```bash
cd scripts/content-scraper
python content_scraper.py
```

### Advanced usage with Selenium

```bash
python advanced_scraper.py
```

### Settings

Edit the `sites_config.json` file to add the desired sites:

```json
{
  "sites": [
    {
      "name": "Site name",
      "base_url": "https://example.com",
      "search_paths": ["/articles", "/blog"],
      "keywords": ["horse", "riding"],
      "use_selenium": false
    }
  ]
}
```

## 📁 Output structure

```
scraped_content/
├── data/
│   ├── scraped_content.json    # data in JSON format
│   └── scraped_content.sql      # data for import into the database
└── images/
    ├── image1.jpg
    ├── image2.png
    └── ...
```

## 📊 Output data format

### JSON Format

```json
{
  "id": "abc123",
  "url": "https://example.com/article",
  "slug": "article-title",
  "title": "Article title",
  "meta_description": "SEO description",
  "meta_keywords": "horse, riding",
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

### SQL Format

```sql
INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image,
    meta_description, meta_keywords, author_id, category_id,
    is_published, published_at, created_at
) VALUES (
    'Article title',
    'article-slug',
    'Summary...',
    'Full text...',
    'images/image1.jpg',
    'SEO description',
    'Keywords',
    1,
    1,
    true,
    NOW(),
    NOW()
);
```

## ⚙️ Advanced settings

### Changing the delay between requests

In `content_scraper.py`:

```python
time.sleep(3)  # change to the desired value (seconds)
```

### Changing image quality

In `content_scraper.py`:

```python
img.save(image_path, optimize=True, quality=85)  # change quality
```

### Limiting the number of articles

In `sites_config.json`:

```json
{
  "settings": {
    "max_articles_per_site": 50  # change to the desired number
  }
}
```

## ⚠️ Important Notes

1. **Follow the rules**: Always check robots.txt
2. **Delay**: Put a delay between requests so the server is not overloaded
3. **Limits**: Limit the number of requests
4. **Legal**: Only collect content from sites that allow it
5. **Copyright**: Use the collected content in compliance with copyright

## 🔧 Troubleshooting

### Connection error

```bash
# Check the internet connection
ping google.com

# Check the firewall
```

### ChromeDriver error

```bash
# Install ChromeDriver
# Or use content_scraper.py without Selenium
```

### Encoding error

```python
# In content_scraper.py
response.encoding = 'utf-8'  # or 'windows-1256' for some sites
```

## 📝 Usage example in code

```python
from content_scraper import ContentScraper

# Create the scraper
scraper = ContentScraper(output_dir="my_content")

# Scrape a specific page
data = scraper.scrape_page("https://example.com/article")

# Save the results
scraper.save_to_json("my_data.json")
scraper.save_to_sql("my_data.sql")
```

## 🎯 Usage in the project

After collecting content, you can import it into the database:

```bash
# Import into PostgreSQL
psql -U postgres -d steedly -f scraped_content/data/scraped_content.sql
```

Or use the API:

```python
# In backend/src/database/seed.ts
# You can read the JSON file and add it to the database
```

---

**Created**: 2025/03/06
**Version**: 1.0

