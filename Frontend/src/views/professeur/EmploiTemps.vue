<template>
  <div class="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden">
    <!-- Page Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30 shrink-0 shadow-sm">
      <div class="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 class="text-slate-900 dark:text-white text-2xl font-black tracking-tight mb-1 flex items-center gap-3 text-nowrap">
             <div class="p-2 bg-primary/10 rounded-lg">
                <span class="material-symbols-outlined text-primary">calendar_today</span>
             </div>
             Mon Emploi du Temps
          </h2>
          <div class="flex items-center gap-3 text-slate-500 dark:text-slate-400">
            <span class="material-symbols-outlined text-[20px]">event_note</span>
            <p class="text-sm font-bold tracking-tight">{{ currentWeekRange }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 flex-1 justify-center max-w-md mx-auto">
            <div class="relative w-full">
                <select v-model="selectedView" 
                        class="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                    <option value="global">Vue Globale (Mes cours)</option>
                    <hr class="my-1 border-slate-200 dark:border-slate-700">
                    <option v-for="classe in myClasses" :key="classe._id" :value="classe._id">
                        Classe de {{ classe.niveau }} {{ classe.section }}
                    </option>
                </select>
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
                    {{ selectedView === 'global' ? 'public' : 'group' }}
                </span>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    unfold_more
                </span>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                <button @click="prevWeek" class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:shadow-sm active:scale-95">
                    <span class="material-symbols-outlined text-[20px] font-black">chevron_left</span>
                </button>
                <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1"></div>
                <button @click="goToday" class="px-4 py-1 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all active:scale-95">Aujourd'hui</button>
                <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 self-center mx-1"></div>
                <button @click="nextWeek" class="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:shadow-sm active:scale-95">
                    <span class="material-symbols-outlined text-[20px] font-black">chevron_right</span>
                </button>
            </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="p-6 max-w-[1600px] mx-auto w-full flex-1 overflow-hidden flex flex-col">
      <!-- Calendar Wrapper -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex-1 flex flex-col relative">
        
        <!-- Legend Bar -->
        <div class="flex items-center bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-6 py-3 gap-6 shrink-0 z-20">
            <div class="flex items-center gap-2">
                <span class="size-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/10"></span>
                <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Cours</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="size-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] ring-4 ring-emerald-500/10"></span>
                <span class="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Évaluations</span>
            </div>
            <div class="ml-auto hidden sm:flex items-center gap-2">
                <span class="material-symbols-outlined text-slate-300 dark:text-slate-600 text-sm">mouse</span>
                <p class="text-[10px] text-slate-400 font-medium italic">Cliquez sur un créneau pour les détails</p>
            </div>
        </div>

        <!-- Scrollable Grid Container -->
        <div class="flex-1 overflow-auto scrollbar-premium flex flex-col relative min-w-[800px]">
            <!-- Day Column Headers -->
            <div class="grid grid-cols-[80px_repeat(6,1fr)] sticky top-0 bg-white dark:bg-slate-900 z-30 border-b border-slate-200 dark:border-slate-800">
                <div class="border-r border-slate-200 dark:border-slate-800 bg-slate-50/10 backdrop-blur-sm"></div>
                <div v-for="day in weekDays" :key="day" 
                     class="p-4 text-center border-r border-slate-200 dark:border-slate-800 last:border-0"
                     :class="{'bg-primary/[0.03]': isToday(day)}">
                    <div class="relative inline-block">
                        <span class="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500 block mb-1">{{ day.slice(0,3) }}</span>
                        <div class="flex flex-col items-center">
                            <span class="text-xl font-black leading-none" :class="isToday(day) ? 'text-primary' : 'text-slate-900 dark:text-white'">
                                {{ getDayNumber(day) }}
                            </span>
                            <div v-if="isToday(day)" class="mt-1.5 size-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(37,99,235,0.6)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Grid Body -->
            <div class="relative min-h-[1040px] flex-1">
                <!-- Background Time Lines -->
                <div v-for="time in timeSlots" :key="'bg-line-'+time" 
                     class="absolute w-full border-t border-slate-100 dark:border-slate-800/40 pointer-events-none transition-colors"
                     :style="{ top: getTopOffset(time) + 'px' }">
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-[80px_repeat(6,1fr)] h-full min-h-[1040px]">
                    <!-- Time Labels Column (arranged and polished) -->
                    <div class="bg-slate-50/10 dark:bg-slate-950/20 border-r border-slate-200 dark:border-slate-800 flex flex-col backdrop-blur-sm">
                        <div v-for="(time, idx) in timeSlots" :key="'time-'+time" 
                             class="h-[80px] flex flex-col items-center justify-start pt-2 px-2 group/time">
                            <span class="text-[11px] font-black text-slate-400 dark:text-slate-500 tracking-tighter group-hover/time:text-primary transition-colors">
                                {{ time }}
                            </span>
                            <div class="w-2 h-px bg-slate-200 dark:bg-slate-800 mt-1"></div>
                        </div>
                    </div>

                    <!-- Column for each day -->
                    <div v-for="day in weekDays" :key="'col-'+day" 
                         class="relative border-r border-slate-100 dark:border-slate-800 last:border-0 group/col"
                         :class="{'bg-primary/[0.015]': isToday(day)}">
                        
                        <!-- Ghost Slots for visual alignment & future click-to-add -->
                        <div v-for="time in timeSlots" :key="'slot-'+day+time"
                             class="h-[80px] w-full border-b border-transparent hover:bg-primary/[0.03] transition-colors cursor-crosshair">
                        </div>

                        <!-- Card Events Layer -->
                        <template v-for="slot in getCombinedSchedule(day)" :key="slot._id">
                            <div class="absolute inset-x-1.5 p-0.5 z-10 animate-fade-in group/card"
                                 :style="getEventStyle(slot)"
                                 @click="showSlotDetail(slot)">
                                
                                <div class="h-full w-full rounded-2xl p-3 border-l-[6px] shadow-sm transition-all hover:scale-[1.01] hover:z-20 cursor-pointer relative overflow-hidden backdrop-blur-md ring-1 ring-inset ring-black/5 dark:ring-white/5"
                                     :class="[getEventColors(slot)]">
                                    
                                    <div class="flex flex-col h-full">
                                        <div class="flex items-center justify-between mb-2">
                                            <div class="flex items-center gap-1.5">
                                                <span class="size-1.5 rounded-full" :class="slot.type === 'evaluation' ? 'bg-emerald-500' : 'bg-primary'"></span>
                                                <span class="text-[9px] font-black uppercase tracking-widest opacity-60">
                                                    {{ slot.type === 'course' ? (slot.matiere?.nom || 'Cours') : 'Évaluation' }}
                                                </span>
                                            </div>
                                            <span v-if="slot.type === 'evaluation'" class="text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">LIVE</span>
                                        </div>
                                        
                                        <h4 class="text-[13px] font-black leading-tight mb-2 line-clamp-2 text-slate-900 dark:text-white">
                                            {{ slot.type === 'course' ? (slot.classe ? `${slot.classe.niveau} ${slot.classe.section}` : 'N/A') : slot.titre }}
                                        </h4>
                                        
                                        <div class="mt-auto flex flex-wrap gap-2 items-center">
                                            <div class="flex items-center gap-1.5 text-[9px] font-bold opacity-70 bg-white/60 dark:bg-black/20 px-2 py-1 rounded-lg">
                                                <span class="material-symbols-outlined text-[14px]">location_on</span>
                                                <span>{{ slot.salle || '---' }}</span>
                                            </div>
                                            <div class="flex items-center gap-1.5 text-[9px] font-bold opacity-70 bg-white/60 dark:bg-black/20 px-2 py-1 rounded-lg">
                                                <span class="material-symbols-outlined text-[14px]">schedule</span>
                                                <span>{{ slot.heureDebut }} - {{ slot.heureFin || '?' }}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Decor Icon -->
                                    <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl opacity-[0.05] transform group-hover/card:rotate-6 group-hover/card:scale-110 transition-all duration-500">
                                        {{ slot.type === 'course' ? 'auto_stories' : 'assignment' }}
                                    </span>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
      </div>
    <!-- Detail Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-md" @click="closeModal"></div>
        
        <!-- Modal Content -->
        <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-modal-in">
          <!-- Header/Banner -->
          <div class="h-32 relative overflow-hidden" :class="[getEventColors(selectedSlot)]">
            <div class="absolute inset-0 opacity-10">
              <span class="material-symbols-outlined text-[120px] absolute -right-4 -bottom-4">
                {{ selectedSlot.type === 'course' ? 'auto_stories' : 'assignment' }}
              </span>
            </div>
            <button @click="closeModal" class="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white">
              <span class="material-symbols-outlined">close</span>
            </button>
            <div class="absolute inset-x-6 bottom-4">
              <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/20 text-white backdrop-blur-sm">
                {{ selectedSlot.type === 'course' ? 'Cours' : 'Évaluation' }}
              </span>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8">
            <div class="mb-8">
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2">
                {{ selectedSlot.type === 'course' ? (selectedSlot.matiere?.nom || 'Matière Inconnue') : selectedSlot.titre }}
              </h3>
              <div v-if="selectedSlot.type === 'course'" class="flex items-center gap-2 text-primary font-bold">
                <span class="material-symbols-outlined">group</span>
                <span>Classe de {{ selectedSlot.classe?.niveau }} {{ selectedSlot.classe?.section }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-6 mb-8">
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Horaire</span>
                <div class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <span class="material-symbols-outlined text-primary text-[20px]">schedule</span>
                  <span>{{ selectedSlot.heureDebut }} - {{ selectedSlot.heureFin || '?' }}</span>
                </div>
              </div>
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Salle</span>
                <div class="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                  <span class="material-symbols-outlined text-emerald-500 text-[20px]">location_on</span>
                  <span>{{ selectedSlot.salle || 'Non définie' }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-4">
              <button @click="closeModal" class="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-black text-sm uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">
                Fermer
              </button>
              <button v-if="selectedSlot.type === 'course'" 
                      @click="goToFaireAppel"
                      class="flex-1 px-6 py-4 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">how_to_reg</span>
                Faire l'appel
              </button>
              <button v-else 
                      class="flex-1 px-6 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2">
                <span class="material-symbols-outlined">edit_square</span>
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { error, success } = useToast()

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const hours = Array.from({ length: 13 }, (_, i) => 7 + i); 
const timeSlots = ref(hours.map(h => `${h.toString().padStart(2, '0')}:00`));

// Navigation State
const baseDate = ref(new Date());

const currentWeekRange = computed(() => {
    const d = new Date(baseDate.value);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday of current week
    const monday = new Date(d.setDate(diff));
    const saturday = new Date(new Date(monday).setDate(monday.getDate() + 5));
    
    return `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${saturday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
});

const getDayNumber = (dayName) => {
    const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const idx = days.indexOf(dayName);
    
    const d = new Date(baseDate.value);
    const currentDay = d.getDay();
    const diff = idx - currentDay;
    
    const target = new Date(baseDate.value);
    target.setDate(d.getDate() + diff);
    return target.getDate();
}

const isToday = (dayName) => {
    const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const todayName = days[new Date().getDay()];
    // Only highlight if the visible week is the current week
    const now = new Date();
    const isSameWeek = Math.abs(now - baseDate.value) < 7 * 24 * 60 * 60 * 1000 && 
                      now.getMonth() === baseDate.value.getMonth();
                      
    return todayName === dayName && isSameWeek;
}

const schedules = ref([]);
const evaluations = ref([]);
const myClasses = ref([]);
const selectedView = ref('global'); // 'global' or classId

// Modal State
const showModal = ref(false);
const selectedSlot = ref({});

const closeModal = () => {
    showModal.value = false;
};

const goToFaireAppel = () => {
    // Placeholder for navigation to attendance page
    success("Redirection vers l'appel...");
    closeModal();
};

const fetchData = async () => {
    try {
        const userId = user.value.id || user.value._id;
        if(!userId) return;

        const params = {};
        if (selectedView.value === 'global') {
            params.professeur = userId;
        } else {
            params.classe = selectedView.value;
        }

        const [sRes, eRes] = await Promise.all([
            api.getSchedules(params),
            api.getValidatedEvaluations()
        ]);

        if (sRes.data.success) schedules.value = sRes.data.data;
        if (eRes.data.success) {
            if (selectedView.value === 'global') {
                evaluations.value = eRes.data.data.filter(e => e.professeur?._id === userId);
            } else {
                evaluations.value = eRes.data.data.filter(e => e.classe?._id === selectedView.value);
            }
        }
    } catch (err) {
        console.error("Calendar Error:", err);
    }
}

const fetchClasses = async () => {
    try {
        const res = await api.getProfessorClasses();
        if (res.data.success) {
            // Extract unique classes from assigned subjects
            const classesMap = new Map();
            res.data.data.forEach(cm => {
                if (cm.classe) {
                    classesMap.set(cm.classe._id, cm.classe);
                }
            });
            myClasses.value = Array.from(classesMap.values());
        }
    } catch (err) {
        console.error("Error fetching classes:", err);
    }
}

const getCombinedSchedule = (day) => {
    const s = schedules.value
        .filter(x => x.jour === day)
        .map(x => ({ ...x, type: 'course', _id: x._id || Math.random() }));
    
    const e = evaluations.value.filter(evalDoc => {
        const evalDate = new Date(evalDoc.date);
        const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        const idx = days.indexOf(day);
        
        const d = new Date(baseDate.value);
        const currentDay = d.getDay();
        const diff = idx - currentDay;
        const targetDate = new Date(baseDate.value);
        targetDate.setDate(d.getDate() + diff);
        
        return evalDate.toDateString() === targetDate.toDateString();
    }).map(evalDoc => ({ ...evalDoc, type: 'evaluation', _id: evalDoc._id || Math.random() }));

    return [...s, ...e];
}

const getTopOffset = (timeStr) => {
    const h = parseInt(timeStr.split(':')[0]);
    return (h - 7) * 80;
}

const getEventStyle = (slot) => {
    const startStr = slot.heureDebut || slot.creneau || "07:00";
    const startH = parseInt(startStr.split(':')[0]);
    const startM = parseInt(startStr.split(':')[1] || 0);
    
    const top = (startH - 7) * 80 + (startM / 60) * 80;
    
    let height = 80; 
    if (slot.heureFin && slot.heureDebut) {
        const endH = parseInt(slot.heureFin.split(':')[0]);
        const endM = parseInt(slot.heureFin.split(':')[1] || 0);
        const dur = (endH + endM/60) - (startH + startM/60);
        height = Math.max(0.5, dur) * 80;
    }

    return {
        top: `${top}px`,
        height: `${height - 4}px`
    };
}

const getEventColors = (slot) => {
    if (slot.type === 'evaluation') {
        return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-4 ring-emerald-500/5';
    }

    // Identify if the course belongs to the current professor
    const profId = user.value.id || user.value._id;
    const isMyCourse = slot.professeur === profId || (slot.professeur && (slot.professeur._id === profId || slot.professeur === profId));

    if (!isMyCourse && selectedView.value !== 'global') {
        return 'bg-slate-50 border-slate-300 dark:bg-slate-800 opacity-60 grayscale-[0.5]';
    }

    const subject = (slot.matiere?.nom || '').toLowerCase();
    const maps = {
        'math': 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/40',
        'phys': 'bg-blue-50 border-blue-500 dark:bg-blue-900/40',
        'fran': 'bg-rose-50 border-rose-500 dark:bg-rose-900/40',
        'svt': 'bg-green-50 border-green-500 dark:bg-green-900/40',
        'angl': 'bg-amber-50 border-amber-500 dark:bg-amber-900/40'
    };

    const key = Object.keys(maps).find(k => subject.includes(k));
    return maps[key] || 'bg-slate-50 border-slate-400 dark:bg-slate-800';
}

const showSlotDetail = (slot) => {
    selectedSlot.value = slot;
    showModal.value = true;
}

// Navigation Handlers
const prevWeek = () => {
    const d = new Date(baseDate.value);
    d.setDate(d.getDate() - 7);
    baseDate.value = d;
}

const nextWeek = () => {
    const d = new Date(baseDate.value);
    d.setDate(d.getDate() + 7);
    baseDate.value = d;
}

const goToday = () => {
    baseDate.value = new Date();
}

onMounted(() => {
    fetchData();
    fetchClasses();
});

// Refresh data when view changes
watch(selectedView, () => {
    fetchData();
});

// Refresh evaluations if needed when week changes
watch(baseDate, () => {
    fetchData();
});

</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
    from { opacity: 0; scale: 0.98; transform: translateY(8px); }
    to { opacity: 1; scale: 1; transform: translateY(0); }
}

.animate-modal-in {
    animation: modalIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalIn {
    from { opacity: 0; scale: 0.9; transform: translateY(20px); }
    to { opacity: 1; scale: 1; transform: translateY(0); }
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .relative {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .relative {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}

.scrollbar-premium::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.scrollbar-premium::-webkit-scrollbar-track {
    background: transparent;
}
.scrollbar-premium::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.15);
    border-radius: 20px;
}
.scrollbar-premium::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.3);
}

.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
</style>
