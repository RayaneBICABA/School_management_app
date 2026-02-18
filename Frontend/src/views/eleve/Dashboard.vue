<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-200 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Welcome Section -->
      <header class="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div class="flex flex-col gap-2">
          <h2 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-tight">
            Bonjour, {{ user?.prenom || 'Élève' }} ! 👋
          </h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-lg">
            Bienvenue dans votre espace personnel. Voici un aperçu de vos résultats et de votre emploi du temps.
          </p>
        </div>
        <div class="flex items-center gap-4">
          <router-link to="/eleve/notifications" class="size-10 rounded-xl bg-white dark:bg-[#1a242f] flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-primary transition-colors">
            <span class="material-symbols-outlined">notifications</span>
          </router-link>
          <div class="flex items-center gap-3 bg-white dark:bg-[#1a242f] px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <span class="material-symbols-outlined text-slate-400">calendar_month</span>
            <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">{{ formatDate(new Date()) }}</span>
          </div>
        </div>
      </header>
      
      <!-- Error State -->
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-red-500">error</span>
          <div>
            <h3 class="text-red-800 dark:text-red-200 font-semibold">Erreur de chargement</h3>
            <p class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- Loading State -->
      <div v-else-if="isLoading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <span class="ml-4 text-slate-500">Chargement de vos données...</span>
      </div>
      
      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Key Metrics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm soft-lift transition-all">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[#4e7397] dark:text-slate-400 text-xs font-black leading-normal uppercase tracking-[0.1em]">Moyenne Générale</p>
              <span class="bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {{ getMoyenneEvolution(studentStats.moyenneGenerale) }}
              </span>
            </div>
            <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-black leading-tight">
              {{ (typeof studentStats.moyenneGenerale === 'number' && !isNaN(studentStats.moyenneGenerale)) ? studentStats.moyenneGenerale.toFixed(2) : '--' }} <span class="text-lg font-medium text-slate-400">/ 20</span>
            </p>
          </div>
          
          <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm soft-lift transition-all">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[#4e7397] dark:text-slate-400 text-xs font-black leading-normal uppercase tracking-[0.1em]">Crédits Validés</p>
              <div class="p-1.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">auto_awesome</div>
            </div>
            <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-black leading-tight">
              {{ studentStats.creditsValides || 0 }} <span class="text-lg font-medium text-slate-400">crédits</span>
            </p>
          </div>
          
          <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-[#1a242f] border border-slate-200 dark:border-slate-700 shadow-sm soft-lift transition-all">
            <div class="flex justify-between items-start mb-2">
              <p class="text-[#4e7397] dark:text-slate-400 text-xs font-black leading-normal uppercase tracking-[0.1em]">Absences</p>
              <span class="bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-400 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                Ce mois
              </span>
            </div>
            <p class="text-[#0e141b] dark:text-white tracking-tight text-3xl font-black leading-tight">
              {{ studentStats.absencesCeMois || 0 }} <span class="text-lg font-medium text-slate-400">absences</span>
            </p>
          </div>
        </div>
        
        <!-- Schedule Section -->
        <section class="bg-white dark:bg-[#1a242f] rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden translate-y-0 transition-all">
          <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <div class="flex items-center gap-4">
              <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                <span class="material-symbols-outlined text-2xl">schedule</span>
              </div>
              <div>
                <h3 class="text-[#0e141b] dark:text-white text-xl font-black leading-tight tracking-tight">Emploi du temps</h3>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ formatDate(new Date()).split(' ')[0] }} • Aujourd'hui</p>
              </div>
            </div>
            <router-link to="/eleve/calendrier" class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary text-sm font-black shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all group click-press">
              <span>Voir la semaine</span>
              <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </router-link>
          </div>
          <div class="p-8">
            <div v-if="todaySchedule.length > 0" class="space-y-0 relative before:content-[''] before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              <TransitionGroup
                enter-active-class="transition-all duration-700 ease-out-expo"
                enter-from-class="opacity-0 translate-x-12"
                enter-to-class="opacity-100 translate-x-0"
              >
                <div v-for="(course, index) in todaySchedule" :key="index" class="relative pl-16 pb-12 last:pb-0 group">
                  <!-- Timeline indicator -->
                  <div class="absolute left-0 top-1 size-[48px] rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center z-10 group-hover:border-primary group-hover:scale-110 shadow-sm transition-all duration-500">
                    <span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{{ getCourseIcon(course.matiere) }}</span>
                  </div>
                  
                  <!-- Card content -->
                  <div class="bg-slate-50/30 dark:bg-slate-800/20 rounded-2xl p-6 border border-transparent hover:border-primary/10 hover:bg-white dark:hover:bg-slate-800/80 transition-all duration-500 shadow-none hover:shadow-2xl hover:shadow-primary/5 cursor-default">
                    <div class="flex flex-wrap items-center justify-between gap-6">
                      <div class="flex flex-col gap-1.5">
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#4e7397] dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">{{ course.heureDebut }} — {{ course.heureFin }}</span>
                          <span v-if="index === 0 && new Date().getHours() < parseInt(course.heureFin)" class="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        </div>
                        <h4 class="text-xl font-black text-[#0e141b] dark:text-white leading-tight underline decoration-primary/20 decoration-4 underline-offset-4">{{ course.matiere }}</h4>
                      </div>
                      
                      <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
                          <span class="material-symbols-outlined text-primary text-base">meeting_room</span>
                          <span class="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{{ course.salle }}</span>
                        </div>
                        <div v-if="course.professeur" class="flex items-center gap-3 group/prof">
                          <div class="size-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black text-slate-500 group-hover/prof:bg-primary group-hover/prof:text-white transition-all overflow-hidden border-2 border-transparent group-hover/prof:border-primary/20">
                            {{ course.professeur.split(' ').map(n => n[0]).join('') }}
                          </div>
                          <div class="flex flex-col">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enseignant</span>
                            <span class="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover/prof:text-primary transition-colors">{{ course.professeur }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
            <div v-else class="flex flex-col items-center justify-center py-24 px-4 text-center">
              <div class="size-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-8 border border-slate-100 dark:border-slate-700 transition-transform hover:rotate-12 duration-500">
                <span class="material-symbols-outlined text-6xl">nightlight_round</span>
              </div>
              <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Aucun cours aujourd'hui</h3>
              <p class="text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                Profitez de ce temps libre pour réviser ou vous reposer ! 
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

// État réactif
const user = ref(null)
const isLoading = ref(true)
const error = ref(null)
const studentStats = ref({
  moyenneGenerale: 0,
  creditsValides: 0,
  absencesCeMois: 0,
  totalAbsences: 0,
  totalRetards: 0
})
const todaySchedule = ref([])
const currentClass = ref(null)

// Computed
const pageTitle = computed(() => `Tableau de bord - ${user.value?.prenom || 'Élève'}`)

// Méthodes
const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date)
}

const getMoyenneEvolution = (moyenne) => {
  if (!moyenne || isNaN(moyenne)) return '---'
  if (moyenne >= 14) return 'Excellent'
  if (moyenne >= 12) return 'Très Bien'
  if (moyenne >= 10) return 'Admis'
  return 'À améliorer'
}

const getCourseIcon = (matiere) => {
  const icons = {
    'Mathématiques': 'functions',
    'Français': 'menu_book',
    'Physique-Chimie': 'science',
    'SVT': 'biotech',
    'Histoire-Géographie': 'public',
    'Anglais': 'language',
    'EPS': 'fitness_center',
    default: 'school'
  }
  return icons[matiere] || icons.default
}

// Charger les données de l'élève
const fetchStudentData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Récupérer les informations de l'élève
    const userRes = await api.getMe()
    user.value = userRes.data.data
    
    // Récupérer les statistiques de l'élève
    if (user.value._id) {
      try {
        const statsRes = await api.getStudentStats(user.value._id.toString())
        if (statsRes.data.success) {
          studentStats.value = {
            moyenneGenerale: statsRes.data.data.moyenneGenerale || 0,
            creditsValides: statsRes.data.data.creditsValides || 0,
            absencesCeMois: statsRes.data.data.absencesCeMois || 0,
            totalAbsences: statsRes.data.data.totalAbsences || 0,
            totalRetards: statsRes.data.data.totalRetards || 0
          }
        }
      } catch (error) {
        console.warn('Stats non disponibles:', error)
        // Valeurs par défaut plus réalistes
        studentStats.value = {
          moyenneGenerale: 0,
          creditsValides: 0,
          absencesCeMois: 0,
          totalAbsences: 0,
          totalRetards: 0
        }
      }
    }
    
    // Récupérer l'emploi du temps du jour
    if (user.value._id) {
      try {
        const scheduleRes = await api.getTodaySchedule(user.value._id.toString())
        if (scheduleRes.data.success) {
          todaySchedule.value = scheduleRes.data.data || []
        }
      } catch (error) {
        console.warn('Emploi du temps non disponible:', error)
        todaySchedule.value = []
      }
    }
    
    // Récupérer les informations de la classe
    if (user.value.classe && user.value.classe._id) {
      try {
        const classRes = await api.getClasse(user.value.classe._id.toString())
        if (classRes.data.success) {
          currentClass.value = classRes.data.data
        }
      } catch (error) {
        console.warn('Classe non disponible:', error)
        currentClass.value = null
      }
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    error.value = 'Impossible de charger vos données. Veuillez réessayer plus tard.'
  } finally {
    isLoading.value = false
  }
}

// Watcher pour recharger les données si nécessaire
watch(() => route.name, () => {
  fetchStudentData()
}, { immediate: true })

onMounted(() => {
  fetchStudentData()
})
</script>
