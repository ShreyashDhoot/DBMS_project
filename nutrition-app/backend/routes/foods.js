const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Get all foods
router.get('/', (req, res) => {
  const query = 'SELECT * FROM food_items ORDER BY name';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// Search foods
router.get('/search', (req, res) => {
  const { name, region } = req.query;
  let query = 'SELECT * FROM food_items WHERE 1=1';
  const params = [];
  
  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  
  if (region && region !== 'All') {
    query += ' AND region = ?';
    params.push(region);
  }
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// Get food by ID
router.get('/:id', (req, res) => {
  const query = 'SELECT * FROM food_items WHERE food_id = ?';
  db.query(query, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Food not found' });
    }
    res.json(results[0]);
  });
});

module.exports = router;
