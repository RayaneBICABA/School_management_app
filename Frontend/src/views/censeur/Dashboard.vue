<template>
  <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm">
      <span class="text-[#4e7397] font-medium">Censeur</span>
      <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
      <span class="font-medium text-slate-400">Tableau de bord</span>
    </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Direction des Études</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Suivi global de l'établissement et des activités académiques.</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="px-4 py-2 bg-primary/10 rounded-lg">
          <p class="text-[10px] font-bold text-primary uppercase tracking-wider">Session Active</p>
          <p class="text-sm font-bold text-primary">{{ stats.notesEnAttente > 0 ? 'Période de Saisie' : 'Consultation' }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm soft-lift transition-all">
        <div class="flex justify-between items-start">
          <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Total Élèves</p>
          <span class="material-symbols-outlined text-primary">groups</span>
        </div>
        <p class="text-3xl font-bold leading-tight">{{ stats.totalEleves }}</p>
      </div>
      <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm soft-lift transition-all">
        <div class="flex justify-between items-start">
          <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Notes en Attente</p>
          <span class="material-symbols-outlined text-orange-500">pending_actions</span>
        </div>
        <p class="text-3xl font-bold leading-tight">{{ stats.notesEnAttente }}</p>
      </div>
      <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm soft-lift transition-all">
        <div class="flex justify-between items-start">
          <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Notes Validées</p>
          <span class="material-symbols-outlined text-green-500">check_circle</span>
        </div>
        <p class="text-3xl font-bold leading-tight">{{ stats.notesValidees }}</p>
      </div>
      <div class="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm soft-lift transition-all">
        <div class="flex justify-between items-start">
          <p class="text-[#4e7397] dark:text-slate-400 text-sm font-medium">Notes Rejetées</p>
          <span class="material-symbols-outlined text-red-500">cancel</span>
        </div>
        <p class="text-3xl font-bold leading-tight">{{ stats.notesRejetees }}</p>
      </div>
    </div>

    <!-- Two-Column Actions Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Pending Notes -->
      <section class="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 class="font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-orange-500">pending_actions</span>
            Notes Récentes en Attente
          </h3>
          <router-link to="/censeur/notes" class="text-xs text-primary font-bold hover:underline">Tout voir</router-link>
        </div>
        <div v-if="recentPendingNotes.length > 0" class="divide-y divide-slate-100 dark:divide-slate-800">
          <TransitionGroup
            enter-active-class="transition-all duration-500 ease-out-expo"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-for="note in recentPendingNotes" :key="note._id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-pointer group click-press">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-grow">
                  <p class="text-sm font-bold group-hover:text-primary transition-colors">{{ note.classe?.niveau }} {{ note.classe?.section }} - {{ note.matiere?.nom }}</p>
                  <p class="text-xs text-slate-500">Professeur: {{ note.professeur?.prenom }} {{ note.professeur?.nom }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ note.eleve?.prenom }} {{ note.eleve?.nom }} • {{ note.periode }}</p>
                </div>
                <span class="text-[10px] font-bold px-2 py-1 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 transition-transform group-hover:scale-110">EN ATTENTE</span>
              </div>
            </div>
          </TransitionGroup>
        </div>
        <div v-else class="p-8 text-center text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2">task_alt</span>
          <p class="text-sm">Aucune note en attente</p>
        </div>
      </section>

      <!-- Recently Validated Notes -->
      <section class="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 class="font-bold flex items-center gap-2">
            <span class="material-symbols-outlined text-green-500">check_circle</span>
            Validations Récentes
          </h3>
          <a class="text-xs text-primary font-bold hover:underline" href="#">Historique</a>
        </div>
        <div v-if="recentValidatedNotes.length > 0" class="divide-y divide-slate-100 dark:divide-slate-800">
          <TransitionGroup
            enter-active-class="transition-all duration-500 ease-out-expo"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
          >
            <div v-for="note in recentValidatedNotes" :key="note._id" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-grow">
                  <p class="text-sm font-bold group-hover:text-primary transition-colors">{{ note.classe?.niveau }} {{ note.classe?.section }} - {{ note.matiere?.nom }}</p>
                  <p class="text-xs text-slate-500">Validée par: {{ note.validePar?.prenom }} {{ note.validePar?.nom }}</p>
                  <p class="text-xs text-slate-400 mt-1">{{ formatDate(note.dateValidation) }}</p>
                </div>
                <span class="text-[10px] font-bold px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 transition-transform group-hover:scale-110">VALIDÉE</span>
              </div>
            </div>
          </TransitionGroup>
        </div>
        <div v-else class="p-8 text-center text-slate-400">
          <span class="material-symbols-outlined text-4xl mb-2">history</span>
          <p class="text-sm">Aucune validation récente</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

// État de la modal
const showModal = ref(false)

// Données du formulaire
const sessionType = ref('saisie')
const periode = ref('T1')
const dateLimite = ref('')
const selectedClasses = ref([])

// Charger les classes disponibles
const loadClasses = async () => {
  try {
    const res = await api.getClasses()
    if (res.data.success) {
      selectedClasses.value = ['Toutes les classes', ...res.data.data.slice(0, 3).map(c => c.nom)]
    }
  } catch (error) {
    console.error('Erreur chargement classes:', error)
    selectedClasses.value = ['Toutes les classes']
  }
}

// Statistiques du dashboard
const stats = ref({
  totalEleves: 0,
  notesEnAttente: 0,
  notesValidees: 0,
  notesRejetees: 0
})

// Listes de notes
const recentPendingNotes = ref([])
const recentValidatedNotes = ref([])

// Charger les statistiques
const loadStats = async () => {
  try {
    // Charger le total d'élèves
    const elevesRes = await api.getUsers({ role: 'ELEVE' })
    if (elevesRes.data.success) {
      stats.value.totalEleves = elevesRes.data.count || elevesRes.data.data.length
    }

    // Charger les notes par statut
    const notesRes = await api.getNotes({})
    if (notesRes.data.success) {
      const notes = notesRes.data.data
      stats.value.notesEnAttente = notes.filter(n => n.statut === 'EN_ATTENTE').length
      stats.value.notesValidees = notes.filter(n => n.statut === 'VALIDEE').length
      stats.value.notesRejetees = notes.filter(n => n.statut === 'REJETEE').length
    }
  } catch (error) {
    console.error('Erreur chargement statistiques:', error)
    // En cas d'erreur, initialiser les stats avec des valeurs par défaut
    stats.value = {
      totalEleves: 0,
      notesEnAttente: 0,
      notesValidees: 0,
      notesRejetees: 0
    }
  }
}

// Charger les notes récentes en attente
const loadRecentPendingNotes = async () => {
  try {
    const res = await api.getPendingNotes({})
    if (res.data.success) {
      // Prendre les 5 notes les plus récentes
      recentPendingNotes.value = res.data.data.slice(0, 5)
    }
  } catch (error) {
    console.error('Erreur chargement notes en attente:', error)
    // En cas d'erreur, initialiser avec un tableau vide
    recentPendingNotes.value = []
  }
}

// Charger les notes récemment validées
const loadRecentValidatedNotes = async () => {
  try {
    const res = await api.getNotes({ statut: 'VALIDEE' })
    if (res.data.success) {
      // Prendre les 5 notes les plus récentes
      recentValidatedNotes.value = res.data.data
        .sort((a, b) => new Date(b.dateValidation) - new Date(a.dateValidation))
        .slice(0, 5)
    }
  } catch (error) {
    console.error('Erreur chargement notes validées:', error)
    // En cas d'erreur, initialiser avec un tableau vide
    recentValidatedNotes.value = []
  }
}

// Formater la date
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Charger toutes les données au montage
onMounted(() => {
  loadStats()
  loadRecentPendingNotes()
  loadRecentValidatedNotes()
  loadClasses()
})

</script>
