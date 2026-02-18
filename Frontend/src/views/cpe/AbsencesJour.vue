<template>
  <div class="flex-1 overflow-y-auto">
    <div class="max-w-6xl mx-auto p-8">
      <!-- Header Section -->
      <div class="flex flex-wrap justify-between items-end gap-3 mb-8">
        <div class="flex min-w-72 flex-col gap-1">
          <h2 class="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Gestion des Absences</h2>
          <p class="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
            Gérez et justifiez les absences signalées par les professeurs ou l'administration.
          </p>
        </div>
      </div>

      <!-- Filters Section -->
      <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase">Période</span>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="filters.startDate" type="date" class="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
              <input v-model="filters.endDate" type="date" class="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase">Classe</span>
            <select v-model="filters.classe" class="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
              <option value="">Toutes les classes</option>
              <option v-for="cls in classes" :key="cls._id" :value="cls._id">{{ cls.niveau }} {{ cls.section }}</option>
            </select>
          </div>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-bold text-slate-500 uppercase">Statut</span>
            <select v-model="filters.justifie" class="h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
              <option value="">Tous</option>
              <option value="false">Non justifiées</option>
              <option value="true">Justifiées</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="fetchAbsences" class="w-full h-10 bg-primary text-white font-bold rounded-lg text-sm hover:brightness-110 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm">filter_list</span>
              Filtrer
            </button>
          </div>
        </div>
      </div>

      <!-- Absences List -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-lg font-bold">Liste des absences</h3>
          <span class="text-sm text-slate-500 italic">{{ absences.length }} enregistrement(s) trouvé(s)</span>
        </div>
        
        <div v-if="isLoading" class="flex justify-center py-12">
          <span class="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
        </div>
        
        <div v-else-if="absences.length === 0" class="text-center py-12">
          <span class="material-symbols-outlined text-6xl text-slate-300">event_available</span>
          <p class="text-slate-500 mt-4">Aucune absence trouvée pour ces critères</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="p-4 text-xs font-bold text-slate-50 uppercase">Élève</th>
                <th class="p-4 text-xs font-bold text-slate-50 uppercase">Date / Heure</th>
                <th class="p-4 text-xs font-bold text-slate-50 uppercase">Matière / Durée</th>
                <th class="p-4 text-xs font-bold text-slate-50 uppercase">Signalé par</th>
                <th class="p-4 text-xs font-bold text-slate-50 uppercase">Statut</th>
                <th class="p-4 text-xs font-bold text-slate-50 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="absence in absences" :key="absence._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="p-4">
                  <div class="flex items-center gap-3">
                    <img :src="absence.eleve.photo || '/default-avatar.png'" class="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p class="font-bold text-sm">{{ absence.eleve.prenom }} {{ absence.eleve.nom }}</p>
                      <p class="text-xs text-slate-500">{{ absence.classe.niveau }} {{ absence.classe.section }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4 text-sm">
                  <p>{{ formatDate(absence.date) }}</p>
                  <p class="text-xs text-slate-500">{{ absence.heureDebut || 'N/A' }} - {{ absence.heureFin || 'N/A' }}</p>
                </td>
                <td class="p-4 text-sm">
                  <p class="font-medium text-primary">{{ absence.matiere?.nom || 'Non spécifiée' }}</p>
                  <p>{{ absence.heures }}h d'absence</p>
                </td>
                <td class="p-4 text-sm text-slate-500">
                  <p>{{ absence.markedBy?.prenom }} {{ absence.markedBy?.nom }}</p>
                  <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-bold">{{ absence.markedBy?.role }}</span>
                </td>
                <td class="p-4 text-sm">
                  <span v-if="absence.justifie" class="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                    <span class="material-symbols-outlined text-xs">check_circle</span> Justifiée
                  </span>
                  <span v-else class="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
                    <span class="material-symbols-outlined text-xs">error</span> Non justifiée
                  </span>
                </td>
                <td class="p-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button v-if="!absence.justifie" @click="openJustifyModal(absence)" class="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" title="Justifier">
                      <span class="material-symbols-outlined text-sm">verified</span>
                    </button>
                    <button @click="openEditModal(absence)" class="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors shadow-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700" title="Modifier">
                      <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Justification -->
    <div v-if="showJustifyModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 class="text-xl font-bold">Justifier l'absence</h3>
          <button @click="showJustifyModal = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-6 flex flex-col gap-4">
          <div class="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p class="text-sm font-bold text-primary">{{ selectedAbsence.eleve.prenom }} {{ selectedAbsence.eleve.nom }}</p>
            <p class="text-xs text-slate-500">{{ formatDate(selectedAbsence.date) }} - {{ selectedAbsence.heures }}h concernées</p>
          </div>
          
          <label class="flex flex-col gap-2">
            <span class="text-sm font-bold">Motif de justification</span>
            <select v-model="justification.motivation" class="h-12 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all">
              <option value="maladie">Certificat Médical</option>
              <option value="famille">Raison Familiale</option>
              <option value="transport">Problème de Transport</option>
              <option value="convocation">Convocation Officielle</option>
              <option value="autre">Autre raison...</option>
            </select>
          </label>
          
          <label class="flex flex-col gap-2">
            <span class="text-sm font-bold">Obsersations / Détails</span>
            <textarea v-model="justification.notes" class="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none" placeholder="Précisez la raison..."></textarea>
          </label>
        </div>
        <div class="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3">
          <button @click="showJustifyModal = false" class="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 transition-all">Annuler</button>
          <button @click="submitJustification" class="flex-1 h-12 rounded-xl bg-emerald-500 text-white font-bold hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all">Confirmer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '@/services/api'

const isLoading = ref(true)
const absences = ref([])
const classes = ref([])

const filters = reactive({
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  classe: '',
  justifie: ''
})

const showJustifyModal = ref(false)
const selectedAbsence = ref(null)
const justification = reactive({
  motivation: 'maladie',
  notes: ''
})

const fetchClasses = async () => {
  try {
    const response = await api.getClasses()
    classes.value = response.data.data
  } catch (error) {
    console.error('Erreur chargement classes:', error)
  }
}

const fetchAbsences = async () => {
  try {
    isLoading.value = true
    const params = {
      ...filters
    }
    const response = await api.getManageableAbsences(params)
    absences.value = response.data.data
  } catch (error) {
    console.error('Erreur chargement absences:', error)
  } finally {
    isLoading.value = false
  }
}

const openJustifyModal = (absence) => {
  selectedAbsence.value = absence
  justification.motivation = 'maladie'
  justification.notes = ''
  showJustifyModal.value = true
}

const submitJustification = async () => {
  try {
    isLoading.value = true
    await api.justifyAbsence(selectedAbsence.value._id, justification)
    alert('L\'absence a été justifiée avec succès. Les retraits de points ont été recalculés.')
    showJustifyModal.value = false
    fetchAbsences()
  } catch (error) {
    console.error('Erreur justification:', error)
    alert('Erreur lors de la justification')
  } finally {
    isLoading.value = false
  }
}

const openEditModal = (absence) => {
  // Placeholder for edit functionality
  alert('Fonctionnalité de modification à implémenter si nécessaire.')
}

const formatDate = (date) => {
  if (!date) return '--'
  return new Date(date).toLocaleDateString('fr-FR', { 
    day: '2-digit', 
    month: '2-digit',
    year: 'numeric'
  })
}

onMounted(() => {
  fetchClasses()
  fetchAbsences()
})
</script>
