<template>
  <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
    <div class="max-w-[1200px] mx-auto p-8">
      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div class="flex flex-col gap-1">
          <p class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Tableau de bord</p>
          <p class="text-[#4e7397] dark:text-slate-400 text-lg font-normal">Vue d'ensemble stratégique de l'établissement</p>
        </div>
        <div class="relative">
          <select v-model="selectedTrimestre" @change="fetchDashboardData" class="appearance-none flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <option value="Trimestre 1">Trimestre 1 - 2023/2024</option>
            <option value="Trimestre 2">Trimestre 2 - 2023/2024</option>
            <option value="Trimestre 3">Trimestre 3 - 2023/2024</option>
          </select>
          <span class="material-symbols-outlined text-primary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">calendar_today</span>
        </div>
      </div>

      <!-- Stats/KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all soft-lift">
          <div class="flex justify-between items-start">
            <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Saisie des notes</p>
            <div class="material-symbols-outlined text-orange-500 bg-orange-500/10 p-2.5 rounded-xl shadow-sm">edit_note</div>
          </div>
          <div class="mt-2">
              <p class="text-[#0e141b] dark:text-white tracking-tight text-4xl font-black leading-tight">{{ kpis.saisieNotes }}</p>
              <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Professeurs ayant validé</p>
          </div>
        </div>

        <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all soft-lift">
          <div class="flex justify-between items-start">
            <p class="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Bulletins en attente</p>
            <div class="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-xl shadow-sm">pending_actions</div>
          </div>
           <div class="mt-2">
              <p class="text-[#0e141b] dark:text-white tracking-tight text-4xl font-black leading-tight">{{ kpis.bulletinsAttente }}</p>
              <p class="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">En attente de validation</p>
           </div>
        </div>
      </div>

      <!-- Strategic Section: Actions & Alerts (Equal Height Grid) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
         <!-- Left: Actions rapides -->
         <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full relative overflow-hidden group">
            <div class="absolute -right-12 -top-12 size-32 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
            <h2 class="text-[#0e141b] dark:text-white text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3 relative">
                <span class="material-symbols-outlined text-primary text-xl">bolt</span>
                Actions rapides
            </h2>
            <div class="grid grid-cols-2 gap-4 flex-1 relative">
              <router-link to="/proviseur/suivi-activite" class="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 group/item click-press">
                <div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover/item:rotate-12">
                  <span class="material-symbols-outlined text-3xl">analytics</span>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-[#0e141b] dark:text-white mt-1">Statistiques</span>
              </router-link>
              
              <router-link to="/proviseur/validation-bulletins" class="flex flex-col items-center justify-center gap-3 p-6 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 group/item click-press">
                <div class="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover/item:rotate-12">
                  <span class="material-symbols-outlined text-3xl">fact_check</span>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-[#0e141b] dark:text-white mt-1">Validations</span>
              </router-link>
            </div>
          </div>

        <!-- Right: Alerts & Notifications -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
            <h2 class="text-[#0e141b] dark:text-white text-xs font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                <span class="material-symbols-outlined text-orange-500 text-xl">notifications_active</span>
                Alertes & Notifications
            </h2>
            <div class="space-y-4 flex-1 overflow-y-auto max-h-[340px] custom-scrollbar pr-2">
              <div v-if="alertes.length === 0" class="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                  <span class="material-symbols-outlined text-5xl mb-4 opacity-20">notifications_off</span>
                  <span class="text-xs font-bold uppercase tracking-widest">Aucune nouvelle alerte</span>
              </div>
              <TransitionGroup
                enter-active-class="transition-all duration-500 ease-out-expo"
                enter-from-class="opacity-0 translate-y-4"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div v-for="alerte in alertes" :key="alerte.id" class="flex items-start gap-4 p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-x-1 group" :class="getAlerteClass(alerte.type)">
                  <div class="size-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110" :class="getAlerteIconClass(alerte.type)">
                    <span class="material-symbols-outlined text-2xl">{{ alerte.icon }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-black text-[#0e141b] dark:text-white text-sm tracking-tight group-hover:text-primary transition-colors truncate">{{ alerte.titre }}</h4>
                    <p class="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{{ alerte.description }}</p>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

      </div>

      <!-- Section Footer info -->
      <div class="mt-12 flex justify-between items-center text-slate-400 text-xs">
        <p> 2024 Lycée Excellence - Système de Pilotage Académique</p>
        <p>Dernière mise à jour : Aujourd'hui à 09:42</p>
      </div>
    </div>

    <!-- Modals -->
    <RelancerRetardatairesModal ref="retardatairesModal" :retardataires="retardatairesList" :stats="kpis" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RelancerRetardatairesModal from '@/components/modals/RelancerRetardatairesModal.vue'
import api from '@/services/api'

const retardatairesModal = ref(null)
const isLoading = ref(true)
const selectedTrimestre = ref('Trimestre 2')

const kpis = ref({
  tauxReussite: 0,
  tauxReussiteEvolution: '0%',
  saisieNotes: 0,
  saisieNotesEvolution: '0%',
  bulletinsAttente: 0,
  retardataires: 0
})

const activite = ref({
  validationGlobale: 0,
  validationGlobaleDetail: 'Chargement...',
  appreciationsConseil: 0,
  appreciationsConseilDetail: 'Chargement...'
})

const departements = ref([])
const alertes = ref([])
const retardatairesList = ref([])
const enseignants = ref([])

const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    
    // Fetch real notifications (not filtered by trimestre)
    const notifRes = await api.getNotifications()
    alertes.value = notifRes.data.data.slice(0, 5).map(n => ({
      id: n._id,
      titre: n.titre,
      description: n.message,
      type: n.type === 'urgent' ? 'danger' : 'info',
      icon: n.type === 'urgent' ? 'error' : 'info'
    }))
    
    // Fetch dashboard stats filtered by trimestre
    try {
      const dashRes = await api.getProviseurDashboard({ trimestre: selectedTrimestre.value })
      const { data } = dashRes.data
      kpis.value = data.kpis
      activite.value = data.activite
    } catch (err) {
      console.log('Dashboard endpoint not available, using defaults')
      // If endpoint doesn't support trimestre filter yet, just fetch without filter
      try {
        const dashRes = await api.getProviseurDashboard()
        const { data } = dashRes.data
        kpis.value = data.kpis
        activite.value = data.activite
      } catch (err2) {
        console.log('Dashboard endpoint not available')
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement du tableau de bord:', error)
  } finally {
    isLoading.value = false
  }
}

const getAlerteClass = (type) => {
  switch(type) {
    case 'danger': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
    case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
    case 'info': return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
    default: return 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
  }
}

const getAlerteIconClass = (type) => {
  switch(type) {
    case 'danger': return 'text-red-600'
    case 'warning': return 'text-amber-600'
    case 'info': return 'text-blue-600'
    default: return 'text-slate-600'
  }
}

const openRetardatairesModal = () => {
  retardatairesModal.value?.openModal()
}

onMounted(() => {
  fetchDashboardData()
})
</script>