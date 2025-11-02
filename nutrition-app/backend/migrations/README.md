# Database Migrations

## How to run migrations

1. Open MySQL Workbench or command line
2. Connect to your `nutrition_db` database
3. Run the SQL files in this directory

## Available Migrations

### add_user_profile_fields.sql
Adds profile fields to the users table:
- gender (VARCHAR)
- height (DECIMAL)
- weight (DECIMAL)
- age (INT)
- activity_level (VARCHAR)
- daily_calorie_goal (INT)

**To run:**
```sql
USE nutrition_db;
SOURCE D:/DBMS_project/nutrition-app/backend/migrations/add_user_profile_fields.sql;
```

Or copy and paste the SQL content directly into MySQL Workbench.
