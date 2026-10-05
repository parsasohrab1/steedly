#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Advanced content collection script with Selenium for JavaScript-heavy sites
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from bs4 import BeautifulSoup
import time
import json
from pathlib import Path
from content_scraper import ContentScraper


class AdvancedScraper(ContentScraper):
    """Advanced scraper with Selenium for JavaScript-heavy sites"""
    
    def __init__(self, output_dir: str = "scraped_content", headless: bool = True):
        super().__init__(output_dir)
        self.headless = headless
        self.driver = None
        self.setup_driver()
    
    def setup_driver(self):
        """Set up ChromeDriver"""
        chrome_options = Options()
        if self.headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        chrome_options.add_argument('--lang=fa-IR')
        
        try:
            self.driver = webdriver.Chrome(options=chrome_options)
            self.driver.set_page_load_timeout(30)
        except Exception as e:
            print(f"⚠️  Error starting ChromeDriver: {e}")
            print("💡 Please install ChromeDriver or use content_scraper.py")
            self.driver = None
    
    def scrape_page_selenium(self, url: str) -> Optional[Dict]:
        """Scrape a page with Selenium"""
        if not self.driver:
            return None
        
        try:
            print(f"Scraping (Selenium): {url}")
            self.driver.get(url)
            
            # Wait for the page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Scroll to load lazy-loaded content
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Get the HTML
            html = self.driver.page_source
            soup = BeautifulSoup(html, 'html.parser')
            
            # Use the parent methods for extraction
            meta_data = self.extract_meta_tags(soup)
            content = self.extract_content(soup)
            
            # Download images
            downloaded_images = []
            for img_info in content['images'][:10]:
                img_path = self.download_image(img_info['url'], url)
                if img_path:
                    downloaded_images.append({
                        'path': img_path,
                        'alt': img_info['alt'],
                        'title': img_info['title']
                    })
            
            title = meta_data['title'] or (content['headings'][0]['text'] if content['headings'] else 'Untitled')
            slug = self.create_slug(title)
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
            
            return scraped_data
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None
    
    def __del__(self):
        """Close the driver on exit"""
        if self.driver:
            self.driver.quit()


if __name__ == "__main__":
    # Using Selenium for specific sites
    scraper = AdvancedScraper(headless=True)
    scraper.run()

