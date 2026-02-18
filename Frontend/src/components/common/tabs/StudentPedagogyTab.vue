<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">grade</span>
        Pédagogie
      </h3>
    </div>
    <div class="p-6 space-y-8">
      <!-- Academic Performance Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-green-600 dark:text-green-400 text-sm font-medium">Moyenne Générale</span>
            <span class="material-symbols-outlined text-green-500">trending_up</span>
          </div>
          <div class="text-2xl font-bold text-green-700 dark:text-green-300">{{ pedagogyStats.moyenneGenerale || '--' }}</div>
          <div class="text-xs text-green-600 dark:text-green-400 mt-1">{{ pedagogyStats.evolution || 'Stable' }}</div>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium">Matières validées</span>
            <span class="material-symbols-outlined text-blue-500">check_circle</span>
          </div>
          <div class="text-2xl font-bold text-blue-700 dark:text-blue-300">{{ pedagogyStats.matieresValidees || 0 }}</div>
          <div class="text-xs text-blue-600 dark:text-blue-400 mt-1">sur {{ pedagogyStats.totalMatieres || 0 }} matières</div>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-purple-600 dark:text-purple-400 text-sm font-medium">Crédits</span>
            <span class="material-symbols-outlined text-purple-500">stars</span>
          </div>
          <div class="text-2xl font-bold text-purple-700 dark:text-purple-300">{{ pedagogyStats.credits || 0 }}</div>
          <div class="text-xs text-purple-600 dark:text-purple-400 mt-1">crédits obtenus</div>
        </div>
      </div>

      <!-- Grade Evolution Chart -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Évolution des Notes</h4>
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div class="flex justify-between items-center mb-6">
            <div class="flex gap-4">
              <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span class="size-2 rounded-full bg-primary"></span>
                Élève
              </span>
              <span class="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span class="size-2 rounded-full bg-slate-300"></span>
                Moyenne Classe
              </span>
            </div>
            <select v-model="selectedPeriod" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <option value="trimestre">Trimestre</option>
              <option value="annee">Année</option>
            </select>
          </div>
          
          <!-- Chart Visualization -->
          <div class="h-48 w-full relative">
            <!-- Placeholder bars -->
            <div class="absolute inset-0 flex items-end justify-between px-4 pb-2">
              <div v-for="i in 8" :key="i" class="h-[60%] w-1 bg-slate-100 dark:bg-slate-800 rounded-t"></div>
            </div>
            <!-- Line paths -->
            <svg class="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <path d="M 50 120 L 150 90 L 250 110 L 350 100 L 450 130 L 550 80 L 650 110 L 750 95" fill="none" stroke="#197fe6" stroke-linecap="round" stroke-width="3"></path>
              <path d="M 50 100 L 150 105 L 250 100 L 350 102 L 450 105 L 550 100 L 650 98 L 750 101" fill="none" stroke="#cbd5e1" stroke-dasharray="4" stroke-width="2"></path>
            </svg>
          </div>
          <div class="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-2 px-2">
            <span>Sept</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Déc</span>
            <span>Jan</span>
            <span>Fév</span>
            <span>Mar</span>
            <span>Avr</span>
          </div>
        </div>
      </div>

      <!-- Subject Details -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Détail par Matière</h4>
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <div v-else-if="subjects.length === 0" class="text-center py-8 text-slate-500 dark:text-slate-400">
          Aucune note enregistrée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th class="px-4 py-3">Matière</th>
                <th class="px-4 py-3">Moyenne</th>
                <th class="px-4 py-3">Classe</th>
                <th class="px-4 py-3">Appréciation</th>
                <th class="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              <tr v-for="subject in subjects" :key="subject.id" class="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-4 py-4 font-medium">{{ subject.name }}</td>
                <td class="px-4 py-4">
                  <span class="font-bold" :class="getGradeColor(subject.average)">{{ subject.average }}</span>
                </td>
                <td class="px-4 py-4 text-slate-500">{{ subject.classAverage }}</td>
                <td class="px-4 py-4">
                  <span class="text-xs px-2 py-1 rounded" :class="getAppreciationClass(subject.appreciation)">
                    {{ subject.appreciation }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-xs px-2 py-1 rounded-full" :class="getStatusClass(subject.status)">
                    {{ subject.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Teacher Comments -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">comment</span>
            Derniers Avis Professeurs
          </h4>
          <div class="space-y-3">
            <div v-for="comment in recentComments" :key="comment.id" class="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-slate-600 dark:text-slate-400">{{ comment.matiere?.nom || 'Non spécifié' }}</span>
                <span class="text-xs text-slate-500">{{ formatDate(comment.date) }}</span>
              </div>
              <p class="text-sm text-slate-700 dark:text-slate-300 italic">{{ comment.text }}</p>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 class="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">lightbulb</span>
            Points Forts & Axes d'Amélioration
          </h4>
          <div class="space-y-4">
            <div>
              <h5 class="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">Points Forts</h5>
              <ul class="text-sm space-y-1 text-blue-600 dark:text-blue-400">
                <li v-for="strength in strengths" :key="strength" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">check_circle</span>
                  {{ strength }}
                </li>
              </ul>
            </div>
            <div>
              <h5 class="text-xs font-bold text-orange-700 dark:text-orange-300 mb-2">Axes d'Amélioration</h5>
              <ul class="text-sm space-y-1 text-orange-600 dark:text-orange-400">
                <li v-for="improvement in improvements" :key="improvement" class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">trending_up</span>
                  {{ improvement }}
                </li>
              </ul>
            </div>
          </div>
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
  }
})

const isLoading = ref(true)
const selectedPeriod = ref('trimestre')
const subjects = ref([])
const pedagogyStats = ref({
  moyenneGenerale: '--',
  matieresValidees: 0,
  totalMatieres: 0,
  credits: 0,
  evolution: 'Stable'
})

const recentComments = ref([
  {
    id: 1,
    matiere: 'Mathématiques',
    text: 'Bon travail cette année, continuez comme ça !',
    date: '2024-01-10'
  },
  {
    id: 2,
    matiere: 'Français',
    text: 'Progrès significatifs en rédaction',
    date: '2024-01-08'
  }
])

const strengths = ref([
  'Participation active en classe',
  'Bon esprit d\'analyse',
  'Autonomie dans le travail'
])

const improvements = ref([
  'Approfondir la rigueur scientifique',
  'Améliorer l\'organisation',
  'Développer l\'aisance orale'
])

const fetchPedagogyData = async () => {
  try {
    isLoading.value = true
    
    // Get student stats
    const statsRes = await api.getStudentStats(props.studentId)
    const stats = statsRes.data.data
    
    pedagogyStats.value = {
      moyenneGenerale: stats.moyenneGenerale ? stats.moyenneGenerale.toFixed(2) : '--',
      matieresValidees: stats.creditsValides || 0,
      totalMatieres: stats.totalMatieres || 0,
      credits: stats.creditsValides || 0,
      evolution: 'En progression'
    }
    
    // Get student notes
    const notesRes = await api.getStudentNotes(props.studentId)
    const notes = notesRes.data.data
    
    // Process subjects
    const subjectsMap = new Map()
    notes.forEach(note => {
      if (!subjectsMap.has(note.matiere._id)) {
        subjectsMap.set(note.matiere._id, {
          id: note.matiere._id,
          name: note.matiere.nom,
          grades: [],
          average: 0,
          classAverage: 12.5, // Mock data
          appreciation: 'Bon',
          status: note.statut
        })
      }
      subjectsMap.get(note.matiere._id).grades.push(note.moyenne)
    })
    
    // Calculate averages
    subjects.value = Array.from(subjectsMap.values()).map(subject => {
      const validGrades = subject.grades.filter(g => g !== null && g !== undefined)
      subject.average = validGrades.length > 0 
        ? (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(2)
        : '--'
      return subject
    })
    
  } catch (error) {
    console.error('Erreur lors du chargement des données pédagogiques:', error)
    // Use mock data for demo
    subjects.value = [
      {
        id: 1,
        name: 'Mathématiques',
        average: '14.5',
        classAverage: '12.3',
        appreciation: 'TB',
        status: 'VALIDEE'
      },
      {
        id: 2,
        name: 'Français',
        average: '13.2',
        classAverage: '11.8',
        appreciation: 'B',
        status: 'VALIDEE'
      },
      {
        id: 3,
        name: 'Physique-Chimie',
        average: '12.8',
        classAverage: '12.1',
        appreciation: 'AB',
        status: 'VALIDEE'
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

const getGradeColor = (grade) => {
  if (typeof grade !== 'number') return 'text-slate-600'
  if (grade >= 16) return 'text-green-600'
  if (grade >= 14) return 'text-blue-600'
  if (grade >= 12) return 'text-yellow-600'
  if (grade >= 10) return 'text-orange-600'
  return 'text-red-600'
}

const getAppreciationClass = (appreciation) => {
  const classes = {
    'TB': 'bg-green-100 text-green-700',
    'B': 'bg-blue-100 text-blue-700',
    'AB': 'bg-yellow-100 text-yellow-700',
    'P': 'bg-orange-100 text-orange-700',
    'I': 'bg-red-100 text-red-700'
  }
  return classes[appreciation] || 'bg-slate-100 text-slate-700'
}

const getStatusClass = (status) => {
  const classes = {
    'VALIDEE': 'bg-green-100 text-green-700',
    'EN_COURS': 'bg-yellow-100 text-yellow-700',
    'ATTENTE': 'bg-orange-100 text-orange-700',
    'REFUSEE': 'bg-red-100 text-red-700'
  }
  return classes[status] || 'bg-slate-100 text-slate-700'
}

onMounted(() => {
  fetchPedagogyData()
})
</script>
