-- Database: teamset_db
-- Volleyball Team Management System

-- Users table (with phone number)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'player') DEFAULT 'player',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS equipos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  coach_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table (volleyball specific stats)
CREATE TABLE IF NOT EXISTS jugadores (
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
  attack_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN attacks > 0 THEN ((attacks - errors) / attacks) * 100 ELSE 0 END
  ) STORED,
  block_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN blocks > 0 THEN (blocks / (blocks + errors)) * 100 ELSE 0 END
  ) STORED,
  serve_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN serves > 0 THEN ((aces - errors) / serves) * 100 ELSE 0 END
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES equipos(id) ON DELETE SET NULL
);

-- Trainings table
CREATE TABLE IF NOT EXISTS entrenamientos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  team_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES equipos(id) ON DELETE SET NULL
);

-- Training assignments (many-to-many)
CREATE TABLE IF NOT EXISTS asignaciones_entrenamiento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES jugadores(id) ON DELETE CASCADE,
  UNIQUE KEY UNIQUE_assignment (training_id, player_id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS partidos (
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
  FOREIGN KEY (team_id) REFERENCES equipos(id) ON DELETE CASCADE
);

-- Match player stats (volleyball specific per match with FIVB efficiency)
CREATE TABLE IF NOT EXISTS estadisticas_partido (
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
  attack_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN attacks > 0 
    THEN ((successful_attacks - attack_errors) / attacks) * 100 
    ELSE 0 END
  ) STORED,
  block_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN blocks > 0 
    THEN (successful_blocks / blocks) * 100 
    ELSE 0 END
  ) STORED,
  serve_efficiency DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN serves > 0 
    THEN ((aces - serve_errors) / serves) * 100 
    ELSE 0 END
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES partidos(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES jugadores(id) ON DELETE CASCADE
);

-- Attendance table
CREATE TABLE IF NOT EXISTS asistencia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  status ENUM('attending', 'not_attending', 'pending') DEFAULT 'pending',
  confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES jugadores(id) ON DELETE CASCADE,
  UNIQUE KEY UNIQUE_asistencia (training_id, player_id)
);

-- Training survey table (player feedback with emojis)
CREATE TABLE IF NOT EXISTS encuestas_entrenamiento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  satisfaction ENUM('happy', 'neutral', 'sad') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES jugadores(id) ON DELETE CASCADE,
  UNIQUE KEY UNIQUE_survey (training_id, player_id)
);

-- Notifications table (keeping for backend but removing from UI as requested)
CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES entrenamientos(id) ON DELETE SET NULL
);

-- Notification recipients
CREATE TABLE IF NOT EXISTS notification_recipients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  notification_id INT NOT NULL,
  user_id INT NOT NULL,
  read_at TIMESTAMP NULL,
  FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
