<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200 p-8">
    <div class="max-w-[1200px] w-full mx-auto">
      <!-- Top Header / Stats Area -->
      <header class="flex flex-col gap-6 mb-8">
        <div class="flex flex-wrap justify-between items-start gap-6">
          <div class="flex flex-col gap-2">
            <h2 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Mon Historique des Notes</h2>
            <p class="text-slate-500 dark:text-slate-400 text-lg">Suivez vos progrès académiques en temps réel.</p>
          </div>
          <button class="flex items-center gap-2 cursor-pointer rounded-lg h-11 px-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            <span class="material-symbols-outlined text-[20px]">download</span>
            <span>Télécharger le bulletin</span>
          </button>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="flex flex-col gap-3 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex justify-between items-center">
              <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Moyenne ({{ selectedPeriod === 'all' ? 'Globale' : selectedPeriod }})</p>
              <div class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-1 rounded-full">
                <span class="material-symbols-outlined text-[18px]">trending_up</span>
              </div>
            </div>
            <p class="text-slate-900 dark:text-white text-3xl font-black">{{ average }}<span class="text-lg font-normal text-slate-400">/20</span></p>
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-1">
               Calculée sur {{ filteredNotes.length }} note(s) validée(s)
            </p>
          </div>
          
          <!-- Hiding static stats for now as they are not calculated -->
          <div v-if="false" class="flex flex-col gap-3 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
             <!-- ... -->
          </div>
        </div>

        <!-- Filters Area -->
        <div class="flex flex-wrap items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          
          <div class="flex gap-2">
              <button 
                v-for="period in periods" 
                :key="period"
                @click="selectedPeriod = period"
                class="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-semibold transition-colors"
                :class="selectedPeriod === period ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'"
              >
                {{ period }}
              </button>
              
              <button 
                @click="selectedPeriod = 'all'"
                class="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 text-sm font-semibold transition-colors"
                :class="selectedPeriod === 'all' ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'"
              >
                Tout
              </button>
          </div>

          <div class="ml-auto relative w-full max-w-xs md:block hidden">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input 
                v-model="searchQuery"
                class="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 dark:bg-slate-700 border-none text-sm focus:ring-2 focus:ring-primary/20" 
                placeholder="Rechercher une matière..." 
                type="text"
            />
          </div>
        </div>

        <!-- Table Container -->
        <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900/50 border-bottom border-slate-200 dark:border-slate-700">
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 w-1/3">Matière</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date Val.</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Moyenne</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center">Coefficient</th>
                  <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Détails</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                <tr v-if="loading" class="text-center py-8">
                    <td colspan="5" class="py-8 text-slate-500">Chargement des notes...</td>
                </tr>
                <tr v-else-if="filteredNotes.length === 0" class="text-center py-8">
                    <td colspan="5" class="py-8 text-slate-500">Aucune note validée pour cette période.</td>
                </tr>
                
                <tr v-for="note in filteredNotes" :key="note._id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td class="px-6 py-5">
                    <div class="flex items-center gap-3">
                      <div class="size-10 rounded-lg flex items-center justify-center" :class="getSubjectColorBg(note.matiere?.nom)">
                        <span class="material-symbols-outlined">{{ getSubjectIcon(note.matiere?.nom) }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ note.matiere?.nom }}</span>
                        <!-- Display first evaluation type or generic -->
                        <span class="text-xs text-slate-400">{{ note.periode }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-5 text-sm text-slate-500 dark:text-slate-400">{{ formatDate(note.dateValidation) }}</td>
                  <td class="px-6 py-5">
                    <div class="inline-flex items-center justify-center rounded-lg h-9 w-16 text-sm font-black border" :class="getNoteColor(note.moyenne)">
                      {{ note.moyenne?.toFixed(1) }}/20
                    </div>
                  </td>
                  <td class="px-6 py-5 text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">{{ note.matiere?.coefficient || 1 }}</td>
                  <td class="px-6 py-5 text-right">
                    <!-- Check breakdown if available in 'notes' array inside note doc -->
                     <div class="flex justify-end gap-1">
                        <span v-for="(n, idx) in note.notes" :key="idx" class="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300" :title="'Coef: ' + n.coefficient">
                            {{ n.valeur }}
                        </span>
                     </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination / Footer -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-700">
            <p class="text-xs font-medium text-slate-500">Affichage de 1 à 5 sur 24 épreuves</p>
            <div class="flex gap-2">
              <button class="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors disabled:opacity-50" disabled="">
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button class="size-8 flex items-center justify-center rounded-lg border border-primary bg-primary text-white text-xs font-bold">1</button>
              <button class="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700">2</button>
              <button class="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700">3</button>
              <button class="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Additional Info Section -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div class="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/10">
            <h3 class="text-lg font-bold mb-2 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">info</span>
              Information importante
            </h3>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Les notes affichées ici sont transmises directement par vos professeurs. Si vous constatez une erreur, veuillez contacter le secrétariat pédagogique ou le professeur concerné dans un délai de 48 heures.
            </p>
          </div>
          <div class="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col justify-center">
            <div class="flex items-center gap-4">
              <div class="bg-white dark:bg-slate-700 p-3 rounded-xl shadow-sm">
                <span class="material-symbols-outlined text-primary text-3xl">picture_as_pdf</span>
              </div>
              <div class="flex flex-col">
                <p class="text-sm font-bold text-slate-900 dark:text-white">Bulletin Trimestriel</p>
                <p class="text-xs text-slate-500">Prêt pour téléchargement • PDF • 1.2 MB</p>
              </div>
              <button class="ml-auto text-primary text-sm font-bold hover:underline">
                Voir
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import api from '@/services/api';

const loading = ref(true);
const user = ref(null);
const classe = ref(null);
const notes = ref([]);
const periods = ref([]);
const selectedPeriod = ref('');
const searchQuery = ref('');

// Computed
const filteredNotes = computed(() => {
  let filtered = notes.value;
  
  // Filter by Period
  if (selectedPeriod.value && selectedPeriod.value !== 'all') {
    filtered = filtered.filter(n => n.periode === selectedPeriod.value);
  }
  
  // Filter by Search (Matière)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter(n => 
      n.matiere?.nom?.toLowerCase().includes(q)
    );
  }
  
  return filtered;
});

const average = computed(() => {
  if (filteredNotes.value.length === 0) return 'N/A';
  
  let totalPoints = 0;
  let totalCoef = 0;
  
  filteredNotes.value.forEach(note => {
    // Assuming 'note.moyenne' is the average for that evaluation/subject entry
    // or if the note object represents a single grade entry, we use value * coef.
    // However, the display shows single grades. 
    // If 'notes' array in DB is [ {valeur: 15, coef: 2} ], we need to flatten or aggregate.
    // The previous implementation assumed rows were "Matières" with multiple notes?
    // Let's assume the API returns individual Grade documents or Note documents which group grades.
    
    // Based on Controller: exports.createNotes creates a Note document with an array of "notes": [{valeur, coefficient}]
    // And also has "moyenne" calculated.
    if (note.moyenne !== undefined && note.matiere) {
       totalPoints += note.moyenne * (note.matiere.coefficient || 1);
       totalCoef += (note.matiere.coefficient || 1);
    }
  });
  
  if (totalCoef === 0) return 'N/A';
  return (totalPoints / totalCoef).toFixed(2);
});

// Fetch Data
const fetchData = async () => {
  loading.value = true;
  try {
    // 1. Get Me
    const userRes = await api.getMe();
    user.value = userRes.data.data;
    
    // 2. Get Class Info (for Filiere)
    if (user.value.classe) {
      const classId = user.value.classe._id || user.value.classe;
      const classRes = await api.getClasse(classId);
      classe.value = classRes.data.data;
      
    // 3. Get Notes
    await fetchNotes();
    
    // 4. Derive available periods from data + defaults based on filiere as fallback
    const distinctPeriods = [...new Set(notes.value.map(n => n.periode))].filter(Boolean).sort();
    
    if (distinctPeriods.length > 0) {
        periods.value = distinctPeriods;
        // Default to the first found period usually (or last if chronologically sorted, but let's stick to first or all)
        selectedPeriod.value = periods.value[0];
    } else {
         // Fallback if no notes yet
         if (classe.value && classe.value.filiere === 'Technique') {
            periods.value = ['Semestre 1', 'Semestre 2'];
         } else {
            periods.value = ['Trimestre 1', 'Trimestre 2', 'Trimestre 3'];
         }
         selectedPeriod.value = periods.value[0];
    }
    
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const fetchNotes = async () => {
  if (!user.value) return;
  
  try {
     const params = {
        eleve: user.value._id,
        statut: 'VALIDEE'
     };
     
     const res = await api.getNotes(params);
     notes.value = res.data.data;
     
  } catch (error) {
     console.error('Error fetching notes:', error);
  }
};

// UI Helpers
const getSubjectIcon = (subjectName) => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('math')) return 'calculate';
    if (s.includes('hist') || s.includes('geo')) return 'public';
    if (s.includes('phys') || s.includes('chimie') || s.includes('sci')) return 'science';
    if (s.includes('fran') || s.includes('litt')) return 'menu_book';
    if (s.includes('angl') || s.includes('lang')) return 'language';
    if (s.includes('sport') || s.includes('eps')) return 'sports_soccer';
    return 'assignment'; // default
};

const getSubjectColorBg = (subjectName) => {
    const s = (subjectName || '').toLowerCase();
    if (s.includes('math')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
    if (s.includes('hist') || s.includes('geo')) return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
    if (s.includes('phys') || s.includes('chimie')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600';
    if (s.includes('fran')) return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600';
    if (s.includes('angl')) return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600';
    return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR');
};

const getNoteColor = (valeur) => {
  if (valeur >= 16) return 'bg-green-100 text-green-700 border-green-200';
  if (valeur >= 12) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (valeur >= 10) return 'bg-slate-100 text-slate-700 border-slate-200';
  return 'bg-red-50 text-red-700 border-red-200';
};

onMounted(() => {
  fetchData();
  
  // Font loading (kept from original)
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
