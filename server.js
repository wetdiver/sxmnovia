require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./backend/config/database');

const galleryRoutes = require('./backend/routes/gallery');
const adminRoutes = require('./backend/routes/admin');
const apiRoutes = require('./backend/routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'sxmnova-fallback-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Redirect root to gallery
app.get('/', (req, res) => {
  res.redirect('/gallery');
});

// Routes
app.use('/', galleryRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  db.init();
});