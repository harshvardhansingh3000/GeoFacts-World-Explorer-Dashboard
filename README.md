# GeoFacts - World Explorer Dashboard

An interactive world explorer dashboard with country information, weather data, air quality monitoring, and personal travel tracking features.

## Features

### 🌍 Interactive World Map
- Click on any country to view detailed information
- Real-time weather data for capital cities
- Air Quality Index (AQI) monitoring
- Country statistics (population, area, languages, currencies)

### 👤 User Features
- **User Authentication**: Register and login with secure password hashing
- **Visited Countries**: Mark countries you've visited (green color on map)
- **Wishlist**: Add countries to your travel wishlist (yellow color on map)
- **Personal Notes**: Add notes for each country
- **Travel History**: Track your travel journey

### 🎨 Visual Features
- **Color-coded Map**: 
  - Gray: Unvisited countries
  - Green: Visited countries
  - Yellow: Wishlist countries
- **Dark Mode Support**: Modern UI with dark theme
- **Responsive Design**: Works on desktop and mobile devices
- **Floating Action Button (FAB)**: Quick access to user actions

### 📊 Data Sources
- **REST Countries API**: Country information and flags
- **OpenWeatherMap API**: Weather data and air quality
- **PostgreSQL Database**: User data and travel tracking

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Maps**: Leaflet.js
- **Authentication**: Passport.js with bcrypt
- **Templating**: EJS

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd GeoFacts-World-Explorer-Dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
DB_PASSWORD=your_postgres_password
SESSION_SECRET=your_session_secret_key
```

### 4. Database Setup
1. Create a PostgreSQL database named `geofacts`
2. Run the database setup script:
```bash
npm run setup-db
```

This will create all necessary tables with proper unique constraints:
- `users` - User accounts
- `visited` - Visited countries (unique user_id + country_code)
- `wishlist` - Wishlist countries (unique user_id + country_code)
- `notes` - Country notes (unique user_id + country_code)
- `aqi_cache` - Cached air quality data

### 5. Start the Application
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Getting Started
1. Visit the application in your browser
2. Click "Register" to create an account
3. Login with your credentials
4. Click "Get Started" to access the interactive map

### Using the Map
1. **Select a Country**: Click on any country on the map
2. **View Information**: Country details, weather, and AQI will appear in the side panel
3. **Mark as Visited**: Click the "○ Mark Visited" button (turns green when visited)
4. **Add to Wishlist**: Click the "☆ Add to Wishlist" button (turns yellow when in wishlist)
5. **Add Notes**: Click the note button to add personal notes about the country

### Color Legend
- **Gray**: Countries you haven't visited or added to wishlist
- **Green**: Countries you've marked as visited
- **Yellow**: Countries in your wishlist
- **Higher Opacity**: Visited countries (more visible)
- **Medium Opacity**: Wishlist countries

### Toggle Actions
- Click the same button again to remove a country from visited/wishlist
- The map colors update instantly when you change status
- All actions show toast notifications for feedback

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout

### Country Actions
- `GET /country/visited` - Get user's visited countries
- `GET /country/wishlist` - Get user's wishlist countries
- `POST /country/visited` - Mark country as visited
- `DELETE /country/visited/:code` - Remove from visited
- `POST /country/wishlist` - Add to wishlist
- `DELETE /country/wishlist/:code` - Remove from wishlist
- `POST /country/note` - Add/update country note

## Database Schema

The database uses unique constraints to prevent duplicate entries:
- Each user can only have one entry per country in visited/wishlist tables
- The combination of `user_id` and `country_code` is unique
- Using `ON CONFLICT DO NOTHING` prevents duplicate insertions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please create an issue in the GitHub repository. 