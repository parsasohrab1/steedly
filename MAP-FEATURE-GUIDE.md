# Map Feature Guide (Snapp-like)

## Summary

A map feature has been added for choosing a veterinarian and horse transporter by showing their geographic location. Users can:

1. See their own location on the map
2. See nearby veterinarians and horse transporters on the map
3. Filter by distance (10, 25, 50, 100 km)
4. See provider information by clicking a marker
5. Book directly from the map

## Backend changes

### 1. Database schema

The following fields were added to the tables:
- `latitude` (DECIMAL): Latitude
- `longitude` (DECIMAL): Longitude
- `address` (TEXT): Full address

### 2. API Updates

#### GET /api/services/veterinarians
New parameters:
- `latitude`: User latitude
- `longitude`: User longitude
- `radius`: Search radius (km)

The response includes a `distance` field (distance in km).

#### GET /api/services/transporters
Same parameters as above

### 3. Distance calculation

The Haversine formula is used to calculate distance:
```sql
6371 * acos(
  cos(radians(lat1)) *
  cos(radians(lat2)) *
  cos(radians(lng2) - radians(lng1)) +
  sin(radians(lat1)) *
  sin(radians(lat2))
)
```

## Frontend (PWA) changes

### 1. Map page

Path: `/services/map`

Features:
- Getting the user's location with the Geolocation API
- Displaying the map with Google Maps
- Displaying markers for veterinarians (green) and horse transporters (orange)
- Filter by service type and distance
- List of providers at the bottom of the page
- Direct booking option

### 2. MapComponent component

Uses `@googlemaps/js-api-loader` to display the map

### 3. Settings

Add to `.env.local`:
```
NEXT_PUBLIC_NESHAN_API_KEY=your_neshan_api_key
```

**Note**: This project uses Neshan Maps, an Iranian map service.

## Android changes

### 1. Dependencies

Added:
- `play-services-maps`: Google Maps SDK
- `play-services-location`: Location Services
- `maps-compose`: Compose integration

### 2. Permissions

In `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 3. Google Maps API Key

In `AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_GOOGLE_MAPS_API_KEY" />
```

### 4. MapScreen

- Getting the user's location
- Displaying the map with Google Maps Compose
- Displaying markers
- Filter and search
- List of providers

## How to Use

### For users

1. Go to the "Services" page
2. Click "View on map"
3. Grant location access
4. Choose veterinarians or horse transporters
5. Set the distance (10, 25, 50, 100 km)
6. Click a marker or choose from the list
7. Press "Book"

### For developers

#### Registering the provider location

When registering a veterinarian or horse transporter:
```json
{
  "full_name": "Dr. Ahmadi",
  "latitude": 35.6892,
  "longitude": 51.3890,
  "address": "Tehran, Valiasr Street"
}
```

#### Getting a Neshan Maps API key

1. Go to the [Neshan developer panel](https://developer.neshan.org/)
2. Sign up or log in
3. Create a new project
4. Get an API key
5. Put it in the `.env` files and `AndroidManifest.xml`

For more details, see [NESHAN-MAPS-SETUP.md](NESHAN-MAPS-SETUP.md).

## Important Notes

1. **Security**: Do not commit the API key to the repository
2. **Optimization**: Use caching to reduce costs
3. **Accuracy**: Make sure locations are accurate
4. **User experience**: If location access is unavailable, the default location (Tehran) is used

## Common Problems

### Map is not displayed
- Check that the API key is correct
- Check that the API is enabled in Google Cloud Console
- Check the Console in the browser

### User location is not obtained
- Check that permission has been granted
- Test on HTTPS or localhost (Geolocation does not work on HTTP)

### Distance is not calculated correctly
- Check that latitude and longitude are correct
- The format must be decimal (e.g. 35.6892 not 35°41'21")

## Future development

- [ ] Navigation
- [ ] Showing the route on the map
- [ ] Estimated arrival time
- [ ] Push notification when approaching
- [ ] History of visited places

