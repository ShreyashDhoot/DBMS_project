const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Helper function to calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight, height, age, gender) {
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  return gender === 'male' ? baseBMR + 5 : baseBMR - 161;
}

// Helper function to calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(BMR, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  
  return Math.round(BMR * (multipliers[activityLevel] || 1.2));
}

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'User already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email
      }
    });
  });
});

// Update user profile and calculate calorie goal
router.put('/profile', verifyToken, (req, res) => {
  const userId = req.userId;
  const { gender, height, weight, age, activity_level } = req.body;
  
  // Validate inputs
  if (!gender || !height || !weight || !age || !activity_level) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // Calculate calorie goal
  const BMR = calculateBMR(weight, height, age, gender);
  const dailyCalorieGoal = calculateTDEE(BMR, activity_level);
  
  // Update user profile
  const query = `UPDATE users 
    SET gender = ?, height = ?, weight = ?, age = ?, activity_level = ?, daily_calorie_goal = ?
    WHERE user_id = ?`;
  
  db.query(query, [gender, height, weight, age, activity_level, dailyCalorieGoal, userId], (err, result) => {
    if (err) {
      console.error('Profile update error:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      profile: {
        gender,
        height,
        weight,
        age,
        activity_level,
        daily_calorie_goal: dailyCalorieGoal
      }
    });
  });
});

// Get user calorie goal
router.get('/calorie-goal', verifyToken, (req, res) => {
  const userId = req.userId;
  
  const query = 'SELECT daily_calorie_goal FROM users WHERE user_id = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json({ daily_calorie_goal: results[0].daily_calorie_goal || 2000 });
  });
});

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  const userId = req.userId;
  
  const query = 'SELECT gender, height, weight, age, activity_level, daily_calorie_goal FROM users WHERE user_id = ?';
  
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json(results[0]);
  });
});

module.exports = router;
