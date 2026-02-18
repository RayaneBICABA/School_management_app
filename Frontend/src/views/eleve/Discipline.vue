<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-50 p-8">
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Page Heading -->
      <header class="flex flex-col gap-2">
        <h2 class="text-[#0e141b] dark:text-white text-4xl font-black tracking-tight">Discipline et Assiduité</h2>
        <p class="text-[#4e7397] dark:text-slate-400 text-lg">Suivez vos présences en temps réel et consultez vos rapports de conduite.</p>
      </header>

      <!-- Stats Cards -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242e] border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Total Absences</p>
            <span class="material-symbols-outlined text-red-500">event_busy</span>
          </div>
          <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ disciplineData.absences || 0 }}</p>
          <p class="text-red-500 text-xs font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">trending_up</span> +{{ disciplineData.absencesCeMois || 0 }} ce mois
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242e] border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Total Retards</p>
            <span class="material-symbols-outlined text-orange-500">schedule</span>
          </div>
          <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ disciplineData.retards || 0 }}</p>
          <p class="text-green-600 text-xs font-semibold flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">trending_down</span> En amélioration
          </p>
        </div>
        <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242e] border border-primary/20 dark:border-primary/30 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Points de Conduite</p>
            <span class="material-symbols-outlined text-primary">stars</span>
          </div>
          <p class="text-primary text-3xl font-bold">{{ disciplineData.pointsConduite || 0 }}/20</p>
          <p class="text-primary/70 text-xs font-medium">{{ disciplineData.appreciation || 'Comportement en cours d\'évaluation' }}</p>
        </div>
      </section>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Calendar Section (Left) -->
        <section class="lg:col-span-2 flex flex-col gap-4">
          <div class="bg-white dark:bg-[#1a242f] rounded-xl border border-[#d0dbe7] dark:border-slate-700 overflow-hidden shadow-sm">
            <div class="p-6 border-b border-[#d0dbe7] dark:border-slate-700 flex justify-between items-center">
              <h3 class="text-lg font-bold">{{ currentMonth }}</h3>
              <div class="flex gap-2">
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <span class="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                  <span class="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>
            </div>
            <div class="p-6">
              <!-- Calendar Grid -->
              <div class="grid grid-cols-7 gap-2 text-sm">
                <!-- Weekday Headers -->
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Lun</div>
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Mar</div>
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Mer</div>
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Jeu</div>
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Ven</div>
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Sam</div>
                <div class="text-slate-500 dark:text-slate-400 font-semibold py-2">Dim</div>
                
                <!-- Calendar Days -->
                <div v-for="empty in firstDayOfMonth" :key="'empty-'+empty" class="aspect-square"></div>
                <div v-for="day in daysInMonth" :key="day" class="aspect-square flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer relative" :class="getDayClass(day)">
                  {{ day }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Right Sidebar -->
        <section class="lg:col-span-1 flex flex-col gap-4">
          <!-- Quick Stats Cards -->
          <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex justify-between items-start">
              <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Total Retards</p>
              <span class="material-symbols-outlined text-orange-500">schedule</span>
            </div>
            <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ disciplineData.retards || 0 }}</p>
          </div>
          
          <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div class="flex justify-between items-start">
              <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Points de Conduite</p>
              <span class="material-symbols-outlined text-primary">stars</span>
            </div>
            <p class="text-[#0e141b] dark:text-white text-3xl font-bold">{{ disciplineData.pointsConduite || 20 }}/20</p>
          </div>
        </section>
      </div>

      <!-- Recent Events Section (Full Width) -->
      <div class="mt-6">
        <section class="bg-white dark:bg-[#1a242f] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
            <h3 class="text-[#0e141b] dark:text-white text-xl font-bold tracking-tight">Événements Récents</h3>
          </div>
          <div class="p-6">
            <div v-if="recentEvents.length > 0" class="space-y-4">
              <div v-for="event in recentEvents" :key="event.id" class="flex items-start gap-4 p-4 rounded-lg border-l-4" :class="getEventStyle(event.type)">
                <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" :class="getEventIconStyle(event.type)">
                  <span class="material-symbols-outlined text-lg">{{ getEventIcon(event.type) }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-sm">{{ event.titre }}</h4>
                    <span class="text-[10px] font-bold px-2 py-1 rounded" :class="getEventBadgeStyle(event.type)">
                      {{ getEventLabel(event.type) }}
                    </span>
                  </div>
                  <p class="text-sm text-[#4e7397] dark:text-slate-300 leading-relaxed">{{ event.description }}</p>
                  <p class="text-xs text-slate-400 mt-2">{{ formatDate(event.date) }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8">
              <span class="material-symbols-outlined text-4xl text-slate-300">check_circle</span>
              <p class="text-slate-500 mt-4">Aucun événement récent</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

// État réactif
const isLoading = ref(true)
const disciplineData = ref({
  absences: 0,
  retards: 0,
  incidents: 0,
  sanctions: 0,
  absencesCeMois: 0,
  pointsConduite: 20,
  totalPoints: 0,
  appreciation: 'Comportement en cours d\'évaluation'
})
const recentEvents = ref([])
const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

// Computed properties for dynamic calendar
const daysInMonth = computed(() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay()
  // Adjust to start Monday (0) to Sunday (6)
  return firstDay === 0 ? 6 : firstDay - 1
})

// Méthodes
const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getEventStyle = (type) => {
  const styles = {
    absence: 'border-red-500 bg-red-50 dark:bg-red-900/20',
    retard: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20',
    incident: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20',
    sanction: 'border-red-600 bg-red-100 dark:bg-red-900/30',
    info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
  }
  return styles[type] || styles.info
}

const getEventIconStyle = (type) => {
  const styles = {
    absence: 'bg-red-100 text-red-600',
    retard: 'bg-orange-100 text-orange-600',
    incident: 'bg-purple-100 text-purple-600',
    sanction: 'bg-red-200 text-red-600',
    conduite: 'bg-blue-100 text-blue-600',
    info: 'bg-blue-100 text-blue-600',
    Discipline: 'bg-purple-100 text-purple-600',
    Médical: 'bg-green-100 text-green-600',
    Pédagogique: 'bg-yellow-100 text-yellow-600',
    Autre: 'bg-gray-100 text-gray-600'
  }
  return styles[type] || styles.info
}

const getEventIcon = (type) => {
  const icons = {
    absence: 'event_busy',
    retard: 'schedule',
    incident: 'warning',
    sanction: 'gavel',
    conduite: 'stars',
    info: 'info',
    Discipline: 'warning',
    Médical: 'medical_services',
    Pédagogique: 'school',
    Autre: 'info'
  }
  return icons[type] || icons.info
}

const getEventLabel = (type) => {
  const labels = {
    absence: 'Absence',
    retard: 'Retard',
    incident: 'Incident',
    sanction: 'Sanction',
    conduite: 'Conduite',
    info: 'Information',
    Discipline: 'Discipline',
    Médical: 'Médical',
    Pédagogique: 'Pédagogique',
    Autre: 'Autre'
  }
  return labels[type] || labels.info
}

const getEventBadgeStyle = (type) => {
  const styles = {
    absence: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    retard: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    incident: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    sanction: 'bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    conduite: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Discipline: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Médical: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Pédagogique: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Autre: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }
  return styles[type] || styles.info
}

const getDayClass = (day) => {
  // Logique pour styliser les jours du calendrier avec les vrais événements
  const today = new Date().getDate()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  // Vérifier si ce jour a des événements
  const hasEvent = recentEvents.value.some(event => {
    const eventDate = new Date(event.date)
    return eventDate.getDate() === day && 
           eventDate.getMonth() === currentMonth && 
           eventDate.getFullYear() === currentYear
  })
  
  if (day === today) {
    return 'bg-primary text-white font-bold'
  } else if (hasEvent) {
    return 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
  } else {
    return 'hover:bg-slate-100 dark:hover:bg-slate-800'
  }
}

// Charger les données de discipline
const fetchDisciplineData = async () => {
  try {
    isLoading.value = true
    
    // Récupérer l'utilisateur connecté
    const userRes = await api.getMe()
    const user = userRes.data.data
    
    // Récupérer les données de discipline
    if (user._id) {
      try {
        const disciplineRes = await api.getDiscipline(user._id.toString())
        if (disciplineRes.data.success) {
          disciplineData.value = disciplineRes.data.data
          recentEvents.value = disciplineRes.data.data.recentEvents || []
        }
      } catch (error) {
        console.warn('Données de discipline non disponibles:', error)
        // Garder les valeurs par défaut
        disciplineData.value = {
          absences: 0,
          retards: 0,
          incidents: 0,
          sanctions: 0,
          absencesCeMois: 0,
          pointsConduite: 20,
          totalPoints: 0,
          appreciation: 'Données non disponibles'
        }
        recentEvents.value = []
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDisciplineData()
})
</script>
