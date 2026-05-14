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

-- Training surveys table
CREATE TABLE IF NOT EXISTS encuestas_entrenamiento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_id INT NOT NULL,
  player_id INT NOT NULL,
  satisfaction ENUM('happy', 'neutral', 'sad') NOT NULL,
  suggestion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (training_id) REFERENCES entrenamientos(id) ON DELETE CASCADE,
  FOREIGN KEY (player_id) REFERENCES jugadores(id) ON DELETE CASCADE,
  UNIQUE KEY unique_survey (training_id, player_id)
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

-- ============================================================
-- STORED PROCEDURE: sp_guardar_resultado_partido
-- Description: Guarda/actualiza un resultado de partido y las
--              estadisticas individuales de los jugadores,
--              actualizando automaticamente las estadisticas
--              acumuladas en la tabla jugadores.
-- Parameters:
--   p_match_id      INT       - NULL para nuevo partido, o ID existente
--   p_team_id       INT       - ID del equipo
--   p_opponent      VARCHAR   - Nombre del rival
--   p_match_date    DATE      - Fecha del partido
--   p_sets_won      INT       - Sets ganados
--   p_sets_lost     INT       - Sets perdidos
--   p_points_scored INT       - Puntos anotados
--   p_points_conceded INT     - Puntos recibidos
--   p_location      VARCHAR   - Ubicacion (opcional)
--   p_description   TEXT      - Notas (opcional)
--   p_player_stats  JSON      - Array de estadisticas por jugador:
--     [{"player_id":1,"attacks":5,"blocks":2,"serves":8,"digs":3,"assists":1,"aces":2,"errors":1},...]
-- Returns: match_id del partido insertado/actualizado
-- ============================================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_guardar_resultado_partido(
    IN p_match_id INT,
    IN p_team_id INT,
    IN p_opponent VARCHAR(100),
    IN p_match_date DATE,
    IN p_sets_won INT,
    IN p_sets_lost INT,
    IN p_points_scored INT,
    IN p_points_conceded INT,
    IN p_location VARCHAR(200),
    IN p_description TEXT,
    IN p_player_stats JSON
)
BEGIN
    DECLARE v_match_id INT;
    DECLARE v_result ENUM('win', 'loss', 'draw');
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_player_id INT;
    DECLARE v_attacks INT;
    DECLARE v_blocks INT;
    DECLARE v_serves INT;
    DECLARE v_digs INT;
    DECLARE v_assists INT;
    DECLARE v_aces INT;
    DECLARE v_errors INT;
    DECLARE v_num_players INT;
    DECLARE v_old_player_id INT;
    DECLARE v_old_attacks INT;
    DECLARE v_old_blocks INT;
    DECLARE v_old_serves INT;
    DECLARE v_old_digs INT;
    DECLARE v_old_assists INT;
    DECLARE v_old_aces INT;
    DECLARE v_old_errors INT;
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE old_stats_cursor CURSOR FOR
        SELECT player_id, attacks, blocks, serves, digs, assists, aces, errors
        FROM estadisticas_partido WHERE match_id = p_match_id;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- Determinar resultado segun sets
    IF p_sets_won > p_sets_lost THEN
        SET v_result = 'win';
    ELSEIF p_sets_won < p_sets_lost THEN
        SET v_result = 'loss';
    ELSE
        SET v_result = 'draw';
    END IF;

    -- Si es actualizacion, revertir estadisticas viejas primero
    IF p_match_id IS NOT NULL THEN
        OPEN old_stats_cursor;
        read_loop: LOOP
            FETCH old_stats_cursor INTO v_old_player_id, v_old_attacks, v_old_blocks,
                v_old_serves, v_old_digs, v_old_assists, v_old_aces, v_old_errors;
            IF v_done THEN
                LEAVE read_loop;
            END IF;
            UPDATE jugadores
            SET attacks = GREATEST(attacks - v_old_attacks, 0),
                blocks = GREATEST(blocks - v_old_blocks, 0),
                serves = GREATEST(serves - v_old_serves, 0),
                digs = GREATEST(digs - v_old_digs, 0),
                assists = GREATEST(assists - v_old_assists, 0),
                aces = GREATEST(aces - v_old_aces, 0),
                errors = GREATEST(errors - v_old_errors, 0),
                matches_played = GREATEST(matches_played - 1, 0)
            WHERE id = v_old_player_id;
        END LOOP;
        CLOSE old_stats_cursor;
    END IF;

    -- Insertar o actualizar el partido
    IF p_match_id IS NULL THEN
        INSERT INTO partidos (team_id, opponent, match_date, sets_won, sets_lost,
            points_scored, points_conceded, result, location, description)
        VALUES (p_team_id, p_opponent, p_match_date, p_sets_won, p_sets_lost,
            p_points_scored, p_points_conceded, v_result, p_location, p_description);
        SET v_match_id = LAST_INSERT_ID();
    ELSE
        UPDATE partidos
        SET team_id = p_team_id,
            opponent = p_opponent,
            match_date = p_match_date,
            sets_won = p_sets_won,
            sets_lost = p_sets_lost,
            points_scored = p_points_scored,
            points_conceded = p_points_conceded,
            result = v_result,
            location = p_location,
            description = p_description
        WHERE id = p_match_id;
        SET v_match_id = p_match_id;

        DELETE FROM estadisticas_partido WHERE match_id = v_match_id;
    END IF;

    -- Insertar nuevas estadisticas y actualizar acumulados
    IF p_player_stats IS NOT NULL AND JSON_VALID(p_player_stats) THEN
        SET v_num_players = JSON_LENGTH(p_player_stats);
        WHILE v_i < v_num_players DO
            SET v_player_id = JSON_UNQUOTE(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].player_id')));
            SET v_attacks = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].attacks')) AS SIGNED), 0);
            SET v_blocks = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].blocks')) AS SIGNED), 0);
            SET v_serves = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].serves')) AS SIGNED), 0);
            SET v_digs = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].digs')) AS SIGNED), 0);
            SET v_assists = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].assists')) AS SIGNED), 0);
            SET v_aces = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].aces')) AS SIGNED), 0);
            SET v_errors = COALESCE(CAST(JSON_EXTRACT(p_player_stats, CONCAT('$[', v_i, '].errors')) AS SIGNED), 0);

            INSERT INTO estadisticas_partido (match_id, player_id, attacks, blocks,
                serves, digs, assists, aces, errors)
            VALUES (v_match_id, v_player_id, v_attacks, v_blocks, v_serves,
                v_digs, v_assists, v_aces, v_errors);

            UPDATE jugadores
            SET attacks = attacks + v_attacks,
                blocks = blocks + v_blocks,
                serves = serves + v_serves,
                digs = digs + v_digs,
                assists = assists + v_assists,
                aces = aces + v_aces,
                errors = errors + v_errors,
                matches_played = matches_played + 1
            WHERE id = v_player_id;

            SET v_i = v_i + 1;
        END WHILE;
    END IF;

    -- Retornar el ID del partido
    SELECT v_match_id AS match_id;
END$$

DELIMITER ;

-- ============================================================
-- STORED PROCEDURE: sp_calcular_tabla_posiciones
-- Description: Calcula automaticamente la tabla de posiciones
--              con puntos, victorias, derrotas, sets ganados y
--              perdidos para todos los equipos.
-- Parameters:
--   p_team_id  INT  - NULL para todos los equipos, o un ID especifico
-- Returns: Tabla de posiciones ordenada por puntos y diferencia de sets
-- Sistema de puntuacion (voleibol):
--   3-0 o 3-1 => 3 pts  |  3-2 => 2 pts
--   2-3      => 1 pt   |  1-3 o 0-3 => 0 pts
-- ============================================================
DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS sp_calcular_tabla_posiciones(
    IN p_team_id INT
)
BEGIN
    SELECT
        e.id AS team_id,
        e.name AS team_name,
        e.category,
        COUNT(p.id) AS matches_played,
        SUM(CASE WHEN p.result = 'win' THEN 1 ELSE 0 END) AS wins,
        SUM(CASE WHEN p.result = 'loss' THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN p.result = 'draw' THEN 1 ELSE 0 END) AS draws,
        SUM(p.sets_won) AS sets_won,
        SUM(p.sets_lost) AS sets_lost,
        (SUM(p.sets_won) - SUM(p.sets_lost)) AS set_difference,
        SUM(p.points_scored) AS points_scored,
        SUM(p.points_conceded) AS points_conceded,
        (SUM(p.points_scored) - SUM(p.points_conceded)) AS point_difference,
        SUM(
            CASE
                WHEN p.sets_won = 3 AND p.sets_lost = 0 THEN 3
                WHEN p.sets_won = 3 AND p.sets_lost = 1 THEN 3
                WHEN p.sets_won = 3 AND p.sets_lost = 2 THEN 2
                WHEN p.sets_won = 2 AND p.sets_lost = 3 THEN 1
                WHEN p.sets_won = 1 AND p.sets_lost = 3 THEN 0
                WHEN p.sets_won = 0 AND p.sets_lost = 3 THEN 0
                WHEN p.result = 'win' THEN 3
                WHEN p.result = 'draw' THEN 1
                WHEN p.result = 'loss' THEN 0
                ELSE 0
            END
        ) AS points
    FROM equipos e
    LEFT JOIN partidos p ON e.id = p.team_id
    WHERE (p_team_id IS NULL OR e.id = p_team_id)
    GROUP BY e.id, e.name, e.category
    ORDER BY points DESC, set_difference DESC, point_difference DESC, sets_won DESC;
END$$

DELIMITER ;


