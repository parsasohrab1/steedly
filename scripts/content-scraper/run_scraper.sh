#!/bin/bash
# Content collection run script

echo "🚀 Starting content collection..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found!"
    exit 1
fi

# Check dependencies
echo "📦 Checking dependencies..."
pip install -r requirements.txt --quiet

# Run the scraper
echo ""
echo "🔍 Starting scrape..."
python3 content_scraper.py

# Validate the content
if [ -f "scraped_content/data/scraped_content.json" ]; then
    echo ""
    echo "✅ Validating content..."
    python3 validate_content.py
fi

echo ""
echo "✅ Done!"

