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
  survey_question TEXT,
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
  UNIQUE KEY unique_assignment (training_id, player_id)
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

-- Match player stats (volleyball specific per match)
CREATE TABLE IF NOT EXISTS estadisticas_partido (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  player_id INT NOT NULL,
  attacks INT DEFAULT 0,
  blocks INT DEFAULT 0,
  serves INT DEFAULT 0,
  digs INT DEFAULT 0,
  assists INT DEFAULT 0,
  aces INT DEFAULT 0,
  errors INT DEFAULT 0,
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
  UNIQUE KEY unique_asistencia (training_id, player_id)
);

-- Team performance table (general team stats 1-10 rating)
CREATE TABLE IF NOT EXISTS rendimiento_equipo (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL,
  performance_date DATE NOT NULL,
  court_performance INT CHECK (court_performance BETWEEN 1 AND 10),
  serve_performance INT CHECK (serve_performance BETWEEN 1 AND 10),
  attack_performance INT CHECK (attack_performance BETWEEN 1 AND 10),
  block_performance INT CHECK (block_performance BETWEEN 1 AND 10),
  defense_performance INT CHECK (defense_performance BETWEEN 1 AND 10),
  overall_rating DECIMAL(3,1) CHECK (overall_rating BETWEEN 1 AND 10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES equipos(id) ON DELETE CASCADE
);


