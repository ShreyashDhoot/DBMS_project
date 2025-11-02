# Nutrition App Updates

## Summary of Changes

### 🆕 NEW: Day-Wise Meal Tracker (Calendar View)
**Added:** Complete historical tracking with date navigation.

**Features:**
- **Previous/Next Day Navigation** - Browse through your meal history
- **"Today" Button** - Quickly jump back to current day
- **Date Display** - Shows which day you're viewing with "Today" badge
- **Historical Data** - View any past day's meals and nutrition stats
- **Smart Navigation** - Next button disabled when viewing today

**How to Use:**
1. Open Dashboard
2. Use **← Previous** and **Next →** buttons to navigate days
3. Click **📅 Today** to return to current day
4. View complete nutrition data for any selected date

---

## Summary of Previous Changes

### 1. ✅ Recipe Recommendations Persistence
**Problem:** Recipe recommendations disappeared when switching tabs.

**Solution:**
- Added `currentRecommendations` state variable stored in `sessionStorage`
- Added `selectedIngredients` persistence in `sessionStorage`
- Modified `setupRecipesView()` to restore recommendations when returning to the tab
- Added "Refresh & Clear" button to manually clear recommendations
- Recommendations now persist across tab changes until explicitly cleared

**Files Modified:**
- `frontend/app.js` - Added sessionStorage persistence for recipes and ingredients

---

### 2. ✅ User Profile & Personalized Calorie Goals
**Problem:** Calorie goal was hardcoded to 2000 calories for all users.

**Solution:**
- Created complete profile management system
- Added new "Profile" tab in navigation
- Implemented BMR (Basal Metabolic Rate) calculation using Mifflin-St Jeor equation
- Implemented TDEE (Total Daily Energy Expenditure) based on activity level
- Users can now input:
  - Gender (Male/Female)
  - Height (cm)
  - Weight (kg)
  - Age
  - Activity Level (Sedentary to Extra Active)
- Calorie goal is automatically calculated and used for recipe recommendations

**Files Modified:**
- `backend/routes/auth.js` - Already had profile endpoints (no changes needed)
- `frontend/app.js` - Added `loadUserProfile()` and `handleProfileUpdate()` functions
- `frontend/index.html` - Added new Profile view with form

**Files Created:**
- `backend/migrations/add_user_profile_fields.sql` - Database migration
- `backend/migrations/README.md` - Migration instructions

**Database Changes Required:**
Run the SQL migration to add profile fields to users table:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS gender VARCHAR(10),
ADD COLUMN IF NOT EXISTS height DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS age INT,
ADD COLUMN IF NOT EXISTS activity_level VARCHAR(20),
ADD COLUMN IF NOT EXISTS daily_calorie_goal INT DEFAULT 2000;
```

---

### 3. ✅ Food Database Display Improvements
**Problem:** Food database might not be displaying properly.

**Solution:**
- Added better error handling with detailed error messages
- Added console logging for debugging
- Added HTTP status code checking
- Added array validation before rendering
- Improved error messages to help identify issues

**Files Modified:**
- `frontend/app.js` - Enhanced `renderFoodGrid()` with better error handling

---

## How to Test

### 1. Recipe Persistence
1. Login to the app
2. Go to "Recipes" tab
3. Add ingredients (e.g., rice, chicken, tomatoes)
4. Click "Generate Recipe Recommendations"
5. Wait for recommendations to load
6. Switch to "Dashboard" or "Food Database" tab
7. Switch back to "Recipes" tab
8. ✅ Recommendations should still be visible
9. Click "Refresh & Clear" button to clear them

### 2. Profile & Calorie Goals
1. Login to the app
2. Click "Profile" in navigation
3. Fill in your details:
   - Gender: Male/Female
   - Height: e.g., 175 cm
   - Weight: e.g., 70 kg
   - Age: e.g., 25
   - Activity Level: e.g., Moderately Active
4. Click "Update Profile"
5. ✅ Your personalized calorie goal will be displayed
6. Go to "Recipes" tab and generate recommendations
7. ✅ Recommendations will use your personalized calorie goal

### 3. Food Database
1. Go to "Food Database" tab
2. ✅ Food items should load and display
3. Try searching for specific foods
4. Try filtering by region (North, South, East, West)
5. If you see errors, check:
   - Backend is running (`npm run dev` in backend folder)
   - Database has food_items table with data
   - Check browser console for detailed error messages

---

## Setup Instructions

### Database Migration
1. Open MySQL Workbench or command line
2. Connect to `nutrition_db` database
3. Run the migration:
   ```sql
   USE nutrition_db;
   SOURCE D:/DBMS_project/nutrition-app/backend/migrations/add_user_profile_fields.sql;
   ```
   Or copy-paste the SQL from the file directly

### Start the Application
1. **Backend:**
   ```bash
   cd D:\DBMS_project\nutrition-app\backend
   npm run dev
   ```

2. **Frontend:**
   - Open `D:\DBMS_project\nutrition-app\frontend\index.html` in a browser
   - Or use a local server (e.g., Live Server in VS Code)

---

## Technical Details

### Calorie Calculation Formula

**BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation:**
- For Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
- For Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

**TDEE (Total Daily Energy Expenditure):**
- Sedentary: BMR × 1.2
- Lightly Active: BMR × 1.375
- Moderately Active: BMR × 1.55
- Very Active: BMR × 1.725
- Extra Active: BMR × 1.9

### Session Storage Keys
- `fndb_selectedIngredients` - Array of selected ingredients
- `fndb_recommendations` - Array of recipe recommendations
- `fndb_currentUser` - Current user object
- `fndb_token` - JWT authentication token (localStorage)

---

## Known Issues & Future Improvements

### Current Limitations
1. Profile setup is optional - users can skip it and use default 2000 cal goal
2. Recipe recommendations can be slow (depends on Gemini API response time)
3. Food database requires manual population with data

### Suggested Improvements
1. Add loading spinner for recipe generation
2. Add profile completion reminder/badge
3. Add weight tracking over time
4. Add meal planning feature
5. Add export/import meal data
6. Add dark mode toggle

---

## Files Changed Summary

### Modified Files
- `frontend/app.js` (multiple functions updated)
- `frontend/index.html` (added Profile view)

### New Files
- `backend/migrations/add_user_profile_fields.sql`
- `backend/migrations/README.md`
- `UPDATES.md` (this file)

### Unchanged Files (Already Working)
- `backend/routes/auth.js` (profile endpoints already existed)
- `backend/routes/recipes.js` (working correctly)
- `backend/routes/foods.js` (working correctly)
- `backend/server.js` (no changes needed)
- `frontend/style.css` (no changes needed)
