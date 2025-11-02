# Food Database Troubleshooting Guide

## 📍 File Responsible for Food Database

**Backend File:** `backend/routes/foods.js` (lines 16-41)

This file handles all food database queries:
- Line 16-41: `/api/foods/search` endpoint - searches and filters foods
- Line 8: Query: `SELECT * FROM food_items WHERE 1=1`

## 🔍 How to Debug

### 1. Check Backend Logs
When you open the Food Database tab, check your terminal where `npm run dev` is running. You should see:
```
Food search query: SELECT * FROM food_items WHERE 1=1 params: []
Found X food items
```

### 2. Common Issues

#### Issue 1: Table Doesn't Exist
**Symptom:** Error in terminal: `Table 'nutrition_db.food_items' doesn't exist`

**Solution:** Create the table:
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

#### Issue 2: Table is Empty
**Symptom:** Terminal shows: `Found 0 food items`

**Solution:** Add sample data:
```sql
INSERT INTO food_items (name, region, calories, protein, carbohydrates, fat) VALUES
('Roti', 'North', 120, 3.5, 22, 2.5),
('Rice', 'All', 130, 2.7, 28, 0.3),
('Dal Tadka', 'North', 180, 9, 20, 8),
('Idli', 'South', 39, 2, 8, 0.2),
('Dosa', 'South', 168, 3.6, 28, 3.7),
('Sambar', 'South', 120, 5, 18, 3),
('Paneer Butter Masala', 'North', 350, 14, 12, 28),
('Chicken Curry', 'All', 250, 25, 8, 15),
('Biryani', 'All', 290, 12, 45, 8),
('Chole', 'North', 210, 12, 30, 6);
```

#### Issue 3: Database Connection Failed
**Symptom:** Error: `Cannot connect to database`

**Solution:** Check `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nutrition_db
```

### 3. Test the API Directly

Open browser or Postman and test:
```
http://localhost:5000/api/foods/search
```

You should see a JSON array of food items.

### 4. Check Frontend Console

Open browser DevTools (F12) → Console tab. Look for:
- `Fetched foods: X` - Shows how many foods were loaded
- Any error messages

## 🎯 Quick Fix Checklist

- [ ] Backend server is running (`npm run dev`)
- [ ] Database `nutrition_db` exists
- [ ] Table `food_items` exists
- [ ] Table has data (at least 1 row)
- [ ] `.env` file has correct database credentials
- [ ] No errors in backend terminal
- [ ] API endpoint returns data: `http://localhost:5000/api/foods/search`

## 📊 Sample Data Script

Run this complete script to set up food database:

```sql
USE nutrition_db;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS food_items (
    food_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    calories DECIMAL(10,2),
    protein DECIMAL(10,2),
    carbohydrates DECIMAL(10,2),
    fat DECIMAL(10,2)
);

-- Clear existing data (optional)
-- TRUNCATE TABLE food_items;

-- Insert sample Indian foods
INSERT INTO food_items (name, region, calories, protein, carbohydrates, fat) VALUES
-- North Indian
('Roti (Chapati)', 'North', 120, 3.5, 22, 2.5),
('Naan', 'North', 262, 7.6, 45, 5.2),
('Paratha', 'North', 300, 6, 35, 15),
('Paneer Tikka', 'North', 280, 16, 8, 20),
('Butter Chicken', 'North', 490, 28, 12, 36),
('Dal Makhani', 'North', 220, 10, 25, 10),
('Chole Bhature', 'North', 450, 15, 60, 18),
('Rajma', 'North', 180, 10, 28, 4),
('Aloo Gobi', 'North', 150, 4, 22, 6),

-- South Indian
('Idli (2 pieces)', 'South', 78, 4, 16, 0.4),
('Dosa (Plain)', 'South', 168, 3.6, 28, 3.7),
('Masala Dosa', 'South', 250, 6, 40, 8),
('Vada (2 pieces)', 'South', 180, 5, 20, 9),
('Sambar (1 bowl)', 'South', 120, 5, 18, 3),
('Rasam', 'South', 50, 2, 8, 1),
('Upma', 'South', 200, 5, 35, 5),
('Pongal', 'South', 220, 6, 38, 6),
('Uttapam', 'South', 190, 5, 32, 4),

-- East Indian
('Luchi', 'East', 150, 3, 20, 7),
('Machher Jhol', 'East', 180, 22, 5, 8),
('Aloo Posto', 'East', 200, 4, 25, 10),
('Chingri Malai Curry', 'East', 280, 18, 8, 20),
('Rasgulla (2 pieces)', 'East', 186, 4, 40, 1),
('Sandesh', 'East', 150, 6, 25, 3),

-- West Indian
('Dhokla', 'West', 160, 4, 28, 3),
('Thepla', 'West', 140, 4, 22, 5),
('Pav Bhaji', 'West', 400, 8, 55, 16),
('Vada Pav', 'West', 290, 6, 42, 11),
('Misal Pav', 'West', 350, 12, 48, 12),
('Puran Poli', 'West', 280, 5, 50, 7),

-- Common/All Regions
('White Rice (1 cup)', 'All', 205, 4.3, 45, 0.4),
('Brown Rice (1 cup)', 'All', 218, 5, 46, 1.6),
('Chicken Biryani', 'All', 290, 12, 45, 8),
('Vegetable Biryani', 'All', 220, 5, 42, 6),
('Egg Curry', 'All', 210, 12, 8, 15),
('Mixed Vegetable Curry', 'All', 130, 4, 18, 5),
('Palak Paneer', 'All', 270, 14, 10, 20),
('Tandoori Chicken', 'All', 260, 35, 5, 11),
('Fish Curry', 'All', 200, 20, 6, 10),
('Khichdi', 'All', 180, 6, 32, 4);

SELECT COUNT(*) as total_foods FROM food_items;
```

## 🆕 New Feature: Day-Wise Tracker

I've also implemented the calendar/day-wise tracking feature you requested!

### Features Added:
1. **Date Navigation Buttons** - Previous/Next/Today buttons on dashboard
2. **View Any Past Day** - Navigate to any previous date to see that day's meals
3. **Historical Data** - All your past meal logs are preserved and viewable
4. **"Today" Badge** - Shows when you're viewing today's data
5. **Disabled Next Button** - Can't go beyond today

### How to Use:
1. Go to Dashboard
2. Click **"← Previous"** to see yesterday's meals
3. Click **"Next →"** to go forward (disabled if viewing today)
4. Click **"📅 Today"** to jump back to current day
5. The date display shows which day you're viewing

### Technical Details:
- Uses `currentDashboardDate` state variable
- Fetches data based on selected date
- All existing functionality (logging, deleting) still works
- Data is fetched from backend based on date parameter

This means you can now:
- Track your nutrition day by day
- Review what you ate yesterday, last week, etc.
- Compare different days
- See your historical progress
