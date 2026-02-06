<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-white">
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col overflow-y-auto">
      <!-- PageHeading -->
      <header class="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-8">
        <div class="max-w-5xl mx-auto flex flex-wrap justify-between items-end gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-primary font-bold text-sm">
              <span class="material-symbols-outlined text-sm">beach_access</span>
              Gestion des Vacances
            </div>
            <h1 class="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Année Scolaire {{ year }}</h1>
            <p class="text-slate-500 dark:text-slate-400 text-base max-w-xl">Définissez les périodes de congés et jours fériés pour l'année académique {{ year }}.</p>
          </div>
          <div class="flex gap-3">
            <button @click="saveHolidays" :disabled="isSaving" class="flex items-center justify-center rounded-lg h-11 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20">
              <span class="material-symbols-outlined mr-2" v-if="isSaving">sync</span>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer le calendrier' }}
            </button>
          </div>
        </div>
      </header>
      
      <!-- Tabs Navigation -->
      <div class="bg-white dark:bg-slate-950 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 mb-8">
        <div class="max-w-5xl mx-auto px-8">
          <nav class="flex gap-10">
            <router-link to="/admin/configuration" class="flex items-center gap-2 border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-4 pt-6 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">schedule</span>
              <p class="text-sm font-bold tracking-wide">Périodes & Dates</p>
            </router-link>
            <router-link to="/admin/gestion-vacances" class="flex items-center gap-2 border-b-4 border-primary text-primary pb-4 pt-6 group">
              <span class="material-symbols-outlined text-[20px] active-icon">beach_access</span>
              <p class="text-sm font-bold tracking-wide">Vacances</p>
            </router-link>
            <router-link to="/admin/cloture-administrative" class="flex items-center gap-2 border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-4 pt-6 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">verified_user</span>
              <p class="text-sm font-bold tracking-wide">Clôture Administrative</p>
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- Content Area -->
      <div class="px-8 pb-10">
        <div class="grid grid-cols-12 gap-6">
          <!-- Config Form Panel -->
          <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div class="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 class="text-lg font-bold mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">add_circle</span>
              Ajouter une période
            </h2>
            <form @submit.prevent="addHoliday" class="flex flex-col gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold">Nom des vacances</label>
                <input v-model="newHoliday.name" class="form-input rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary text-sm" placeholder="ex: Vacances de Noël" type="text" required/>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-600 dark:text-slate-400">Date de début</label>
                  <div class="relative">
                    <input v-model="newHoliday.start" class="form-input w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary text-sm" type="date" required/>
                  </div>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-semibold text-slate-600 dark:text-slate-400">Date de fin</label>
                  <div class="relative">
                    <input v-model="newHoliday.end" class="form-input w-full rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary text-sm" type="date" required/>
                  </div>
                </div>
              </div>
              <div class="flex flex-col gap-2 mt-2">
                <label class="text-sm font-semibold">Application</label>
                <div class="flex flex-col gap-2">
                  <label class="flex items-center gap-3 p-3 border border-primary bg-primary/5 rounded-lg cursor-pointer">
                    <input v-model="newHoliday.scope" value="all" class="text-primary focus:ring-primary" name="scope" type="radio"/>
                    <span class="text-sm font-medium">Tout l'établissement</span>
                  </label>
                  <label class="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-800 rounded-lg cursor-pointer">
                    <input v-model="newHoliday.scope" value="specific" class="text-primary focus:ring-primary" name="scope" type="radio"/>
                    <span class="text-sm font-medium">Portée spécifique</span>
                  </label>
                </div>
              </div>
              <button class="mt-4 w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity" type="submit">
                Ajouter au calendrier
              </button>
            </form>
          </div>
          
          <!-- Statistics/Quick info card -->
          <div class="bg-primary text-white rounded-xl p-6 shadow-xl shadow-primary/20">
            <h3 class="text-sm font-medium uppercase tracking-wider opacity-80">Résumé de l'année</h3>
            <div class="mt-4 flex flex-col gap-4">
              <div class="flex justify-between items-end border-b border-white/20 pb-2">
                <span class="text-2xl font-bold">{{ totalHolidayDays }}</span>
                <span class="text-sm opacity-80">Jours de vacances</span>
              </div>
              <div class="flex justify-between items-end border-b border-white/20 pb-2">
                <span class="text-2xl font-bold">{{ holidays.length }}</span>
                <span class="text-sm opacity-80">Périodes définies</span>
              </div>
              <div class="flex items-center gap-2 text-xs bg-white/20 p-2 rounded">
                <span class="material-symbols-outlined text-sm">info</span>
                <span>Aucun chevauchement détecté.</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Main View Panel -->
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
          <!-- Calendar Widget Mockup -->
          <div class="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 class="font-bold">Vue Calendrier - {{ currentMonthName }} {{ currentYear }}</h3>
              <div class="flex gap-1">
                <button @click="prevMonth" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <button @click="nextMonth" class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <span class="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-7 mb-2">
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Lun</div>
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Mar</div>
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Mer</div>
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Jeu</div>
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Ven</div>
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Sam</div>
                <div class="text-center text-xs font-bold text-slate-400 uppercase py-2">Dim</div>
              </div>
              <div class="grid grid-cols-7 gap-1">
                <!-- Dynamic Calendar Days -->
                <div 
                  v-for="(day, idx) in calendarDays" 
                  :key="idx"
                  class="aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all relative overflow-hidden"
                  :class="[
                    day.isCurrentMonth ? '' : 'opacity-20',
                    isDateHoliday(day.date) ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  ]"
                >
                  <span>{{ day.date.getDate() }}</span>
                  <div v-if="isDateHoliday(day.date)" class="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>
                </div>
              </div>
              <div class="mt-4 flex items-center gap-4 text-xs">
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 bg-primary rounded"></span>
                  <span>Vacances actives</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-3 h-3 border border-slate-300 dark:border-slate-600 rounded"></span>
                  <span>Jours ouvrés</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Data Table List -->
          <div class="bg-white dark:bg-background-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 class="font-bold">Liste des vacances configurées</h3>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="bg-slate-50 dark:bg-slate-900/50">
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Libellé</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Période</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Portée</th>
                    <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-if="holidays.length === 0">
                    <td colspan="4" class="px-6 py-10 text-center text-slate-400 italic">Aucune période de vacances configurée</td>
                  </tr>
                  <tr v-for="(h, idx) in holidays" :key="idx" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex flex-col">
                        <span class="font-bold text-sm">{{ h.name }}</span>
                        <span class="text-xs text-slate-400">{{ getDuration(h.start, h.end) }} jours</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm">{{ formatDateRange(h.start, h.end) }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span :class="h.scope === 'all' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'" class="px-2 py-1 text-[10px] font-bold uppercase rounded">
                        {{ h.scope === 'all' ? 'Établissement' : h.scope }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex justify-end gap-2">
                        <button @click="removeHoliday(idx)" class="text-slate-400 hover:text-red-500 transition-colors">
                          <span class="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-900/30 text-center">
              <button class="text-sm text-primary font-bold hover:underline">Voir toutes les périodes</button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const isSaving = ref(false);
const year = ref('2023-2024');
const holidays = ref([]);
const newHoliday = ref({
    name: '',
    start: '',
    end: '',
    scope: 'all'
});

const currentViewDate = ref(new Date());

const currentMonthName = computed(() => {
    return currentViewDate.value.toLocaleString('fr-FR', { month: 'long' });
});

const currentYear = computed(() => currentViewDate.value.getFullYear());

const prevMonth = () => {
    currentViewDate.value = new Date(currentViewDate.value.getFullYear(), currentViewDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
    currentViewDate.value = new Date(currentViewDate.value.getFullYear(), currentViewDate.value.getMonth() + 1, 1);
};

const calendarDays = computed(() => {
    const d = currentViewDate.value;
    const year = d.getFullYear();
    const month = d.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for first day (0-6, 0 is Sunday, let's map it so 0 is Monday)
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6;
    
    const days = [];
    
    // Padding from previous month
    for (let i = startDayIdx; i > 0; i--) {
        days.push({
            date: new Date(year, month, 1 - i),
            isCurrentMonth: false
        });
    }
    
    // Days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
            date: new Date(year, month, i),
            isCurrentMonth: true
        });
    }
    
    // Padding for next month to complete 6 rows (42 days)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({
            date: new Date(year, month + 1, i),
            isCurrentMonth: false
        });
    }
    
    return days;
});

const isDateHoliday = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    
    return holidays.value.some(h => {
        const start = new Date(h.start);
        start.setHours(0, 0, 0, 0);
        const end = new Date(h.end);
        end.setHours(0, 0, 0, 0);
        return d >= start && d <= end;
    });
};

const fetchData = async () => {
    try {
        const res = await api.getSetting('academic_year_config');
        if (res.data.success && res.data.data) {
            const config = res.data.data.value;
            year.value = config.year;
            holidays.value = config.holidays || [];
        }
    } catch (error) {
        console.error('Erreur chargement config:', error);
    }
};

const addHoliday = () => {
    holidays.value.push({ ...newHoliday.value });
    newHoliday.value = { name: '', start: '', end: '', scope: 'all' };
};

const removeHoliday = (idx) => {
    holidays.value.splice(idx, 1);
};

const saveHolidays = async () => {
    isSaving.value = true;
    try {
        const res = await api.getSetting('academic_year_config');
        let config = res.data.data?.value || {};
        config.holidays = holidays.value;
        await api.updateSetting('academic_year_config', config);
        alert('Calendrier des vacances enregistré !');
    } catch (error) {
        console.error('Erreur enregistrement:', error);
    } finally {
        isSaving.value = false;
    }
};

const getDuration = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = Math.abs(e - s);
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
};

const formatDateRange = (start, end) => {
    const s = new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const e = new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${s} - ${e}`;
};

const totalHolidayDays = computed(() => {
    return holidays.value.reduce((acc, h) => acc + getDuration(h.start, h.end), 0);
});

onMounted(() => {
  fetchData();
  
  // Add Material Symbols font
  const link = document.createElement('link');
  // ... rest of the logic ...
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Lexend font
  const lexendLink = document.createElement('link');
  lexendLink.href = 'https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&display=swap';
  lexendLink.rel = 'stylesheet';
  document.head.appendChild(lexendLink);

  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Lexend', sans-serif;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `;
  document.head.appendChild(style);
});
</script>
