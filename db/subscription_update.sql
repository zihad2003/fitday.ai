-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN plan_type TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN ai_credits INTEGER DEFAULT 3;
ALTER TABLE users ADD COLUMN subscription_end_date DATETIME;
