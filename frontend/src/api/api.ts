const API_URL = "http://localhost:3000/api";

// USERS
export const getUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
};

// TRAININGS
export const getTrainings = async () => {
  const res = await fetch(`${API_URL}/trainings`);
  return res.json();
};