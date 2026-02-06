<template>
  <div class="flex-1 flex flex-col overflow-y-auto">
    <!-- Header -->
    <header class="flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky top-0 z-10">
      <div class="flex flex-col">
        <h2 class="text-2xl font-black tracking-tight">Historique des Notes</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Suivez l'évolution académique en temps réel.</p>
      </div>
      <div class="flex items-center gap-4">
      <div class="flex items-center gap-4">
        <!-- Child Selector -->
        <div v-if="children.length > 0" class="relative">
             <select v-model="selectedChildId" class="appearance-none bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 pr-10 font-bold text-sm focus:ring-2 focus:ring-primary/20 cursor-pointer text-[#0e141b] dark:text-white">
                 <option v-for="child in children" :key="child._id" :value="child._id">
                     {{ child.prenom }} {{ child.nom }}
                 </option>
             </select>
             <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-lg">expand_more</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="size-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-50 border border-slate-200 dark:border-slate-700">
            <span class="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>
      </div>
    </header>

    <!-- Stats Overview -->
    <div class="px-8 pt-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Moyenne Générale</p>
          <div class="flex items-baseline gap-2">
            <p class="text-3xl font-black text-primary">{{ stats.average }}<span class="text-sm text-slate-400">/20</span></p>
          </div>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Note la plus basse</p>
           <p class="text-3xl font-black text-red-500">{{ stats.lowest }}<span class="text-sm text-slate-400 font-normal ml-2">/ 20</span></p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Évaluations totales</p>
          <p class="text-3xl font-black">{{ stats.totalEvaluations }}<span class="text-sm text-slate-400 font-normal ml-2">notes</span></p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="px-8 py-6">
      <div class="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button @click="selectedPeriod = 'all'" class="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold transition-all" :class="selectedPeriod === 'all' ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary'">
          Toutes les périodes
        </button>
        <button v-for="p in periods" :key="p" @click="selectedPeriod = p" class="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-all" :class="selectedPeriod === p ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary'">
          {{ p }}
        </button>
      </div>
    </div>

    <!-- Grades List -->
    <div class="px-8 pb-12">
      <div v-if="isLoading" class="py-12 text-center">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
      <div v-else-if="filteredNotes.length === 0" class="py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200">
          <p class="text-slate-500">Aucune note trouvée pour cette sélection.</p>
      </div>
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Matière</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Évaluation</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Note /20</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Coeff.</th>
              <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Période</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
            <tr v-for="grade in filteredNotes" :key="grade._id" class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
              <td class="px-6 py-4 text-sm font-medium">{{ grade.date }}</td>
              <td class="px-6 py-4">
                  <span class="text-sm font-bold">{{ grade.subjectName }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{{ grade.evalTitle }}</td>
              <td class="px-6 py-4">
                <span class="text-base font-bold" :class="getGradeColor(grade.note)">{{ grade.note }}</span>
              </td>
              <td class="px-6 py-4 text-sm font-medium">{{ grade.coefficient }}</td>
              <td class="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{{ grade.periode }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'

// State
const children = ref([])
const selectedChildId = ref(null)
const notes = ref([])
const isLoading = ref(false)

const selectedPeriod = ref('all')
const periods = ref([])

// Stats
const stats = computed(() => {
    if (!notes.value.length) return { average: '-', totalEvaluations: 0, highest: '-', lowest: '-' };
    
    // Calculate global average respecting coefficients
    const totalPoints = notes.value.reduce((acc, n) => acc + (n.note * n.coefficient), 0);
    const totalCoefs = notes.value.reduce((acc, n) => acc + n.coefficient, 0);
    const avg = totalCoefs ? (totalPoints / totalCoefs).toFixed(2) : '-';
    
    const grades = notes.value.map(n => n.note);
    
    return {
        average: avg,
        totalEvaluations: notes.value.length,
        highest: Math.max(...grades),
        lowest: Math.min(...grades)
    };
});

// Computed
const filteredNotes = computed(() => {
    let res = notes.value;
    if (selectedPeriod.value !== 'all') {
        res = res.filter(n => n.periode === selectedPeriod.value);
    }
    return res;
});

// Fetch Data
const fetchChildren = async () => {
    try {
        const res = await api.getChildren();
        children.value = res.data.data;
        if (children.value.length > 0) {
            selectedChildId.value = children.value[0]._id;
            fetchNotes(); // Initial fetch
        }
    } catch (e) {
        console.error(e);
    }
};

const fetchNotes = async () => {
    if (!selectedChildId.value) return;
    
    isLoading.value = true;
    try {
        const res = await api.getNotes({ 
            eleve: selectedChildId.value, 
            statut: 'VALIDEE' 
        });
        
        // Enrich notes
        notes.value = res.data.data.map(n => ({
            ...n,
            subjectName: n.matiere?.nom || 'Matière inconnue',
            evalTitle: n.periode || 'Évaluation',
            coefficient: n.matiere?.coefficient || 1,
            note: n.moyenne !== undefined ? parseFloat(n.moyenne.toFixed(2)) : 0,
            date: new Date(n.updatedAt).toLocaleDateString()
        }));
        
        // Derive periods
        const distinctPeriods = [...new Set(notes.value.map(n => n.periode))].filter(Boolean).sort();
        periods.value = distinctPeriods;
        // Default to filtering all or most recent? Let's stay on 'all' or last one
        if (distinctPeriods.length && selectedPeriod.value === 'all') {
            selectedPeriod.value = 'all'; 
        }

    } catch (e) {
        console.error(e);
    } finally {
        isLoading.value = false;
    }
};

// Watchers
watch(selectedChildId, () => {
    // Reset and fetch when child changes
    notes.value = [];
    selectedPeriod.value = 'all';
    fetchNotes();
});

// Helpers
const getGradeColor = (note) => {
  if (note >= 16) return 'text-primary'
  if (note >= 14) return 'text-slate-900 dark:text-slate-100'
  if (note >= 10) return 'text-amber-500'
  return 'text-red-500'
}

onMounted(fetchChildren);
</script>
