<template>
  <div class="p-8 max-w-7xl mx-auto w-full">
    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4 mb-8">
      <div class="flex flex-col gap-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Bonjour, {{ user?.nom || '' }} {{ user?.prenom || 'Professeur' }} !</h2>
        <p class="text-slate-500 dark:text-slate-400">Voici l'aperçu de votre journée du {{ formatDate(new Date()) }}</p>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm soft-lift transition-all">
        <div class="flex justify-between items-start">
          <p class="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Cours aujourd'hui</p>
          <div class="p-2 bg-primary/10 rounded-xl text-primary material-symbols-outlined">schedule</div>
        </div>
        <p class="text-3xl font-black text-slate-900 dark:text-white">{{ stats.coursAujourdHui }}</p>
      </div>
      <div class="flex flex-col gap-2 rounded-2xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm soft-lift transition-all">
        <div class="flex justify-between items-start">
          <p class="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest">Alertes absences</p>
          <div class="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 material-symbols-outlined">person_off</div>
        </div>
        <p class="text-3xl font-black text-slate-900 dark:text-white">{{ stats.alertesAbsences }}</p>
      </div>
    </div>

    <!-- Dashboard Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Left: Today's Schedule -->
      <div class="xl:col-span-2 space-y-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div class="px-8 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-xl">event_upcoming</span>
              <h3 class="font-black text-lg tracking-tight uppercase text-xs tracking-[0.2em] text-slate-500">Cours du jour</h3>
            </div>
            <button @click="router.push('/professeur/emploi-temps')" class="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:underline group">
              Voir l'agenda
              <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
          <div class="p-6">
            <div class="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
              <TransitionGroup
                enter-active-class="transition-all duration-500 ease-out-expo"
                enter-from-class="opacity-0 translate-x-4"
                enter-to-class="opacity-100 translate-x-0"
              >
                <!-- Course Item -->
                <div v-for="cours in coursDuJour" :key="cours.id" class="flex items-center gap-6 p-5 rounded-2xl transition-all duration-300 group hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/20" :class="getCoursClass(cours.statut)">
                  <div v-if="cours.statut === 'encours'" class="absolute left-0 top-4 bottom-4 w-1 bg-primary rounded-r-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"></div>
                  <div class="flex flex-col items-center justify-center min-w-[80px] border-r border-slate-200 dark:border-slate-700 pr-6">
                    <span class="text-[9px] font-black uppercase tracking-widest mb-1" :class="getCoursStatutClass(cours.statut)">{{ getCoursStatutText(cours.statut) }}</span>
                    <span class="text-sm font-black tracking-tight" :class="getCoursTimeClass(cours.statut)">{{ cours.heure }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors text-lg tracking-tight">{{ cours.matiere }}</h4>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{{ cours.classe }} • {{ cours.salle }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span v-if="cours.statut === 'termine'" class="flex items-center gap-1.5 px-4 py-2 bg-green-50 dark:bg-green-900/10 text-green-600 text-[10px] font-black uppercase tracking-wider rounded-xl border border-green-100 dark:border-green-900/20">
                      <span class="material-symbols-outlined text-sm">check_circle</span>
                      Appel fait
                    </span>
                    <button v-else-if="cours.statut === 'encours' || cours.statut === 'prochain'" @click="handleFaireAppel(cours.classeId, cours.matiereId)" class="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all click-press">Faire l'appel</button>
                    <span v-else class="material-symbols-outlined text-slate-300">more_vert</span>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Notifications & Recent Activity -->
      <div class="flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex-1">
          <div class="px-8 py-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/20">
            <h3 class="font-black text-xs tracking-[0.2em] text-slate-500 uppercase">Alertes & Infos</h3>
          </div>
          <div class="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto custom-scrollbar">
            <TransitionGroup
              enter-active-class="transition-all duration-500 ease-out-expo"
              enter-from-class="opacity-0 translate-y-4"
              enter-to-class="opacity-100 translate-y-0"
            >
              <div v-for="notif in notifications" :key="notif.id" class="p-5 flex gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all group">
                <div class="size-12 rounded-xl flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110" :class="getNotificationIconClass(notif.type)">
                  <span class="material-symbols-outlined text-xl transition-transform group-hover:rotate-12">{{ notif.icon }}</span>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-primary transition-colors tracking-tight">{{ notif.titre }}</p>
                  <p class="text-[11px] font-medium text-slate-500 mb-1.5 line-clamp-2 leading-relaxed">{{ notif.description }}</p>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-[10px] text-slate-300">schedule</span>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{{ notif.temps }}</span>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
          <div class="p-5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
            <button class="w-full py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all group flex items-center justify-center gap-2">
              Toutes les notifications
              <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">login</span>
            </button>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="bg-primary rounded-3xl p-8 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div class="absolute -right-8 -bottom-8 size-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <h3 class="font-black text-xs tracking-[0.2em] uppercase mb-6 relative">Actions rapides</h3>
          <div class="grid grid-cols-2 gap-4 relative">
            <button v-for="action in actionsRapides" :key="action.id" @click="handleAction(action.id)" class="flex flex-col items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all duration-300 group/btn click-press border border-white/5">
              <span class="material-symbols-outlined text-3xl transition-transform group-hover/btn:scale-110">{{ action.icon }}</span>
              <span class="text-[10px] font-black uppercase tracking-widest text-center">{{ action.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// Données statiques
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

// Données statiques -> Dynamiques
const stats = ref({
  coursAujourdHui: 0,
  alertesAbsences: 0
})

const coursDuJour = ref([])
// Removed progressionNotes

const notifications = ref([])

// Méthodes
const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(date)
}

const isCurrentCourse = (creneau) => {
  if (!creneau || !creneau.includes('-')) return false;
  const [start, end] = creneau.split('-').map(s => s.trim());
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  return currentTime >= startTime && currentTime <= endTime;
}

const isPastCourse = (creneau) => {
  if (!creneau || !creneau.includes('-')) return false;
  const parts = creneau.split('-');
  const end = parts[parts.length - 1].trim();
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [endH, endM] = end.split(':').map(Number);
  const endTime = endH * 60 + endM;
  
  return currentTime > endTime;
}

onMounted(async () => {
    try {
        // Fetch current user
        const userRes = await api.getMe()
        user.value = userRes.data.data
        
        const userId = user.value.id || user.value._id;
        
        // 1. Fetch Schedule for Today
        const schedRes = await api.getSchedules({ professeur: userId });
        const allSchedules = schedRes.data.data;
        
        const days = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
        const todayName = days[new Date().getDay()]; 
        
        const todayCourses = allSchedules.filter(s => s.jour === todayName);
        
        coursDuJour.value = todayCourses.sort((a,b) => a.creneau.localeCompare(b.creneau)).map(s => ({
            id: s._id,
            statut: isCurrentCourse(s.creneau) ? 'encours' : (isPastCourse(s.creneau) ? 'termine' : 'prochain'),
            heure: s.creneau, 
            matiere: s.matiere.nom,
            sujet: '', 
            classe: `${s.classe.niveau} ${s.classe.section}`,
            classeId: s.classe._id, 
            matiereId: s.matiere._id, // Fixed: Store matiere ID
            salle: s.salle,
            hasAttendance: false 
        }));
        
        stats.value.coursAujourdHui = coursDuJour.value.length;

        // 2. Fetch Pending Evaluations
        const evalsRes = await api.getMyEvaluations();
        const pendingEvals = evalsRes.data.data.filter(e => e.statut === 'EN_ATTENTE');
        stats.value.notesEnAttente = pendingEvals.length;
        
        // 3. Absences Alerts - Calcul réel
        try {
          // Récupérer les classes du professeur
          const classesRes = await api.getMyClasses()
          const professorClasses = classesRes.data.data
          
          let totalAbsences = 0
          for (const classItem of professorClasses) {
            try {
              const attendanceRes = await api.getAttendanceStats(classItem.classe._id)
              totalAbsences += attendanceRes.data.data.absencesAujourdHui || 0
            } catch (error) {
              console.warn(`Erreur attendance pour classe ${classItem.classe._id}:`, error)
            }
          }
          stats.value.alertesAbsences = totalAbsences
        } catch (error) {
          console.warn('Erreur lors du calcul des alertes absences:', error)
          stats.value.alertesAbsences = 0
        } 

        // 4. Fetch Notifications
        const notifRes = await api.getNotifications();
        notifications.value = notifRes.data.data.map(n => ({
            id: n._id,
            type: n.type === 'error' ? 'error' : (n.type === 'warning' ? 'warning' : 'info'), // Map backend types if different
            icon: n.subject && n.subject.includes('Absence') ? 'report' : (n.subject && n.subject.includes('Note') ? 'history_edu' : 'info'),
            titre: n.subject,
            description: n.content,
            temps: new Date(n.createdAt).toLocaleDateString() + ' ' + new Date(n.createdAt).toLocaleTimeString()
        })).slice(0, 5); // Limit to 5

    } catch (err) {
        console.error("Error loading dashboard", err);
    }
})

const actionsRapides = ref([
  { id: 3, icon: 'upload_file', label: 'Import Notes' },
  { id: 4, icon: 'description', label: 'Bulletins' }
])

// Fonctions utilitaires
const getCoursClass = (statut) => {
  switch(statut) {
    case 'termine': return 'bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700'
    case 'encours': return 'bg-primary/5 border border-primary/20 relative overflow-hidden'
    default: return 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
  }
}

const getCoursStatutClass = (statut) => {
  switch(statut) {
    case 'termine': return 'text-slate-400'
    case 'encours': return 'text-primary'
    default: return 'text-slate-400'
  }
}

const getCoursTimeClass = (statut) => {
  switch(statut) {
    case 'termine': return 'text-slate-500'
    case 'encours': return 'text-primary'
    default: return 'text-slate-700 dark:text-slate-300'
  }
}

const getCoursStatutText = (statut) => {
  switch(statut) {
    case 'termine': return 'Terminé'
    case 'encours': return 'En cours'
    default: return 'Prochain'
  }
}

const getProgressClass = (taux) => {
  if (taux === 100) return 'bg-green-500'
  if (taux >= 70) return 'bg-primary'
  if (taux >= 40) return 'bg-orange-400'
  return 'bg-red-400'
}

const getNotificationIconClass = (type) => {
  switch(type) {
    case 'info': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
    case 'warning': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
    case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-600'
    default: return 'bg-slate-100 dark:bg-slate-900/30 text-slate-600'
  }
}

const handleFaireAppel = (classeId, matiereId) => {
  router.push({ path: '/professeur/faire-appel', query: { id: classeId, matiereId } })
}

const handleAction = (actionId) => {
  switch(actionId) {
    case 1: router.push('/professeur/classes'); break;
    case 2: router.push('/professeur/annuaire'); break;
    case 3: router.push('/professeur/saisie-notes'); break;
    case 4: router.push('/professeur/classes'); break;
  }
}
</script>

<style scoped>
.soft-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.soft-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.1);
}

.click-press:active {
  transform: scale(0.97);
}

/* Custom Scrollbar for better UI */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(79, 70, 229, 0.2) transparent;
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(79, 70, 229, 0.1);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(79, 70, 229, 0.3);
}

.ease-out-expo {
  transition-timing-function: cubic-bezier(0.19, 1, 0.22, 1);
}
</style>
