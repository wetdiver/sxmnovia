const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
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

// ========== IMAGE UPLOAD CONFIG ==========
// Use absolute path for temp uploads (Render /tmp is writable, but local works too)
const tempUploadDir = process.env.NODE_ENV === 'production' 
  ? '/tmp/' 
  : path.join(__dirname, '../../public/uploads/temp/');

// Ensure temp directory exists
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const upload = multer({ dest: tempUploadDir });

// ========== ADD MEMBER ==========
router.post('/members', requireAuth, upload.single('image'), async (req, res) => {
  const { name, bio } = req.body;
  let finalImagePath = null;

  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}${ext}`;
      const outputDir = path.join(__dirname, '../../public/uploads/members/');
      
      // Ensure members directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, filename);
      
      // Process with Jimp
      const image = await Jimp.read(req.file.path);
      await image.resize(400, 400).writeAsync(outputPath);
      
      // Delete temp file
      fs.unlinkSync(req.file.path);
      
      finalImagePath = `/uploads/members/${filename}`;
    } catch (err) {
      console.error('Image processing error:', err);
      return res.status(500).send(`Failed to process image: ${err.message}`);
    }
  }

  db.run('INSERT INTO members (name, bio, image) VALUES (?, ?, ?)',
    [name, bio, finalImagePath],
    (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error');
      }
      res.redirect('/admin');
    }
  );
});

// ========== EDIT MEMBER ==========
router.post('/members/:id', requireAuth, upload.single('image'), async (req, res) => {
  const { name, bio } = req.body;
  const id = req.params.id;

  if (req.file) {
    try {
      const ext = path.extname(req.file.originalname);
      const filename = `${Date.now()}${ext}`;
      const outputDir = path.join(__dirname, '../../public/uploads/members/');
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputPath = path.join(outputDir, filename);
      
      const image = await Jimp.read(req.file.path);
      await image.resize(400, 400).writeAsync(outputPath);
      
      fs.unlinkSync(req.file.path);
      
      const imagePath = `/uploads/members/${filename}`;
      db.run('UPDATE members SET name = ?, bio = ?, image = ? WHERE id = ?',
        [name, bio, imagePath, id], (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
          }
          res.redirect('/admin');
        });
    } catch (err) {
      console.error('Image processing error:', err);
      return res.status(500).send(`Failed to process image: ${err.message}`);
    }
  } else {
    db.run('UPDATE members SET name = ?, bio = ? WHERE id = ?',
      [name, bio, id], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
        }
        res.redirect('/admin');
      });
  }
});

// ========== DELETE MEMBER ==========
router.get('/members/:id/delete', requireAuth, (req, res) => {
  db.run('DELETE FROM members WHERE id = ?', req.params.id, (err) => {
    if (err) console.error(err);
    res.redirect('/admin');
  });
});

// ========== PROPERTIES CRUD ==========
router.post('/properties', requireAuth, (req, res) => {
  const { title, video } = req.body;
  db.run('INSERT INTO properties (title, video) VALUES (?, ?)', [title, video], (err) => {
    if (err) console.error(err);
    res.redirect('/admin');
  });
});

router.get('/properties/:id/delete', requireAuth, (req, res) => {
  db.run('DELETE FROM properties WHERE id = ?', req.params.id, (err) => {
    if (err) console.error(err);
    res.redirect('/admin');
  });
});

module.exports = router;