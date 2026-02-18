<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Common Header -->
    <Header title="Tableau de bord CPE" />
    
    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-8 space-y-6">
      <!-- Section Title -->
      <div>
        <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Vue d'ensemble et Alertes</h2>
        <p class="text-slate-500 text-sm">Synthèse des indicateurs scolaires</p>
      </div>


      <!-- Stats Widgets -->
      <div class="grid grid-cols-1 md:grid-cols-1 gap-6">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2 soft-lift transition-all">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-500 uppercase tracking-wider">Retards (Ce matin)</span>
            <span class="material-symbols-outlined text-amber-500">schedule</span>
          </div>
          <p class="text-3xl font-bold text-slate-900 dark:text-white">{{ stats.retards }}</p>
        </div>
      </div>

      <!-- Main Grid Content -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- New Section: Recent Absences to Validate -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 class="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <span class="material-symbols-outlined text-orange-500">pending_actions</span>
              Absences Récentes à Valider
            </h3>
            <router-link to="/cpe/absences" class="text-primary text-xs font-black uppercase hover:underline">Console</router-link>
          </div>
          <div class="flex-1">
            <div v-if="recentAbsences.length === 0" class="py-12 text-center text-slate-400">
              <span class="material-symbols-outlined text-5xl mb-3 opacity-30">verified</span>
              <p class="text-sm italic">Aucune absence en attente de validation</p>
            </div>
            <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
              <TransitionGroup
                enter-active-class="transition-all duration-500 ease-out-expo"
                enter-from-class="opacity-0 translate-y-4"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div v-for="abs in recentAbsences" :key="abs.id" class="p-4 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer" @click="router.push('/cpe/absences')">
                  <div class="flex items-center gap-3">
                    <div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-slate-800 shadow-sm" :style="`background-image: url('${abs.avatar || '/default-avatar.png'}')`"></div>
                    <div>
                      <p class="text-sm font-bold group-hover:text-primary transition-colors">{{ abs.eleve }}</p>
                      <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ abs.classe }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs font-black text-slate-700 dark:text-slate-300">{{ abs.date }}</p>
                    <span class="text-[9px] font-black px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-800/40 dark:text-orange-300 rounded uppercase">À Valider</span>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>

        <!-- Upcoming Class Councils -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 class="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">groups</span>
              Conseils de classe à venir
            </h3>
            <button @click="voirCalendrier" class="text-primary text-xs font-black uppercase hover:underline">Agenda</button>
          </div>
          <div class="p-6 space-y-6">
            <div v-if="councils.length === 0" class="py-12 text-center text-slate-400">
              <span class="material-symbols-outlined text-5xl mb-3 opacity-30">event_busy</span>
              <p class="text-sm italic">Aucun conseil de classe prévu dans le planning</p>
            </div>
            <div v-else class="relative pl-8 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
              <TransitionGroup
                enter-active-class="transition-all duration-500 ease-out-expo"
                enter-from-class="opacity-0 -translate-x-4"
                enter-to-class="opacity-100 translate-x-0"
              >
                <div v-for="council in councils" :key="council.id" class="relative group">
                  <div class="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 shadow-sm transition-all duration-300 group-hover:scale-125" :class="council.isToday ? 'bg-primary animate-pulse' : 'bg-slate-300 group-hover:bg-primary/50'"></div>
                  <div class="flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-transparent hover:border-primary/20 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 cursor-default">
                    <div>
                      <p class="text-sm font-bold group-hover:text-primary transition-colors">{{ council.classe }}</p>
                      <p class="text-xs text-slate-500">{{ council.professeur }}</p>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-slate-700 dark:text-slate-300">{{ council.date }}</p>
                      <p class="text-xs text-slate-500 font-medium">{{ council.time }} • {{ council.salle }}</p>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
          <div class="mt-auto p-4 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-100 dark:border-slate-800">
            <p class="text-xs font-bold text-slate-500 tracking-wide">{{ councils.length }} CONSEILS PRÉVUS POUR CETTE SEMAINE</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions / Additional Sections -->
      <div class="bg-primary/5 rounded-2xl border border-primary/10 p-6">
        <h3 class="text-primary font-black mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
          <span class="material-symbols-outlined text-sm">bolt</span>
          Actions rapides
        </h3>
        <div class="grid grid-cols-2 gap-4">
          <button @click="contacterParents" class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/5 flex flex-col items-center gap-3 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group click-press">
            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
              <span class="material-symbols-outlined text-primary text-2xl">mail</span>
            </div>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Contacter Parents</span>
          </button>
          <button @click="fichesEleves" class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-primary/5 flex flex-col items-center gap-3 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group click-press">
            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center transition-transform group-hover:scale-110">
              <span class="material-symbols-outlined text-primary text-2xl">assignment_ind</span>
            </div>
            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Fiches Elèves</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Header from '@/components/common/Header.vue'
import api from '@/services/api'

const router = useRouter()
const isLoading = ref(true)

// Données réactives
const currentDate = ref(new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }))

// Statistiques
const stats = ref({
  retards: 0
})

// Conseils de classe à venir
const councils = ref([])
const recentAbsences = ref([])

const fetchDashboardData = async () => {
  try {
    isLoading.value = true
    const response = await api.getCPEDashboard()
    const data = response.data.data
    stats.value = data.stats
    councils.value = data.councils
    recentAbsences.value = data.recentAbsences || []
  } catch (error) {
    console.error('Erreur chargement dashboard:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

// Fonctions d'action
const voirCalendrier = () => {
  router.push('/cpe/calendrier')
}

const contacterParents = () => {
  router.push('/cpe/notifications')
}

const fichesEleves = () => {
  router.push('/cpe/eleves')
}
</script>
