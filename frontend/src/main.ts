import "./style.css";
import {
  login,
  register,
  logout,
  getCurrentAuthUser,
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining as deleteTrainingApi,
  getStats,
  getTeams,
  createTeam,
  getTeamPlayers,
  getPlayers,
  getPlayerByUserId,
  createPlayerProfile,
  getMatches,
  createMatch,
  getPerformance,
  createPerformance,
  updateProfile,
  setAttendance,
  getAttendanceForTraining,
  createTrainingSurvey,
  getTrainingSurveys,
  getPlayerSurvey,
  updatePlayerStats as updatePlayerStatsApi,
} from "./api/api";

let activeDashboardTab: "overview" | "team" | "players" | "matches" | "trainings" | "attendance" | "performance" | "player-stats" | "surveys" = "overview";

let render: () => void;

// Global data
let globalTrainings: any[] = [];
let globalTeams: any[] = [];
let globalPlayers: any[] = [];
let globalMatches: any[] = [];
let globalPerformance: any[] = [];

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("es-ES", { year: "numeric", month: "short", day: "numeric" });
};


const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
  const existing = document.getElementById("toast");
  if (existing) existing.remove();
  const colors = { success: "bg-yellow-500 text-black", error: "bg-red-600 text-white", info: "bg-gray-700 text-white" };
  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const toast = document.createElement("div");
  toast.id = "toast";
  toast.className = `fixed top-6 right-6 ${colors[type]} px-5 py-3 rounded-lg shadow-2xl flex items-center gap-3 z-[100]`;
  toast.innerHTML = `<span class="text-lg font-bold">${icons[type]}</span><span class="font-medium">${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transform = "translateX(100%)"; setTimeout(() => toast.remove(), 300); }, 2500);
};

const showEditModal = (
  title: string,
  fields: { label: string; value: string; id: string; type?: string }[],
  onSave: (values: Record<string, string>) => void
) => {
  const existing = document.getElementById("modal-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
  const modal = document.createElement("div");
  modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto";
  modal.innerHTML = `
    <h3 class="text-xl font-bold text-yellow-500 mb-6">${title}</h3>
    <form id="edit-form" class="space-y-4">
      ${fields.map((f) => `<div><label class="block text-sm font-medium text-gray-300 mb-1.5">${f.label}</label><input id="${f.id}" type="${f.type || "text"}" value="${f.value}" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required /></div>`).join("")}
      <div class="flex gap-3 pt-4">
        <button type="button" id="modal-cancel" class="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium">Cancelar</button>
        <button type="submit" class="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold">Guardar</button>
      </div>
    </form>`;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("modal-cancel")?.addEventListener("click", () => overlay.remove());
  document.getElementById("edit-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const values: Record<string, string> = {};
    fields.forEach((f) => { values[f.id] = (document.getElementById(f.id) as HTMLInputElement).value; });
    onSave(values);
    overlay.remove();
  });
};

// ==================== AUTH ====================

const renderAuthForm = (isLogin: boolean) => {
  const app = document.querySelector<HTMLDivElement>("#app")!;
  app.innerHTML = `
    <div class="min-h-screen bg-black flex items-center justify-center p-4">
      <div class="absolute inset-0 overflow-hidden"><div class="absolute top-1/4 -left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div><div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div></div>
      <div class="relative w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mb-4 shadow-lg shadow-yellow-500/20">
            <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h1 class="text-4xl font-black text-white tracking-tight">Team<span class="text-yellow-500">Set</span></h1>
          <p class="text-gray-400 mt-2">Gestión de voleibol</p>
        </div>
        <div class="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <h2 class="text-2xl font-bold text-white mb-6">${isLogin ? "Bienvenido de nuevo" : "Crear cuenta"}</h2>
          <form id="auth-form" class="space-y-5">
            ${!isLogin ? '<div><label class="block text-sm font-medium text-gray-300 mb-2">Nombre completo</label><input id="auth-name" type="text" placeholder="Tu nombre" class="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required autocomplete="name" /></div><div><label class="block text-sm font-medium text-gray-300 mb-2">Teléfono</label><input id="auth-phone" type="tel" placeholder="Tu número celular" class="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" autocomplete="tel" /></div>' : ''}
            <div><label class="block text-sm font-medium text-gray-300 mb-2">Email</label><input id="auth-email" type="email" placeholder="ejemplo@correo.com" class="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required autocomplete="${isLogin ? 'username' : 'new-username'}" /></div>
            <div><label class="block text-sm font-medium text-gray-300 mb-2">Contraseña</label><input id="auth-password" type="password" placeholder="••••••••" class="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required autocomplete="${isLogin ? 'current-password' : 'new-password'}" /></div>
            <button type="submit" class="w-full py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold text-lg transition-colors shadow-lg shadow-yellow-500/20">${isLogin ? "Iniciar sesión" : "Registrarse"}</button>
          </form>
          <div class="mt-6 text-center"><p class="text-gray-400">${isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"} <a href="#" id="auth-toggle" class="text-yellow-500 font-semibold hover:underline">${isLogin ? "Regístrate" : "Inicia sesión"}</a></p></div>
        </div>
      </div>
    </div>`;

  document.getElementById("auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isLogin) {
      const email = (document.getElementById("auth-email") as HTMLInputElement).value;
      const password = (document.getElementById("auth-password") as HTMLInputElement).value;
      const result = await login(email, password);
      if (typeof result === "string") { showToast("Credenciales incorrectas", "error"); }
      else { showToast("Inicio de sesión exitoso"); activeDashboardTab = "overview"; render(); }
    } else {
      const name = (document.getElementById("auth-name") as HTMLInputElement).value;
      const email = (document.getElementById("auth-email") as HTMLInputElement).value;
      const password = (document.getElementById("auth-password") as HTMLInputElement).value;
      const phone = (document.getElementById("auth-phone") as HTMLInputElement)?.value || "";
      const result = await register(name, email, password, phone);
      if (typeof result === "string") { showToast(result, "error"); }
      else { showToast("Cuenta creada exitosamente"); activeDashboardTab = "overview"; render(); }
    }
  });

  document.getElementById("auth-toggle")?.addEventListener("click", (e) => { e.preventDefault(); renderAuthForm(!isLogin); });
};

// ==================== DASHBOARD ====================

const renderDashboard = async () => {
  const user = getCurrentAuthUser();
  if (!user) { renderAuthForm(true); return; }

  const stats = await getStats();
  const trainings = await getTrainings();
  const teams = await getTeams();
  const players = await getPlayers();
  const matches = await getMatches();
  const performance = await getPerformance();
  
  // Store globally for access in survey functions
  globalTrainings = trainings;
  globalTeams = teams;
  globalPlayers = players;
  globalMatches = matches;
  globalPerformance = performance;
  
  const today = new Date().toISOString().split("T")[0];
  const upcomingTrainings = trainings.filter((t: any) => t.date >= today).sort((a: any, b: any) => a.date.localeCompare(b.date));

  const app = document.querySelector<HTMLDivElement>("#app")!;

  app.innerHTML = `
    <div class="min-h-screen bg-black">
      <div class="flex min-h-screen">
        <!-- Sidebar -->
        <aside class="w-64 bg-gray-950 border-r border-gray-800 hidden lg:flex flex-col">
          <div class="p-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center"><svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
              <span class="text-xl font-black text-white">Team<span class="text-yellow-500">Set</span></span>
            </div>
          </div>
          <nav class="flex-1 px-3 space-y-1">
            ${[["overview", "Panel", "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"],
              ["team", "Equipo", "12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"],
              ["players", "Jugadores", "16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"],
              ["matches", "Partidos", "6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1zm-6 12V9a1 1 0 012 0v6a1 1 0 01-2 0zm4 0V9a1 1 0 012 0v6a1 1 0 01-2 0z"],
              ["trainings", "Entrenamientos", "9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"],
              ["attendance", "Asistencia", "9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"],
               ["player-stats", "Estadísticas", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"],
               ["performance", "Rendimiento", "15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"],
               ["surveys", "Encuestas", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"]
             ].map(([tab, label, path]) => {
               const isActive = activeDashboardTab === tab;
               return `<button onclick="window.switchTab('${tab}')" class="nav-btn w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "text-gray-400 hover:bg-gray-800 hover:text-white"}">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M${path}"/></svg>${label}
               </button>`;
             }).join("")}
           </nav>
          <div class="p-4 border-t border-gray-800">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold">${user.name.charAt(0).toUpperCase()}</div>
              <div class="flex-1 min-w-0"><p class="text-sm font-medium text-white truncate">${user.name}</p><p class="text-xs text-gray-500 truncate">${user.email}</p></div>
            </div>
            <button onclick="window.showEditProfile()" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>Mi perfil</button>
            <button onclick="window.doLogout()" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>Cerrar sesión</button>
          </div>
        </aside>

        <!-- Mobile Header -->
        <div class="lg:hidden fixed top-0 left-0 right-0 bg-gray-950 border-b border-gray-800 z-30 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2"><div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center"><svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><span class="text-lg font-black text-white">Team<span class="text-yellow-500">Set</span></span></div>
            <div class="flex items-center gap-3">
              <button onclick="window.showEditProfile()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
              <button onclick="window.doLogout()" class="text-gray-400 hover:text-white"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg></button>
            </div>
          </div>
        </div>

        <!-- Mobile Nav -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-30 px-2 py-2">
          <div class="flex justify-around">
            ${[["overview", "Panel", "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"],
              ["trainings", "Entrenamientos", "9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"],
              ["matches", "Partidos", "6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1zm-6 12V9a1 1 0 012 0v6a1 1 0 01-2 0zm4 0V9a1 1 0 012 0v6a1 1 0 01-2 0z"],
              ["player-stats", "Estadísticas", "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"],
               ["performance", "Rendimiento", "15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"],
               ["surveys", "Encuestas", "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"]
             ].map(([tab, label, path]) => {
              const isActive = activeDashboardTab === tab;
              return `<button onclick="window.switchTab('${tab}')" class="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs ${isActive ? "text-yellow-500" : "text-gray-500"}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M${path}"/></svg>${label}
              </button>`;
            }).join("")}
          </div>
        </div>

        <!-- Main Content -->
        <main class="flex-1 overflow-auto">
          <div class="p-4 lg:p-8 pt-20 lg:pt-8 pb-24 lg:pb-8">

            <!-- OVERVIEW -->
            <div id="tab-overview" class="${activeDashboardTab === "overview" ? "" : "hidden"}">
              <div class="mb-8"><h1 class="text-2xl lg:text-3xl font-bold text-white mb-1">Hola, ${user.name.split(" ")[0]}</h1><p class="text-gray-400">Resumen de tu equipo de voleibol</p></div>
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5"><div class="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-3"><svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div><p class="text-3xl font-bold text-white">${stats.totalUsers || 0}</p><p class="text-sm text-gray-400">Miembros</p></div>
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5"><div class="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-3"><svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg></div><p class="text-3xl font-bold text-white">${stats.totalPlayers || 0}</p><p class="text-sm text-gray-400">Jugadores</p></div>
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5"><div class="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-3"><svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg></div><p class="text-3xl font-bold text-white">${stats.totalTrainings || 0}</p><p class="text-sm text-gray-400">Entrenamientos</p></div>
                <div class="bg-gray-900 border border-gray-800 rounded-xl p-5"><div class="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-3"><svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 00-1-1zm-6 12V9a1 1 0 012 0v6a1 1 0 01-2 0zm4 0V9a1 1 0 012 0v6a1 1 0 01-2 0z"/></svg></div><p class="text-3xl font-bold text-white">${stats.totalMatches || 0}</p><p class="text-sm text-gray-400">Partidos</p></div>
              </div>
              <div class="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
                <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2"><div class="w-2 h-2 bg-yellow-500 rounded-full"></div>Próximos Entrenamientos</h2>
                ${upcomingTrainings.length === 0 ? '<p class="text-gray-500 text-center py-6">No hay entrenamientos próximos</p>' : `<div class="space-y-3">${upcomingTrainings.slice(0, 5).map((t: any) => `<div class="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"><div class="flex items-center gap-3"><div class="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center"><svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><div><p class="font-medium text-white">${t.title}</p><p class="text-sm text-gray-400">${formatDate(t.date)}</p></div></div></div>`).join("")}</div>`}
              </div>
            </div>

            <!-- TEAM -->
            <div id="tab-team" class="${activeDashboardTab === "team" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Equipos</h1><p class="text-gray-400">Gestiona los equipos</p></div>
                ${user.role === 'admin' ? `<button onclick="window.showAddTeam()" class="px-4 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Agregar</button>` : ''}
              </div>
              <div class="space-y-3">
                ${teams.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay equipos registrados</p></div>' : teams.map((t: any) => `
                  <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div class="flex items-center justify-between">
                      <div><h3 class="font-semibold text-white">${t.name}</h3><p class="text-sm text-gray-400">${t.category || ''} · ${t.coach_name || 'Sin entrenador'}</p></div>
                      ${user.role === 'admin' ? `<button onclick="window.viewTeamPlayers(${t.id})" class="px-3 py-1.5 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm hover:bg-yellow-500/20">Ver jugadores</button>` : ''}
                    </div>
                  </div>`).join('')}
              </div>
            </div>

            <!-- PLAYERS -->
            <div id="tab-players" class="${activeDashboardTab === "players" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Jugadores</h1><p class="text-gray-400">Estadísticas individuales de voleibol</p></div>
                ${user.role === 'admin' ? `<button onclick="window.showAddPlayer()" class="px-4 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Agregar</button>` : ''}
              </div>
              <div class="space-y-3">
                ${players.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay jugadores registrados</p></div>' : players.map((p: any) => `
                  <div class="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-yellow-500/30 transition-all">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-lg">${p.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div>
                          <h3 class="font-semibold text-white">${p.name || 'Sin nombre'}</h3>
                          <p class="text-sm text-gray-400">${p.position || 'Sin posición'} · #${p.jersey_number || '?'}</p>
                          ${p.phone ? `<p class="text-xs text-gray-500">📱 ${p.phone}</p>` : ''}
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="flex gap-2 text-xs">
                          <span class="px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md">Ataques: ${p.attacks || 0}</span>
                          <span class="px-2 py-1 bg-green-500/10 text-green-500 rounded-md">Bloqueos: ${p.blocks || 0}</span>
                          <span class="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-md">Saque: ${p.serves || 0}</span>
                        </div>
                        <p class="text-xs text-yellow-500 mt-1">🔥 Racha: ${p.attendance_streak || 0} días</p>
                      </div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>

            <!-- MATCHES -->
            <div id="tab-matches" class="${activeDashboardTab === "matches" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Partidos</h1><p class="text-gray-400">Gestiona los partidos de voleibol</p></div>
                ${user.role === 'admin' ? `<button onclick="window.showAddMatch()" class="px-4 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Agregar</button>` : ''}
              </div>
              <div class="space-y-3">
                ${matches.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay partidos registrados</p></div>' : matches.map((m: any) => `
                  <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="font-semibold text-white">vs ${m.opponent}</h3>
                        <p class="text-sm text-gray-400">${formatDate(m.match_date)} · ${m.location || 'Sin ubicación'}</p>
                      </div>
                      <div class="text-right">
                        <span class="px-3 py-1 rounded-lg text-sm font-bold ${m.result === 'win' ? 'bg-green-500/20 text-green-500' : m.result === 'loss' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'}">${m.result === 'win' ? 'Victoria' : m.result === 'loss' ? 'Derrota' : 'Empate'}</span>
                        <p class="text-xs text-gray-400 mt-1">Sets: ${m.sets_won || 0}-${m.sets_lost || 0}</p>
                      </div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>

             <!-- TRAININGS -->
            <div id="tab-trainings" class="${activeDashboardTab === "trainings" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Entrenamientos</h1><p class="text-gray-400">Planifica y gestiona los entrenamientos</p></div>
                ${user.role === 'admin' ? `<button onclick="window.showAddTraining()" class="px-4 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Agregar</button>` : ''}
              </div>
              <div class="space-y-3">
                ${trainings.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay entrenamientos registrados</p></div>' : trainings.map((t: any) => {
                  const isPast = new Date(t.date) < new Date(today);
                  return `<div class="bg-gray-900 border border-gray-800 hover:border-yellow-500/30 rounded-xl p-5 transition-all">
                    <div class="flex items-start justify-between">
                      <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                        <div>
                          <h3 class="font-semibold text-white">${t.title}</h3>
                          <p class="text-sm text-gray-400 mt-1">${formatDate(t.date)}</p>
                        </div>
                      </div>
                      ${user.role === 'admin' ? `<div class="flex gap-2">
                        <button onclick="window.showEditTraining(${t.id}, '${(t.title || '').replace(/'/g, "\\'")}', '${(t.date || '').replace(/'/g, "\\'")}', ${t.team_id || 'null'}, '${(t.survey_question || '').replace(/'/g, "\\'")}')" class="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-sm hover:bg-blue-500/20">Editar</button>
                        <button onclick="window.deleteTraining(${t.id})" class="px-3 py-1.5 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20">Eliminar</button>
                      </div>` : ''}
                    </div>
                  </div>`;
                }).join("")}
              </div>
            </div>

            <!-- ATTENDANCE -->
            <div id="tab-attendance" class="${activeDashboardTab === "attendance" ? "" : "hidden"}">
              <div class="mb-6"><h1 class="text-2xl font-bold text-white mb-1">Asistencia</h1><p class="text-gray-400">Confirma tu asistencia a los entrenamientos</p></div>
              ${trainings.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay entrenamientos registrados</p></div>' : `<div class="space-y-4" id="attendance-list">${trainings.map((t: any) => {
                const isPast = new Date(t.date) < new Date(today);
                return `<div class="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden" data-training-id="${t.id}">
                  <div class="p-5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${isPast ? "bg-gray-800" : "bg-yellow-500/20"} rounded-lg flex items-center justify-center"><svg class="w-5 h-5 ${isPast ? "text-gray-600" : "text-yellow-500"}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                        <div><h3 class="font-semibold text-white">${t.title}</h3><p class="text-sm text-gray-400">${formatDate(t.date)}</p></div>
                      </div>
                      ${!isPast ? `<button onclick="window.confirmAttendance(${t.id})" class="confirm-btn px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold text-sm">Confirmar asistencia</button>` : '<span class="text-sm text-gray-500">Entrenamiento finalizado</span>'}
                    </div>
                    <div class="mt-3 attendance-status" id="status-${t.id}"></div>
                  </div>
                </div>`;
              }).join("")}</div>`}
            </div>

            <!-- PERFORMANCE -->
            <div id="tab-performance" class="${activeDashboardTab === "performance" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Rendimiento del Equipo (FIVB)</h1><p class="text-gray-400">Eficiencia calculada según estándares FIVB</p></div>
                ${user.role === 'admin' ? `<button onclick="window.showAddPerformance()" class="px-4 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Agregar</button>` : ''}
              </div>
              <div class="space-y-4">
                ${performance.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay registros de rendimiento</p></div>' : performance.map((p: any) => `
                  <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h3 class="font-semibold text-white">${p.team_name || 'Equipo'}</h3>
                        <p class="text-sm text-gray-400">${formatDate(p.performance_date)}</p>
                      </div>
                      <div class="text-right">
                        <p class="text-2xl font-bold text-yellow-500">${parseFloat(p.overall_rating || 0).toFixed(1)}%</p>
                        <p class="text-xs text-gray-400">Eficiencia general</p>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                      <div class="bg-gray-800/50 rounded-lg p-3 text-center"><p class="text-xs text-gray-400">Eficiencia Ataque</p><p class="text-lg font-bold text-white">${parseFloat(p.attack_efficiency || 0).toFixed(1)}%</p><p class="text-xs text-gray-500">(${p.successful_attacks || 0}/${p.total_attacks || 0})</p></div>
                      <div class="bg-gray-800/50 rounded-lg p-3 text-center"><p class="text-xs text-gray-400">Eficiencia Saque</p><p class="text-lg font-bold text-white">${parseFloat(p.serve_efficiency || 0).toFixed(1)}%</p><p class="text-xs text-gray-500">(${p.aces || 0} aces - ${p.serve_errors || 0} errores)</p></div>
                      <div class="bg-gray-800/50 rounded-lg p-3 text-center"><p class="text-xs text-gray-400">Eficiencia Bloqueo</p><p class="text-lg font-bold text-white">${parseFloat(p.block_efficiency || 0).toFixed(1)}%</p><p class="text-xs text-gray-500">(${p.successful_blocks || 0}/${p.total_blocks || 0})</p></div>
                    </div>
                    ${p.notes ? `<p class="text-sm text-gray-400 mt-3 italic">${p.notes}</p>` : ''}
                  </div>`).join('')}
              </div>
            </div>

            <!-- SURVEYS -->
            <div id="tab-surveys" class="${activeDashboardTab === "surveys" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Encuestas</h1><p class="text-gray-400">${user.role === 'admin' ? 'Crea y gestiona encuestas para los entrenamientos' : 'Responde las encuestas disponibles'}</p></div>
                ${user.role === 'admin' ? `<button onclick="window.showCreateSurveyForTraining()" class="px-4 py-2.5 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold flex items-center gap-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>Crear Encuesta</button>` : ''}
              </div>
              <div class="space-y-4">
                ${trainings.filter((t: any) => t.survey_question).length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay encuestas disponibles</p></div>' : trainings.filter((t: any) => t.survey_question).map((t: any) => {
                  const isPast = t.date < today;
                  return `<div class="bg-gray-900 border ${isPast ? 'border-gray-800' : 'border-yellow-500/30'} rounded-xl p-5">
                    <div class="flex items-center justify-between mb-4">
                      <div>
                        <h3 class="font-semibold text-white">${t.title}</h3>
                        <p class="text-sm text-gray-400">${formatDate(t.date)}</p>
                      </div>
                      <div class="flex gap-2">
                        ${user.role === 'admin' ? `<button onclick="window.editSurveyQuestion(${t.id})" class="px-3 py-1.5 bg-purple-500/10 text-purple-500 rounded-lg text-sm hover:bg-purple-500/20">Editar</button>` : ''}
                        ${user.role === 'admin' ? `<button onclick="window.viewSurveyResults(${t.id})" class="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-sm hover:bg-blue-500/20">Ver Resultados</button>` : ''}
                        ${user.role === 'player' ? `<button onclick="window.respondToSurvey(${t.id})" class="px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-sm hover:bg-green-500/20">Responder</button>` : ''}
                      </div>
                    </div>
                    <div class="bg-gray-800/50 rounded-lg p-4">
                      <p class="text-yellow-500 font-medium">${t.survey_question}</p>
                    </div>
                  </div>`;
                }).join("")}
              </div>
            </div>

            <!-- PLAYER STATS (Individual) -->
            <div id="tab-player-stats" class="${activeDashboardTab === "player-stats" ? "" : "hidden"}">
              <div class="flex items-center justify-between mb-6">
                <div><h1 class="text-2xl font-bold text-white mb-1">Estadísticas Individuales</h1><p class="text-gray-400">Rendimiento FIVB por jugador</p></div>
              </div>
              <div class="space-y-3">
                ${players.length === 0 ? '<div class="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center"><p class="text-gray-500">No hay jugadores registrados</p></div>' : players.map((p: any) => `
                  <div class="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-lg">${p.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div>
                          <h3 class="font-semibold text-white">${p.name || 'Sin nombre'}</h3>
                          <p class="text-sm text-gray-400">${p.position || 'Sin posición'} · #${p.jersey_number || '?'}</p>
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div class="bg-blue-500/10 px-2 py-1 rounded"><span class="text-blue-500 font-bold">${parseFloat(p.attack_efficiency || 0).toFixed(1)}%</span><br>Ataque</div>
                          <div class="bg-green-500/10 px-2 py-1 rounded"><span class="text-green-500 font-bold">${parseFloat(p.block_efficiency || 0).toFixed(1)}%</span><br>Bloqueo</div>
                          <div class="bg-purple-500/10 px-2 py-1 rounded"><span class="text-purple-500 font-bold">${parseFloat(p.serve_efficiency || 0).toFixed(1)}%</span><br>Saque</div>
                        </div>
                        ${user.role === 'admin' ? `<button onclick="window.showEditPlayerStats(${p.id}, ${p.attacks || 0}, ${p.blocks || 0}, ${p.serves || 0})" class="px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-sm hover:bg-blue-500/20">Editar stats</button>` : ''}
                      </div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>`;
};

// ==================== ACTIONS ====================

(window as any).switchTab = (tab: string) => { 
  activeDashboardTab = tab as typeof activeDashboardTab; 
  render(); 
  if (tab === 'attendance') {
    setTimeout(() => loadAttendanceStatus(), 500);
  }
};

(window as any).confirmAttendance = async (trainingId: number) => {
  const user = getCurrentAuthUser();
  if (!user) return;  
  try {
    const player = await getPlayerByUserId(user.id);
    if (!player) {
      showToast("No se encontró tu perfil de jugador", "error");
      return;
    }
    
    await setAttendance(trainingId, player.id, 'attending');
    
    // Update button state
    const btn = document.querySelector(`[onclick="window.confirmAttendance(${trainingId})"]`) as HTMLButtonElement;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "✓ Confirmado";
      btn.classList.remove("bg-yellow-500", "hover:bg-yellow-400");
      btn.classList.add("bg-green-600", "cursor-not-allowed");
    }
    
    // Update status display
    const statusDiv = document.getElementById(`status-${trainingId}`);
    if (statusDiv) {
      statusDiv.innerHTML = '<p class="text-sm text-green-500 font-medium">✓ Asistencia confirmada - Racha actualizada</p>';
    }
    
    showToast("Asistencia confirmada. ¡Racha actualizada!");
    
    // Refresh to update streak display
    setTimeout(() => render(), 1000);
  } catch (error: any) {
    showToast(error.message || "Error al confirmar asistencia", "error");
  }
};

(window as any).submitSurvey = async (trainingId: number, satisfaction: string, suggestion: string = "") => {
  const user = getCurrentAuthUser();
  if (!user) return;
  try {
    const player = await getPlayerByUserId(user.id);
    if (!player) {
      showToast("No se encontró tu perfil de jugador", "error");
      return;
    }
    await createTrainingSurvey(trainingId, player.id, satisfaction, suggestion);
    showToast("Encuesta enviada exitosamente");
    const overlay = document.querySelector('.fixed');
    if (overlay) overlay.remove();
    setTimeout(() => render(), 500);
  } catch (error: any) {
    showToast(error.message || "Error al enviar encuesta", "error");
  }
};

(window as any).showCreateSurveyForTraining = () => {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
  const modal = document.createElement("div");
  modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl";
  modal.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-yellow-500">Crear Encuesta</h3>
      <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
    </div>
    <form id="survey-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Entrenamiento</label>
        <select id="survey-training-select" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none">
          <option value="">Selecciona un entrenamiento</option>
          ${globalTrainings.map((t: any) => `<option value="${t.id}">${t.title} - ${formatDate(t.date)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Pregunta de la encuesta</label>
        <input id="survey-question-input" type="text" placeholder="¿Qué te pareció el entrenamiento?" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium">Cancelar</button>
        <button type="submit" class="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold">Crear</button>
      </div>
    </form>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("survey-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const trainingId = parseInt((document.getElementById("survey-training-select") as HTMLSelectElement).value);
    const question = (document.getElementById("survey-question-input") as HTMLInputElement).value.trim();
    if (!trainingId || !question) {
      showToast("Completa todos los campos", "error");
      return;
    }
    await updateTraining(trainingId, { survey_question: question });
    showToast("Encuesta creada");
    overlay.remove();
    render();
  });
};

(window as any).editSurveyQuestion = (trainingId: number) => {
  const training = globalTrainings.find((t: any) => t.id === trainingId);
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
  const modal = document.createElement("div");
  modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl";
  modal.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-yellow-500">Editar Encuesta</h3>
      <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
    </div>
    <form id="edit-survey-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Pregunta de la encuesta</label>
        <input id="edit-survey-question" type="text" value="${training?.survey_question || ''}" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required />
      </div>
      <div class="flex gap-3 pt-4">
        <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium">Cancelar</button>
        <button type="submit" class="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold">Guardar</button>
      </div>
    </form>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("edit-survey-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const question = (document.getElementById("edit-survey-question") as HTMLInputElement).value.trim();
    await updateTraining(trainingId, { survey_question: question || null });
    showToast("Encuesta actualizada");
    overlay.remove();
    render();
  });
};

(window as any).viewSurveyResults = async (trainingId: number) => {
  try {
    const surveys = await getTrainingSurveys(trainingId);
    const training = globalTrainings.find((t: any) => t.id === trainingId);
    const happy = surveys.filter((s: any) => s.satisfaction === 'happy').length;
    const neutral = surveys.filter((s: any) => s.satisfaction === 'neutral').length;
    const sad = surveys.filter((s: any) => s.satisfaction === 'sad').length;
    const total = surveys.length;
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
    const modal = document.createElement("div");
    modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl max-h-[90vh] overflow-y-auto";
    modal.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-yellow-500">Resultados de Encuesta</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
      </div>
      <div class="mb-6">
        <p class="text-white font-medium mb-2">${training?.survey_question || 'Sin pregunta'}</p>
        <p class="text-sm text-gray-400">Total de respuestas: ${total}</p>
      </div>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-800/50 rounded-xl p-4 text-center">
          <div class="w-16 h-16 rounded-full border-4 border-green-500 mx-auto mb-2 flex items-center justify-center">
            <span class="text-3xl">😊</span>
          </div>
          <p class="text-green-500 font-bold text-lg">${happy}</p>
          <p class="text-xs text-gray-400">Me gustó</p>
        </div>
        <div class="bg-gray-800/50 rounded-xl p-4 text-center">
          <div class="w-16 h-16 rounded-full border-4 border-yellow-500 mx-auto mb-2 flex items-center justify-center">
            <span class="text-3xl">😐</span>
          </div>
          <p class="text-yellow-500 font-bold text-lg">${neutral}</p>
          <p class="text-xs text-gray-400">Más o menos</p>
        </div>
        <div class="bg-gray-800/50 rounded-xl p-4 text-center">
          <div class="w-16 h-16 rounded-full border-4 border-red-500 mx-auto mb-2 flex items-center justify-center">
            <span class="text-3xl">😢</span>
          </div>
          <p class="text-red-500 font-bold text-lg">${sad}</p>
          <p class="text-xs text-gray-400">No gustó</p>
        </div>
      </div>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <h4 class="text-sm font-medium text-gray-300 mb-2">Sugerencias:</h4>
        ${surveys.filter((s: any) => s.suggestion).map((s: any) => `
          <div class="bg-gray-800/30 rounded-lg p-3 text-sm">
            <p class="text-gray-300">${s.suggestion}</p>
            <p class="text-xs text-gray-500 mt-1">Jugador ID: ${s.player_id}</p>
          </div>
        `).join('') || '<p class="text-gray-500 text-sm">No hay sugerencias</p>'}
      </div>
      <div class="mt-6 space-y-2 max-h-48 overflow-y-auto">
        <h4 class="text-sm font-medium text-gray-300 mb-2">Todas las respuestas:</h4>
        ${surveys.map((s: any) => {
          const label = s.satisfaction === 'happy' ? 'Me gustó' : s.satisfaction === 'neutral' ? 'Más o menos' : 'No gustó';
          const color = s.satisfaction === 'happy' ? 'text-green-500' : s.satisfaction === 'neutral' ? 'text-yellow-500' : 'text-red-500';
          return `<div class="flex items-center justify-between bg-gray-800/30 rounded p-2 text-sm">
            <span class="text-gray-300">Jugador ID: ${s.player_id}</span>
            <span class="${color} font-medium">${label}</span>
          </div>`;
        }).join('')}
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  } catch (error: any) {
    showToast(error.message || "Error al cargar resultados", "error");
  }
};

(window as any).respondToSurvey = async (trainingId: number) => {
  const user = getCurrentAuthUser();
  if (!user) return;
  try {
    const player = await getPlayerByUserId(user.id);
    if (!player) {
      showToast("No se encontró tu perfil de jugador", "error");
      return;
    }
    const training = globalTrainings.find((t: any) => t.id === trainingId);
    const existingSurvey = await getPlayerSurvey(trainingId, player.id);
    
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
    const modal = document.createElement("div");
    modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-lg mx-4 shadow-2xl";
    modal.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-yellow-500">Responder Encuesta</h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
      </div>
      <p class="text-white font-medium mb-6">${training?.survey_question || 'Sin pregunta'}</p>
      <form id="survey-response-form" class="space-y-6">
        <div>
          <p class="text-sm text-gray-300 mb-4">Califica el entrenamiento:</p>
          <div class="grid grid-cols-3 gap-4">
            <button type="button" onclick="window.selectSatisfaction('happy')" class="satisfaction-btn flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 border-2 border-transparent" data-satisfaction="happy">
              <div class="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span class="text-green-500 text-2xl">😊</span>
              </div>
              <span class="text-sm text-gray-300">Me gustó</span>
            </button>
            <button type="button" onclick="window.selectSatisfaction('neutral')" class="satisfaction-btn flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 border-2 border-transparent" data-satisfaction="neutral">
              <div class="w-16 h-16 rounded-full border-4 border-yellow-500 flex items-center justify-center">
                <span class="text-yellow-500 text-2xl">😐</span>
              </div>
              <span class="text-sm text-gray-300">Más o menos</span>
            </button>
            <button type="button" onclick="window.selectSatisfaction('sad')" class="satisfaction-btn flex flex-col items-center gap-2 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 border-2 border-transparent" data-satisfaction="sad">
              <div class="w-16 h-16 rounded-full border-4 border-red-500 flex items-center justify-center">
                <span class="text-red-500 text-2xl">😢</span>
              </div>
              <span class="text-sm text-gray-300">No gustó</span>
            </button>
          </div>
          <input type="hidden" id="selected-satisfaction" value="${existingSurvey?.satisfaction || ''}" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">Sugerencia (opcional)</label>
          <textarea id="survey-suggestion" rows="3" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none" placeholder="Escribe tu sugerencia...">${existingSurvey?.suggestion || ''}</textarea>
        </div>
        <div class="flex gap-3">
          <button type="button" onclick="this.closest('.fixed').remove()" class="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-800 font-medium">Cancelar</button>
          <button type="submit" class="flex-1 px-4 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold">Enviar</button>
        </div>
      </form>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
    
    // Mark existing selection
    if (existingSurvey?.satisfaction) {
      const btn = modal.querySelector(`[data-satisfaction="${existingSurvey.satisfaction}"]`);
      if (btn) btn.classList.add('border-yellow-500', 'bg-yellow-500/10');
    }
    
    (window as any).selectSatisfaction = (value: string) => {
      (document.getElementById('selected-satisfaction') as HTMLInputElement).value = value;
      modal.querySelectorAll('.satisfaction-btn').forEach(btn => {
        btn.classList.remove('border-yellow-500', 'bg-yellow-500/10');
      });
      const selectedBtn = modal.querySelector(`[data-satisfaction="${value}"]`);
      if (selectedBtn) selectedBtn.classList.add('border-yellow-500', 'bg-yellow-500/10');
    };
    
    document.getElementById('survey-response-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const satisfaction = (document.getElementById('selected-satisfaction') as HTMLInputElement).value;
      const suggestion = (document.getElementById('survey-suggestion') as HTMLTextAreaElement).value.trim();
      if (!satisfaction) {
        showToast("Selecciona una calificación", "error");
        return;
      }
      await submitSurvey(trainingId, satisfaction, suggestion);
    });
  } catch (error: any) {
    showToast(error.message || "Error al cargar encuesta", "error");
  }
};

(window as any).submitSurveyFromModal = async (trainingId: number, satisfaction: string) => {
  const user = getCurrentAuthUser();
  if (!user) return;  
  try {
    const player = await getPlayerByUserId(user.id);
    if (!player) {
      showToast("No se encontró tu perfil de jugador", "error");
      return;
    }
    
    await createTrainingSurvey(trainingId, player.id, satisfaction);
    
    const emoji = satisfaction === 'happy' ? '😊' : satisfaction === 'neutral' ? '😐' : '😢';
    showToast(`Encuesta enviada: ${emoji}`);
    
    const overlay = document.querySelector('.fixed');
    if (overlay) overlay.remove();
    setTimeout(() => render(), 500);
  } catch (error: any) {
    showToast(error.message || "Error al enviar encuesta", "error");
  }
};

const loadAttendanceStatus = async () => {
  const user = getCurrentAuthUser();
  if (!user || user.role !== 'player') return;
  
  try {
    const player = await getPlayerByUserId(user.id);
    if (!player) return;
    
    // Get all trainings and check attendance status
    const trainings = await getTrainings();
    for (const training of trainings) {
      const attendance = await getAttendanceForTraining(training.id);
      const playerAttendance = attendance.find((a: any) => a.player_id === player.id);
      
      if (playerAttendance && playerAttendance.status === 'attending') {
        const btn = document.querySelector(`[onclick="window.confirmAttendance(${training.id})"]`) as HTMLButtonElement;
        if (btn) {
          btn.disabled = true;
          btn.textContent = "✓ Confirmado";
          btn.classList.remove("bg-yellow-500", "hover:bg-yellow-400");
          btn.classList.add("bg-green-600", "cursor-not-allowed");
        }
        
        const statusDiv = document.getElementById(`status-${training.id}`);
        if (statusDiv) {
          statusDiv.innerHTML = '<p class="text-sm text-green-500 font-medium">✓ Asistencia confirmada</p>';
        }
      }
    }
  } catch (error) {
    console.error("Error loading attendance status:", error);
  }
};

(window as any).doLogout = () => { 
  logout(); 
  showToast("Sesión cerrada", "info"); 
  renderAuthForm(true); 
};

(window as any).showEditProfile = () => {
  const user = getCurrentAuthUser();
  if (!user) return;
  showEditModal("Mi Perfil", [
    { label: "Nombre", value: user.name || "", id: "edit-name" },
    { label: "Email", value: user.email || "", id: "edit-email" },
    { label: "Teléfono", value: user.phone || "", id: "edit-phone" },
    { label: "Nueva contraseña (opcional)", value: "", id: "edit-password", type: "password" }
  ], async (v) => { 
    const data: any = { name: v["edit-name"], email: v["edit-email"], phone: v["edit-phone"] };
    if (v["edit-password"]) data.password = v["edit-password"];
    await updateProfile(user.id, data); 
    showToast("Perfil actualizado"); 
    render(); 
  });
};

(window as any).showAddTeam = () => {
  showEditModal("Nuevo Equipo", [
    { label: "Nombre", value: "", id: "team-name" },
    { label: "Categoría", value: "", id: "team-category" },
    { label: "Entrenador", value: "", id: "team-coach" }
  ], async (v) => { 
    await createTeam({ name: v["team-name"], category: v["team-category"], coach_name: v["team-coach"] }); 
    showToast("Equipo creado"); 
    render(); 
  });
};

(window as any).showAddPlayer = () => {
  showEditModal("Nuevo Jugador", [
    { label: "ID de Usuario", value: "", id: "player-user-id" },
    { label: "ID de Equipo", value: "", id: "player-team-id" },
    { label: "Posición", value: "", id: "player-position" },
    { label: "Número de camiseta", value: "", id: "player-jersey", type: "number" }
  ], async (v) => { 
    await fetch("http://localhost:3000/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        user_id: parseInt(v["player-user-id"]), 
        team_id: parseInt(v["player-team-id"]), 
        position: v["player-position"], 
        jersey_number: parseInt(v["player-jersey"]) 
      })
    }); 
    showToast("Jugador creado"); 
    render(); 
  });
};

(window as any).showAddMatch = () => {
  showEditModal("Nuevo Partido", [
    { label: "ID del Equipo", value: "", id: "match-team-id" },
    { label: "Oponente", value: "", id: "match-opponent" },
    { label: "Fecha", value: "", id: "match-date", type: "date" },
    { label: "Sets ganados", value: "0", id: "match-sets-won", type: "number" },
    { label: "Sets perdidos", value: "0", id: "match-sets-lost", type: "number" },
    { label: "Ubicación", value: "", id: "match-location" },
    { label: "Resultado (win/loss/draw)", value: "win", id: "match-result" }
  ], async (v) => { 
    await createMatch({ 
      team_id: parseInt(v["match-team-id"]), 
      opponent: v["match-opponent"], 
      match_date: v["match-date"],
      sets_won: parseInt(v["match-sets-won"]),
      sets_lost: parseInt(v["match-sets-lost"]),
      result: v["match-result"],
      location: v["match-location"]
    }); 
    showToast("Partido creado"); 
    render(); 
  });
};

(window as any).showAddTraining = () => {
  showEditModal("Nuevo Entrenamiento", [
    { label: "Título", value: "", id: "new-title" },
    { label: "Fecha", value: "", id: "new-date", type: "date" },
    { label: "ID del Equipo", value: "", id: "new-team-id" },
    { label: "Pregunta para encuesta (opcional)", value: "", id: "new-survey-question" }
  ], async (v) => { 
    await createTraining({ title: v["new-title"], date: v["new-date"], team_id: v["new-team-id"] ? parseInt(v["new-team-id"]) : null, survey_question: v["new-survey-question"] || null }); 
    showToast("Entrenamiento creado"); 
    render(); 
  });
};

(window as any).showEditTraining = (id: number, title: string, date: string, teamId: any, surveyQuestion: string = "") => {
  showEditModal("Editar Entrenamiento", [
    { label: "Título", value: title, id: "edit-title" },
    { label: "Fecha", value: date, id: "edit-date", type: "date" },
    { label: "ID del Equipo", value: teamId || "", id: "edit-team-id" },
    { label: "Pregunta para encuesta", value: surveyQuestion || "", id: "edit-survey-question" }
  ], async (v) => { 
    await updateTraining(id, { title: v["edit-title"], date: v["edit-date"], team_id: v["edit-team-id"] ? parseInt(v["edit-team-id"]) : null, survey_question: v["edit-survey-question"] || null }); 
    showToast("Entrenamiento actualizado"); 
    render(); 
  });
};

(window as any).deleteTraining = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar este entrenamiento?")) return;
  try {
    await deleteTrainingApi(id);
    showToast("Entrenamiento eliminado", "info");
    render();
  } catch (error: any) {
    showToast(error.message || "Error al eliminar", "error");
  }
};

(window as any).showEditPlayerStats = (playerId: number, attacks: number, blocks: number, serves: number) => {
  showEditModal("Editar Estadísticas", [
    { label: "Ataques totales", value: attacks.toString(), id: "edit-attacks", type: "number" },
    { label: "Bloqueos totales", value: blocks.toString(), id: "edit-blocks", type: "number" },
    { label: "Saque totales", value: serves.toString(), id: "edit-serves", type: "number" }
  ], async (v) => { 
    await updatePlayerStatsApi(playerId, { 
      attacks: parseInt(v["edit-attacks"]), 
      blocks: parseInt(v["edit-blocks"]), 
      serves: parseInt(v["edit-serves"]) 
    }); 
    showToast("Estadísticas actualizadas"); 
    render(); 
  });
};

(window as any).showAddPerformance = () => {
  showEditModal("Nuevo Registro de Rendimiento", [
    { label: "ID del Equipo", value: "", id: "perf-team-id" },
    { label: "Fecha", value: "", id: "perf-date", type: "date" },
    { label: "Rendimiento en Campo (1-10)", value: "5", id: "perf-court", type: "number" },
    { label: "Rendimiento en Saque (1-10)", value: "5", id: "perf-serve", type: "number" },
    { label: "Rendimiento en Ataque (1-10)", value: "5", id: "perf-attack", type: "number" },
    { label: "Rendimiento en Bloqueo (1-10)", value: "5", id: "perf-block", type: "number" },
    { label: "Rendimiento en Defensa (1-10)", value: "5", id: "perf-defense", type: "number" },
    { label: "Notas", value: "", id: "perf-notes" }
  ], async (v) => { 
    await createPerformance({ 
      team_id: parseInt(v["perf-team-id"]), 
      performance_date: v["perf-date"],
      court_performance: parseInt(v["perf-court"]),
      serve_performance: parseInt(v["perf-serve"]),
      attack_performance: parseInt(v["perf-attack"]),
      block_performance: parseInt(v["perf-block"]),
      defense_performance: parseInt(v["perf-defense"]),
      notes: v["perf-notes"]
    }); 
    showToast("Rendimiento registrado"); 
    render(); 
  });
};

(window as any).viewTeamPlayers = async (teamId: number) => {
  const players = await getTeamPlayers(teamId);
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
  const modal = document.createElement("div");
  modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto";
  modal.innerHTML = `
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-yellow-500">Jugadores del Equipo</h3>
      <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white">✕</button>
    </div>
    <div class="space-y-3">
      ${players.length === 0 ? '<p class="text-gray-500 text-center py-6">No hay jugadores en este equipo</p>' : players.map((p: any) => `
        <div class="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold">${p.name?.charAt(0).toUpperCase() || '?'}</div>
            <div>
              <p class="font-medium text-white">${p.name || 'Sin nombre'}</p>
              <p class="text-sm text-gray-400">${p.position || 'Sin posición'} · #${p.jersey_number || '?'}</p>
            </div>
          </div>
          <div class="text-right text-xs">
            <p class="text-yellow-500">🔥 Racha: ${p.attendance_streak || 0}</p>
            <p class="text-gray-400">Ataques: ${p.attacks || 0}</p>
          </div>
        </div>`).join('')}
    </div>`;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
};

// ==================== INIT ====================

const showCompletePlayerModal = (user: any, player: any = null) => {
  const overlay = document.createElement("div");
  overlay.id = "player-modal-overlay";
  overlay.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";

  const modal = document.createElement("div");
  modal.className = "bg-gray-900 border border-yellow-500/30 rounded-xl p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto";
  modal.innerHTML = `
    <div class="text-center mb-6">
      <div class="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mb-4">
        <svg class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      </div>
      <h3 class="text-2xl font-bold text-yellow-500 mb-2">Completa tu registro</h3>
      <p class="text-gray-400">Regístrate como jugador para continuar</p>
    </div>
    <form id="player-form" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Nombre del jugador</label>
        <input id="player-name" type="text" value="${user.name}" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Equipo</label>
        <select id="player-team-id" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required>
          <option value="">Selecciona un equipo</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Posición</label>
        <select id="player-position" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required>
          <option value="">Selecciona posición</option>
          <option value="Colocador">Colocador</option>
          <option value="Atacante externo">Atacante externo</option>
          <option value="Atacante opuesto">Atacante opuesto</option>
          <option value="Central">Central</option>
          <option value="Libero">Libero</option>
          <option value="Líbero">Líbero</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-1.5">Número de camiseta</label>
        <input id="player-jersey" type="number" min="1" max="99" placeholder="Ej: 10" value="${player?.jersey_number || ''}" class="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none" required />
      </div>
      <button type="submit" class="w-full py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold text-lg transition-colors shadow-lg shadow-yellow-500/20">Completar registro</button>
    </form>`;  
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  getTeams().then((teams: any[]) => {
    const teamSelect = document.getElementById("player-team-id") as HTMLSelectElement;
    if (teamSelect) {
      teams.forEach((t: any) => {
        const opt = document.createElement("option");
        opt.value = t.id;
        opt.textContent = t.name;
        opt.selected = player?.team_id === t.id;
        teamSelect.appendChild(opt);
      });
    }
  }).catch(() => {});
  
  if (player) {
    const positionSelect = document.getElementById("player-position") as HTMLSelectElement;
    if (positionSelect) positionSelect.value = player.position || "";
  }

  document.getElementById("player-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (document.getElementById("player-name") as HTMLInputElement).value.trim();
    const teamId = parseInt((document.getElementById("player-team-id") as HTMLSelectElement).value);
    const position = (document.getElementById("player-position") as HTMLSelectElement).value;
    const jerseyNumber = parseInt((document.getElementById("player-jersey") as HTMLInputElement).value);
    
    if (!name || !teamId || !position || !jerseyNumber) {
      showToast("Todos los campos son obligatorios", "error");
      return;
    }
    
    try {
      if (name !== user.name) {
        await updateProfile(user.id, { name });
      }
      await createPlayerProfile({
        user_id: user.id,
        team_id: teamId,
        position,
        jersey_number: jerseyNumber
      });
      overlay.remove();
      showToast("Registro completado correctamente");
      render();
    } catch (err: any) {
      showToast(err.message || "Error al completar registro", "error");
    }
  });
};

const showProfileCompletionBanner = (user: any) => {
  const existing = document.getElementById("profile-banner");
  if (existing) return; // Ya existe

  const banner = document.createElement("div");
  banner.id = "profile-banner";
  banner.className = "fixed top-20 left-4 right-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 z-40 shadow-lg";
  banner.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
        </div>
        <div>
          <p class="text-yellow-500 font-semibold">Completa tu perfil de jugador</p>
          <p class="text-yellow-500/80 text-sm">Para acceder a todas las funciones, completa tu información de jugador.</p>
        </div>
      </div>
      <div class="flex gap-2">
        <button id="complete-profile-btn" class="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 font-bold text-sm">Completar ahora</button>
        <button id="dismiss-banner-btn" class="px-3 py-2 border border-yellow-500/30 text-yellow-500 rounded-lg hover:bg-yellow-500/20 text-sm">Después</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById("complete-profile-btn")?.addEventListener("click", () => {
    banner.remove();
    showCompletePlayerModal(user);
  });

  document.getElementById("dismiss-banner-btn")?.addEventListener("click", () => {
    banner.remove();
  });
};

render = () => {
  const user = getCurrentAuthUser();
  if (user) { 
    if (user.role === 'player') {
      getPlayerByUserId(user.id).then((player) => {
        const needsProfile = !player || !player.team_id || !player.position || !player.jersey_number;
        if (needsProfile) {
          renderDashboard().then(() => {
            showCompletePlayerModal(user, player);
          }).catch((err) => {
            console.error("Error rendering dashboard:", err);
            showToast("Error al cargar el panel", "error");
            renderAuthForm(true);
          });
        } else {
          renderDashboard().catch((err) => {
            console.error("Error rendering dashboard:", err);
            showToast("Error al cargar el panel", "error");
            renderAuthForm(true);
          });
        }
      }).catch(() => {
        renderDashboard().then(() => {
          showCompletePlayerModal(user, null);
        }).catch((err) => {
          console.error("Error rendering dashboard:", err);
          showToast("Error al cargar el panel", "error");
          renderAuthForm(true);
        });
      });
    } else {
      renderDashboard().catch((err) => {
        console.error("Error rendering dashboard:", err);
        showToast("Error al cargar el panel", "error");
        renderAuthForm(true);
      });
    }
  } else { 
    renderAuthForm(true); 
  }
};

const session = getCurrentAuthUser();
if (session) {
  activeDashboardTab = "overview";
  if (session.role === 'player') {
    getPlayerByUserId(session.id).then((player: any) => {
      const needsProfile = !player || !player.team_id || !player.position || !player.jersey_number;
      if (needsProfile) {
        renderDashboard().then(() => {
          showCompletePlayerModal(session, player);
        }).catch((err) => {
          console.error("Error initializing dashboard:", err);
          showToast("Error al inicializar", "error");
          renderAuthForm(true);
        });
      } else {
        renderDashboard().catch((err) => {
          console.error("Error initializing dashboard:", err);
          showToast("Error al inicializar", "error");
          renderAuthForm(true);
        });
      }
    }).catch(() => {
      renderDashboard().then(() => {
        showCompletePlayerModal(session, null);
      }).catch((err) => {
        console.error("Error initializing dashboard:", err);
        showToast("Error al inicializar", "error");
        renderAuthForm(true);
      });
    });
  } else {
    renderDashboard().catch((err) => {
      console.error("Error al inicializar", err);
      showToast("Error al inicializar", "error");
      renderAuthForm(true);
    });
  }
} else {
  renderAuthForm(true);
}
