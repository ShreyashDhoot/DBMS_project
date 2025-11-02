# Quick Start Guide

## 🚀 Start the Application

### 1. Start Backend Server
```bash
cd D:\DBMS_project\nutrition-app\backend
npm run dev
```
✅ Server should start on http://localhost:5000

### 2. Open Frontend
Open `D:\DBMS_project\nutrition-app\frontend\index.html` in your browser

---

## 🔧 Fix Food Database Issue

### Problem: Food Database tab is empty

**The file responsible:** `backend/routes/foods.js` (lines 16-41)

### Quick Fix Steps:

1. **Check if table exists:**
```sql
USE nutrition_db;
SHOW TABLES;
```

2. **If `food_items` table doesn't exist, create it:**
```sql
CREATE TABLE food_items (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    calories DECIMAL(10,2),
    protein DECIMAL(10,2),
    carbohydrates DECIMAL(10,2),
    fat DECIMAL(10,2)
);
```

3. **Add sample data:**
```sql
INSERT INTO food_items (name, region, calories, protein, carbohydrates, fat) VALUES
('Roti', 'North', 120, 3.5, 22, 2.5),
('Rice', 'All', 130, 2.7, 28, 0.3),
('Dal Tadka', 'North', 180, 9, 20, 8),
('Idli', 'South', 39, 2, 8, 0.2),
('Dosa', 'South', 168, 3.6, 28, 3.7),
('Paneer Tikka', 'North', 280, 16, 8, 20),
('Chicken Biryani', 'All', 290, 12, 45, 8),
('Sambar', 'South', 120, 5, 18, 3),
('Dhokla', 'West', 160, 4, 28, 3),
('Pav Bhaji', 'West', 400, 8, 55, 16);
```

4. **Verify data:**
```sql
SELECT COUNT(*) FROM food_items;
```

5. **Test API:**
Open browser: http://localhost:5000/api/foods/search

6. **Check backend logs:**
Look at your terminal where `npm run dev` is running. You should see:
```
Food search query: SELECT * FROM food_items WHERE 1=1 params: []
Found 10 food items
```

### Full sample data script available in:
`FOOD_DATABASE_DEBUG.md` - Contains 40+ Indian food items

---

## 🆕 New Features

### 1. Day-Wise Meal Tracker ✅
- Navigate through your meal history day by day
- View yesterday's, last week's, or any past day's meals
- Buttons: **← Previous**, **Next →**, **📅 Today**
- Shows "Today" badge when viewing current day

### 2. Profile & Personalized Calories ✅
- Go to **Profile** tab
- Enter: gender, height, weight, age, activity level
- Get personalized daily calorie goal
- Uses BMR (Mifflin-St Jeor) calculation

### 3. Recipe Recommendations Persistence ✅
- Recommendations stay visible when switching tabs
- Click "Refresh & Clear" button to reset
- Ingredients are saved automatically

---

## 📋 Database Setup Checklist

Run these SQL commands in order:

```sql
-- 1. Use the database
USE nutrition_db;

-- 2. Add profile fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS daily_calorie_goal INT DEFAULT 2000;

-- 3. Verify users table
DESCRIBE users;

-- 4. Check if food_items table exists
SHOW TABLES LIKE 'food_items';

-- 5. If not, create it (see above)

-- 6. Verify all tables
SHOW TABLES;
```

---

## 🐛 Debugging

### Backend not starting?
- Check if port 5000 is already in use
- Verify `.env` file exists with correct database credentials
- Run `npm install` if packages are missing

### Food Database empty?
- See `FOOD_DATABASE_DEBUG.md` for detailed troubleshooting
- Check backend terminal logs
- Test API directly: http://localhost:5000/api/foods/search

### Profile not working?
- Run the ALTER TABLE command above
- Check if migration was successful: `DESCRIBE users;`

### Recipe recommendations slow?
- Normal - Gemini API can take 5-10 seconds
- Check if GEMINI_API_KEY is set in `.env`
- Check backend logs for errors

---

## 📚 Documentation Files

- `UPDATES.md` - Complete changelog of all features
- `FOOD_DATABASE_DEBUG.md` - Detailed food database troubleshooting
- `QUICK_START.md` - This file
- `backend/migrations/README.md` - Database migration guide

---

## ✅ Feature Checklist

- [x] User registration & login
- [x] Dashboard with nutrition stats
- [x] Meal logging with food search
- [x] Food database with filtering
- [x] Recipe recommendations with AI
- [x] Profile management
- [x] Personalized calorie goals
- [x] Day-wise meal tracking (NEW!)
- [x] Recipe persistence across tabs
- [x] YouTube video links for recipes

---

## 🎯 Next Steps

1. Run database migrations (ALTER TABLE command)
2. Add food items to database (use sample data script)
3. Test the application
4. Create your profile for personalized calories
5. Start logging meals!

Enjoy your nutrition tracking app! 🍽️
