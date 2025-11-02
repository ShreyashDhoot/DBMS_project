# 🍽️ Food & Nutrition Database System

A comprehensive web-based nutrition tracking application for Indian cuisine with AI-powered recipe recommendations, personalized calorie goals, and day-wise meal tracking.

![Version](https://img.shields.io/badge/version-2.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green)
![MySQL](https://img.shields.io/badge/mysql-8.0-orange)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🔐 User Management
- User registration and authentication with JWT
- Secure password hashing with bcrypt
- Profile management with personalized settings

### 📊 Nutrition Tracking
- **Day-wise meal logging** with complete nutritional breakdown
- Real-time calorie, protein, carbs, and fat tracking
- Visual progress bars and charts
- **Calendar navigation** to view historical data (NEW!)
- Browse meals from any past day

### 🍛 Food Database
- Comprehensive Indian food database
- Regional filtering (North, South, East, West Indian)
- Search functionality
- Detailed nutritional information per serving

### 🤖 AI-Powered Recipe Recommendations
- Gemini AI integration for personalized recipe suggestions
- Ingredient-based recipe generation
- YouTube video links for cooking tutorials
- **Persistent recommendations** across tab changes
- Calorie-aware meal planning

### 👤 Personalized Calorie Goals
- BMR calculation using Mifflin-St Jeor equation
- TDEE based on activity level
- Custom profile setup (age, gender, height, weight, activity)
- Automatic calorie goal updates

### 📈 Analytics & Insights
- Daily calorie goal tracking
- Meal-type breakdown charts
- Nutritional summaries
- Historical data visualization

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with custom properties
- **Vanilla JavaScript** - Dynamic functionality
- **Google Fonts (Inter)** - Typography

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

### APIs & Services
- **Google Gemini AI** - Recipe recommendations
- **YouTube Data API v3** - Recipe video links

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- **Google Gemini API Key** - [Get Key](https://makersuite.google.com/app/apikey)
- **YouTube Data API Key** - [Get Key](https://console.cloud.google.com/)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/ShreyashDhoot/DBMS_project.git
cd DBMS_project/nutrition-app
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

No installation needed - frontend uses vanilla JavaScript.

---

## 🗄️ Database Setup

### 1. Create Database

Open MySQL Workbench or command line:

```sql
CREATE DATABASE nutrition_db;
USE nutrition_db;
```

### 2. Create Users Table

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    age INT,
    activity_level VARCHAR(20),
    daily_calorie_goal INT DEFAULT 2000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Create Food Items Table

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

### 4. Create Meal Logs Table

```sql
CREATE TABLE meal_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner', 'snacks') NOT NULL,
    quantity DECIMAL(5,2) NOT NULL,
    log_date DATE NOT NULL,
    log_time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES food_items(food_id) ON DELETE CASCADE
);
```

### 5. Insert Sample Food Data

```sql
INSERT INTO food_items (name, region, calories, protein, carbohydrates, fat) VALUES
-- North Indian
('Roti (Chapati)', 'North', 120, 3.5, 22, 2.5),
('Naan', 'North', 262, 7.6, 45, 5.2),
('Paratha', 'North', 300, 6, 35, 15),
('Paneer Tikka', 'North', 280, 16, 8, 20),
('Butter Chicken', 'North', 490, 28, 12, 36),
('Dal Makhani', 'North', 220, 10, 25, 10),
('Chole Bhature', 'North', 450, 15, 60, 18),

-- South Indian
('Idli (2 pieces)', 'South', 78, 4, 16, 0.4),
('Dosa (Plain)', 'South', 168, 3.6, 28, 3.7),
('Masala Dosa', 'South', 250, 6, 40, 8),
('Vada (2 pieces)', 'South', 180, 5, 20, 9),
('Sambar (1 bowl)', 'South', 120, 5, 18, 3),
('Upma', 'South', 200, 5, 35, 5),

-- East Indian
('Luchi', 'East', 150, 3, 20, 7),
('Machher Jhol', 'East', 180, 22, 5, 8),
('Rasgulla (2 pieces)', 'East', 186, 4, 40, 1),

-- West Indian
('Dhokla', 'West', 160, 4, 28, 3),
('Pav Bhaji', 'West', 400, 8, 55, 16),
('Vada Pav', 'West', 290, 6, 42, 11),

-- Common
('White Rice (1 cup)', 'All', 205, 4.3, 45, 0.4),
('Chicken Biryani', 'All', 290, 12, 45, 8),
('Vegetable Biryani', 'All', 220, 5, 42, 6),
('Egg Curry', 'All', 210, 12, 8, 15),
('Tandoori Chicken', 'All', 260, 35, 5, 11);
```

For more sample data, see `FOOD_DATABASE_DEBUG.md`.

---

## ⚙️ Configuration

### 1. Create Environment File

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

### 2. Add Configuration

```env
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=nutrition_db

# JWT Secret (use a strong random string)
JWT_SECRET=your_jwt_secret_key_here

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. Get API Keys

**Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into `.env`

**YouTube Data API Key:**
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Copy and paste into `.env`

---

## 🏃 Running the Application

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✓ Server running on http://localhost:5000
✓ Connected to MySQL database
```

### 2. Open Frontend

Open `frontend/index.html` in your web browser, or use a local server:

**Option A: Direct File**
```
Double-click frontend/index.html
```

**Option B: VS Code Live Server**
```
Right-click index.html → Open with Live Server
```

**Option C: Python HTTP Server**
```bash
cd frontend
python -m http.server 8080
# Open http://localhost:8080
```

---

## 📖 Usage Guide

### Getting Started

1. **Register an Account**
   - Click "Sign up here" on the login page
   - Enter username, email, and password
   - Click "Register"

2. **Complete Your Profile**
   - After login, you'll be prompted to set up your profile
   - Enter: gender, height (cm), weight (kg), age, activity level
   - Your personalized calorie goal will be calculated automatically

3. **Dashboard Overview**
   - View today's nutrition summary
   - See calorie goal progress
   - Log meals using the search function
   - View meal history in a table

### Day-Wise Tracking (NEW!)

Navigate through your meal history:
- **← Previous**: View yesterday's meals
- **Next →**: Go forward (disabled if viewing today)
- **📅 Today**: Jump back to current day
- Date display shows which day you're viewing

### Logging Meals

1. Go to **Dashboard**
2. Search for a food item
3. Select from dropdown
4. Choose meal type (breakfast/lunch/dinner/snacks)
5. Enter quantity (servings)
6. Click "Log Meal"

### Food Database

1. Go to **Food Database** tab
2. Search by name or filter by region
3. Click "Quick Log" to add 1 serving directly

### Recipe Recommendations

1. Go to **Recipes** tab
2. Add ingredients you have available
3. Click "Generate Recipe Recommendations"
4. Wait for AI to generate personalized recipes
5. View recipes with calorie info and YouTube videos
6. Recommendations persist when you switch tabs
7. Click "Refresh & Clear" to reset

### Profile Management

1. Go to **Profile** tab
2. Update your details anytime
3. Your calorie goal updates automatically
4. View current calorie goal at the top

---

## 🔌 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "gender": "male",
  "height": 175,
  "weight": 70,
  "age": 25,
  "activity_level": "moderately_active"
}
```

### Food Endpoints

#### Search Foods
```http
GET /api/foods/search?name=rice&region=South
```

#### Get Food by ID
```http
GET /api/foods/:id
```

### Meal Endpoints

#### Log Meal
```http
POST /api/meals/log
Authorization: Bearer <token>
Content-Type: application/json

{
  "food_id": 1,
  "meal_type": "lunch",
  "quantity": 1.5
}
```

#### Get Daily Summary
```http
GET /api/meals/summary?date=2025-11-02
Authorization: Bearer <token>
```

#### Get Meal Logs
```http
GET /api/meals/logs?date=2025-11-02
Authorization: Bearer <token>
```

#### Delete Meal Log
```http
DELETE /api/meals/logs/:id
Authorization: Bearer <token>
```

### Recipe Endpoints

#### Get Recipe Recommendations
```http
POST /api/recipes/recommendations
Authorization: Bearer <token>
Content-Type: application/json

{
  "ingredients": ["rice", "chicken", "tomatoes"],
  "calorie_limit": 2000
}
```

---

## 📁 Project Structure

```
nutrition-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── foods.js              # Food database routes
│   │   ├── meals.js              # Meal logging routes
│   │   └── recipes.js            # Recipe recommendation routes
│   ├── migrations/
│   │   ├── add_user_profile_fields.sql
│   │   └── README.md
│   ├── .env                      # Environment variables
│   ├── package.json              # Dependencies
│   └── server.js                 # Express server
│
├── frontend/
│   ├── index.html                # Main HTML file
│   ├── app.js                    # JavaScript logic
│   └── style.css                 # Styling
│
├── UPDATES.md                    # Changelog
├── QUICK_START.md                # Quick setup guide
├── FOOD_DATABASE_DEBUG.md        # Troubleshooting
└── README.md                     # This file
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem: `npm` not recognized**
- Solution: Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart terminal/IDE after installation

**Problem: Port 5000 already in use**
- Solution: Change `PORT` in `.env` file
- Or kill the process using port 5000

**Problem: Database connection failed**
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database `nutrition_db` exists

### Frontend Issues

**Problem: Food Database is empty**
- Check backend logs for errors
- Verify `food_items` table has data
- Test API: `http://localhost:5000/api/foods/search`
- See `FOOD_DATABASE_DEBUG.md` for detailed guide

**Problem: Recipe generation is slow**
- Normal - Gemini API can take 5-10 seconds
- Check GEMINI_API_KEY in `.env`
- Check backend logs for API errors

**Problem: Login not working**
- Clear browser cache and localStorage
- Check backend is running
- Verify JWT_SECRET is set in `.env`

### Database Issues

**Problem: Table doesn't exist**
- Run all CREATE TABLE commands
- Check database name is correct

**Problem: Foreign key constraint fails**
- Ensure parent tables exist first
- Check user_id and food_id are valid

For more troubleshooting, see:
- `FOOD_DATABASE_DEBUG.md` - Food database issues
- `QUICK_START.md` - Setup issues

---

## 🔒 Security Notes

- Never commit `.env` file to Git
- Use strong JWT_SECRET (random 32+ characters)
- Keep API keys confidential
- Use HTTPS in production
- Implement rate limiting for APIs
- Sanitize all user inputs

---

## 🚀 Future Enhancements

- [ ] Weekly/Monthly nutrition reports
- [ ] Weight tracking over time
- [ ] Meal planning calendar
- [ ] Barcode scanner for packaged foods
- [ ] Social features (share recipes)
- [ ] Mobile app (React Native)
- [ ] Export data to CSV/PDF
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Nutrition goals (protein, carbs, fat targets)

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Shreyash Dhoot**

- GitHub: [@ShreyashDhoot](https://github.com/ShreyashDhoot)
- Project: [DBMS_project](https://github.com/ShreyashDhoot/DBMS_project)

---

## 🙏 Acknowledgments

- Google Gemini AI for recipe recommendations
- YouTube Data API for cooking videos
- Node.js and Express.js communities
- MySQL documentation
- All contributors and testers

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review `FOOD_DATABASE_DEBUG.md` for food database issues
3. Check `QUICK_START.md` for setup help
4. Open an issue on GitHub
5. Contact the author

---

## 🌟 Star this Repository

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Version 2.0** - Updated with day-wise tracking, profile management, and recipe persistence

Last Updated: November 2, 2025
