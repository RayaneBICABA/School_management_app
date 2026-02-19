<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar Navigation -->
    <CenseurSidebar @open-modal="showModal = true" @logout="handleLogout" />
    <!-- Main Content Area -->
    <main class="flex-grow flex flex-col overflow-y-auto">
      <!-- Common Header -->
      <Header :title="pageTitle">
      </Header>

      <!-- Page Content -->
      <div class="flex-grow pb-8">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </div>
      <footer class="mt-auto p-6 text-center text-slate-400 text-xs">
        © 2024 Système de Gestion Scolaire Intégré - Dashboard Censeur v2.4.0
      </footer>
    </main>


    <!-- Modal Nouvelle Session -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
      <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined">add_task</span>
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight">Lancer une Nouvelle Session</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Configurez les paramètres de la nouvelle période administrative</p>
            </div>
          </div>
          <button @click="showModal = false" class="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <span class="material-symbols-outlined text-slate-400">close</span>
          </button>
        </div>
        
        <div class="p-8 space-y-8">
          <div class="space-y-4">
            <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Type de session</label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label class="relative flex flex-col p-4 border-2 rounded-xl cursor-pointer hover:bg-primary/10 transition-all group"
                     :class="sessionType === 'saisie' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'">
                <input v-model="sessionType" value="saisie" class="sr-only" name="session_type" type="radio"/>
                <span class="material-symbols-outlined mb-2" :class="sessionType === 'saisie' ? 'text-primary' : 'text-slate-400 group-hover:text-primary'">edit_note</span>
                <span class="text-sm font-bold">Saisie de notes</span>
                <span class="text-[10px] text-slate-500 mt-1 leading-tight">Ouverture des carnets de notes</span>
                <div v-if="sessionType === 'saisie'" class="absolute top-2 right-2 size-4 rounded-full border-4 border-primary bg-white"></div>
              </label>
              <label class="relative flex flex-col p-4 border-2 rounded-xl cursor-pointer hover:border-primary/30 transition-all group"
                     :class="sessionType === 'import' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'">
                <input v-model="sessionType" value="import" class="sr-only" name="session_type" type="radio"/>
                <span class="material-symbols-outlined mb-2" :class="sessionType === 'import' ? 'text-primary' : 'text-slate-400 group-hover:text-primary'">upload_file</span>
                <span class="text-sm font-bold">Import Excel</span>
                <span class="text-[10px] text-slate-500 mt-1 leading-tight">Mise à jour via fichier externe</span>
                <div v-if="sessionType === 'import'" class="absolute top-2 right-2 size-4 rounded-full border-4 border-primary bg-white"></div>
              </label>
              <label class="relative flex flex-col p-4 border-2 rounded-xl cursor-pointer hover:border-primary/30 transition-all group"
                     :class="sessionType === 'conseil' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800'">
                <input v-model="sessionType" value="conseil" class="sr-only" name="session_type" type="radio"/>
                <span class="material-symbols-outlined mb-2" :class="sessionType === 'conseil' ? 'text-primary' : 'text-slate-400 group-hover:text-primary'">groups_2</span>
                <span class="text-sm font-bold">Conseil de classe</span>
                <span class="text-[10px] text-slate-500 mt-1 leading-tight">Calcul des moyennes & appréciations</span>
                <div v-if="sessionType === 'conseil'" class="absolute top-2 right-2 size-4 rounded-full border-4 border-primary bg-white"></div>
              </label>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Période concernée</label>
              <select v-model="periode" class="w-full h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all">
                <optgroup label="Trimestres">
                  <option value="T1">1er Trimestre</option>
                  <option value="T2">2ème Trimestre</option>
                  <option value="T3">3ème Trimestre</option>
                </optgroup>
                <optgroup label="Semestres">
                  <option value="S1">1er Semestre</option>
                  <option value="S2">2ème Semestre</option>
                </optgroup>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Date limite de saisie</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">calendar_today</span>
                <input v-model="dateLimite" class="w-full h-11 pl-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 transition-all" type="date"/>
              </div>
            </div>
            <div class="md:col-span-2 space-y-2">
              <label class="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Classes concernées</label>
              <div class="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px]">
                <span v-for="classe in selectedClasses" :key="classe" class="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded-md flex items-center gap-1">
                  {{ classe }}
                  <button @click="removeClass(classe)" class="material-symbols-outlined text-xs">close</button>
                </span>
                <button @click="addClasse" class="px-2 py-1 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 text-xs font-bold rounded-md flex items-center gap-1 hover:border-primary hover:text-primary transition-colors">
                  <span class="material-symbols-outlined text-xs">add</span> Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-4">
          <button @click="showModal = false" class="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">
            Annuler
          </button>
          <button @click="lancerSession" class="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">rocket_launch</span>
            Lancer la session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CenseurSidebar from '@/components/sidebars/CenseurSidebar.vue'

import Header from '@/components/common/Header.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = ref('Direction des Études')

const pageTitles = {
  'CenseurDashboard': 'Tableau de bord',
  'CenseurEmploiTemps': 'Emplois du temps',
  'CenseurExamens': 'Planification Examens',
  'CenseurBulletins': 'Contrôle des Bulletins',
  'CenseurProfil': 'Mon Profil'
}

watch(() => route.name, (newName) => {
  if (newName && pageTitles[newName]) {
    pageTitle.value = pageTitles[newName]
  }
}, { immediate: true })
const pageComponent = ref(null)
const showModal = ref(false)

const openModal = () => {
  // Vérifier si le composant actuel a une méthode openModal
  if (pageComponent.value && pageComponent.value.openModal) {
    pageComponent.value.openModal()
  }
}

const handleLogout = () => {
  // Logique de déconnexion
  console.log('Déconnexion en cours...')
  
  // Optionnel: Afficher une confirmation
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    // Effacer les données utilisateur (localStorage, sessionStorage, etc.)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.clear()
    
    // Rediriger vers la page de login
    router.push('/login')
  }
}

// Données du formulaire
const sessionType = ref('saisie')
const periode = ref('T1')
const dateLimite = ref('')
const selectedClasses = ref(['Toutes les classes', '2nde C', '1ère S'])

// Fonctions
const removeClass = (classe) => {
  selectedClasses.value = selectedClasses.value.filter(c => c !== classe)
}

const addClasse = () => {
  const nouvelleClasse = prompt('Nom de la classe:')
  if (nouvelleClasse && nouvelleClasse.trim()) {
    selectedClasses.value.push(nouvelleClasse.trim())
  }
}

const lancerSession = () => {
  console.log('Session lancée:', {
    type: sessionType.value,
    periode: periode.value,
    dateLimite: dateLimite.value,
    classes: selectedClasses.value
  })
  // Ici vous pouvez ajouter la logique pour lancer la session
  alert('Session lancée avec succès!')
  showModal.value = false
}
</script>
