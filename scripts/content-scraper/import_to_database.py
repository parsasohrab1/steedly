#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script for importing collected content into the PostgreSQL database
"""

import json
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path
import sys

def import_to_database(json_file: str, db_config: dict):
    """Import content from JSON into PostgreSQL"""
    
    # Connect to the database
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password']
        )
        cur = conn.cursor()
        print("✓ Database connection established")
    except Exception as e:
        print(f"❌ Error connecting to the database: {e}")
        return
    
    # Read the JSON file
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            content_data = json.load(f)
        print(f"✓ JSON file read: {len(content_data)} items")
    except Exception as e:
        print(f"❌ Error reading the JSON file: {e}")
        return
    
    # Import each item
    imported = 0
    skipped = 0
    
    for item in content_data:
        try:
            # Check whether the slug exists
            cur.execute("SELECT id FROM blog_posts WHERE slug = %s", (item['slug'],))
            if cur.fetchone():
                print(f"⏭️  Content with slug '{item['slug']}' already exists")
                skipped += 1
                continue
            
            # Insert content
            cur.execute("""
                INSERT INTO blog_posts (
                    title, slug, excerpt, content, featured_image,
                    meta_description, meta_keywords, author_id, category_id,
                    is_published, published_at, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                RETURNING id
            """, (
                item['title'],
                item['slug'],
                item['excerpt'],
                item['content'],
                item['images'][0]['path'] if item['images'] else None,
                item['meta_description'],
                item['meta_keywords'],
                1,  # author_id - you must change this
                1,  # category_id - you must change this
                True
            ))
            
            post_id = cur.fetchone()[0]
            
            # Insert images
            if item['images']:
                image_data = [
                    (post_id, img['path'], img['alt'], img['title'])
                    for img in item['images']
                ]
                execute_values(
                    cur,
                    """
                    INSERT INTO blog_post_images (post_id, image_url, alt_text, title)
                    VALUES %s
                    """,
                    image_data
                )
            
            imported += 1
            print(f"✓ Content imported: {item['title'][:50]}...")
            
        except Exception as e:
            print(f"❌ Error importing content '{item['title']}': {e}")
            skipped += 1
    
    # Commit the changes
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Import completed successfully!")
    print(f"📊 Number imported: {imported}")
    print(f"⏭️  Number skipped: {skipped}")
    print(f"{'='*60}\n")


def main():
    # Database settings
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': 'steedly',
        'user': 'postgres',
        'password': 'your_password'  # change this
    }
    
    # JSON file path
    json_file = 'scraped_content/data/scraped_content.json'
    
    if not Path(json_file).exists():
        print(f"❌ File {json_file} not found!")
        sys.exit(1)
    
    import_to_database(json_file, db_config)


if __name__ == "__main__":
    main()

