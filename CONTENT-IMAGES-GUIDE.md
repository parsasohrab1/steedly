# Guide to Images and Alt Text for Content

## Images used

### Articles (Blog Posts)

#### 1. Arabian horse
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop`
- **Alt Text**: "A beautiful Arabian horse with a prominent forehead and large eyes"
- **Keywords**: Arabian horse, horse breed, beautiful horse

#### 2. Colic in horses
- **URL**: `https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=800&h=600&fit=crop`
- **Alt Text**: "A horse under veterinary examination to diagnose colic"
- **Keywords**: horse colic, horse disease, veterinary

#### 3. Saddle buying guide
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop`
- **Alt Text**: "An English saddle on a horse for riding"
- **Keywords**: horse saddle, riding equipment

#### 4. Dressage
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop`
- **Alt Text**: "A rider and horse performing dressage movements"
- **Keywords**: dressage, equestrian competitions

#### 5. Horse nutrition
- **URL**: `https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=800&h=600&fit=crop`
- **Alt Text**: "A horse eating forage and healthy feed"
- **Keywords**: horse nutrition, horse forage

#### 6. History of the horse in Iran
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop`
- **Alt Text**: "An Iranian Turkmen horse running"
- **Keywords**: Iranian horse, Turkmen horse

### Products

#### 1. English saddle
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&h=600&fit=crop`
- **Alt Text**: "Standard English saddle with natural leather"
- **Keywords**: horse saddle, riding equipment

#### 2. Vitamin E
- **URL**: `https://images.unsplash.com/photo-1553284965-83fd3e82fa5f?w=600&h=600&fit=crop`
- **Alt Text**: "Vitamin E supplement for horse health"
- **Keywords**: horse supplement, horse vitamin

#### 3. Cleaning brush
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&h=600&fit=crop`
- **Alt Text**: "Professional brush for grooming and cleaning the horse"
- **Keywords**: horse brush, horse grooming

### Competitions

#### 1. Dressage competition
- **URL**: `https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=800&h=600&fit=crop`
- **Alt Text**: "Iran dressage championship competition with riders participating"
- **Keywords**: horse competitions, Iran dressage

## Important notes for Alt Text

1. **Be descriptive**: Alt text must accurately describe the image content
2. **Keywords**: Include keywords related to the content
3. **Concise**: At most 125 characters
4. **Useful**: Useful for blind users and search engines

## Image sources

Images from **Unsplash** are used, which:
- Are free and need no license
- Are high quality
- Are suitable for commercial use

## Replacing images

To replace images with real ones:

1. Put the images in the `public/images/` folder
2. Change the URL in the database to the local path
3. Update the Alt text

## SEO and optimization

- All images have appropriate Alt text
- Images with suitable dimensions (800x600 for articles, 600x600 for products)
- Use of `fit=crop` for optimization

## Usage instructions

To add content with images:

```typescript
{
  title: 'Title',
  featured_image: 'Image URL',
  // Alt text is used in the HTML code
}
```

In React components:
```tsx
<Image
  src={post.featured_image}
  alt="Image description with keywords"
  fill
  className="object-cover"
/>
```

