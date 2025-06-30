import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { config } from 'dotenv';
import axios from 'axios';
import bodyparser from 'body-parser';
import authRoutes from './routes/auth.js';
import pool from './models/db.js';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import countryRoutes from './routes/country.js';
import pgSession from 'connect-pg-simple';
dotenv.config();
const PgSession = pgSession(session);

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,'public'))); 
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, // 30 days
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) return done(null, false, { message: "User not found" });
      const user = result.rows[0];
      bcrypt.compare(password, user.password_hash, (err, isMatch) => {
        if (err) return done(err);
        if (isMatch) return done(null, user);
        return done(null, false, { message: "Incorrect password" });
      });
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) return done(null, false);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Make user available in all EJS templates
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.get('/', (req, res) => {
  res.render('home', { user: req.user });
});
app.get('/about', (req, res) => {
  res.render('about', { user: req.user });
});
app.get('/contact', (req, res) => {
  res.render('contact', { user: req.user });
});

app.get('/dashboard', async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect('/login');
  const user_id = req.user.id;
  try {
    const visitedResult = await pool.query('SELECT country_code FROM visited WHERE user_id = $1', [user_id]);
    const wishlistResult = await pool.query('SELECT country_code FROM wishlist WHERE user_id = $1', [user_id]);
    const notesResult = await pool.query('SELECT country_code FROM notes WHERE user_id = $1', [user_id]);
    res.render('dashboard', {
      user: req.user,
      visitedCount: visitedResult.rows.length,
      wishlistCount: wishlistResult.rows.length,
      notesCount: notesResult.rows.length,
      visitedCountries: visitedResult.rows.map(r => r.country_code),
      wishlistCountries: wishlistResult.rows.map(r => r.country_code)
    });
  } catch (err) {
    res.status(500).send('Error loading dashboard');
  }
});

app.get('/map',(req,res)=>{
    if(req.isAuthenticated()){
        res.render('map');
    }else{
        res.redirect('/login');
    }
});

app.use('/',authRoutes(passport, pool));
app.use('/country', countryRoutes(pool));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
