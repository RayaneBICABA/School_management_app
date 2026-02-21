<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white mb-2">Inscription des Élèves</h1>
        <p class="text-slate-600 dark:text-slate-400">Gérez les nouvelles inscriptions et demandes d'admission</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">person_add</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.enAttente }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">En attente</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">check_circle</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.valides }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Validées</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl">pending</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.enCours }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">En cours</p>
            </div>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <span class="material-symbols-outlined text-red-600 dark:text-red-400 text-xl">close</span>
            </div>
            <div>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">{{ stats.rejetes }}</p>
              <p class="text-sm text-slate-500 dark:text-slate-400">Rejetées</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 mb-8">
        <button @click="showNewInscription = true" class="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <span class="material-symbols-outlined">add</span>
          Nouvelle inscription
        </button>
        <button @click="exporterListe" class="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <span class="material-symbols-outlined">download</span>
          Exporter la liste
        </button>
      </div>

      <!-- Tableau des inscriptions -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Liste des inscriptions</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Élève</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Classe demandée</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
              <tr v-for="inscription in inscriptions" :key="inscription.id" class="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                      <span class="text-xs font-bold">{{ inscription.initials }}</span>
                    </div>
                    <div>
                      <p class="font-medium text-slate-900 dark:text-white">{{ inscription.nom }}</p>
                      <p class="text-sm text-slate-500">{{ inscription.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ inscription.date }}</td>
                <td class="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{{ inscription.classe }}</td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs font-bold rounded-full" :class="getStatusClass(inscription.statut)">
                    {{ inscription.statut }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    <button @click="voirDetails(inscription)" class="text-primary hover:text-primary/80 text-sm font-medium">Voir</button>
                    <button v-if="inscription.statut === 'En attente'" @click="validerInscription(inscription)" class="text-green-600 hover:text-green-700 text-sm font-medium">Valider</button>
                    <button v-if="inscription.statut === 'En attente'" @click="rejeterInscription(inscription)" class="text-red-600 hover:text-red-700 text-sm font-medium">Rejeter</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showNewInscription = ref(false)

const stats = ref({
  enAttente: 12,
  valides: 45,
  enCours: 8,
  rejetes: 3
})

const inscriptions = ref([
  {
    id: 1,
    nom: 'Martin Alice',
    initials: 'MA',
    email: 'alice.martin@email.com',
    date: '15/10/2023',
    classe: '6ème A',
    statut: 'En attente'
  },
  {
    id: 2,
    nom: 'Dupont Bob',
    initials: 'DB',
    email: 'bob.dupont@email.com',
    date: '14/10/2023',
    classe: '5ème B',
    statut: 'Validée'
  },
  {
    id: 3,
    nom: 'Bernard Claire',
    initials: 'BC',
    email: 'claire.bernard@email.com',
    date: '13/10/2023',
    classe: '4ème A',
    statut: 'En cours'
  }
])

const getStatusClass = (statut) => {
  switch (statut) {
    case 'Validée': return 'bg-green-100 text-green-700'
    case 'En cours': return 'bg-amber-100 text-amber-700'
    case 'En attente': return 'bg-blue-100 text-blue-700'
    case 'Rejetée': return 'bg-red-100 text-red-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const voirDetails = (inscription) => {
  console.log('Voir détails:', inscription)
}

const validerInscription = (inscription) => {
  console.log('Valider inscription:', inscription)
  inscription.statut = 'Validée'
}

const rejeterInscription = (inscription) => {
  console.log('Rejeter inscription:', inscription)
  inscription.statut = 'Rejetée'
}

const exporterListe = () => {
  console.log('Exporter la liste des inscriptions')
}
</script>
