<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">event_available</span>
        Assiduité
      </h3>
    </div>
    <div class="p-6 space-y-8">
      <!-- Attendance Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-green-600 dark:text-green-400 text-sm font-medium">Présences</span>
            <span class="material-symbols-outlined text-green-500">check_circle</span>
          </div>
          <div class="text-2xl font-bold text-green-700 dark:text-green-300">{{ attendanceStats.presences || 0 }}</div>
          <div class="text-xs text-green-600 dark:text-green-400 mt-1">{{ attendanceStats.presencePercentage || 0 }}%</div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-red-600 dark:text-red-400 text-sm font-medium">Absences</span>
            <span class="material-symbols-outlined text-red-500">event_busy</span>
          </div>
          <div class="text-2xl font-bold text-red-700 dark:text-red-300">{{ attendanceStats.absences || 0 }}</div>
          <div class="text-xs text-red-600 dark:text-red-400 mt-1">{{ attendanceStats.absenceHours || 0 }}h</div>
        </div>
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-orange-600 dark:text-orange-400 text-sm font-medium">Retards</span>
            <span class="material-symbols-outlined text-orange-500">schedule</span>
          </div>
          <div class="text-2xl font-bold text-orange-700 dark:text-orange-300">{{ attendanceStats.retards || 0 }}</div>
          <div class="text-xs text-orange-600 dark:text-orange-400 mt-1">{{ attendanceStats.retardMinutes || 0 }}min</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium">Justifiés</span>
            <span class="material-symbols-outlined text-blue-500">verified</span>
          </div>
          <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ attendanceStats.justified || 0 }}</div>
          <div class="text-xs text-blue-600 dark:text-blue-400 mt-1">{{ attendanceStats.justificationRate || 0 }}%</div>
        </div>
      </div>

      <!-- Monthly Attendance Chart -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Évolution Mensuelle</h4>
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div class="h-48 w-full relative">
            <!-- Bar chart visualization -->
            <div class="absolute inset-0 flex items-end justify-between px-2 pb-8">
              <div v-for="(month, index) in monthlyData" :key="index" class="flex flex-col items-center flex-1">
                <div class="w-full max-w-[20px] bg-gradient-to-t from-red-500 to-orange-500 rounded-t" :style="`height: ${month.absenceHeight}%`" :title="`${month.absences} absences`"></div>
                <div class="w-full max-w-[20px] bg-gradient-to-t from-orange-500 to-yellow-500 rounded-t mt-1" :style="`height: ${month.retardHeight}%`" :title="`${month.retards} retards`"></div>
              </div>
            </div>
            <!-- X-axis labels -->
            <div class="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 font-bold px-2">
              <span v-for="month in monthlyData" :key="month.name">{{ month.name }}</span>
            </div>
          </div>
          <div class="flex justify-center gap-6 mt-4">
            <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span class="size-2 rounded-full bg-red-500"></span>
              Absences
            </span>
            <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span class="size-2 rounded-full bg-orange-500"></span>
              Retards
            </span>
          </div>
        </div>
      </div>

      <!-- Detailed Attendance Log -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Historique Détaillé</h4>
          <div class="flex gap-2">
            <select v-model="selectedPeriod" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <option value="month">Ce mois</option>
              <option value="trimestre">Ce trimestre</option>
              <option value="annee">Cette année</option>
            </select>
            <select v-model="selectedType" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <option value="all">Tout</option>
              <option value="absence">Absences</option>
              <option value="retard">Retards</option>
            </select>
          </div>
        </div>
        
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="filteredAttendance.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
          Aucun enregistrement d'assiduité pour cette période
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Type</th>
                <th class="px-4 py-3">Heure</th>
                <th class="px-4 py-3">Matière</th>
                <th class="px-4 py-3">Motif</th>
                <th class="px-4 py-3">Statut</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              <tr v-for="record in filteredAttendance" :key="record.id" class="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-4 py-4 font-medium">{{ formatDate(record.date) }}</td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" :class="getAttendanceTypeClass(record.type)">
                    <span class="material-symbols-outlined text-sm">{{ getAttendanceIcon(record.type) }}</span>
                    {{ getAttendanceLabel(record.type) }}
                  </span>
                </td>
                <td class="px-4 py-4 text-slate-500">{{ record.heure || '--' }}</td>
                <td class="px-4 py-4 text-slate-500">{{ record.matiere || '--' }}</td>
                <td class="px-4 py-4 text-slate-500">{{ record.motif || 'Non spécifié' }}</td>
                <td class="px-4 py-4">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" :class="getJustificationClass(record.justifie)">
                    {{ record.justifie ? 'Justifié' : 'Non justifié' }}
                  </span>
                </td>
                <td class="px-4 py-4 text-right">
                  <button @click="viewDetails(record)" class="text-slate-400 hover:text-primary">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Attendance Patterns -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">pattern</span>
            Analyse des Tendances
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Jour le plus absent</span>
              <span class="text-sm font-bold text-slate-900 dark:text-slate-200">{{ patterns.mostAbsentDay || 'Lundi' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Matière concernée</span>
              <span class="text-sm font-bold text-slate-900 dark:text-slate-200">{{ patterns.concernedSubject || 'Mathématiques' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Période critique</span>
              <span class="text-sm font-bold text-slate-900 dark:text-slate-200">{{ patterns.criticalPeriod || 'Fin de trimestre' }}</span>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <h4 class="text-sm font-bold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">warning</span>
            Alertes & Recommandations
          </h4>
          <div class="space-y-2">
            <div v-for="alert in alerts" :key="alert.id" class="p-2 bg-white dark:bg-slate-900 rounded border border-orange-200 dark:border-orange-800">
              <p class="text-xs font-medium text-orange-800 dark:text-orange-200">{{ alert.message }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const props = defineProps({
  studentId: {
    type: String,
    required: true
  }
})

const isLoading = ref(true)
const selectedPeriod = ref('trimestre')
const selectedType = ref('all')
const attendanceRecords = ref([])

const attendanceStats = ref({
  presences: 0,
  presences: 0,
  absences: 0,
  absenceHours: 0,
  retards: 0,
  retardMinutes: 0,
  justified: 0,
  presencePercentage: 0,
  justificationRate: 0
})

const monthlyData = ref([
  { name: 'Sep', absences: 2, retards: 1, absenceHeight: 20, retardHeight: 10 },
  { name: 'Oct', absences: 1, retards: 3, absenceHeight: 10, retardHeight: 30 },
  { name: 'Nov', absences: 3, retards: 2, absenceHeight: 30, retardHeight: 20 },
  { name: 'Déc', absences: 1, retards: 1, absenceHeight: 10, retardHeight: 10 },
  { name: 'Jan', absences: 2, retards: 4, absenceHeight: 20, retardHeight: 40 },
  { name: 'Fév', absences: 0, retards: 2, absenceHeight: 0, retardHeight: 20 }
])

const patterns = ref({
  mostAbsentDay: 'Lundi',
  concernedSubject: 'Mathématiques',
  criticalPeriod: 'Fin de trimestre'
})

const alerts = ref([
  { id: 1, message: 'Taux d\'absence élevé ce mois-ci' },
  { id: 2, message: 'Plusieurs retards le matin' }
])

const filteredAttendance = computed(() => {
  let filtered = attendanceRecords.value
  
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(record => record.type === selectedType.value)
  }
  
  // Filter by period (simplified for demo)
  if (selectedPeriod.value === 'month') {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    filtered = filtered.filter(record => new Date(record.date) >= oneMonthAgo)
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date))
})

const fetchAttendanceData = async () => {
  try {
    isLoading.value = true
    
    const res = await api.getStudentAttendance(props.studentId)
    const records = res.data.data
    
    attendanceRecords.value = records.map(record => ({
      id: record._id,
      date: record.date,
      type: record.statut === 'absent' ? 'absence' : 'retard',
      heure: record.heure,
      matiere: record.matiere?.nom || 'Non spécifié',
      motif: record.motif || 'Non spécifié',
      justifie: record.justifie || false
    }))
    
    // Calculate statistics
    const totalDays = attendanceRecords.value.length
    const absences = attendanceRecords.value.filter(r => r.type === 'absence').length
    const retards = attendanceRecords.value.filter(r => r.type === 'retard').length
    const justified = attendanceRecords.value.filter(r => r.justifie).length
    
    attendanceStats.value = {
      presences: totalDays - absences,
      absences,
      absenceHours: absences * 2, // Estimate 2h per absence
      retards,
      retardMinutes: retards * 15, // Estimate 15min per retard
      justified,
      presencePercentage: totalDays > 0 ? ((totalDays - absences) / totalDays * 100).toFixed(1) : 0,
      justificationRate: (absences + retards) > 0 ? (justified / (absences + retards) * 100).toFixed(1) : 0
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des données d\'assiduité:', error)
    // Use mock data for demo
    attendanceRecords.value = [
      {
        id: 1,
        date: '2024-01-15',
        type: 'absence',
        heure: '08:00',
        matiere: 'Mathématiques',
        motif: 'Maladie',
        justifie: true
      },
      {
        id: 2,
        date: '2024-01-12',
        type: 'retard',
        heure: '08:10',
        matiere: 'Français',
        motif: 'Transport',
        justifie: false
      },
      {
        id: 3,
        date: '2024-01-10',
        type: 'absence',
        heure: '14:00',
        matiere: 'Physique',
        motif: 'Rendez-vous médical',
        justifie: true
      }
    ]
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const getAttendanceTypeClass = (type) => {
  return type === 'absence' 
    ? 'bg-red-100 text-red-700' 
    : 'bg-orange-100 text-orange-700'
}

const getAttendanceIcon = (type) => {
  return type === 'absence' ? 'event_busy' : 'schedule'
}

const getAttendanceLabel = (type) => {
  return type === 'absence' ? 'Absence' : 'Retard'
}

const getJustificationClass = (justified) => {
  return justified 
    ? 'bg-green-100 text-green-700' 
    : 'bg-red-100 text-red-700'
}

const viewDetails = (record) => {
  console.log('Voir les détails:', record)
  alert(`Détails: ${getAttendanceLabel(record.type)} du ${formatDate(record.date)}`)
}

onMounted(() => {
  fetchAttendanceData()
})
</script>
