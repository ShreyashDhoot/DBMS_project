# Quick Start Guide

## Installation

After cloning/downloading the project, run:

```bash
cd nutrition-app/backend
npm install
```

This will install all dependencies including the new packages:
- google-generative-ai
- googleapis

## Required Environment Variables

Create a `.env` file in `nutrition-app/backend/` with:

```env
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_database_name
JWT_SECRET=your_secret_key_here
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

## Database Setup

Run the SQL migration script from the project root:

```bash
mysql -u your_user -p your_database < ../../schema_updates.sql
```

## Run the Server

```bash
node server.js
```

Or with auto-reload:
```bash
npx nodemon server.js
```

## Test the Setup

1. Open browser to test the API: http://localhost:5000
2. Should see: `{"message":"Nutrition API is running"}`
3. Open `../frontend/index.html` in your browser to use the app

## API Endpoints to Test

- GET http://localhost:5000/api/foods - List all foods
- POST http://localhost:5000/api/auth/register - Register user
- POST http://localhost:5000/api/auth/login - Login
- PUT http://localhost:5000/api/auth/profile - Update profile (requires auth)
- POST http://localhost:5000/api/recipes/recommendations - Get AI recipes (requires auth)

## Troubleshooting

### Error: "Cannot find module 'google-generative-ai'"
Solution: Run `npm install` again

### Error: "GEMINI_API_KEY is not defined"
Solution: Add GEMINI_API_KEY to your .env file

### Error: Database connection failed
Solution: Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env

