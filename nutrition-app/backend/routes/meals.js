const express = require('express');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Log a meal (protected route)
router.post('/log', verifyToken, (req, res) => {
  const { food_id, meal_type, quantity } = req.body;
  const user_id = req.userId;
  
  const now = new Date();
  const log_date = now.toISOString().split('T')[0];
  const log_time = now.toTimeString().split(' ')[0];
  
  const query = 'INSERT INTO meal_logs (user_id, food_id, meal_type, quantity, log_date, log_time) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [user_id, food_id, meal_type, quantity, log_date, log_time], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to log meal' });
    res.status(201).json({ message: 'Meal logged successfully', log_id: result.insertId });
  });
});

// Get user's meal logs for a specific date
router.get('/logs', verifyToken, (req, res) => {
  const { date } = req.query;
  const user_id = req.userId;
  
  const query = `
    SELECT ml.*, fi.name, fi.calories, fi.protein, fi.carbohydrates, fi.fat, fi.fiber
    FROM meal_logs ml
    JOIN food_items fi ON ml.food_id = fi.food_id
    WHERE ml.user_id = ? AND ml.log_date = ?
    ORDER BY ml.log_time DESC
  `;
  
  db.query(query, [user_id, date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results);
  });
});

// Get nutritional summary for a date
router.get('/summary', verifyToken, (req, res) => {
  const { date } = req.query;
  const user_id = req.userId;
  
  const query = `
    SELECT 
      SUM(fi.calories * ml.quantity) as total_calories,
      SUM(fi.protein * ml.quantity) as total_protein,
      SUM(fi.carbohydrates * ml.quantity) as total_carbs,
      SUM(fi.fat * ml.quantity) as total_fat,
      SUM(fi.fiber * ml.quantity) as total_fiber
    FROM meal_logs ml
    JOIN food_items fi ON ml.food_id = fi.food_id
    WHERE ml.user_id = ? AND ml.log_date = ?
  `;
  
  db.query(query, [user_id, date], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    res.json(results[0]);
  });
});

// Delete meal log
router.delete('/logs/:id', verifyToken, (req, res) => {
  const log_id = req.params.id;
  const user_id = req.userId;
  
  const query = 'DELETE FROM meal_logs WHERE log_id = ? AND user_id = ?';
  
  db.query(query, [log_id, user_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete meal log' });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Meal log not found' });
    }
    res.json({ message: 'Meal log deleted successfully' });
  });
});

module.exports = router;
