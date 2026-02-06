<template>
  <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-100">
    <div class="max-w-7xl mx-auto w-full flex flex-col gap-6">
      <!-- Top Navigation Bar -->
      <header class="h-16 border-b border-[#d0dbe7] dark:border-slate-800 bg-white dark:bg-[#1a242f] sticky top-0 z-40 flex items-center justify-between px-8">
        <div class="flex items-center gap-6 flex-1">
          <h2 class="text-[#0e141b] dark:text-white text-lg font-bold tracking-tight">Suivi de l'Activité Enseignante</h2>
          <div class="relative w-full max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#4e7397] text-[20px]">search</span>
            <input v-model="searchQuery" class="w-full pl-10 pr-4 py-2 bg-background-light dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary placeholder-[#4e7397] dark:text-white" placeholder="Rechercher un enseignant ou un département..." type="text"/>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <nav class="hidden lg:flex items-center gap-6 mr-6 border-r border-[#d0dbe7] dark:border-slate-800 pr-6">
            <a class="text-sm font-medium text-[#4e7397] hover:text-primary transition-colors" href="#">Départements</a>
            <a class="text-sm font-medium text-[#4e7397] hover:text-primary transition-colors" href="#">Plannings</a>
          </nav>
          <div class="flex items-center gap-2">
            <button class="size-10 flex items-center justify-center rounded-lg bg-background-light dark:bg-slate-800 text-[#0e141b] dark:text-white hover:bg-[#e7edf3] transition-colors relative">
              <span class="material-symbols-outlined">notifications</span>
              <span class="absolute top-2 right-2 size-2 bg-danger rounded-full border-2 border-white dark:border-[#1a242f]"></span>
            </button>
            <button class="size-10 flex items-center justify-center rounded-lg bg-background-light dark:bg-slate-800 text-[#0e141b] dark:text-white hover:bg-[#e7edf3] transition-colors">
              <span class="material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>

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
            <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ kpis.completudeNotes }}%</p>
          </div>
          <div class="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#d0dbe7] dark:border-slate-800 shadow-sm flex flex-col gap-2">
            <div class="flex justify-between items-start">
              <p class="text-[#4e7397] text-sm font-medium">Évaluations Prévues (S34)</p>
              <span class="material-symbols-outlined text-warning">event_note</span>
            </div>
            <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ kpis.evaluationsPrevues }}</p>
          </div>
        </div>

        <!-- Main Data Section -->
        <section class="bg-white dark:bg-[#1a242f] rounded-xl border border-[#d0dbe7] dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div class="p-6 border-b border-[#d0dbe7] dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 class="text-[#0e141b] dark:text-white text-xl font-bold">Récapitulatif de l'activité pédagogique</h3>
              <p class="text-[#4e7397] text-sm font-normal">Surveillance du cycle d'évaluation en cours</p>
            </div>
            <div class="flex items-center gap-2">
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
                      <span class="text-xs text-[#4e7397]">cette semaine</span>
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
            <p class="text-xs text-[#4e7397]">Affichage de 1-4 sur 42 enseignants</p>
            <div class="flex items-center gap-2">
              <button class="size-8 flex items-center justify-center rounded border border-[#d0dbe7] dark:border-slate-700 text-[#4e7397] disabled:opacity-50" disabled="">
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button class="size-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-xs font-bold">1</button>
              <button class="size-8 flex items-center justify-center rounded border border-[#d0dbe7] dark:border-slate-700 text-[#4e7397] hover:bg-background-light dark:hover:bg-slate-800 transition-colors text-xs font-bold">2</button>
              <button class="size-8 flex items-center justify-center rounded border border-[#d0dbe7] dark:border-slate-700 text-[#4e7397] hover:bg-background-light dark:hover:bg-slate-800 transition-colors text-xs font-bold">3</button>
              <button class="size-8 flex items-center justify-center rounded border border-[#d0dbe7] dark:border-slate-700 text-[#4e7397] hover:bg-background-light dark:hover:bg-slate-800 transition-colors">
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Bottom Tools Section -->
        <div class="pb-12">
          <!-- Admin Alerts -->

          <div class="bg-white dark:bg-[#1a242f] p-6 rounded-xl border border-[#d0dbe7] dark:border-slate-800 shadow-sm">
            <div class="flex items-center gap-3 mb-6">
              <div class="size-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
                <span class="material-symbols-outlined">warning</span>
              </div>
              <div>
                <h4 class="text-[#0e141b] dark:text-white font-bold">Alertes Administratives</h4>
                <p class="text-xs text-[#4e7397]">Actions urgentes requises</p>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="alerte in alertes" :key="alerte.id" class="flex items-center gap-3 p-3 rounded-lg border" :class="getAlerteClass(alerte.type)">
                <span class="material-symbols-outlined text-[20px]" :class="getAlerteIconClass(alerte.type)">{{ alerte.icon }}</span>
                <div class="flex-1">
                  <p class="text-xs font-bold text-[#0e141b] dark:text-white">{{ alerte.titre }}</p>
                  <p class="text-[10px] text-[#4e7397]">{{ alerte.description }}</p>
                </div>
                <button class="text-[10px] font-bold text-primary uppercase">Voir</button>
              </div>
            </div>
          </div>
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

const kpis = ref({
  completudeNotes: 0,
  evaluationsPrevues: 0
})

const enseignants = ref([])
const alertes = ref([])

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
    console.log('Fetching activity data...')
    
    // Fetch all professors
    const profsRes = await api.getUsers({ role: 'PROFESSEUR' })
    const professors = profsRes.data.data
    console.log('Professors fetched:', professors.length, professors)
    
    // Fetch all class-subject assignments
    const assignmentsRes = await api.getAllGlobalClasseMatieres()
    const assignments = assignmentsRes.data.data
    console.log('Assignments fetched:', assignments.length)
    
    // Fetch all evaluations
    const evalsRes = await api.getEvaluations()
    const allEvaluations = evalsRes.data.data
    console.log('Evaluations fetched:', allEvaluations.length)
    
    // Map professors with their data
    enseignants.value = professors.map((prof) => {
      // ... mapping logic (summarized for brevity if unmodified) ...
      // Assuming mapping logic is unchanged, I will just copy it or keep it as is.
      // Since replace_file_content replaces the whole block, I must include the logic.
      
      // ... (Re-implementing mapping logic to be safe) ...
      const profAssignments = assignments.filter(a => {
        const profId = a.professeur?._id || a.professeur
        const match = profId === prof._id || profId?.toString() === prof._id?.toString()
        return match
      })
      
      const subjects = [...new Set(profAssignments.map(a => a.matiere?.nom || 'N/A'))]
      const classes = [...new Set(profAssignments.map(a => {
        const classe = a.classe
        return classe ? `${classe.niveau} ${classe.section}` : 'N/A'
      }))]
      
      const validatedEvals = allEvaluations.filter(e => {
        const evalProfId = e.professeur?._id || e.professeur
        const match = (evalProfId === prof._id || evalProfId?.toString() === prof._id?.toString()) && 
                     e.statut === 'VALIDE'
        return match
      })
      
      const totalEvals = allEvaluations.filter(e => {
        const evalProfId = e.professeur?._id || e.professeur
        return evalProfId === prof._id || evalProfId?.toString() === prof._id?.toString()
      })
      const completude = totalEvals.length > 0 
        ? Math.round((validatedEvals.length / totalEvals.length) * 100) 
        : 0
      
      const scheduledEvals = validatedEvals.filter(e => e.date).length
      
      return {
        id: prof._id,
        nom: `${prof.prenom} ${prof.nom}`,
        initials: `${prof.prenom[0]}${prof.nom[0]}`.toUpperCase(),
        matiere: subjects.join(', ') || 'Aucune matière',
        classes: classes.join(', ') || 'Aucune classe',
        completude: completude,
        evaluations: scheduledEvals
      }
    })
    
    // Calculate KPIs
    const totalCompletude = enseignants.value.reduce((sum, e) => sum + e.completude, 0)
    const avgCompletude = enseignants.value.length > 0 
      ? Math.round(totalCompletude / enseignants.value.length) 
      : 0
    
    const totalScheduled = enseignants.value.reduce((sum, e) => sum + e.evaluations, 0)
    
    kpis.value = {
      completudeNotes: avgCompletude,
      evaluationsPrevues: totalScheduled
    }
    
    // Fetch notifications
    const notifRes = await api.getNotifications()
    alertes.value = notifRes.data.data.slice(0, 5).map(n => ({
      id: n._id,
      titre: n.titre,
      description: n.message,
      type: n.type === 'urgent' ? 'danger' : 'warning',
      icon: n.type === 'urgent' ? 'error' : 'info'
    }))
    
  } catch (err) {
    console.error('Erreur chargement suivi activité:', err)
  } finally {
    isLoading.value = false
  }
}

const exportCSV = () => {
  const headers = 'Enseignant,Matière,Classes,Complétude Notes (%),Éval. Planifiées\n'
  const rows = enseignants.value.map(e => 
    `"${e.nom}","${e.matiere}","${e.classes}",${e.completude},${e.evaluations}`
  ).join('\n')
  
  const csv = headers + rows
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `activite_enseignante_${new Date().toISOString().split('T')[0]}.csv`
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
    `Matière(s): ${enseignant.matiere}\nClasse(s): ${enseignant.classes}\nComplétude: ${enseignant.completude}%\nÉvaluations planifiées: ${enseignant.evaluations}`,
    'Fermer',
    () => {},
    'info',
    'Fermer'
  )
  // Hack to ensure logic works as "OK" closing it.
  confirmModalActionText.value = 'OK'
  confirmModalCancelText.value = 'Fermer'
}

onMounted(() => {
  fetchData()
})

const getCompletudeBarClass = (completude) => {
  if (completude >= 90) return 'bg-success'
  if (completude >= 70) return 'bg-primary'
  if (completude >= 50) return 'bg-warning'
  return 'bg-danger'
}

const getAlerteClass = (type) => {
  switch(type) {
    case 'danger': return 'bg-danger/5 border border-danger/10'
    case 'warning': return 'bg-warning/5 border border-warning/10'
    default: return 'bg-slate-50 border border-slate-200'
  }
}

const getAlerteIconClass = (type) => {
  switch(type) {
    case 'danger': return 'text-danger'
    case 'warning': return 'text-warning'
    default: return 'text-slate-600'
  }
}
</script>
