<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">gavel</span>
        Discipline
      </h3>
      <button v-if="canEdit" @click="addIncident" class="text-sm font-bold text-primary hover:underline">
        + Nouvel incident
      </button>
    </div>
    <div class="p-6 space-y-8">
      <!-- Discipline Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-orange-600 dark:text-orange-400 text-sm font-medium">Incidents</span>
            <span class="material-symbols-outlined text-orange-500">warning</span>
          </div>
          <div class="text-2xl font-bold text-orange-700 dark:text-orange-300">{{ disciplineStats.incidents || 0 }}</div>
        </div>
        <div class="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-red-600 dark:text-red-400 text-sm font-medium">Absences</span>
            <span class="material-symbols-outlined text-red-500">event_busy</span>
          </div>
          <div class="text-2xl font-bold text-red-700 dark:text-red-300">{{ disciplineStats.absences || 0 }}</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium">Retards</span>
            <span class="material-symbols-outlined text-blue-500">schedule</span>
          </div>
          <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ disciplineStats.retards || 0 }}</div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-600 dark:text-purple-400 text-sm font-medium">Points</span>
            <span class="material-symbols-outlined text-purple-500">stars</span>
          </div>
          <div class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ disciplineStats.pointsConduite || 20 }}/20</div>
        </div>
      </div>

      <!-- Recent Incidents -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Historique des Incidents</h4>
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="incidents.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
          Aucun incident enregistré
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Nature</th>
                <th class="px-4 py-3">Rapporteur</th>
                <th class="px-4 py-3">Sanction</th>
                <th class="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              <tr v-for="incident in incidents" :key="incident.id" class="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-4 py-4 font-medium">{{ formatDate(incident.date) }}</td>
                <td class="px-4 py-4">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" :class="getIncidentClass(incident.severity)">
                    {{ incident.titre || incident.nature }}
                  </span>
                </td>
                <td class="px-4 py-4 text-slate-500">{{ incident.professeur || 'Non spécifié' }}</td>
                <td class="px-4 py-4">{{ incident.sanction || 'Aucune' }}</td>
                <td class="px-4 py-4 text-right">
                  <button @click="viewIncident(incident)" class="text-slate-400 hover:text-primary">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Conduct Assessment -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">assessment</span>
            Appréciation Générale
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Points de conduite</span>
              <span class="text-lg font-bold" :class="getConductPointsColor(disciplineStats.pointsConduite)">
                {{ disciplineStats.pointsConduite || 20 }}/20
              </span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div class="h-full transition-all duration-300" :class="getConductBarColor(disciplineStats.pointsConduite)" :style="`width: ${(disciplineStats.pointsConduite || 20) * 5}%`"></div>
            </div>
            <p class="text-sm italic text-slate-600 dark:text-slate-400">
              {{ getConductAppreciation(disciplineStats.pointsConduite) }}
            </p>
          </div>
        </div>

        <div class="bg-primary/5 p-4 rounded-xl border border-primary/20">
          <h4 class="text-sm font-bold text-primary mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">tips_and_updates</span>
            Recommandations
          </h4>
          <ul class="text-sm space-y-2 text-slate-600 dark:text-slate-400">
            <li v-for="recommendation in recommendations" :key="recommendation.id" class="flex items-start gap-2">
              <span class="material-symbols-outlined text-sm mt-0.5 text-primary">check_circle</span>
              <span>{{ recommendation.text }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const props = defineProps({
  studentId: {
    type: String,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const isLoading = ref(true)
const incidents = ref([])
const disciplineStats = ref({
  incidents: 0,
  absences: 0,
  retards: 0,
  pointsConduite: 20
})

const recommendations = ref([
  { id: 1, text: 'Maintenir un dialogue régulier avec la famille' },
  { id: 2, text: 'Surveiller les progrès académiques' },
  { id: 3, text: 'Encourager la participation en classe' }
])

const fetchDisciplineData = async () => {
  try {
    isLoading.value = true
    
    const res = await api.getStudentDiscipline(props.studentId)
    const data = res.data.data
    
    disciplineStats.value = {
      incidents: data.incidents || 0,
      absences: data.absences || 0,
      retards: data.retards || 0,
      pointsConduite: data.pointsConduite || 20
    }
    
    incidents.value = data.recentEvents || []
    
  } catch (error) {
    console.error('Erreur lors du chargement des données de discipline:', error)
    // Use mock data for demo
    incidents.value = [
      {
        id: 1,
        date: '2024-01-15',
        titre: 'Bavardages répétés',
        severity: 'medium',
        professeur: 'M. Martin',
        sanction: 'Observation écrite'
      },
      {
        id: 2,
        date: '2024-01-10',
        titre: 'Retard',
        severity: 'low',
        professeur: 'Mme. Durand',
        sanction: 'Avertissement'
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

const getIncidentClass = (severity) => {
  switch (severity) {
    case 'high': return 'bg-red-100 text-red-700'
    case 'medium': return 'bg-orange-100 text-orange-700'
    case 'low': return 'bg-slate-100 text-slate-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const getConductPointsColor = (points) => {
  if (points >= 16) return 'text-green-600'
  if (points >= 12) return 'text-blue-600'
  if (points >= 8) return 'text-orange-600'
  return 'text-red-600'
}

const getConductBarColor = (points) => {
  if (points >= 16) return 'bg-green-500'
  if (points >= 12) return 'bg-blue-500'
  if (points >= 8) return 'bg-orange-500'
  return 'bg-red-500'
}

const getConductAppreciation = (points) => {
  if (points >= 16) return 'Excellent comportement'
  if (points >= 12) return 'Bon comportement'
  if (points >= 8) return 'Comportement satisfaisant'
  if (points >= 5) return 'Comportement à améliorer'
  return 'Comportement insuffisant'
}

const addIncident = () => {
  console.log('Ajouter un incident')
  alert('Ajout d\'incident en cours (mode démo)')
}

const viewIncident = (incident) => {
  console.log('Voir les détails de l\'incident:', incident)
  alert(`Détails de l'incident: ${incident.titre}`)
}

onMounted(() => {
  fetchDisciplineData()
})
</script>
