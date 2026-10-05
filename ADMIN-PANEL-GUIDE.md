# Admin Panel Guide

## Access

The admin panel is at the path `/admin` and is accessible only to users with the `admin` or `author` role.

### User roles:
- **admin**: Full access to all sections
- **author**: Access to article management
- **user**: Profile access only

## Admin panel pages

### 1. Main dashboard (`/admin`)
- Display of overall statistics (articles, products, competitions, users)
- Quick access to common operations
- Display of the latest articles and products

### 2. Article management (`/admin/blog`)
- List of all articles
- Search in articles
- Edit and delete articles
- View the article on the site

### 3. Create a new article (`/admin/blog/new`)
- New article creation form
- Category selection
- Featured image upload
- Content editor (HTML)

### 4. Product management (`/admin/products`)
- List of all products
- Search in products
- Edit and delete products
- View the product on the site

### 5. Competition management (`/admin/competitions`)
- List of all competitions
- Search in competitions
- Edit and delete competitions
- View the competition on the site

## Features

### Security
- Check the user's role before showing the panel
- Automatic redirect to the login page if not authenticated
- Role-based restricted access

### User interface
- Simple and practical design
- Searchable tables
- Quick action buttons
- Statistics shown in colored cards

### Operations
- Create new content
- Edit existing content
- Delete content (with confirmation)
- View content on the site (external link)

## Usage

### Accessing the panel:
1. Log in to your account (with the admin or author role)
2. Click the "Admin panel" button in the Header
3. Or go directly to `/admin`

### Creating a new article:
1. Go to `/admin/blog`
2. Click "New article"
3. Fill out the form
4. Click "Save article"

### Editing an article:
1. In the article list, click the edit icon
2. Fill out the edit form
3. Save the changes

## Important Notes

1. **Authentication**: You must always be logged in
2. **User role**: Only admin and author can access the panel
3. **API Endpoints**: Some operations (such as delete) require API implementation
4. **Rich Text Editor**: You can use the HTML editor to edit content

## Future development

- [ ] Complete Rich Text editor
- [ ] Direct image upload
- [ ] Content preview
- [ ] User management
- [ ] Management of veterinarians and horse transporters
- [ ] Statistics and reporting
- [ ] Activity log

