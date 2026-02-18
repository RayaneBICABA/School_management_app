<template>
  <div class="rapports-anomalies-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium text-slate-400">Rapports d'Anomalies</span>
      </nav>

    <!-- Back Button -->
    <div class="mb-4">
      <button @click="$router.push('/censeur')" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Retour au tableau de bord</span>
      </button>
    </div>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Rapports d'Anomalies</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Supervisez les incohérences de notes et les retards identifiés par le système.</p>
      </div>
      <button @click="actualiserDonnees" class="flex items-center gap-2 px-5 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
        <span class="material-symbols-outlined text-[20px]">refresh</span>
        <span>Actualiser</span>
      </button>
    </div>

    <!-- Stats Overview -->
    <section class="px-8 py-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Anomalies Totales</p>
            <span class="material-symbols-outlined text-primary">analytics</span>
          </div>
          <p class="text-slate-900 dark:text-white text-3xl font-bold">{{ stats.anomaliesTotales }}</p>
          <p class="text-emerald-500 text-sm font-medium mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">trending_up</span> +{{ stats.progressionVsHier }}% vs hier
          </p>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Critiques (Notes > 20)</p>
            <span class="material-symbols-outlined text-rose-500">error</span>
          </div>
          <p class="text-slate-900 dark:text-white text-3xl font-bold">{{ stats.notesCritiques }}</p>
          <p class="text-emerald-500 text-sm font-medium mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">trending_down</span> -{{ stats.reductionMatin }} ce matin
          </p>
        </div>
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
          <div class="flex justify-between items-start mb-2">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Retards de saisie</p>
            <span class="material-symbols-outlined text-amber-500">schedule</span>
          </div>
          <p class="text-slate-900 dark:text-white text-3xl font-bold">{{ stats.retardsSaisie }}</p>
          <p class="text-rose-500 text-sm font-medium mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">priority_high</span> +{{ stats.enAttente }} en attente
          </p>
        </div>
      </div>
    </section>

    <!-- Search and Filters -->
    <section class="px-8 py-4">
      <div class="max-w-6xl mx-auto flex flex-col gap-4">
        <div class="flex flex-col md:flex-row gap-4 items-center">
          <div class="relative flex-1 w-full">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input v-model="searchQuery" class="w-full h-12 pl-12 pr-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all" placeholder="Rechercher un élève, une classe ou un professeur..." type="text"/>
          </div>
          <div class="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button class="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent px-4 whitespace-nowrap">
              <span class="text-slate-700 dark:text-white text-sm font-medium leading-normal">{{ selectedClasse || 'Toutes les classes' }}</span>
              <span class="material-symbols-outlined text-slate-400 text-[20px]">expand_more</span>
            </button>
            <button class="flex h-10 items-center justify-center gap-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent px-4 whitespace-nowrap">
              <span class="text-slate-700 dark:text-white text-sm font-medium leading-normal">{{ selectedSeverite || 'Sévérité' }}</span>
              <span class="material-symbols-outlined text-slate-400 text-[20px]">filter_list</span>
            </button>
          </div>
        </div>
        <!-- Type Chips -->
        <div class="flex gap-2 flex-wrap">
          <button @click="selectedType = 'tous'" :class="selectedType === 'tous' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300'" class="px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-all">
            Tous les types
          </button>
          <button @click="selectedType = 'notes'" :class="selectedType === 'notes' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300'" class="px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-all">
            Notes hors plage
          </button>
          <button @click="selectedType = 'moyennes'" :class="selectedType === 'moyennes' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300'" class="px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-all">
            Moyennes aberrantes
          </button>
          <button @click="selectedType = 'manquantes'" :class="selectedType === 'manquantes' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-600 dark:text-slate-300'" class="px-4 py-1.5 rounded-full text-sm font-medium hover:border-primary transition-all">
            Saisies manquantes
          </button>
        </div>
      </div>
    </section>

    <!-- Anomalies List/Table -->
    <section class="px-8 py-6 flex-1">
      <div class="max-w-6xl mx-auto h-full">
        <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Élève / Classe</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Matière & Professeur</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Anomalie détectée</th>
                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr v-for="anomalie in filteredAnomalies" :key="anomalie.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-bold text-slate-900 dark:text-white">{{ anomalie.eleve }}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400">{{ anomalie.classe }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="font-medium text-slate-900 dark:text-white">{{ anomalie.matiere }}</span>
                    <span class="text-xs text-slate-500 dark:text-slate-400 text-primary">{{ anomalie.professeur }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="flex h-2 w-2 rounded-full" :class="getSeverityColor(anomalie.severite)"></span>
                    <span class="text-sm font-semibold" :class="getSeverityTextColor(anomalie.severite)">{{ anomalie.description }}</span>
                  </div>
                  <p class="text-[11px] text-slate-400 mt-0.5">{{ anomalie.details }}</p>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button @click="contacterProf(anomalie)" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-white hover:bg-primary/20 hover:text-primary transition-all" :title="anomalie.actionTitle">
                      <span class="material-symbols-outlined text-[20px]">{{ anomalie.primaryIcon }}</span>
                    </button>
                    <button @click="actionSecondaire(anomalie)" :class="anomalie.severite === 'critique' ? 'bg-primary text-white hover:bg-blue-600' : 'border border-primary text-primary dark:border-primary/50 hover:bg-primary/10'" class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all">
                      {{ anomalie.secondaryAction }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Footer Pagination -->
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center border-t border-slate-200 dark:border-slate-700 mt-auto">
            <p class="text-xs text-slate-500 dark:text-slate-400">Affichage de 1-{{ filteredAnomalies.length }} sur {{ stats.anomaliesTotales }} anomalies</p>
            <div class="flex gap-1">
              <button class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-400 disabled:opacity-50" disabled>
                <span class="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <button class="p-2 rounded-lg bg-primary text-white font-bold text-xs px-4">1</button>
              <button class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-600 dark:text-white font-bold text-xs px-4">2</button>
              <button class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-600 dark:text-white font-bold text-xs px-4">3</button>
              <button class="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent text-slate-400">
                <span class="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contextual Help Card -->
    <section class="px-8 py-4 mb-10">
      <div class="max-w-6xl mx-auto">
        <div class="bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary p-6 rounded-r-xl">
          <div class="flex items-start gap-4">
            <span class="material-symbols-outlined text-primary text-3xl">lightbulb</span>
            <div>
              <h4 class="text-slate-900 dark:text-white font-bold">Conseil de gestion</h4>
              <p class="text-slate-600 dark:text-slate-400 text-sm mt-1">
                Le système détecte automatiquement les notes supérieures à 20 et les moyennes de classe variant de plus de 40% par rapport au trimestre précédent. Pensez à vérifier les coefficients configurés en début de période.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Données réactives
const searchQuery = ref('')
const selectedClasse = ref('')
const selectedSeverite = ref('')
const selectedType = ref('tous')

// Statistiques
const stats = ref({
  anomaliesTotales: 42,
  progressionVsHier: 5,
  notesCritiques: 12,
  reductionMatin: 2,
  retardsSaisie: 25,
  enAttente: 10
})

// Données des anomalies
const anomalies = ref([
  {
    id: 1,
    eleve: 'Jean-Paul Kouassi',
    classe: 'Terminale C1',
    matiere: 'Mathématiques',
    professeur: 'Dr. Soro',
    severite: 'critique',
    description: 'Note hors plage: 25/20',
    details: 'Détecté il y a 2h',
    primaryIcon: 'mail',
    secondaryAction: 'Corriger',
    actionTitle: 'Contacter le prof',
    type: 'notes'
  },
  {
    id: 2,
    eleve: 'Marie-Noëlle Yao',
    classe: 'Seconde A2',
    matiere: 'Histoire-Géo',
    professeur: 'Mme. Diallo',
    severite: 'warning',
    description: 'Note manquante (Délai dépassé)',
    details: 'Éval. du 12/10',
    primaryIcon: 'notifications_active',
    secondaryAction: 'Justifier',
    actionTitle: 'Relancer',
    type: 'manquantes'
  },
  {
    id: 3,
    eleve: 'Classe de 3ème 4',
    classe: 'Collectif',
    matiere: 'Physique-Chimie',
    professeur: 'M. Touré',
    severite: 'info',
    description: 'Moyenne aberrante (19.8/20)',
    details: 'Possible erreur de coefficient',
    primaryIcon: 'chat',
    secondaryAction: 'Vérifier',
    actionTitle: 'Contacter le prof',
    type: 'moyennes'
  },
  {
    id: 4,
    eleve: 'Abdou Karim',
    classe: '4ème B',
    matiere: 'Français',
    professeur: 'M. Konan',
    severite: 'critique',
    description: 'Note négative: -5/20',
    details: 'Détecté il y a 30min',
    primaryIcon: 'mail',
    secondaryAction: 'Corriger',
    actionTitle: 'Contacter le prof',
    type: 'notes'
  },
  {
    id: 5,
    eleve: 'Aminata Bamba',
    classe: '1ère D',
    matiere: 'SVT',
    professeur: 'Mme. Ouattara',
    severite: 'warning',
    description: '3 notes manquantes',
    details: 'Retard de 5 jours',
    primaryIcon: 'notifications_active',
    secondaryAction: 'Justifier',
    actionTitle: 'Relancer',
    type: 'manquantes'
  }
])

// Computed properties
const filteredAnomalies = computed(() => {
  let filtered = anomalies.value

  // Filtrer par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(anomalie => 
      anomalie.eleve.toLowerCase().includes(query) ||
      anomalie.classe.toLowerCase().includes(query) ||
      anomalie.matiere.toLowerCase().includes(query) ||
      anomalie.professeur.toLowerCase().includes(query)
    )
  }

  // Filtrer par type
  if (selectedType.value !== 'tous') {
    filtered = filtered.filter(anomalie => anomalie.type === selectedType.value)
  }

  return filtered
})

// Fonctions utilitaires
const getSeverityColor = (severite) => {
  switch (severite) {
    case 'critique': return 'bg-rose-500'
    case 'warning': return 'bg-amber-500'
    case 'info': return 'bg-sky-500'
    default: return 'bg-slate-500'
  }
}

const getSeverityTextColor = (severite) => {
  switch (severite) {
    case 'critique': return 'text-rose-500'
    case 'warning': return 'text-amber-500'
    case 'info': return 'text-sky-500'
    default: return 'text-slate-500'
  }
}

// Fonctions d'action
const actualiserDonnees = () => {
  console.log('Actualisation des données...')
}

const contacterProf = (anomalie) => {
  console.log('Contacter professeur pour:', anomalie.eleve)
}

const actionSecondaire = (anomalie) => {
  console.log(`${anomalie.secondaryAction} pour:`, anomalie.eleve)
}
</script>
