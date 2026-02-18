<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-7xl mx-auto p-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
        <div class="text-center">
          <span class="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
          <p class="text-[#4e7397] mt-4">Chargement des classes...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Page Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h1 class="text-3xl font-black text-[#0e141b] dark:text-white mb-2">Validation des Bulletins</h1>
              <div class="flex items-center gap-2 text-sm text-[#4e7397] dark:text-slate-400">
                <span class="material-symbols-outlined text-lg">calendar_today</span>
                <p class="text-base font-normal">Trimestre 1, Année Scolaire 2025-2026</p>
              </div>
            </div>
            <div class="flex gap-3">
              <!-- Removed Aide button -->
              <button @click="toutValider" class="flex items-center gap-2 cursor-pointer justify-center rounded-lg h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90">
                <span class="material-symbols-outlined text-xl">done_all</span>
                <span>Tout Valider</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="flex flex-col gap-3 rounded-xl p-6 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 shadow-sm col-span-1 md:col-span-3">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-semibold uppercase tracking-wider">Classes prêtes</p>
            <span class="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg material-symbols-outlined">assignment_turned_in</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-black">{{ stats.classesPretes }}</p>
          <div class="flex items-center gap-1 text-green-600 font-bold text-sm">
            <span class="material-symbols-outlined text-sm font-bold">trending_up</span>
            <span>Prêtes à être validées (Toutes matières ont min 2 évals)</span>
          </div>
        </div>
        <!-- Removed "Élèves concernés" and "Moyenne Générale" cards as requested -->
      </div>

      <!-- Actions Bar -->
      <div class="bg-white dark:bg-slate-800 rounded-t-xl border-x border-t border-[#d0dbe7] dark:border-slate-700 px-6 py-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-6">
            <div class="flex items-center gap-2 group cursor-pointer">
              <div class="w-5 h-5 rounded border-2 border-primary bg-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-xs font-bold">check</span>
              </div>
              <span class="text-[#0e141b] dark:text-slate-200 text-sm font-medium">{{ classesSelectionnees }} classes sélectionnées</span>
            </div>
            <!-- Removed Filter and Export buttons -->
          </div>
          <!-- Removed Search Bar -->
        </div>
      </div>

      <!-- Table Content -->
      <div class="bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 rounded-b-xl overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-[#d0dbe7] dark:border-slate-700">
            <tr>
              <th class="px-6 py-4 w-12"></th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397] dark:text-slate-400">Classe & Professeur Principal</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397] dark:text-slate-400">Performance (Moy/Min/Max)</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397] dark:text-slate-400 text-center">Statut</th>
              <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#4e7397] dark:text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#d0dbe7] dark:divide-slate-700">
            <tr v-if="filteredClasses.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500 text-sm">Toutes les classes sont validées ou aucune classe trouvée.</td>
            </tr>
            <tr v-for="classe in filteredClasses" :key="classe.id" class="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors group">
              <td class="px-6 py-4">
                <input v-model="classe.selected" class="h-5 w-5 rounded border-[#d0dbe7] text-primary focus:ring-primary transition-all" type="checkbox"/>
              </td>
              <td class="px-6 py-4 cursor-pointer hover:bg-primary/5 transition-colors" @click="voirDetails(classe.id)">
                <div class="flex flex-col">
                  <span class="text-[#0e141b] dark:text-white font-bold text-sm">{{ classe.nom }}</span>
                  <span class="text-[#4e7397] dark:text-slate-400 text-xs">{{ classe.professeur }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <div class="text-sm">
                    <span class="font-bold text-primary">{{ classe.moyenne }}</span>
                    <span class="text-slate-300 mx-1">/</span>
                    <span class="text-slate-500 text-xs">{{ classe.min }}</span>
                    <span class="text-slate-300 mx-1">/</span>
                    <span class="text-slate-500 text-xs">{{ classe.max }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" :class="getStatutClass(classe.statut)">
                  <span class="size-1.5 rounded-full mr-1.5" :class="getStatutDotClass(classe.statut)"></span>
                  {{ classe.statut }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button @click="voirDetails(classe.id)" class="text-primary hover:text-primary/80 text-sm font-medium">Voir</button>
                  <button @click="validerClasse(classe.id)" class="text-[#4e7397] hover:text-primary text-sm font-medium">Valider</button>
                  <!-- Removed 'Imprimer' button -->
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success, error: showError } = useToast()

const stats = ref({
  classesPretes: '0/0'
})

const classes = ref([])
const isLoading = ref(true)

const classesSelectionnees = computed(() => {
  return filteredClasses.value.filter(c => c.selected).length
})

const filteredClasses = computed(() => {
    // Hide classes that are fully validated (all bulletins signed by proviseur)
    return classes.value.filter(c => {
        if (c.bulletinsCount > 0 && c.signedCount === c.bulletinsCount) {
            return false;
        }
        return true;
    });
});

const getStatutClass = (statut) => {
  switch(statut) {
    case 'Prêt': return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
    case 'En cours': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
    case 'En attente': return 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
    default: return 'bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
  }
}

const getStatutDotClass = (statut) => {
  switch(statut) {
    case 'Prêt': return 'bg-green-500'
    case 'En cours': return 'bg-amber-500'
    case 'En attente': return 'bg-red-500'
    default: return 'bg-slate-500'
  }
}

// Charger les classes depuis l'API
// Charger les classes depuis l'API
const fetchClasses = async () => {
  try {
    isLoading.value = true
    // Use new endpoint
    const response = await api.getValidationPageStats();
    const { classes: classesData, stats: statsData } = response.data.data;
    
    classes.value = classesData.map(c => ({
        ...c,
        selected: false
    }));

    stats.value = {
      classesPretes: `${statsData.classesPretes}/${statsData.totalClasses}`
    }
    
  } catch (error) {
    console.error('Erreur chargement classes:', error)
    // Keep empty state
    classes.value = []
  } finally {
    isLoading.value = false
  }
}

const toutValider = async () => {
  if (!confirm('Voulez-vous valider TOUTES les classes prêtes ?')) return;
  
  const classesPretes = classes.value.filter(c => c.statut === 'Prêt');
  if (classesPretes.length === 0) {
      showError('Aucune classe n\'est prête à être validée.');
      return;
  }

  for (const classe of classesPretes) {
      try {
          await api.validateClassBulletins(classe.id);
      } catch (e) {
          console.error(`Erreur validation classe ${classe.nom}`, e);
      }
  }
  success('Validation terminée.');
  fetchClasses();
}

const voirDetails = (classeId) => {
  router.push(`/proviseur/validation-bulletins/${classeId}`)
}

const validerClasse = async (classeId) => {
  if (!confirm('Valider tous les bulletins de cette classe ?')) return;
    try {
        await api.validateClassBulletins(classeId);
        success('Classe validée avec succès');
        fetchClasses();
    } catch (e) {
        console.error(e);
        showError('Erreur lors de la validation');
    }
}

// Charger les classes au montage du composant
onMounted(() => {
  fetchClasses()
})
</script>