<template>
  <div class="flex max-w-[1440px] mx-auto">
    <!-- Main Content Area -->
    <main class="flex-1 min-w-0">
      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-3 p-8">
        <div class="flex min-w-72 flex-col gap-1">
          <p class="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Mes Classes et Matières</p>
          <p class="text-[#4e7397] text-base font-normal leading-normal">Gérez vos affectations et suivez la progression de la saisie des notes.</p>
        </div>
        <button @click="router.push('/professeur/nouvelle-evaluation')" class="flex items-center gap-2 cursor-pointer rounded-lg h-12 px-6 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span class="material-symbols-outlined text-lg">add</span>
          <span>Nouvelle évaluation</span>
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="flex flex-wrap gap-4 px-8 pb-4">
        <div class="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[#4e7397] text-sm font-medium leading-normal">Total Classes</p>
            <span class="material-symbols-outlined text-primary text-xl">school</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-light text-3xl font-bold leading-tight">{{ stats.totalClasses }}</p>
        </div>
        <div class="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[#4e7397] text-sm font-medium leading-normal">Total Matières</p>
            <span class="material-symbols-outlined text-primary text-xl">menu_book</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-light text-3xl font-bold leading-tight">{{ stats.totalMatieres }}</p>
        </div>
        <div class="flex min-w-[180px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-[#d0dbe7] dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <p class="text-[#4e7397] text-sm font-medium leading-normal">Évaluations à venir</p>
            <span class="material-symbols-outlined text-primary text-xl">event_upcoming</span>
          </div>
          <p class="text-[#0e141b] dark:text-white tracking-light text-3xl font-bold leading-tight">{{ stats.evaluationsAVenir }}</p>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="px-8 py-4">
        <div class="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-[#d0dbe7] dark:border-slate-800">
           <!-- Search omitted for now or keep static UI -->
        </div>
      </div>

      <!-- Class Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-8 pb-12">
        <div v-for="classe in classes" :key="classe.id" class="bg-white dark:bg-slate-900 rounded-xl border border-[#d0dbe7] dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div class="p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-2xl font-bold text-[#0e141b] dark:text-white">{{ classe.nom }}</h3>
                <p class="text-primary font-semibold text-sm">{{ classe.matiere }}</p>
              </div>
              <span class="bg-[#e7edf3] dark:bg-slate-800 text-[#4e7397] text-xs font-bold px-3 py-1 rounded-full">-- Élèves</span>
            </div>
          </div>
          <div class="grid grid-cols-2 border-t border-[#d0dbe7] dark:border-slate-800">
            <router-link :to="`/professeur/liste-eleves?classe=${classe.id}`" class="py-3 text-sm font-bold text-primary hover:bg-primary/5 transition-colors border-r border-[#d0dbe7] dark:border-slate-800 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">groups</span>
              Élèves
            </router-link>
            <router-link to="/professeur/emploi-temps" class="py-3 text-sm font-bold text-[#0e141b] dark:text-slate-300 hover:bg-[#f6f7f8] dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-lg">calendar_today</span>
              Calendrier
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Calendar Shortcut -->
    <aside class="w-80 flex-shrink-0 border-l border-[#d0dbe7] dark:border-slate-800 h-[calc(100vh-64px)] sticky top-16 bg-white dark:bg-slate-900 hidden xl:flex flex-col p-6">
      <h2 class="text-[#0e141b] dark:text-white text-lg font-bold mb-6">Prochaines Évaluations</h2>
      <div class="flex flex-col gap-4">
        <div v-for="evaluation in prochainesEvaluations" :key="evaluation.id" class="p-4 rounded-xl border-l-4" :class="getEvaluationClass(evaluation.couleur)">
          <p class="text-xs font-bold mb-1" :class="getEvaluationDateColor(evaluation.couleur)">{{ evaluation.date }}</p>
          <h4 class="text-sm font-bold text-[#0e141b] dark:text-white">{{ evaluation.titre }}</h4>
          <p class="text-xs text-[#4e7397]">{{ evaluation.classe }} • {{ evaluation.heure }}</p>
        </div>
      </div>
      <button class="mt-8 w-full py-3 bg-[#e7edf3] dark:bg-slate-800 text-[#0e141b] dark:text-slate-300 text-sm font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2">
        <span class="material-symbols-outlined text-lg">event</span>
        Voir tout le calendrier
      </button>
      <div class="mt-auto bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div class="flex items-center gap-3 mb-2">
          <div class="p-2 bg-primary/20 rounded-lg">
            <span class="material-symbols-outlined text-primary">tips_and_updates</span>
          </div>
          <p class="text-xs font-bold text-primary">Info</p>
        </div>
        <p class="text-xs text-[#4e7397] leading-relaxed">
           Les évaluations validées par le Censeur apparaissent ici en vert.
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

const stats = ref({
  totalClasses: 0,
  totalMatieres: 0,
  evaluationsAVenir: 0,
  tauxSaisie: 0
})

const classes = ref([])
const prochainesEvaluations = ref([])

onMounted(async () => {
    try {
        const [classesRes, evalsRes] = await Promise.all([
            api.getProfessorClasses(),
            api.getMyEvaluations()
        ]);

        const classData = classesRes.data.data;
        classes.value = classData.map(item => ({
            id: item.classe._id,
            nom: `${item.classe.niveau} ${item.classe.section}`,
            matiere: item.matiere.nom,
            matiereId: item.matiere._id,
            eleves: 0 // Need separate fetch for count if vital
        }));

        stats.value.totalClasses = classes.value.length;
        stats.value.totalMatieres = new Set(classes.value.map(c => c.matiere)).size;
        
        const evals = evalsRes.data.data;
        stats.value.evaluationsAVenir = evals.filter(e => new Date(e.date) > new Date()).length;

        prochainesEvaluations.value = evals
            .filter(e => new Date(e.date) > new Date())
            .slice(0, 5)
            .map(e => ({
                id: e._id,
                date: new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase(),
                titre: e.titre,
                classe: `${e.classe.niveau} ${e.classe.section}`,
                heure: `${e.heureDebut} - ${e.heureFin}`,
                statut: e.statut,
                couleur: e.statut === 'VALIDE' ? 'emerald' : 'amber' // Amber for Pending
            }));

    } catch (err) {
        console.error("Error fetching dashboard data", err);
    }
})

const getProgressionColor = (progression) => {
  if (progression === 100) return 'text-emerald-500'
  if (progression >= 80) return 'text-primary'
  if (progression >= 50) return 'text-amber-500'
  return 'text-red-500'
}

const getProgressBarColor = (progression) => {
  if (progression === 100) return 'bg-emerald-500'
  if (progression >= 80) return 'bg-primary'
  if (progression >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

const getAlertClass = (progression) => {
  if (progression === 100) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10'
  if (progression >= 80) return 'text-[#4e7397] bg-[#f6f7f8] dark:bg-slate-800/50'
  if (progression >= 50) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/10'
  return 'text-amber-600 bg-amber-50 dark:bg-amber-900/10'
}

const getAlertIcon = (progression) => {
  if (progression === 100) return 'text-emerald-500'
  if (progression >= 80) return ''
  if (progression >= 50) return ''
  return ''
}

const getAlertIconName = (progression) => {
  if (progression === 100) return 'check_circle'
  if (progression >= 80) return 'info'
  if (progression >= 50) return 'warning'
  return 'priority_high'
}

const getFirstAction = (progression) => {
  if (progression === 100) return 'visibility'
  if (progression >= 80) return 'edit_square'
  if (progression >= 50) return 'edit_square'
  return 'priority_high'
}

const getFirstActionLink = (classeId) => {
  return `/professeur/details-classe?id=${classeId}`
}

const getSecondActionLink = (classe) => {
  return `/professeur/faire-appel?id=${classe.id}&matiereId=${classe.matiereId}`
}

const getSecondActionText = (progression) => {
  if (progression === 100) return 'Notes'
  if (progression >= 80) return 'Saisir Notes'
  if (progression >= 50) return 'Saisir Notes'
  return 'Appel'
}

const getFirstActionText = (progression) => {
  if (progression === 100) return 'Consulter'
  if (progression >= 75) return 'Notes'
  if (progression >= 50) return 'Saisir'
  return 'Appel'
}

const getFirstActionIcon = (progression) => {
  if (progression === 100) return 'check_circle'
  if (progression >= 75) return 'edit_note'
  if (progression >= 50) return 'note_alt'
  return 'how_to_reg'
}

const getEvaluationClass = (couleur) => {
  switch(couleur) {
    case 'primary': return 'border-primary bg-[#f6f7f8] dark:bg-slate-800'
    case 'emerald': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
    case 'amber': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
    default: return 'border-primary bg-[#f6f7f8] dark:bg-slate-800'
  }
}

const getEvaluationDateColor = (couleur) => {
  switch(couleur) {
    case 'primary': return 'text-primary'
    case 'emerald': return 'text-emerald-600'
    case 'amber': return 'text-amber-600'
    default: return 'text-primary'
  }
}
</script>
