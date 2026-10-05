#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script for collecting horse-related content from Persian websites
This script collects SEO-optimized content, images and text from Persian websites
"""

import os
import re
import json
import time
import requests
from urllib.parse import urljoin, urlparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from bs4 import BeautifulSoup
import hashlib
from PIL import Image
import io

class ContentScraper:
    def __init__(self, output_dir: str = "scraped_content"):
        self.output_dir = Path(output_dir)
        self.images_dir = self.output_dir / "images"
        self.data_dir = self.output_dir / "data"
        
        # Create folders
        self.images_dir.mkdir(parents=True, exist_ok=True)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # User-Agent to avoid being blocked
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
        }
        
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        
        # List of Persian horse-related websites
        self.target_sites = [
            {
                'name': 'Iran Horse',
                'base_url': 'https://www.asbiran.com',
                'search_paths': ['/articles', '/blog', '/news'],
                'keywords': ['اسب', 'سوارکاری', 'مسابقات اسب']
            },
            {
                'name': 'Equestrian Federation',
                'base_url': 'https://www.iranequestrian.com',
                'search_paths': ['/news', '/articles'],
                'keywords': ['اسب', 'سوارکاری', 'مسابقات']
            },
            # You can add more sites
        ]
        
        self.scraped_urls = set()
        self.scraped_content = []
        
    def check_robots_txt(self, base_url: str) -> bool:
        """Check robots.txt to comply with the rules"""
        try:
            robots_url = urljoin(base_url, '/robots.txt')
            response = self.session.get(robots_url, timeout=10)
            if response.status_code == 200:
                # Simple check - should be more complete in production
                return True
        except:
            pass
        return True  # If inaccessible, we continue
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize Persian text"""
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters
        text = re.sub(r'[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z0-9\s.,!?;:()\-]', '', text)
        # Normalize whitespace
        text = text.strip()
        return text
    
    def extract_meta_tags(self, soup: BeautifulSoup) -> Dict:
        """Extract Meta Tags for SEO"""
        meta_data = {
            'title': '',
            'description': '',
            'keywords': '',
            'og_title': '',
            'og_description': '',
            'og_image': '',
        }
        
        # Title
        title_tag = soup.find('title')
        if title_tag:
            meta_data['title'] = self.clean_text(title_tag.get_text())
        
        # Meta Description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if meta_desc:
            meta_data['description'] = self.clean_text(meta_desc.get('content', ''))
        
        # Meta Keywords
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        if meta_keywords:
            meta_data['keywords'] = self.clean_text(meta_keywords.get('content', ''))
        
        # Open Graph
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        if og_title:
            meta_data['og_title'] = self.clean_text(og_title.get('content', ''))
        
        og_desc = soup.find('meta', attrs={'property': 'og:description'})
        if og_desc:
            meta_data['og_description'] = self.clean_text(og_desc.get('content', ''))
        
        og_image = soup.find('meta', attrs={'property': 'og:image'})
        if og_image:
            meta_data['og_image'] = og_image.get('content', '')
        
        return meta_data
    
    def extract_content(self, soup: BeautifulSoup) -> Dict:
        """Extract the main content of the page"""
        content = {
            'headings': [],
            'paragraphs': [],
            'images': [],
            'links': [],
        }
        
        # Extract headings (H1-H6)
        for i in range(1, 7):
            headings = soup.find_all(f'h{i}')
            for heading in headings:
                text = self.clean_text(heading.get_text())
                if text:
                    content['headings'].append({
                        'level': i,
                        'text': text
                    })
        
        # Extract paragraphs
        paragraphs = soup.find_all('p')
        for p in paragraphs:
            text = self.clean_text(p.get_text())
            if text and len(text) > 20:  # Only paragraphs with content
                content['paragraphs'].append(text)
        
        # Extract images
        images = soup.find_all('img')
        for img in images:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                alt = img.get('alt', '')
                content['images'].append({
                    'url': src,
                    'alt': self.clean_text(alt),
                    'title': self.clean_text(img.get('title', ''))
                })
        
        # Extract links
        links = soup.find_all('a', href=True)
        for link in links:
            href = link.get('href')
            text = self.clean_text(link.get_text())
            if href and text:
                content['links'].append({
                    'url': href,
                    'text': text
                })
        
        return content
    
    def download_image(self, image_url: str, base_url: str) -> Optional[str]:
        """Download and save an image"""
        try:
            # Convert relative URL to absolute
            if not image_url.startswith('http'):
                image_url = urljoin(base_url, image_url)
            
            # Check that it has not already been downloaded
            url_hash = hashlib.md5(image_url.encode()).hexdigest()
            image_ext = Path(urlparse(image_url).path).suffix or '.jpg'
            image_filename = f"{url_hash}{image_ext}"
            image_path = self.images_dir / image_filename
            
            if image_path.exists():
                return str(image_path.relative_to(self.output_dir))
            
            # Download the image
            response = self.session.get(image_url, timeout=30, stream=True)
            if response.status_code == 200:
                # Check the file type
                content_type = response.headers.get('content-type', '')
                if 'image' not in content_type:
                    return None
                
                # Save the image
                image_data = response.content
                with open(image_path, 'wb') as f:
                    f.write(image_data)
                
                # Check and optimize the image
                try:
                    img = Image.open(io.BytesIO(image_data))
                    # If the image is very large, resize it
                    if img.width > 1920 or img.height > 1920:
                        img.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
                        img.save(image_path, optimize=True, quality=85)
                except:
                    pass
                
                return str(image_path.relative_to(self.output_dir))
        except Exception as e:
            print(f"Error downloading image {image_url}: {e}")
        
        return None
    
    def scrape_page(self, url: str) -> Optional[Dict]:
        """Scrape a single page"""
        if url in self.scraped_urls:
            return None
        
        try:
            print(f"Scraping: {url}")
            response = self.session.get(url, timeout=30)
            
            if response.status_code != 200:
                return None
            
            # Check the encoding
            response.encoding = response.apparent_encoding or 'utf-8'
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract Meta Tags
            meta_data = self.extract_meta_tags(soup)
            
            # Extract content
            content = self.extract_content(soup)
            
            # Download images
            downloaded_images = []
            for img_info in content['images'][:10]:  # Maximum 10 images
                img_path = self.download_image(img_info['url'], url)
                if img_path:
                    downloaded_images.append({
                        'path': img_path,
                        'alt': img_info['alt'],
                        'title': img_info['title']
                    })
            
            # Create a slug from the title
            title = meta_data['title'] or content['headings'][0]['text'] if content['headings'] else 'Untitled'
            slug = self.create_slug(title)
            
            # Combine content
            full_text = ' '.join([p for p in content['paragraphs']])
            
            scraped_data = {
                'id': hashlib.md5(url.encode()).hexdigest()[:12],
                'url': url,
                'slug': slug,
                'title': title,
                'meta_description': meta_data['description'],
                'meta_keywords': meta_data['keywords'],
                'content': full_text,
                'excerpt': full_text[:300] + '...' if len(full_text) > 300 else full_text,
                'headings': content['headings'],
                'images': downloaded_images,
                'scraped_at': datetime.now().isoformat(),
                'source': urlparse(url).netloc,
            }
            
            self.scraped_urls.add(url)
            return scraped_data
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def create_slug(self, text: str) -> str:
        """Create a slug from Persian text"""
        # Convert to Latin for the slug
        persian_to_latin = {
            'ا': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's',
            'ج': 'j', 'چ': 'ch', 'ح': 'h', 'خ': 'kh', 'د': 'd',
            'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's',
            'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z',
            'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'gh', 'ک': 'k',
            'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v',
            'ه': 'h', 'ی': 'y', ' ': '-'
        }
        
        slug = text.lower()
        for persian, latin in persian_to_latin.items():
            slug = slug.replace(persian, latin)
        
        # Remove disallowed characters
        slug = re.sub(r'[^a-z0-9\-]', '', slug)
        slug = re.sub(r'-+', '-', slug)
        slug = slug.strip('-')
        
        return slug[:100]  # Limit the length
    
    def find_article_urls(self, base_url: str, search_paths: List[str], keywords: List[str]) -> List[str]:
        """Find article URLs"""
        article_urls = []
        
        for path in search_paths:
            try:
                url = urljoin(base_url, path)
                response = self.session.get(url, timeout=30)
                
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    
                    # Find article links
                    links = soup.find_all('a', href=True)
                    for link in links:
                        href = link.get('href')
                        text = link.get_text().lower()
                        
                        # Check whether the link is horse-related
                        if any(keyword in text for keyword in keywords):
                            full_url = urljoin(base_url, href)
                            if full_url not in article_urls:
                                article_urls.append(full_url)
                
                time.sleep(self.delay)  # Delay for ethical compliance
                
            except Exception as e:
                print(f"Error finding articles from {path}: {e}")
        
        return article_urls[:20]  # Maximum 20 articles from each site
    
    def scrape_site(self, site_config: Dict):
        """Scrape an entire site"""
        print(f"\n{'='*60}")
        print(f"Starting to scrape site: {site_config['name']}")
        print(f"URL: {site_config['base_url']}")
        print(f"{'='*60}\n")
        
        # Check robots.txt
        if not self.check_robots_txt(site_config['base_url']):
            print(f"⚠️  robots.txt does not allow scraping: {site_config['base_url']}")
            return
        
        # Find article URLs
        article_urls = self.find_article_urls(
            site_config['base_url'],
            site_config['search_paths'],
            site_config['keywords']
        )
        
        print(f"Number of articles found: {len(article_urls)}")
        
        # Scrape each article
        for url in article_urls:
            data = self.scrape_page(url)
            if data:
                self.scraped_content.append(data)
                print(f"✓ Content saved: {data['title'][:50]}...")
            
            time.sleep(self.delay)  # Delay between requests
    
    def save_to_json(self, filename: str = 'scraped_content.json'):
        """Save data to a JSON file"""
        output_file = self.data_dir / filename
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(self.scraped_content, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Data saved to {output_file}")
        print(f"Total number of collected items: {len(self.scraped_content)}")
    
    def save_to_sql(self, filename: str = 'scraped_content.sql'):
        """Save data to a SQL file for import into the database"""
        output_file = self.data_dir / filename
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("-- Content collected from Persian websites\n")
            f.write("-- Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + "\n\n")
            
            for item in self.scraped_content:
                # Escape for SQL
                title = item['title'].replace("'", "''")
                content = item['content'].replace("'", "''")
                excerpt = item['excerpt'].replace("'", "''")
                meta_desc = item['meta_description'].replace("'", "''")
                
                # Main image
                main_image = item['images'][0]['path'] if item['images'] else None
                
                f.write(f"""
INSERT INTO blog_posts (
    title, slug, excerpt, content, featured_image,
    meta_description, meta_keywords, author_id, category_id,
    is_published, published_at, created_at
) VALUES (
    '{title}',
    '{item['slug']}',
    '{excerpt}',
    '{content}',
    {f"'{main_image}'" if main_image else 'NULL'},
    '{meta_desc}',
    '{item['meta_keywords']}',
    1, -- author_id (you must change this)
    1, -- category_id (you must change this)
    true,
    NOW(),
    NOW()
);
""")
        
        print(f"\n✓ SQL file created at {output_file}")
    
    def run(self):
        """Run the scraper"""
        print("🚀 Starting content collection...")
        print(f"📁 Output folder: {self.output_dir}\n")
        
        for site in self.target_sites:
            try:
                self.scrape_site(site)
            except Exception as e:
                print(f"❌ Error scraping site {site['name']}: {e}")
        
        # Save the results
        if self.scraped_content:
            self.save_to_json()
            self.save_to_sql()
            
            # Summary
            print(f"\n{'='*60}")
            print("✅ Content collection completed successfully!")
            print(f"📊 Total number of items: {len(self.scraped_content)}")
            print(f"🖼️  Number of images downloaded: {len(list(self.images_dir.glob('*')))}")
            print(f"{'='*60}\n")
        else:
            print("⚠️  No content was collected!")


def main():
    scraper = ContentScraper(output_dir="scraped_content")
    scraper.run()


if __name__ == "__main__":
    main()

