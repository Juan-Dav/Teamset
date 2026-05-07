-- Database: teamset_db
-- Volleyball Team Management System

-- Users table (with phone number)
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'player') DEFAULT 'player',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  coach_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table (volleyball specific stats)
CREATE TABLE IF NOT EXISTS players (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE,
  team_id INT,
  position VARCHAR(50),
  jersey_number INT,
  attacks INT DEFAULT 0,
  blocks INT DEFAULT 0,
  serves INT DEFAULT 0,
  digs INT DEFAULT 0,
  assists INT DEFAULT 0,
  aces INT DEFAULT 0,
  errors INT DEFAULT 0,
  matches_played INT DEFAULT 0,
  attendance_streak INT DEFAULT 0,
  last_attendance_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Trainings table
CREATE TABLE IF NOT EXISTS trainings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  survey_question TEXT,
  team_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Training assignments (many-to-many)
CREATE TABLE IF NOT EXISTS training_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE KEY unique_assignment (training_id, player_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  opponent VARCHAR(100) NOT NULL,
  match_date DATE NOT NULL,
  sets_won INT DEFAULT 0,
  sets_lost INT DEFAULT 0,
  points_scored INT DEFAULT 0,
  points_conceded INT DEFAULT 0,
  result ENUM('win', 'loss', 'draw') DEFAULT 'win',
  location VARCHAR(200),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Match player stats (volleyball specific per match)
CREATE TABLE IF NOT EXISTS match_player_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  attacks INT DEFAULT 0,
  successful_attacks INT DEFAULT 0,
  attack_errors INT DEFAULT 0,
  blocks INT DEFAULT 0,
  successful_blocks INT DEFAULT 0,
  serves INT DEFAULT 0,
  aces INT DEFAULT 0,
  serve_errors INT DEFAULT 0,
  digs INT DEFAULT 0,
  assists INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  status ENUM('attending', 'not_attending', 'pending') DEFAULT 'pending',
  confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE KEY unique_attendance (training_id, player_id)
);

-- Team performance table (FIVB calculated stats)
CREATE TABLE IF NOT EXISTS team_performance (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  performance_date DATE NOT NULL,
  total_attacks INT DEFAULT 0,
  successful_attacks INT DEFAULT 0,
  attack_errors INT DEFAULT 0,
  total_serves INT DEFAULT 0,
  aces INT DEFAULT 0,
  serve_errors INT DEFAULT 0,
  total_blocks INT DEFAULT 0,
  successful_blocks INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Training survey table (player feedback with emojis)
CREATE TABLE IF NOT EXISTS training_surveys (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  satisfaction ENUM('happy', 'neutral', 'sad') NOT NULL,
  suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE KEY unique_survey (training_id, player_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE SET NULL
);

-- Notification recipients
CREATE TABLE IF NOT EXISTS notification_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
