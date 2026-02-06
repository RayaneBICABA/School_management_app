<template>
  <div class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden">
    <!-- Page Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-2 sticky top-0 z-10 shrink-0">
      <div class="max-w-[1400px] mx-auto flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-slate-900 dark:text-white text-xl font-black tracking-tight mb-0.5">Mon Emploi du Temps</h2>
          <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <span class="material-symbols-outlined text-xs">calendar_month</span>
            <p class="text-xs font-medium">Semaine du {{ currentWeekRange }}</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Schedule Grid Container -->
    <div class="p-2 max-w-[1400px] mx-auto w-full h-full flex flex-col overflow-hidden">
      <div class="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 flex flex-col">
        <div class="overflow-auto h-full">
            <table class="w-full border-collapse h-full">
              <thead class="sticky top-0 z-20 bg-white dark:bg-slate-900">
                <tr class="bg-slate-50 dark:bg-slate-800/50">
                  <th class="w-16 px-2 py-2 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-900 z-10">Heure</th>
                  <th v-for="day in weekDays" :key="day" class="px-2 py-2 text-center text-xs font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 min-w-[120px]" :class="{'bg-primary/5': isToday(day)}">
                      {{ day }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="time in timeSlots" :key="time" class="h-16 group">
                  <td class="px-2 py-1 border-r border-slate-100 dark:border-slate-800 text-[10px] font-medium text-slate-500 align-middle bg-slate-50/30 dark:bg-slate-900 sticky left-0 z-10 border-b">{{ time }}</td>
                  
                  <td v-for="day in weekDays" :key="day + time" class="p-1 border-b border-r border-slate-100 dark:border-slate-800 relative bg-white dark:bg-slate-900 align-top">
                      
                      <!-- Regular Schedule -->
                      <div v-if="getSchedule(day, time)" class="h-full rounded bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500 p-1 flex flex-col justify-between overflow-hidden">
                        <div>
                          <p class="text-blue-700 dark:text-blue-300 text-[9px] font-bold mb-0.5 uppercase truncate leading-tight">{{ getSchedule(day, time).matiere.nom }}</p>
                          <p class="text-slate-900 dark:text-white text-[10px] font-bold leading-tight truncate">{{ getSchedule(day, time).classe.niveau }} {{ getSchedule(day, time).classe.section }}</p>
                        </div>
                        <div class="flex items-center gap-0.5 text-slate-500 dark:text-slate-400 text-[8px] font-medium uppercase tracking-wide truncate">
                          <span class="material-symbols-outlined text-[10px]">location_on</span>
                          <span>{{ getSchedule(day, time).salle || '?' }}</span>
                        </div>
                      </div>

                      <!-- Evaluation Override/Overlay -->
                      <div v-if="getEvaluation(day, time)" class="absolute inset-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 border-l-2 border-emerald-500 p-1 flex flex-col justify-between shadow-sm z-10 overflow-hidden">
                        <div>
                          <p class="text-emerald-700 dark:text-emerald-300 text-[9px] font-bold mb-0.5 uppercase truncate">⚠️ ÉVAL: {{ getEvaluation(day, time).type }}</p>
                           <p class="text-slate-900 dark:text-white text-[10px] font-bold leading-tight truncate">{{ getEvaluation(day, time).titre }}</p>
                          <p class="text-[9px] text-emerald-800 dark:text-emerald-200 truncate">{{ getEvaluation(day, time).classe.niveau }} {{ getEvaluation(day, time).classe.section }}</p>
                        </div>
                      </div>

                      <div v-if="!getSchedule(day, time) && !getEvaluation(day, time)" class="h-full flex items-center justify-center text-slate-200 dark:text-slate-800 text-[10px] italic opacity-0 hover:opacity-100 transition-opacity">
                          Libre
                      </div>

                  </td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
      
      <div class="mt-2 flex gap-4 items-center px-2 shrink-0">
         <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm bg-blue-500"></span>
          <span class="text-[10px] font-medium text-slate-600 dark:text-slate-400">Cours</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm bg-emerald-500"></span>
          <span class="text-[10px] font-medium text-slate-600 dark:text-slate-400">Évaluation</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { error } = useToast()

// Fetch user from localStorage
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
// Fixed slots 07h to 18h
const hours = Array.from({ length: 12 }, (_, i) => 7 + i); 
const timeSlots = ref(hours.map(h => `${h.toString().padStart(2, '0')}:00`));

const schedules = ref([]);
const evaluations = ref([]);

const currentWeekRange = computed(() => {
    return "En cours"; 
});

const isToday = (dayName) => {
    const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    return days[new Date().getDay()] === dayName;
}

const fetchData = async () => {
    try {
        const userId = user.value.id || user.value._id;
        if(!userId) {
            error("Erreur: Impossible d'identifier l'utilisateur connecté.");
            return;
        }

        // Fetch Regular Schedule
        const schedRes = await api.getSchedules({ professeur: userId });
        if (schedRes.data.success) {
             schedules.value = schedRes.data.data;
        }

        // Fetch Validated Evaluations
        const evalRes = await api.getValidatedEvaluations(); 
        if (evalRes.data.success) {
            evaluations.value = evalRes.data.data.filter(e => e.professeur?._id === userId);
        }
        
        console.log("Schedules loaded:", schedules.value.length);
        console.log("Evaluations loaded:", evaluations.value.length);

    } catch (err) {
        console.error("Error fetching calendar", err);
        error("Erreur lors de l'actualisation du calendrier.");
    }
}

onMounted(() => {
    fetchData();
});

const getSchedule = (day, timePrefix) => {
    return schedules.value.find(s => s.jour === day && s.creneau === timePrefix);
}

const getEvaluation = (day, timePrefix) => {
    return evaluations.value.find(e => {
        const d = new Date(e.date);
        const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d);
        const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        return capitalizedDay === day && e.heureDebut === timePrefix;
    });
}

</script>
