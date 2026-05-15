-- Stored Procedures for TeamSet
-- These are executed WITHOUT DELIMITER commands because mysql2 API
-- sends each statement as a complete string to the server.
-- The DELIMITER trick is only needed in the mysql CLI client.

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
END;

CREATE PROCEDURE IF NOT EXISTS sp_calcular_rendimiento_equipo()
BEGIN
    SELECT 
        e.id AS team_id,
        e.name AS team_name,
        e.category,
        e.coach_name,
        COUNT(DISTINCT j.id) AS total_players,
        COALESCE(SUM(j.attacks), 0) AS total_attacks,
        COALESCE(SUM(j.blocks), 0) AS total_blocks,
        COALESCE(SUM(j.serves), 0) AS total_serves,
        COALESCE(SUM(j.digs), 0) AS total_digs,
        COALESCE(SUM(j.assists), 0) AS total_assists,
        COALESCE(SUM(j.aces), 0) AS total_aces,
        COALESCE(SUM(j.errors), 0) AS total_errors,
        COALESCE(SUM(j.matches_played), 0) AS total_matches_played,
        CASE WHEN COALESCE(SUM(j.attacks), 0) > 0 
            THEN ROUND(((COALESCE(SUM(j.attacks), 0) - COALESCE(SUM(j.errors), 0)) / COALESCE(SUM(j.attacks), 0)) * 100, 1) 
            ELSE 0 END AS attack_efficiency,
        CASE WHEN COALESCE(SUM(j.blocks), 0) > 0 
            THEN ROUND((COALESCE(SUM(j.blocks), 0) / (COALESCE(SUM(j.blocks), 0) + COALESCE(SUM(j.errors), 0))) * 100, 1) 
            ELSE 0 END AS block_efficiency,
        CASE WHEN COALESCE(SUM(j.serves), 0) > 0 
            THEN ROUND(((COALESCE(SUM(j.aces), 0) - COALESCE(SUM(j.errors), 0)) / COALESCE(SUM(j.serves), 0)) * 100, 1) 
            ELSE 0 END AS serve_efficiency,
        CASE 
            WHEN (COALESCE(SUM(j.attacks), 0) > 0 OR COALESCE(SUM(j.blocks), 0) > 0 OR COALESCE(SUM(j.serves), 0) > 0)
            THEN ROUND(
                (CASE WHEN COALESCE(SUM(j.attacks), 0) > 0 
                    THEN ((COALESCE(SUM(j.attacks), 0) - COALESCE(SUM(j.errors), 0)) / COALESCE(SUM(j.attacks), 0)) * 100 
                    ELSE 0 END +
                 CASE WHEN COALESCE(SUM(j.blocks), 0) > 0 
                    THEN (COALESCE(SUM(j.blocks), 0) / (COALESCE(SUM(j.blocks), 0) + COALESCE(SUM(j.errors), 0))) * 100 
                    ELSE 0 END +
                 CASE WHEN COALESCE(SUM(j.serves), 0) > 0 
                    THEN ((COALESCE(SUM(j.aces), 0) - COALESCE(SUM(j.errors), 0)) / COALESCE(SUM(j.serves), 0)) * 100 
                    ELSE 0 END) / 3, 1
            ) ELSE 0 END AS overall_rating
    FROM equipos e
    LEFT JOIN jugadores j ON e.id = j.team_id
    GROUP BY e.id, e.name, e.category, e.coach_name
    ORDER BY overall_rating DESC, attack_efficiency DESC;
END;

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
END;
