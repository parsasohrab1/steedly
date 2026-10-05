#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Example usage of Content Scraper
"""

from content_scraper import ContentScraper
import json

def example_basic_usage():
    """Basic usage example"""
    print("=" * 60)
    print("Example 1: Basic usage")
    print("=" * 60)
    
    # Create the scraper
    scraper = ContentScraper(output_dir="example_output")
    
    # Scrape a specific page
    url = "https://example.com/article-about-horses"
    data = scraper.scrape_page(url)
    
    if data:
        print(f"\n✓ Content collected:")
        print(f"  Title: {data['title']}")
        print(f"  Number of paragraphs: {len(data.get('headings', []))}")
        print(f"  Number of images: {len(data.get('images', []))}")
    else:
        print("\n❌ Error collecting content")


def example_custom_site():
    """Custom site scraping example"""
    print("\n" + "=" * 60)
    print("Example 2: Custom site scraping")
    print("=" * 60)
    
    scraper = ContentScraper(output_dir="custom_output")
    
    # Define a custom site
    custom_site = {
        'name': 'Custom site',
        'base_url': 'https://example.com',
        'search_paths': ['/articles', '/blog'],
        'keywords': ['اسب', 'سوارکاری']
    }
    
    # Scrape the site
    scraper.scrape_site(custom_site)
    
    # Save the results
    if scraper.scraped_content:
        scraper.save_to_json("custom_content.json")
        print(f"\n✓ {len(scraper.scraped_content)} items collected")


def example_filter_content():
    """Content filtering example"""
    print("\n" + "=" * 60)
    print("Example 3: Content filtering")
    print("=" * 60)
    
    # Read the collected content
    with open('scraped_content/data/scraped_content.json', 'r', encoding='utf-8') as f:
        contents = json.load(f)
    
    # Filter by keywords (Persian keywords, since the scraped sites are Persian)
    keywords = ['نژاد', 'تربیت', 'بیماری']
    filtered = [
        c for c in contents
        if any(kw in c.get('title', '').lower() or kw in c.get('content', '').lower() 
               for kw in keywords)
    ]
    
    print(f"\n✓ Number of filtered items: {len(filtered)}")
    for item in filtered[:5]:
        print(f"  - {item['title'][:50]}...")


def example_import_preparation():
    """Import preparation example"""
    print("\n" + "=" * 60)
    print("Example 4: Preparing for import")
    print("=" * 60)
    
    from validate_content import ContentValidator
    
    # Read the content
    with open('scraped_content/data/scraped_content.json', 'r', encoding='utf-8') as f:
        contents = json.load(f)
    
    # Validation
    validator = ContentValidator()
    valid_contents, invalid_contents = validator.validate_batch(contents)
    
    print(f"\n✓ Valid items: {len(valid_contents)}")
    print(f"❌ Invalid items: {len(invalid_contents)}")
    
    # Save the valid items
    if valid_contents:
        with open('scraped_content/data/validated_content.json', 'w', encoding='utf-8') as f:
            json.dump(valid_contents, f, ensure_ascii=False, indent=2)
        print("✓ Valid items saved")


if __name__ == "__main__":
    print("📚 Content Scraper usage examples\n")
    
    # Run the examples (comment/uncomment)
    # example_basic_usage()
    # example_custom_site()
    # example_filter_content()
    # example_import_preparation()
    
    print("\n💡 To run the examples, remove the comments")

