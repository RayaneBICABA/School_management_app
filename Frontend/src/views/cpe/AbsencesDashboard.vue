<template>
  <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
    <div class="max-w-[1600px] mx-auto p-4 lg:p-8">
      <!-- Header & Stats Unified -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div class="flex flex-col gap-1">
          <h2 class="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Console des Absences</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Monitoring, justification et validation des présences scolaires.</p>
        </div>
        
        <div class="flex items-center gap-3 w-full lg:w-auto">
          <button @click="fetchAbsences" class="size-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
            <span class="material-symbols-outlined" :class="{ 'animate-spin': isLoading }">refresh</span>
          </button>
        </div>
      </div>

      <!-- Stats Grid - Compact -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <span class="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Période</p>
            <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.total }}</p>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <span class="material-symbols-outlined">pending_actions</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">À Valider</p>
            <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.pending }}</p>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <span class="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Justifiées</p>
            <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.justified }}</p>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div class="size-12 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
            <span class="material-symbols-outlined">rule</span>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-wider">Réfutées</p>
            <p class="text-xl font-black text-slate-900 dark:text-white">{{ stats.rejected }}</p>
          </div>
        </div>
      </div>

      <!-- Filters & Main Table Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <!-- Optimized Filters Bar -->
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 h-10 shadow-sm">
              <span class="material-symbols-outlined text-slate-400 text-sm">calendar_today</span>
              <input v-model="filters.startDate" type="date" class="bg-transparent border-none text-xs font-bold focus:ring-0 p-0" />
              <span class="text-slate-300">|</span>
              <input v-model="filters.endDate" type="date" class="bg-transparent border-none text-xs font-bold focus:ring-0 p-0" />
            </div>
            
            <select v-model="filters.classe" class="h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-xs font-bold focus:ring-primary shadow-sm min-w-[140px]">
              <option value="">Toutes les classes</option>
              <option v-for="cls in classes" :key="cls._id" :value="cls._id">{{ cls.niveau }} {{ cls.section }}</option>
            </select>
            
            <select v-model="filters.justifie" class="h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-xs font-bold focus:ring-primary shadow-sm">
              <option value="">Tous les justificatifs</option>
              <option value="false">Non justifiées</option>
              <option value="true">Justifiées</option>
            </select>

            <select v-model="filters.status" class="h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-xs font-bold focus:ring-primary shadow-sm">
              <option value="">Absences & Retards</option>
              <option value="all">Tout (Presents inclus)</option>
              <option value="present">Présents uniquement</option>
              <option value="absent">Absents uniquement</option>
              <option value="late">Retards uniquement</option>
            </select>

            <button @click="fetchAbsences" class="h-10 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:brightness-110 transition-all ml-auto">
              Appliquer les filtres
            </button>
          </div>
        </div>

        <!-- Table Content -->
        <div class="flex-1 overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-xs font-black text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 sticky top-0 z-10">
                <th class="px-6 py-4">Élève & Classe</th>
                <th class="px-6 py-4">Détails Absence</th>
                <th class="px-6 py-4 text-center">Statut Justification</th>
                <th class="px-6 py-4 text-right">Actions de Contrôle</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="isLoading" v-for="i in 5" :key="i">
                <td colspan="5" class="px-6 py-8"><div class="h-12 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl"></div></td>
              </tr>
              
              <tr v-else-if="absences.length === 0" class="text-center">
                <td colspan="5" class="py-20">
                  <div class="flex flex-col items-center gap-3">
                    <span class="material-symbols-outlined text-6xl text-slate-200">inbox</span>
                    <p class="text-slate-400 font-medium">Aucun enregistrement ne correspond à vos filtres</p>
                  </div>
                </td>
              </tr>

              <tr v-for="absence in absences" :key="absence._id" class="group hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-5">
                  <div class="flex items-center gap-4">
                    <div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800 shadow-sm" :style="`background-image: url('${absence.eleve?.photo || '/default-avatar.png'}')`"></div>
                    <div>
                      <p class="font-bold text-slate-900 dark:text-white">{{ absence.eleve?.prenom || 'N/A' }} {{ absence.eleve?.nom || 'Élève' }}</p>
                      <span v-if="absence.classe" class="text-[11px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded uppercase">{{ absence.classe.niveau }} {{ absence.classe.section }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900 dark:text-white">{{ formatDate(absence.date) }}</span>
                    <span class="text-xs text-slate-500">{{ absence.heureDebut }} - {{ absence.heureFin }} ({{ absence.heures }}h)</span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex justify-center">
                    <span :class="getStatusClass(absence.statusJustification)" class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                       <span class="size-1.5 rounded-full" :class="getStatusDotClass(absence.statusJustification || absence.statut)"></span>
                       {{ getStatusLabel(absence.statusJustification || absence.statut) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="flex justify-end items-center gap-2 opacity-100 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity">
                    <!-- Valid flow buttons -->
                    <template v-if="absence.statusJustification === 'EN_ATTENTE' || absence.statusJustification === 'REFUTE' || !absence.justifie">
                      <button @click="handleValidate(absence._id)" class="size-9 flex items-center justify-center bg-emerald-500 text-white rounded-lg hover:brightness-110 shadow-lg shadow-emerald-500/20" title="Valider la justification">
                        <span class="material-symbols-outlined text-sm">verified</span>
                      </button>
                    </template>
                    
                    <template v-if="absence.statusJustification === 'EN_ATTENTE' || absence.statusJustification === 'VALIDE' || absence.justifie">
                      <button @click="handleReject(absence._id)" class="size-9 flex items-center justify-center bg-red-500 text-white rounded-lg hover:brightness-110 shadow-lg shadow-red-500/20" title="Réfuter/Invalider">
                        <span class="material-symbols-outlined text-sm">cancel</span>
                      </button>
                    </template>

                    <button @click="openJustifyModal(absence)" class="size-9 flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50" title="Détails / Justifier">
                      <span class="material-symbols-outlined text-sm">info</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modals (Justify & Grouped) -->
    <!-- ... Similar to before but integrated ... -->
    <div v-if="showJustifyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
       <!-- Same modal but styled even tighter -->
       <div class="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
         <div class="p-8">
           <div class="flex justify-between items-center mb-6">
             <h3 class="text-2xl font-black tracking-tight">Justification d'absence</h3>
             <button @click="showJustifyModal = false" class="text-slate-400 hover:text-slate-600"><span class="material-symbols-outlined">close</span></button>
           </div>
           
           <div v-if="selectedAbsence" class="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
             <div class="flex justify-between items-center mb-2">
               <span class="text-xs font-bold text-slate-500 uppercase">Élève</span>
               <span class="text-xs font-black text-primary">{{ selectedAbsence?.eleve?.prenom || 'N/A' }} {{ selectedAbsence?.eleve?.nom || '' }}</span>
             </div>
             <p class="text-sm font-medium mb-2">{{ formatDate(selectedAbsence?.date) }} • {{ selectedAbsence?.heureDebut || '00:00' }} - {{ selectedAbsence?.heureFin || '00:00' }} ({{ selectedAbsence?.heures || 0 }}h)</p>
             <div class="pt-2 border-t border-slate-200 dark:border-slate-700">
               <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                 Matière: <span class="text-slate-700 dark:text-slate-200">{{ selectedAbsence?.matiere?.nom || 'Vie Scolaire' }}</span><br/>
                 Signalé par: <span class="text-slate-700 dark:text-slate-200">{{ selectedAbsence?.markedBy?.prenom || 'Système' }} {{ selectedAbsence?.markedBy?.nom || '' }}</span>
               </p>
             </div>
           </div>

           <div class="space-y-4">
             <div class="flex flex-col gap-2">
               <label class="text-sm font-bold ml-1">Motif de l'absence</label>
               <select v-model="justification.motivation" class="w-full h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-sm font-bold focus:ring-primary">
                 <option value="maladie">Certificat Médical</option>
                 <option value="famille">Raison Familiale</option>
                 <option value="transport">Problème de Transport</option>
                 <option value="autre">Autre motif</option>
               </select>
             </div>

             <div class="flex flex-col gap-2">
               <label class="text-sm font-bold ml-1">Commentaires de la CPE</label>
               <textarea v-model="justification.notes" rows="4" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:ring-primary" placeholder="Notes internes..."></textarea>
             </div>
           </div>

           <div class="grid grid-cols-2 gap-4 mt-8">
             <button @click="showJustifyModal = false" class="h-14 font-bold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">Annuler</button>
             <button @click="submitJustification" class="h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:brightness-110 transition-all shadow-xl">Enregistrer & Valider</button>
           </div>
         </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const isLoading = ref(true)
const absences = ref([])
const classes = ref([])

const getLocalDate = (date) => {
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  const localDate = new Date(d.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().split('T')[0]
}

const filters = reactive({
  startDate: getLocalDate(new Date().setDate(new Date().getDate() - 30)), 
  endDate: getLocalDate(new Date()),
  classe: '',
  justifie: '',
  status: '' 
})

const stats = reactive({
  total: 0,
  pending: 0,
  justified: 0,
  rejected: 0
})

const showJustifyModal = ref(false)
const showGroupedModal = ref(false)
const selectedAbsence = ref(null)
const justification = reactive({
  motivation: 'maladie',
  notes: ''
})

const fetchClasses = async () => {
  try {
    const res = await api.getClasses()
    classes.value = res.data.data
  } catch (error) {
    console.error('Error classes:', error)
  }
}

const fetchAbsences = async () => {
  try {
    isLoading.value = true
    const response = await api.getManageableAbsences(filters)
    absences.value = response.data.data
    updateStats()
  } catch (error) {
    console.error('Error fetching absences:', error)
  } finally {
    isLoading.value = false
  }
}

const updateStats = () => {
  stats.total = absences.value.length
  stats.pending = absences.value.filter(a => a.statusJustification === 'EN_ATTENTE').length
  stats.justified = absences.value.filter(a => a.statusJustification === 'VALIDE').length
  stats.rejected = absences.value.filter(a => a.statusJustification === 'REFUTE').length
}

const handleValidate = async (id) => {
  try {
    await api.validateJustification(id)
    fetchAbsences()
  } catch (error) {
    console.error('Error validating:', error)
  }
}

const handleReject = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir réfuter cette justification ?')) return
  try {
    await api.rejectJustification(id)
    fetchAbsences()
  } catch (error) {
    console.error('Error rejecting:', error)
  }
}

const openJustifyModal = (absence) => {
  selectedAbsence.value = absence
  justification.motivation = absence.motivation || 'maladie'
  justification.notes = absence.notes || ''
  showJustifyModal.value = true
}

const submitJustification = async () => {
  try {
    await api.justifyAbsence(selectedAbsence.value._id, justification)
    showJustifyModal.value = false
    fetchAbsences()
  } catch (error) {
    console.error('Error justifying:', error)
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'VALIDE': return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
    case 'REFUTE': return 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
    case 'EN_ATTENTE': return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
    case 'present': return 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500'
  }
}

const getStatusDotClass = (status) => {
  switch (status) {
    case 'VALIDE': return 'bg-emerald-500'
    case 'REFUTE': return 'bg-red-500'
    case 'EN_ATTENTE': return 'bg-amber-500'
    case 'present': return 'bg-emerald-400'
    default: return 'bg-slate-400'
  }
}

const getStatusLabel = (status) => {
  switch (status) {
    case 'VALIDE': return 'Validé'
    case 'REFUTE': return 'Réfuté'
    case 'EN_ATTENTE': return 'En attente'
    case 'present': return 'Présent'
    case 'absent': return 'Absent'
    case 'late': return 'Retard'
    default: return 'Non justifiée'
  }
}

const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchClasses()
  fetchAbsences()
})

// Auto-fetch on filter changes
watch(() => filters, () => {
  fetchAbsences()
}, { deep: true })
</script>

<style scoped>
.size-12 { width: 3rem; height: 3rem; }
.size-10 { width: 2.5rem; height: 2.5rem; }
.size-9 { width: 2.25rem; height: 2.25rem; }
</style>
