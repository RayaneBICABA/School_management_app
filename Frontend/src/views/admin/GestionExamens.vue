<template>
  <div class="flex flex-col gap-6">
    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Examens Planifiés</h2>
        <p class="text-slate-500 dark:text-slate-400">Consultez les examens planifiés par les professeurs</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Class Filter -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Classe</label>
          <select 
            v-model="selectedClasse" 
            @change="loadExams"
            class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Toutes les classes</option>
            <option v-for="classe in classes" :key="classe._id" :value="classe._id">
              {{ classe.niveau }} {{ classe.section }}
            </option>
          </select>
        </div>

        <!-- Date Start Filter -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date de début</label>
          <input 
            v-model="dateDebut" 
            @change="loadExams"
            type="date"
            class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <!-- Date End Filter -->
        <div>
          <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date de fin</label>
          <input 
            v-model="dateFin" 
            @change="loadExams"
            type="date"
            class="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Exams List -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div class="p-6 border-b border-slate-200 dark:border-slate-800">
        <h3 class="font-bold text-slate-900 dark:text-white">
          Liste des examens
          <span v-if="filteredExams.length > 0" class="text-sm font-normal text-slate-500 ml-2">
            ({{ filteredExams.length }} examen{{ filteredExams.length > 1 ? 's' : '' }})
          </span>
        </h3>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 text-center">
        <p class="text-slate-500">Chargement des examens...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredExams.length === 0" class="p-12 text-center">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">event_busy</span>
        <p class="text-slate-500">Aucun examen planifié pour les critères sélectionnés</p>
        <p class="text-sm text-slate-400 mt-2">Les professeurs pourront planifier des examens prochainement</p>
      </div>

      <!-- Exams Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Examen</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Matière</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Classe</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Horaire</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Professeur</th>
              <th class="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr 
              v-for="exam in filteredExams" 
              :key="exam._id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-900 dark:text-white">{{ exam.nom }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                  {{ exam.matiere?.nom || 'N/A' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {{ exam.classe?.niveau }} {{ exam.classe?.section }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {{ formatDate(exam.date) }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {{ exam.heureDebut }} - {{ exam.heureFin }}
              </td>
              <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                {{ exam.professeur?.nom }} {{ exam.professeur?.prenom }}
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(exam.date)">
                  {{ getStatus(exam.date) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

const classes = ref([])
const exams = ref([])
const isLoading = ref(false)
const selectedClasse = ref('')
const dateDebut = ref('')
const dateFin = ref('')

const loadClasses = async () => {
  try {
    const res = await api.getClasses()
    classes.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (error) {
    console.error('Erreur chargement classes:', error)
    classes.value = []
  }
}

const loadExams = async () => {
  isLoading.value = true
  try {
    const params = {}
    if (selectedClasse.value) params.classe = selectedClasse.value
    if (dateDebut.value) params.dateDebut = dateDebut.value
    if (dateFin.value) params.dateFin = dateFin.value
    
    const res = await api.getExamens(params)
    exams.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (error) {
    console.error('Erreur chargement examens:', error)
    exams.value = []
  } finally {
    isLoading.value = false
  }
}

const filteredExams = computed(() => {
  let filtered = exams.value

  // Filter by date range if specified
  if (dateDebut.value || dateFin.value) {
    filtered = filtered.filter(exam => {
      const examDate = new Date(exam.date)
      const start = dateDebut.value ? new Date(dateDebut.value) : null
      const end = dateFin.value ? new Date(dateFin.value) : null

      if (start && examDate < start) return false
      if (end && examDate > end) return false
      return true
    })
  }

  // Sort by date (most recent first)
  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const getStatus = (dateString) => {
  if (!dateString) return 'Inconnu'
  const examDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  examDate.setHours(0, 0, 0, 0)

  if (examDate < today) return 'Terminé'
  if (examDate.getTime() === today.getTime()) return 'Aujourd\'hui'
  return 'À venir'
}

const getStatusClass = (dateString) => {
  const status = getStatus(dateString)
  const classes = {
    'Terminé': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    'Aujourd\'hui': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'À venir': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
  }
  return classes[status] || classes['Inconnu']
}

onMounted(() => {
  loadClasses()
  loadExams()
})
</script>
