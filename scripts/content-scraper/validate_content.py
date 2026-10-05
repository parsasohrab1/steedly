#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script for validating and cleaning collected content
"""

import json
import re
from pathlib import Path
from typing import List, Dict, Tuple

class ContentValidator:
    def __init__(self):
        self.min_title_length = 10
        self.min_content_length = 200
        self.max_content_length = 50000
        self.required_keywords = ['اسب', 'سوارکاری', 'مسابقات', 'نژاد', 'بیماری', 'تغذیه']
    
    def validate_title(self, title: str) -> bool:
        """Validate the title"""
        if not title or len(title) < self.min_title_length:
            return False
        
        # Check for related keywords
        title_lower = title.lower()
        if not any(keyword in title_lower for keyword in self.required_keywords):
            return False
        
        return True
    
    def validate_content(self, content: str) -> bool:
        """Validate the content"""
        if not content:
            return False
        
        if len(content) < self.min_content_length:
            return False
        
        if len(content) > self.max_content_length:
            return False
        
        # Check for keywords
        content_lower = content.lower()
        keyword_count = sum(1 for keyword in self.required_keywords if keyword in content_lower)
        
        if keyword_count < 2:  # At least 2 keywords
            return False
        
        return True
    
    def clean_content(self, content: Dict) -> Dict:
        """Clean and validate the content"""
        # Remove leftover HTML tags
        content['content'] = re.sub(r'<[^>]+>', '', content.get('content', ''))
        content['excerpt'] = re.sub(r'<[^>]+>', '', content.get('excerpt', ''))
        
        # Remove extra whitespace
        content['content'] = re.sub(r'\s+', ' ', content['content']).strip()
        content['excerpt'] = re.sub(r'\s+', ' ', content['excerpt']).strip()
        
        # Limit the excerpt length
        if len(content['excerpt']) > 300:
            content['excerpt'] = content['excerpt'][:297] + '...'
        
        return content
    
    def validate(self, content: Dict) -> Tuple[bool, List[str]]:
        """Full content validation"""
        errors = []
        
        if not self.validate_title(content.get('title', '')):
            errors.append('Title is invalid or too short')
        
        if not self.validate_content(content.get('content', '')):
            errors.append('Content is invalid or too short')
        
        if not content.get('slug'):
            errors.append('Slug is missing')
        
        if not content.get('url'):
            errors.append('URL is missing')
        
        return len(errors) == 0, errors
    
    def validate_batch(self, contents: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
        """Batch validation of items"""
        valid_contents = []
        invalid_contents = []
        
        for content in contents:
            # Clean
            content = self.clean_content(content)
            
            # Validation
            is_valid, errors = self.validate(content)
            
            if is_valid:
                valid_contents.append(content)
            else:
                content['validation_errors'] = errors
                invalid_contents.append(content)
        
        return valid_contents, invalid_contents


def main():
    json_file = Path('scraped_content/data/scraped_content.json')
    
    if not json_file.exists():
        print(f"❌ File {json_file} not found!")
        return
    
    # Read the content
    with open(json_file, 'r', encoding='utf-8') as f:
        contents = json.load(f)
    
    print(f"📊 Total number of items: {len(contents)}")
    
    # Validation
    validator = ContentValidator()
    valid_contents, invalid_contents = validator.validate_batch(contents)
    
    print(f"\n✅ Valid items: {len(valid_contents)}")
    print(f"❌ Invalid items: {len(invalid_contents)}")
    
    # Save the valid items
    if valid_contents:
        output_file = json_file.parent / 'scraped_content_validated.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(valid_contents, f, ensure_ascii=False, indent=2)
        print(f"\n✓ Valid items saved to {output_file}")
    
    # Show the errors
    if invalid_contents:
        print("\n⚠️  Invalid items:")
        for content in invalid_contents[:5]:  # Show the first 5
            print(f"  - {content.get('title', 'Untitled')[:50]}")
            print(f"    Errors: {', '.join(content.get('validation_errors', []))}")


if __name__ == "__main__":
    main()

