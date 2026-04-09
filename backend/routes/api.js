const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

// Get all members (for modal navigation)
router.get('/members', (req, res) => {
  db.all('SELECT id, name, bio, image FROM members ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get random alternative members (exclude current member)
router.get('/members/alternatives/:excludeId', (req, res) => {
  const excludeId = parseInt(req.params.excludeId);
  db.all('SELECT id, name, image FROM members WHERE id != ? ORDER BY RANDOM() LIMIT 3',
    [excludeId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Endpoint to verify age (sets session)
router.post('/verify-age', (req, res) => {
  req.session.ageVerified = true;
  res.json({ success: true });
});

module.exports = router;