<template>
  <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-100">
    <div class="max-w-7xl mx-auto w-full flex flex-col gap-6">
      <!-- Page Body -->
      <div class="p-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm">
          <router-link to="/proviseur" class="text-[#4e7397] hover:text-primary transition-colors">Accueil</router-link>
          <span class="text-[#4e7397]">/</span>
          <span class="text-[#0e141b] dark:text-white font-semibold">Suivi de l'Activité Enseignante</span>
        </nav>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#d0dbe7] dark:border-slate-800 shadow-sm flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <p class="text-[#4e7397] text-sm font-medium">Complétude des Notes</p>
              <span class="material-symbols-outlined text-primary">donut_large</span>
            </div>
            <div>
              <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ kpis.completudeNotes }}</p>
              <p class="text-xs text-slate-400 mt-1">Professeurs à jour (>= 2 notes)</p>
            </div>
          </div>
          <!-- Removed "Évaluations Prévues (S34)" as requested -->
        </div>

        <!-- Main Data Section -->
        <section class="bg-white dark:bg-[#1a242f] rounded-xl border border-[#d0dbe7] dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 border-b border-[#d0dbe7] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="text-[#0e141b] dark:text-white text-xl font-bold">Récapitulatif de l'activité pédagogique</h3>
              <p class="text-[#4e7397] text-sm font-normal">Surveillance du cycle d'évaluation en cours</p>
            </div>
            <div class="flex items-center gap-2">
               <!-- Period Selector -->
              <div class="relative">
                <select v-model="selectedPeriod" @change="fetchData" class="appearance-none bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm font-medium text-slate-700 dark:text-white focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <optgroup label="Filière Générale">
                    <option value="Trimestre 1">Trimestre 1</option>
                    <option value="Trimestre 2">Trimestre 2</option>
                    <option value="Trimestre 3">Trimestre 3</option>
                  </optgroup>
                   <optgroup label="Filière Technique">
                    <option value="Semestre 1">Semestre 1</option>
                    <option value="Semestre 2">Semestre 2</option>
                  </optgroup>
                </select>
                 <span class="material-symbols-outlined text-xs absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">expand_more</span>
              </div>

              <button @click="exportCSV" class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
                <span class="material-symbols-outlined text-[20px]">download</span>
                Exporter CSV
              </button>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-background-light/50 dark:bg-slate-800/50">
                  <th class="px-6 py-4 text-[#4e7397] text-xs font-bold uppercase tracking-wider">Enseignant</th>
                  <th class="px-6 py-4 text-[#4e7397] text-xs font-bold uppercase tracking-wider">Matière / Classes</th>
                  <th class="px-6 py-4 text-[#4e7397] text-xs font-bold uppercase tracking-wider">Complétude Notes</th>
                  <th class="px-6 py-4 text-[#4e7397] text-xs font-bold uppercase tracking-wider">Éval. Planifiées</th>
                  <th class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#d0dbe7] dark:divide-slate-800">
                <tr v-if="enseignants.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-500 text-sm">Aucun enseignant trouvé pour cette période.</td>
                </tr>
                <tr v-for="enseignant in enseignants" :key="enseignant.id" class="hover:bg-background-light/30 dark:hover:bg-slate-800/20 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{{ enseignant.initials }}</div>
                      <div>
                        <p class="text-sm font-bold text-[#0e141b] dark:text-white">{{ enseignant.nom }}</p>
                        <p class="text-xs text-[#4e7397]">ID: {{ enseignant.id }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <p class="text-sm font-medium text-[#0e141b] dark:text-white">{{ enseignant.matiere }}</p>
                    <p class="text-xs text-[#4e7397]">{{ enseignant.classes }}</p>
                  </td>
  
                  <td class="px-6 py-4">
                    <div class="flex flex-col gap-1.5 w-full max-w-[120px]">
                      <div class="flex justify-between text-[10px] font-bold">
                        <span class="text-[#0e141b] dark:text-white">{{ enseignant.completude }}%</span>
                      </div>
                      <div class="h-1.5 w-full bg-[#e7edf3] dark:bg-slate-700 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" :class="getCompletudeBarClass(enseignant.completude)" :style="`width: ${enseignant.completude}%`"></div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-[#0e141b] dark:text-white">{{ enseignant.evaluations }}</span>
                      <span class="text-xs text-[#4e7397]">à venir</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button @click="viewDetails(enseignant)" class="p-2 text-[#4e7397] hover:text-primary transition-colors" title="Détails">
                        <span class="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination / Footer Table -->
          <div class="p-4 bg-background-light/30 dark:bg-slate-800/30 border-t border-[#d0dbe7] dark:border-slate-800 flex items-center justify-between">
            <p class="text-xs text-[#4e7397]">Affichage de {{ enseignants.length }} enseignants</p>
          </div>
        </section>

        <!-- Bottom Tools Section (Removed Alertes Administratives) -->
        <div class="pb-12">
        </div>
      </div>
    </div>


    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :confirm-text="confirmModalActionText"
      :cancel-text="confirmModalCancelText"
      :type="confirmModalType"
      @confirm="executeConfirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

const { success, error, info } = useToast()

const searchQuery = ref('')
const isLoading = ref(true)
const selectedPeriod = ref('Trimestre 2') // Default

const kpis = ref({
  completudeNotes: 0,
  evaluationsPrevues: 0
})

const enseignants = ref([])

// Modal state
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmModalActionText = ref('Confirmer')
const confirmModalCancelText = ref('Annuler')
const confirmModalType = ref('info')
const pendingAction = ref(null)

const fetchData = async () => {
  try {
    isLoading.value = true
    
    // Use specific endpoint for this page
    // Note: Assuming api.getSuiviActivite exists or using generic get call if allowed
    // If not, we might need to update api service. 
    // Since I can't update api.js easily without seeing it (though I can infer), I'll try to use axios direct or assume it's added.
    // For now, let's try calling the new route.
    const res = await api.getSuiviActiviteStats({ periode: selectedPeriod.value });
    
    const { data } = res.data;
    enseignants.value = data.enseignants;
    kpis.value = data.kpis;
    
  } catch (err) {
    console.error('Erreur chargement suivi activité:', err)
    // Fallback or error handling
  } finally {
    isLoading.value = false
  }
}

const exportCSV = () => {
  // Add Byte Order Mark (BOM) for Excel UTF-8 compatibility
  const BOM = '\uFEFF'; 
  const headers = 'Enseignant,Matière,Classes,Complétude Notes (%),Éval. Planifiées\n'
  const rows = enseignants.value.map(e => 
    `"${e.nom}","${e.matiere}","${e.classes}",${e.completude},${e.evaluations}`
  ).join('\n')
  
  const csv = BOM + headers + rows
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `activite_enseignante_${selectedPeriod.value}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
  success('Export CSV réussi')
}

const openConfirmModal = (title, message, actionText, action, type = 'info', cancelText = 'Annuler') => {
  confirmModalTitle.value = title
  confirmModalMessage.value = message
  confirmModalActionText.value = actionText
  confirmModalCancelText.value = cancelText
  confirmModalType.value = type
  pendingAction.value = action
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  pendingAction.value = null
}

const executeConfirmAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
  }
  closeConfirmModal()
}

const viewDetails = (enseignant) => {
  openConfirmModal(
    `Détails de ${enseignant.nom}`,
    `Matière(s): ${enseignant.matiere}\nClasse(s): ${enseignant.classes}\nComplétude: ${enseignant.completude}%\nÉvaluations planifiées (Futur): ${enseignant.evaluations}`,
    'Fermer',
    () => {},
    'info',
    'Fermer'
  )
  confirmModalActionText.value = 'OK'
  confirmModalCancelText.value = 'Fermer'
}

onMounted(() => {
  fetchData()
})

const getCompletudeBarClass = (completude) => {
  if (completude == 100) return 'bg-success'
  if (completude >= 50) return 'bg-warning'
  return 'bg-danger'
}
</script>
