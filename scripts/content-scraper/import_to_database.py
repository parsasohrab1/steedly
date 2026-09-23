#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
اسکریپت import محتوای جمع‌آوری شده به دیتابیس PostgreSQL
"""

import json
import psycopg2
from psycopg2.extras import execute_values
from pathlib import Path
import sys

def import_to_database(json_file: str, db_config: dict):
    """Import محتوا از JSON به PostgreSQL"""
    
    # اتصال به دیتابیس
    try:
        conn = psycopg2.connect(
            host=db_config['host'],
            port=db_config['port'],
            database=db_config['database'],
            user=db_config['user'],
            password=db_config['password']
        )
        cur = conn.cursor()
        print("✓ اتصال به دیتابیس برقرار شد")
    except Exception as e:
        print(f"❌ خطا در اتصال به دیتابیس: {e}")
        return
    
    # خواندن فایل JSON
    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            content_data = json.load(f)
        print(f"✓ فایل JSON خوانده شد: {len(content_data)} محتوا")
    except Exception as e:
        print(f"❌ خطا در خواندن فایل JSON: {e}")
        return
    
    # Import هر محتوا
    imported = 0
    skipped = 0
    
    for item in content_data:
        try:
            # بررسی وجود slug
            cur.execute("SELECT id FROM blog_posts WHERE slug = %s", (item['slug'],))
            if cur.fetchone():
                print(f"⏭️  محتوا با slug '{item['slug']}' قبلاً وجود دارد")
                skipped += 1
                continue
            
            # Insert محتوا
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
                1,  # author_id - باید تغییر دهید
                1,  # category_id - باید تغییر دهید
                True
            ))
            
            post_id = cur.fetchone()[0]
            
            # Insert تصاویر
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
            print(f"✓ محتوا import شد: {item['title'][:50]}...")
            
        except Exception as e:
            print(f"❌ خطا در import محتوا '{item['title']}': {e}")
            skipped += 1
    
    # Commit تغییرات
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"\n{'='*60}")
    print(f"✅ Import با موفقیت انجام شد!")
    print(f"📊 تعداد import شده: {imported}")
    print(f"⏭️  تعداد رد شده: {skipped}")
    print(f"{'='*60}\n")


def main():
    # تنظیمات دیتابیس
    db_config = {
        'host': 'localhost',
        'port': 5432,
        'database': 'steedly',
        'user': 'postgres',
        'password': 'your_password'  # تغییر دهید
    }
    
    # مسیر فایل JSON
    json_file = 'scraped_content/data/scraped_content.json'
    
    if not Path(json_file).exists():
        print(f"❌ فایل {json_file} یافت نشد!")
        sys.exit(1)
    
    import_to_database(json_file, db_config)


if __name__ == "__main__":
    main()

