const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { db } = require('../config/database');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123';

// Middleware to protect admin routes
function requireAuth(req, res, next) {
  if (req.session.adminAuth) return next();
  res.redirect('/admin/login');
}

// Login page
router.get('/login', (req, res) => {
  res.send(`
    <form method="post" action="/admin/login">
      <input type="password" name="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  `);
});

router.post('/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.adminAuth = true;
    res.redirect('/admin');
  } else {
    res.send('Wrong password');
  }
});

// Admin panel (members + properties tabs)
router.get('/', requireAuth, (req, res) => {
  db.all('SELECT * FROM members', (err, members) => {
    db.all('SELECT * FROM properties', (err2, properties) => {
      res.render('admin', { members, properties });
    });
  });
});

// Image upload config
const upload = multer({ dest: 'public/uploads/temp/' });

// Add member
router.post('/members', requireAuth, upload.single('image'), async (req, res) => {
  const { name, bio } = req.body;
  let finalImagePath = null;

  if (req.file) {
    const ext = path.extname(req.file.originalname);
    const filename = `${Date.now()}${ext}`;
    const outputPath = `public/uploads/members/${filename}`;
    await sharp(req.file.path).resize(400, 400).toFile(outputPath);
    finalImagePath = `/uploads/members/${filename}`;
  }

  db.run('INSERT INTO members (name, bio, image) VALUES (?, ?, ?)',
    [name, bio, finalImagePath],
    (err) => {
      if (err) console.error(err);
      res.redirect('/admin');
    }
  );
});

// Edit member
router.post('/members/:id', requireAuth, upload.single('image'), async (req, res) => {
  const { name, bio } = req.body;
  const id = req.params.id;

  if (req.file) {
    const ext = path.extname(req.file.originalname);
    const filename = `${Date.now()}${ext}`;
    const outputPath = `public/uploads/members/${filename}`;
    await sharp(req.file.path).resize(400, 400).toFile(outputPath);
    const image = `/uploads/members/${filename}`;
    db.run('UPDATE members SET name = ?, bio = ?, image = ? WHERE id = ?',
      [name, bio, image, id]);
  } else {
    db.run('UPDATE members SET name = ?, bio = ? WHERE id = ?',
      [name, bio, id]);
  }
  res.redirect('/admin');
});

// Delete member
router.get('/members/:id/delete', requireAuth, (req, res) => {
  db.run('DELETE FROM members WHERE id = ?', req.params.id, () => {
    res.redirect('/admin');
  });
});

// Properties CRUD (simple stub)
router.post('/properties', requireAuth, (req, res) => {
  const { title, video } = req.body;
  db.run('INSERT INTO properties (title, video) VALUES (?, ?)', [title, video], () => {
    res.redirect('/admin');
  });
});

router.get('/properties/:id/delete', requireAuth, (req, res) => {
  db.run('DELETE FROM properties WHERE id = ?', req.params.id, () => {
    res.redirect('/admin');
  });
});

module.exports = router;