# TeamSet - Gestión de Voleibol

## Requisitos
- Node.js
- MySQL Server
- Base de datos `teamset_db` creada

## Instalación

### Backend
```bash
cd backend
npm install
npm run setup  # Inicializa la base de datos
npm run dev      # Inicia el servidor en puerto 3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Inicia Vite en puerto 5173
```

## Características implementadas

### Para Admin:
- ✅ Gestión de equipos, jugadores y partidos
- ✅ Agendar entrenamientos y partidos
- ✅ Modificar estadísticas de rendimiento del equipo (1-10)
- ✅ Ver estadísticas individuales de jugadores de voleibol
- ✅ Gestionar usuarios con teléfono

### Para Usuario:
- ✅ Modificar su propia información (perfil)
- ✅ Confirmar asistencia a entrenamientos
- ✅ Ver racha de asistencia
- ✅ Ver estadísticas del equipo y jugadores

### General:
- ✅ Registro con número de celular
- ✅ Racha de asistencia para jugadores que confirman entrenamiento
- ✅ Estadísticas de voleibol (ataques, bloqueos, saques, defensas)
- ✅ Rendimiento del equipo (campo, saque, ataque, bloqueo, defensa)
- ✅ Panel lateral con: Equipo, Jugadores, Partidos, Entrenamientos, Asistencia, Rendimiento
- ✅ Se eliminó apartado de notificaciones

## Base de Datos
La base de datos `teamset_db` incluye tablas para:
- users (usuarios con teléfono)
- teams (equipos)
- players (jugadores con estadísticas de voleibol y racha)
- trainings (entrenamientos)
- matches (partidos)
- team_performance (rendimiento 1-10)
- attendance (asistencia)
