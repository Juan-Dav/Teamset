// Frontend API with error handling
const API_URL = "http://localhost:3000/api";

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Error en el servidor" }));
    throw new Error(error.message || "Error en el servidor");
  }
  return res.json();
};

// ==================== AUTH ====================

export const login = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return "invalid_credentials";
    const user = await res.json();
    localStorage.setItem("teamset_session", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Login error:", error);
    return "server_error";
  }
};

export const register = async (name: string, email: string, password: string, phone?: string) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, phone }),
    });
    if (!res.ok) { 
      const data = await res.json().catch(() => ({}));
      return data.message || "error"; 
    }
    const user = await res.json();
    localStorage.setItem("teamset_session", JSON.stringify(user));
    return user;
  } catch (error) {
    console.error("Register error:", error);
    return "server_error";
  }
};

export const logout = () => localStorage.removeItem("teamset_session");

export const getCurrentAuthUser = () => {
  const data = localStorage.getItem("teamset_session");
  return data ? JSON.parse(data) : null;
};

export const getProfile = async (id: number) => {
  const res = await fetch(`${API_URL}/auth/profile/${id}`);
  return handleResponse(res);
};

export const updateProfile = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/auth/profile/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const user = await handleResponse(res);
  localStorage.setItem("teamset_session", JSON.stringify(user));
  return user;
};

// ==================== USERS ====================

export const getTeamUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  return handleResponse(res);
};

export const createTeamUser = async (data: any) => {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateTeamUser = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteTeamUser = async (id: number) => {
  const res = await fetch(`${API_URL}/users/${id}`, { method: "DELETE" });
  return handleResponse(res);
};

export const searchUsers = async (query: string) => {
  const users = await getTeamUsers();
  const q = query.toLowerCase();
  return users.filter((u: any) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
};

// ==================== TRAININGS ====================

export const getTrainings = async () => {
  const res = await fetch(`${API_URL}/trainings`);
  return handleResponse(res);
};

export const createTraining = async (data: any) => {
  const res = await fetch(`${API_URL}/trainings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateTraining = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/trainings/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteTraining = async (id: number) => {
  const res = await fetch(`${API_URL}/trainings/${id}`, { method: "DELETE" });
  return handleResponse(res);
};

// ==================== TEAMS ====================

export const getTeams = async () => {
  const res = await fetch(`${API_URL}/teams`);
  return handleResponse(res);
};

export const createTeam = async (data: any) => {
  const res = await fetch(`${API_URL}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const getTeamPlayers = async (teamId: number) => {
  const res = await fetch(`${API_URL}/teams/${teamId}/players`);
  return handleResponse(res);
};

// ==================== PLAYERS ====================

export const getPlayers = async () => {
  const res = await fetch(`${API_URL}/players`);
  return handleResponse(res);
};

export const getPlayerByUserId = async (userId: number) => {
  const res = await fetch(`${API_URL}/players/user/${userId}`);
  if (!res.ok) return null;
  return res.json();
};

export const createPlayerProfile = async (data: { user_id: number; team_id: number; position: string; jersey_number: number }) => {
  const res = await fetch(`${API_URL}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const createPlayerWithUser = async (data: { name: string; email: string; password: string; phone: string; team_id: number; position: string; jersey_number: number }) => {
  const res = await fetch(`${API_URL}/players/create-with-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deletePlayer = async (id: number) => {
  const res = await fetch(`${API_URL}/players/${id}`, { method: "DELETE" });
  return handleResponse(res);
};

export const updatePlayerStats = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/players/${id}/stats`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ==================== MATCHES ====================

export const getMatches = async () => {
  const res = await fetch(`${API_URL}/matches`);
  return handleResponse(res);
};

export const createMatch = async (data: any) => {
  const res = await fetch(`${API_URL}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updateMatch = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/matches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const deleteMatch = async (id: number) => {
  const res = await fetch(`${API_URL}/matches/${id}`, { method: "DELETE" });
  return handleResponse(res);
};

export const getMatchPlayerStats = async (matchId: number) => {
  const res = await fetch(`${API_URL}/matches/${matchId}/stats`);
  return handleResponse(res);
};

// ==================== PERFORMANCE ====================

export const getTeamPerformanceFromStats = async () => {
  const res = await fetch(`${API_URL}/performance/team-stats`);
  return handleResponse(res);
};

export const getPerformance = async () => {
  const res = await fetch(`${API_URL}/performance`);
  return handleResponse(res);
};

export const createPerformance = async (data: any) => {
  const res = await fetch(`${API_URL}/performance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

export const updatePerformance = async (id: number, data: any) => {
  const res = await fetch(`${API_URL}/performance/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ==================== ATTENDANCE ====================

export const getAttendanceForTraining = async (trainingId: number) => {
  const res = await fetch(`${API_URL}/attendance/training/${trainingId}`);
  return handleResponse(res);
};

export const setAttendance = async (training_id: number, player_id: number, status: string) => {
  const res = await fetch(`${API_URL}/attendance/set`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ training_id, player_id, status }),
  });
  return handleResponse(res);
};

export const getAttendanceStreak = async (playerId: number) => {
  const res = await fetch(`${API_URL}/attendance/streak/${playerId}`);
  return handleResponse(res);
};

// ==================== TRAINING SURVEYS ====================

export const createTrainingSurvey = async (training_id: number, player_id: number, satisfaction: string, suggestion?: string) => {
  const res = await fetch(`${API_URL}/training-surveys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ training_id, player_id, satisfaction, suggestion }),
  });
  return handleResponse(res);
};

export const getTrainingSurveys = async (trainingId: number) => {
  const res = await fetch(`${API_URL}/training-surveys/training/${trainingId}`);
  return handleResponse(res);
};

export const getPlayerSurvey = async (trainingId: number, playerId: number) => {
  const res = await fetch(`${API_URL}/training-surveys/training/${trainingId}/player/${playerId}`);
  if (!res.ok) return null;
  return res.json();
};

// ==================== STANDINGS ====================

export const getStandings = async (teamId?: number) => {
  const params = teamId ? `?team_id=${teamId}` : "";
  const res = await fetch(`${API_URL}/standings${params}`);
  return handleResponse(res);
};

export const saveMatchResult = async (data: any) => {
  const res = await fetch(`${API_URL}/matches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};

// ==================== STATS ====================

export const getStats = async () => {
  try {
    const [users, trainings, matches, players] = await Promise.all([
      getTeamUsers().catch(() => []),
      getTrainings().catch(() => []),
      getMatches().catch(() => []),
      getPlayers().catch(() => []),
    ]);
    const today = new Date().toISOString().split("T")[0];
    return {
      totalUsers: users.length || 0,
      totalTrainings: trainings.length || 0,
      upcomingTrainings: (trainings.filter((t: any) => t.date >= today) || []).length,
      totalMatches: matches.length || 0,
      totalPlayers: players.length || 0,
    };
  } catch (error) {
    console.error("Stats error:", error);
    return { totalUsers: 0, totalTrainings: 0, upcomingTrainings: 0, totalMatches: 0, totalPlayers: 0 };
  }
};
