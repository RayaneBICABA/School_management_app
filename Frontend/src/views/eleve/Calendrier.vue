<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-200 p-8">
    <div class="max-w-[1200px] mx-auto space-y-6">
      
      <!-- Page Heading -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h3 class="text-3xl font-black text-slate-900 dark:text-white">Emploi du temps</h3>
          <p class="text-slate-500 dark:text-slate-400">
            {{ loading ? 'Chargement...' : (user?.classe?.niveau ? `Classe: ${user.classe.niveau} ${user.classe.section}` : 'Planning hebdomadaire') }}
          </p>
        </div>
      </div>

      <!-- Main Layout: Stacked (Calendar then Info) -->
      <div class="flex flex-col gap-8">
        
        <!-- Calendar Grid -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <!-- Days Header -->
          <div class="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div class="p-4 border-r border-slate-200 dark:border-slate-800"></div> <!-- Time Column Header -->
            <div v-for="day in days" :key="day" class="p-4 border-r last:border-r-0 border-slate-200 dark:border-slate-800 text-center">
              <p class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{{ day }}</p>
            </div>
          </div>

          <!-- Calendar Body -->
          <div class="relative bg-white dark:bg-slate-900" style="height: 720px;"> <!-- 12 hours * 60px -->
             <!-- Grid Lines & Time Labels -->
            <div class="absolute inset-0 grid grid-cols-7 pointer-events-none">
               <!-- Time Column -->
               <div class="border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div v-for="hour in hours" :key="hour" class="h-[60px] border-b border-slate-100 dark:border-slate-800 flex items-start justify-center pt-2">
                    <span class="text-xs font-medium text-slate-400">{{ hour }}:00</span>
                  </div>
               </div>
               <!-- Day Columns Lines -->
               <div v-for="day in days" :key="day + '-col'" class="border-r last:border-r-0 border-slate-100 dark:border-slate-800">
                  <div v-for="h in 12" :key="h" class="h-[60px] border-b border-slate-100 dark:border-slate-800"></div>
               </div>
            </div>

            <!-- Events Container -->
            <div class="absolute inset-0 grid grid-cols-7 ml-[14.28%] w-[85.72%] pointer-events-none">
               <!-- Events are absolute positioned within this container based on day/time -->
               <!-- We map Lundi->col 1, etc. -->
               <template v-for="schedule in schedules" :key="schedule._id">
                  <div 
                    class="absolute px-2 py-1 m-1 rounded-lg border-l-4 shadow-sm text-xs cursor-pointer hover:scale-[1.02] transition-transform pointer-events-auto overflow-hidden text-left"
                    :class="getSubjectColorClass(schedule.matiere.nom)"
                    :style="getEventStyle(schedule)"
                  >
                     <div class="font-bold truncate">{{ schedule.matiere.nom }}</div>
                     <div class="opacity-80 truncate">{{ schedule.salle || 'Salle ?' }}</div>
                     <div class="opacity-80 truncate" v-if="schedule.professeur">{{ schedule.professeur.nom }}</div>
                  </div>
               </template>
            </div>
          </div>
        </div>

        <!-- Info Panel (Now at Bottom) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Upcoming (Simulated from Schedule) -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">event_upcoming</span>
                  Cours à venir
                </h4>
                <div v-if="loading" class="text-sm text-slate-500">Chargement...</div>
                <div v-else-if="schedules.length === 0" class="text-sm text-slate-500">Aucun cours programmé.</div>
                <div v-else class="space-y-3">
                    <!-- Just showing first 3 schedules as 'Upcomming' for demo, ideally filter by current day/time -->
                    <div v-for="sched in sortedSchedules.slice(0, 3)" :key="sched._id" class="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div class="bg-primary/10 text-primary rounded-lg p-2 font-bold text-xs flex flex-col items-center min-w-[40px]">
                           <span>{{ sched.jour.substring(0,3) }}</span>
                           <span>{{ sched.creneau.split('h')[0] }}h</span>
                        </div>
                        <div>
                            <p class="font-bold text-sm">{{ sched.matiere.nom }}</p>
                            <p class="text-xs text-slate-500">{{ sched.professeur?.nom || 'Sans prof' }} • {{ sched.salle }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Legend -->
             <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Légende</h4>
                <div class="grid grid-cols-2 gap-3">
                   <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <span class="size-3 rounded-full bg-blue-500"></span> Sciences
                   </div>
                   <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <span class="size-3 rounded-full bg-red-500"></span> Littéraire
                   </div>
                   <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <span class="size-3 rounded-full bg-green-500"></span> Langues
                   </div>
                   <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <span class="size-3 rounded-full bg-purple-500"></span> Arts/Sport
                   </div>
                   <div class="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                       <span class="size-3 rounded-full bg-slate-500"></span> Autre
                   </div>
                </div>
             </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const loading = ref(true);
const user = ref(null);
const schedules = ref([]);

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7 to 18

const fetchUserAndSchedule = async () => {
    loading.value = true;
    try {
        const userRes = await api.getMe();
        user.value = userRes.data.data;
        
        if (user.value.classe) {
            const classeId = user.value.classe._id || user.value.classe;
            console.log('Fetching schedule for class:', classeId);

            const schedRes = await api.getSchedules({ classe: classeId });
            schedules.value = schedRes.data.data;
            console.log('Schedules received:', schedules.value);
            
            if (schedules.value.length > 0 && schedules.value[0].classe) {
                 user.value.classe = schedules.value[0].classe; 
            }
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUserAndSchedule();
    
    // Add custom styles for fonts if needed (though already in index.html usually)
    const style = document.createElement('style');
    style.textContent = `
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    `;
    document.head.appendChild(style);
});

// Helper to calculate position
const getEventStyle = (schedule) => {
    // Column (Day) - Case insensitive match
    const dayIndex = days.findIndex(d => d.toLowerCase() === (schedule.jour || '').trim().toLowerCase());
    if (dayIndex === -1) return { display: 'none' };
    
    const colWidthPct = 100 / 6; // 6 days
    const leftPct = dayIndex * colWidthPct;
    
    // Row (Time)
    if (!schedule.creneau) return { display: 'none' };
    
    // Replace non-standard dashes
    const dash = schedule.creneau.includes('–') ? '–' : '-'; 
    let parts = schedule.creneau.split(dash).map(s => s.trim());
    
    // Handle single time case (e.g. "16:00") -> Assume 1h duration
    if (parts.length === 1 && parts[0]) {
        parts = [parts[0], null];
    } else if (parts.length !== 2) {
        return { display: 'none' };
    }
    
    const [startStr, endStr] = parts;
    
    const parseTime = (str) => {
        if (!str) return NaN;
        const clean = str.toLowerCase().replace('h', ':');
        const [h, m] = clean.split(':').map(val => parseInt(val) || 0);
        return h + (m || 0) / 60;
    };
    
    const start = parseTime(startStr);
    let end = parseTime(endStr);
    
    // Default to 1 hour if end is missing
    if (isNaN(end)) {
        end = start + 1;
    }
    
    const startHour = 7;
    const pxPerHour = 60;
    
    // Validate range
    if (isNaN(start) || isNaN(end)) return { display: 'none' };

    const topPx = (start - startHour) * pxPerHour;
    const heightPx = (end - start) * pxPerHour;
    
    return {
        left: `${leftPct}%`,
        width: `${colWidthPct}%`,
        top: `${topPx}px`,
        height: `${heightPx}px`,
        position: 'absolute',
        zIndex: 10
    };
};

const getSubjectColorClass = (subjectName) => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('math') || s.includes('physique') || s.includes('chimie')) return 'bg-blue-100 text-blue-800 border-blue-500';
    if (s.includes('français') || s.includes('philo') || s.includes('histoire')) return 'bg-red-100 text-red-800 border-red-500';
    if (s.includes('anglais') || s.includes('espagnol') || s.includes('allemand')) return 'bg-green-100 text-green-800 border-green-500';
    if (s.includes('sport') || s.includes('eps')) return 'bg-orange-100 text-orange-800 border-orange-500';
    if (s.includes('art') || s.includes('musique')) return 'bg-purple-100 text-purple-800 border-purple-500';
    return 'bg-slate-100 text-slate-800 border-slate-500';
};

const sortedSchedules = computed(() => {
    // Sort logic to show "upcoming" first or just sorted by day/time
    return [...schedules.value].sort((a, b) => {
        const dayA = days.indexOf(a.jour);
        const dayB = days.indexOf(b.jour);
        if (dayA !== dayB) return dayA - dayB;
        return a.creneau.localeCompare(b.creneau);
    });
});

</script>
