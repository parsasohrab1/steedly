@echo off
REM Content collection run script for Windows

echo 🚀 Starting content collection...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found!
    pause
    exit /b 1
)

REM Check dependencies
echo 📦 Checking dependencies...
pip install -r requirements.txt --quiet

REM Run the scraper
echo.
echo 🔍 Starting scrape...
python content_scraper.py

REM Validate the content
if exist "scraped_content\data\scraped_content.json" (
    echo.
    echo ✅ Validating content...
    python validate_content.py
)

echo.
echo ✅ Done!
pause

