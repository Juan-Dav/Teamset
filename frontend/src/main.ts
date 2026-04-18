import "./style.css";
import {
  getUsers,
  getTrainings,
  createUser,
  deleteUser,
  createTraining,
  deleteTraining,
  updateUser,
  updateTraining,
} from "./api/api";

const app = document.querySelector<HTMLDivElement>("#app")!;

const loadData = async () => {
  const users = await getUsers();
  const trainings = await getTrainings();

  app.innerHTML = `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-6">
        
        <h1 class="text-3xl font-bold mb-6 text-center">
          Sistema de Entrenamientos
        </h1>

        <!-- FORM USUARIO -->
        <h2 class="text-xl font-semibold mb-2">Crear Usuario</h2>
        <form id="userForm" class="mb-6 space-y-2">
          <input id="name" type="text" placeholder="Nombre" class="w-full p-2 border rounded" required />
          <input id="email" type="email" placeholder="Email" class="w-full p-2 border rounded" required />
          <button class="bg-blue-500 text-white px-4 py-2 rounded">
            Crear
          </button>
        </form>

        <!-- USERS -->
        <h2 class="text-xl font-semibold mb-2">Usuarios</h2>
        <ul class="mb-6 space-y-2">
          ${users.map((u: any) => `
            <li class="bg-gray-100 p-2 rounded flex justify-between items-center">
              <span>${u.name} - ${u.email}</span>
              <div class="flex gap-2">
                <button 
                  class="bg-yellow-500 text-white px-2 py-1 rounded"
                  onclick="editUserHandler(${u.id}, '${u.name}', '${u.email}')"
                >
                  Editar
                </button>
                <button 
                  class="bg-red-500 text-white px-2 py-1 rounded"
                  onclick="deleteUserHandler(${u.id})"
                >
                  Eliminar
                </button>
              </div>
            </li>
          `).join("")}
        </ul>

        <!-- FORM TRAINING -->
        <h2 class="text-xl font-semibold mb-2">Crear Entrenamiento</h2>
        <form id="trainingForm" class="mb-6 space-y-2">
          <input id="title" type="text" placeholder="Título" class="w-full p-2 border rounded" required />
          <input id="date" type="date" class="w-full p-2 border rounded" required />
          <button class="bg-green-500 text-white px-4 py-2 rounded">
            Crear
          </button>
        </form>

        <!-- TRAININGS -->
        <h2 class="text-xl font-semibold mb-2">Entrenamientos</h2>
        <ul class="space-y-2">
          ${trainings.map((t: any) => `
            <li class="bg-gray-100 p-2 rounded flex justify-between items-center">
              <span>${t.title} - ${t.date}</span>
              <div class="flex gap-2">
                <button 
                  class="bg-yellow-500 text-white px-2 py-1 rounded"
                  onclick="editTrainingHandler(${t.id}, '${t.title}', '${t.date}')"
                >
                  Editar
                </button>
                <button 
                  class="bg-red-500 text-white px-2 py-1 rounded"
                  onclick="deleteTrainingHandler(${t.id})"
                >
                  Eliminar
                </button>
              </div>
            </li>
          `).join("")}
        </ul>

      </div>
    </div>
  `;

  // FORM USER
  const userForm = document.getElementById("userForm") as HTMLFormElement;
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("name") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;

    await createUser({ name, email });
    loadData();
  });

  // FORM TRAINING
  const trainingForm = document.getElementById("trainingForm") as HTMLFormElement;
  trainingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = (document.getElementById("title") as HTMLInputElement).value;
    const date = (document.getElementById("date") as HTMLInputElement).value;

    await createTraining({ title, date });
    loadData();
  });
};

// DELETE
(window as any).deleteUserHandler = async (id: number) => {
  await deleteUser(id);
  loadData();
};

(window as any).deleteTrainingHandler = async (id: number) => {
  await deleteTraining(id);
  loadData();
};

// EDIT USER (prompt simple)
(window as any).editUserHandler = async (
  id: number,
  oldName: string,
  oldEmail: string
) => {
  const name = prompt("Nuevo nombre:", oldName);
  const email = prompt("Nuevo email:", oldEmail);

  if (name && email) {
    await updateUser(id, { name, email });
    loadData();
  }
};

// EDIT TRAINING
(window as any).editTrainingHandler = async (
  id: number,
  oldTitle: string,
  oldDate: string
) => {
  const title = prompt("Nuevo título:", oldTitle);
  const date = prompt("Nueva fecha (YYYY-MM-DD):", oldDate);

  if (title && date) {
    await updateTraining(id, { title, date });
    loadData();
  }
};

loadData();