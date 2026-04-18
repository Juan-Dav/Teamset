const API_URL = "http://localhost:3000/api";

// ==================== USERS ====================

// Obtener todos los usuarios
export const getUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
};

// Crear usuario
export const createUser = async (data: { name: string; email: string }) => {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// Eliminar usuario
export const deleteUser = async (id: number) => {
  await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });
};

// ==================== TRAININGS ====================

// Obtener todos los entrenamientos
export const getTrainings = async () => {
  const res = await fetch(`${API_URL}/trainings`);
  return res.json();
};

// Crear entrenamiento
export const createTraining = async (data: { title: string; date: string }) => {
  const res = await fetch(`${API_URL}/trainings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}; 

// Eliminar entrenamiento
export const deleteTraining = async (id: number) => {
  await fetch(`http://localhost:3000/api/trainings/${id}`, {
    method: "DELETE",
  });
};

// ==================== UPDATE ====================

// Actualizar usuario
export const updateUser = async (
  id: number,
  data: { name: string; email: string }
) => {
  const res = await fetch(`http://localhost:3000/api/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// Actualizar entrenamiento
export const updateTraining = async (
  id: number,
  data: { title: string; date: string }
) => {
  const res = await fetch(`http://localhost:3000/api/trainings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};