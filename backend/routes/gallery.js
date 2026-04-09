const express = require('express');
const router = express.Router();
const { db } = require('../config/database');

router.get('/gallery', (req, res) => {
  db.all('SELECT * FROM members ORDER BY id DESC', (err, members) => {
    if (err) return res.status(500).send(err.message);
    res.render('gallery', { members, ageVerified: req.session.ageVerified || false });
  });
});

module.exports = router;