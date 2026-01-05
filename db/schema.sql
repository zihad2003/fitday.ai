-- db/schema.sql - Cloudflare D1 Database Schema for FitDay AI
-- This file contains the SQL schema for users, workouts, and meals tables

-- Users table: Stores user profile information
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female', 'other')),
  age INTEGER CHECK(age >= 13 AND age <= 120),
  height REAL CHECK(height >= 100 AND height <= 250),
  weight REAL CHECK(weight >= 30 AND weight <= 300),
  goal TEXT CHECK(goal IN ('lose_weight', 'gain_muscle', 'maintain', 'improve_fitness')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Workouts table: Stores daily workout plans and completion status
CREATE TABLE workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'cardio', 'strength', 'yoga'
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Meals table: Stores daily meal plans and completion status
CREATE TABLE meals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food TEXT NOT NULL, -- Description of the meal/food
  completed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_meals_user_date ON meals(user_id, date);
CREATE INDEX idx_users_email ON users(email);