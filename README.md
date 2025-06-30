# GeoFacts - World Explorer Dashboard

GeoFacts is a modern, fullstack web app for interactive world exploration, travel tracking, and personal notes. Discover country facts, weather, air quality, and manage your travel wishlist—all in a beautiful, responsive, dark-mode enabled dashboard.

---

## ✨ Features

- **Modern Responsive Navbar**
  - Hamburger menu on mobile
  - Dark mode support
  - Links: Home, Dashboard, Map, About, Contact Us, Login/Register/Logout
- **Home Page**
  - Hero section, app features, call to action
- **Dashboard**
  - Welcome message, user stats (visited, wishlist, notes)
  - Flag grid for visited/wishlist countries
  - Modern card layout
- **Map Page**
  - Interactive world map (Leaflet.js)
  - Click any country for info, weather, AQI
  - Mark as visited/wishlist, add/view notes
  - Color-coded map (visited/wishlist)
- **About & Contact Us Pages**
  - App info, contact form (styled, not functional by default)
- **User Authentication**
  - Register, login, logout
  - Persistent sessions (PostgreSQL session store)
- **Dark Mode**
  - All pages fully support dark mode
- **Mobile Friendly**
  - Responsive layouts, touch-friendly navigation
- **Beautiful UI**
  - Tailwind CSS, gradients, cards, and modern design

---

## 🛠️ Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with session store)
- **Frontend:** EJS, Tailwind CSS, Vanilla JS
- **Maps:** Leaflet.js, REST Countries API, OpenWeatherMap API
- **Authentication:** Passport.js, bcrypt

---

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repo-url>
cd GeoFacts-World-Explorer-Dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```
DB_PASSWORD=your_postgres_password
SESSION_SECRET=your_session_secret_key
```

### 4. Database Setup
- Create a PostgreSQL database named `geofacts`.
- Run the schema in `database.sql` to create all tables.
- For session support, also run:
```sql
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
```

### 5. Start the App
```bash
npm start
```
Visit [http://localhost:3000](http://localhost:3000)

---

## 📚 Pages Overview
- **Home:** Welcome, features, Get Started button
- **Dashboard:** User stats, flag grid, modern cards
- **Map:** Interactive map, country info, weather, AQI, visited/wishlist/notes
- **About:** App info, tech stack
- **Contact Us:** Contact form (styled)
- **Login/Register:** Modern, card-style forms

---

## 🧑‍💻 Contributing
1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 🙏 Credits
- [REST Countries API](https://restcountries.com/)
- [OpenWeatherMap API](https://openweathermap.org/)
- [Leaflet.js](https://leafletjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [connect-pg-simple](https://www.npmjs.com/package/connect-pg-simple)

---

## 📄 License
This project is licensed under the ISC License.

---

## 💬 Support
For issues and questions, please create an issue in the GitHub repository. 
