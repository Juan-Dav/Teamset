import "./style.css";
import { getUsers, getTrainings } from "./api/api";

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

        <h2 class="text-xl font-semibold mb-2">Usuarios</h2>
        <ul class="mb-6 space-y-2">
          ${users.map((u: any) => `
            <li class="bg-gray-100 p-2 rounded">
              ${u.name} - ${u.email}
            </li>
          `).join("")}
        </ul>

        <h2 class="text-xl font-semibold mb-2">Entrenamientos</h2>
        <ul class="space-y-2">
          ${trainings.map((t: any) => `
            <li class="bg-gray-100 p-2 rounded">
              ${t.title} - ${t.date}
            </li>
          `).join("")}
        </ul>

      </div>
    </div>
  `;
};

loadData();