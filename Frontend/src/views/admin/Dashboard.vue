<template>
  <div class="space-y-8">
    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col soft-lift transition-all">
        <div class="flex items-center justify-between mb-4">
          <span class="p-2 bg-primary/10 text-primary rounded-lg material-symbols-outlined">groups</span>
          <span :class="trends.eleves.trend >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'" class="text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {{ trends.eleves.trend >= 0 ? '+' : '' }}{{ trends.eleves.trend }}%
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Élèves</p>
        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mt-1">{{ isLoading ? '...' : trends.eleves.value }}</h3>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col soft-lift transition-all">
        <div class="flex items-center justify-between mb-4">
          <span class="p-2 bg-orange-500/10 text-orange-500 rounded-lg material-symbols-outlined">co_present</span>
          <span :class="trends.professeurs.trend >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'" class="text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {{ trends.professeurs.trend >= 0 ? '+' : '' }}{{ trends.professeurs.trend }}%
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Professeurs</p>
        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mt-1">{{ isLoading ? '...' : trends.professeurs.value }}</h3>
      </div>
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col soft-lift transition-all">
        <div class="flex items-center justify-between mb-4">
          <span class="p-2 bg-green-500/10 text-green-500 rounded-lg material-symbols-outlined">school</span>
          <span :class="trends.classes.trend >= 0 ? 'text-green-600 bg-green-50 dark:bg-green-500/10' : 'text-red-600 bg-red-50 dark:bg-red-500/10'" class="text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {{ trends.classes.trend >= 0 ? '+' : '' }}{{ trends.classes.trend }}%
          </span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Classes</p>
        <h3 class="text-3xl font-bold text-slate-900 dark:text-white mt-1">{{ isLoading ? '...' : trends.classes.value }}</h3>
      </div>
    </div>
    
    <!-- Examens Section -->
    <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900 dark:text-white">Examens Planifiés</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Consultez les examens planifiés par les professeurs</p>
        </div>
      </div>

      <!-- Class Selector -->
      <div class="mb-6">
        <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Sélectionner une classe</label>
        <select 
          v-model="selectedClasseForExams" 
          @change="loadExamsForClass"
          class="w-full md:w-64 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
        >
          <option value="">Toutes les classes</option>
          <option v-for="classe in classes" :key="classe._id" :value="classe._id">
            {{ classe.niveau }} {{ classe.section }}
          </option>
        </select>
      </div>

      <!-- Exams List -->
      <div v-if="isLoadingExams" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p class="text-slate-500">Chargement des examens...</p>
      </div>

      <div v-else-if="filteredExams.length === 0" class="text-center py-12">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 transition-transform hover:scale-110 duration-500">event_busy</span>
        <p class="text-slate-500">Aucun examen planifié{{ selectedClasseForExams ? ' pour cette classe' : '' }}</p>
      </div>

      <div v-else class="space-y-3">
        <TransitionGroup
          enter-active-class="transition-all duration-500 ease-out-expo"
          enter-from-class="opacity-0 translate-y-4"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div 
            v-for="exam in filteredExams" 
            :key="exam._id"
            class="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary transition-all duration-300 group click-press bg-slate-50/30 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{{ exam.nom }}</h3>
                  <span class="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary shadow-sm group-hover:scale-105 transition-transform">
                    {{ exam.matiere?.nom }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                  <span class="flex items-center gap-1 group/item">
                    <span class="material-symbols-outlined text-sm group-hover/item:text-primary transition-colors">school</span>
                    {{ exam.classe?.niveau }} {{ exam.classe?.section }}
                  </span>
                  <span class="flex items-center gap-1 group/item">
                    <span class="material-symbols-outlined text-sm group-hover/item:text-primary transition-colors">event</span>
                    {{ formatDate(exam.date) }}
                  </span>
                  <span class="flex items-center gap-1 group/item">
                    <span class="material-symbols-outlined text-sm group-hover/item:text-primary transition-colors">schedule</span>
                    {{ exam.heureDebut }} - {{ exam.heureFin }}
                  </span>
                  <span class="flex items-center gap-1 group/item">
                    <span class="material-symbols-outlined text-sm group-hover/item:text-primary transition-colors">person</span>
                    {{ exam.professeur?.prenom }} {{ exam.professeur?.nom }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
    
    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Classes Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Classes</h2>
          <router-link to="/admin/classes" class="text-xs text-primary hover:underline">Voir tout →</router-link>
        </div>
        <div class="text-center py-8">
          <div class="text-5xl font-bold text-primary mb-2">{{ trends.classes.value }}</div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Classes actives</p>
        </div>
      </div>

      <!-- Subjects Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Matières</h2>
          <router-link to="/admin/cours" class="text-xs text-primary hover:underline">Voir tout →</router-link>
        </div>
        <div class="text-center py-8">
          <div class="text-5xl font-bold text-orange-500 mb-2">{{ matieres.length }}</div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Matières enseignées</p>
        </div>
      </div>

      <!-- Users Card -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Utilisateurs</h2>
          <router-link to="/admin/utilisateurs" class="text-xs text-primary hover:underline">Voir tout →</router-link>
        </div>
        <div class="text-center py-8">
          <div class="text-5xl font-bold text-green-500 mb-2">{{ users.length }}</div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Comptes actifs</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const users = ref([])
const classes = ref([])
const matieres = ref([])
const exams = ref([])
const isLoading = ref(false)
const isLoadingExams = ref(false)
const selectedClasseForExams = ref('')

// Trend data
const trends = ref({
  eleves: { value: 0, trend: 0 },
  professeurs: { value: 0, trend: 0 },
  classes: { value: 0, trend: 0 }
})

const fetchDashboardData = async () => {
  isLoading.value = true
  try {
    const [usersRes, classesRes, matieresRes] = await Promise.all([
      api.getUsers(),
      api.getClasses(),
      api.getMatieres()
    ])
    
    users.value = Array.isArray(usersRes.data.data) ? usersRes.data.data : []
    classes.value = Array.isArray(classesRes.data.data) ? classesRes.data.data : []
    matieres.value = Array.isArray(matieresRes.data.data) ? matieresRes.data.data : []
    
    // Calculate trends based on historical data
    const currentUsers = users.value.length
    const currentClasses = classes.value.length
    const currentProfesseurs = users.value.filter(u => u.role === 'PROFESSEUR').length
    const currentEleves = users.value.filter(u => u.role === 'ELEVE').length
    
    // Calculate trends by comparing with last month (simplified approach)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    
    // For demo: use creation dates to calculate monthly growth
    const usersThisMonth = users.value.filter(u => new Date(u.createdAt) > lastMonth).length
    const classesThisMonth = classes.value.filter(c => new Date(c.createdAt) > lastMonth).length
    const professeursThisMonth = users.value.filter(u => 
      u.role === 'PROFESSEUR' && new Date(u.createdAt) > lastMonth
    ).length
    const elevesThisMonth = users.value.filter(u => 
      u.role === 'ELEVE' && new Date(u.createdAt) > lastMonth
    ).length
    
    // Calculate percentage trends
    const calculateTrend = (current, monthlyNew) => {
      if (current === 0) return 0
      return Math.round((monthlyNew / current) * 100)
    }
    
    trends.value = {
      eleves: { 
        value: currentEleves,
        trend: calculateTrend(currentEleves, elevesThisMonth)
      },
      professeurs: { 
        value: currentProfesseurs,
        trend: calculateTrend(currentProfesseurs, professeursThisMonth)
      },
      classes: { 
        value: currentClasses,
        trend: calculateTrend(currentClasses, classesThisMonth)
      }
    }
  } catch (error) {
    console.error('Erreur chargement dashboard:', error)
    users.value = []
    classes.value = []
    matieres.value = []
  } finally {
    isLoading.value = false
  }
}

const loadExamsForClass = async () => {
  isLoadingExams.value = true
  try {
    const params = selectedClasseForExams.value ? { classe: selectedClasseForExams.value } : {}
    const res = await api.getExamens(params)
    exams.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (error) {
    console.error('Erreur chargement examens:', error)
    exams.value = []
  } finally {
    isLoadingExams.value = false
  }
}

const filteredExams = computed(() => {
  return exams.value
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchDashboardData()
  loadExamsForClass()
})
</script>
