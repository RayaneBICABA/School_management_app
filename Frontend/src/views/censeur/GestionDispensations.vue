<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Dispensations</h1>
      <p class="text-slate-500 dark:text-slate-400">Gérez les élèves dispensés par matière et par classe.</p>
    </div>

    <!-- Sélections -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">1. Choisir une Matière</label>
        <select 
          v-model="selectedMatiere" 
          @change="onSelectionChange"
          class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Sélectionner une matière</option>
          <option v-for="mat in matieres" :key="mat._id" :value="mat._id">{{ mat.nom }}</option>
        </select>
      </div>

      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">2. Choisir une Classe</label>
        <select 
          v-model="selectedClasse" 
          @change="onSelectionChange"
          class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Sélectionner une classe</option>
          <option v-for="cls in classes" :key="cls._id" :value="cls._id">{{ cls.niveau }} {{ cls.section }}</option>
        </select>
      </div>

      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Action par défaut</label>
        <input 
          v-model="defaultMotif"
          type="text"
          placeholder="Motif (ex: Raisons médicales)"
          class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>

    <!-- Liste des élèves -->
    <div v-if="selectedMatiere && selectedClasse" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
        <h3 class="font-bold text-slate-800 dark:text-white">
          Élèves de la classe ({{ eleves.length }})
        </h3>
        <div class="text-xs text-slate-500 uppercase font-semibold">
          {{ dispensationsCount }} dispense(s) active(s)
        </div>
      </div>
      
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">Dispense</th>
            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Élève</th>
            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Matricule</th>
            <th class="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut / Motif</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-if="loadingEleves" class="animate-pulse">
            <td colspan="4" class="px-6 py-8 text-center text-slate-500">Chargement des élèves...</td>
          </tr>
          <tr v-else-if="eleves.length === 0">
            <td colspan="4" class="px-6 py-8 text-center text-slate-500">Aucun élève dans cette classe.</td>
          </tr>
          <tr v-for="eleve in eleves" :key="eleve._id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td class="px-6 py-4">
              <input 
                type="checkbox" 
                :checked="isDispensed(eleve._id)"
                @change="(e) => toggleDispense(eleve, e.target.checked)"
                class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
              />
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900 dark:text-white">
                {{ eleve.prenom }} {{ eleve.nom }}
              </div>
            </td>
            <td class="px-6 py-4 text-slate-500 text-sm">
              {{ eleve.matricule }}
            </td>
            <td class="px-6 py-4">
              <div v-if="isDispensed(eleve._id)" class="flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                  DISPENSÉ
                </span>
                <span class="text-xs text-slate-500 italic truncate max-w-[200px]" :title="getDispensationMotif(eleve._id)">
                  {{ getDispensationMotif(eleve._id) }}
                </span>
              </div>
              <span v-else class="text-xs text-slate-400 italic">Non dispensé</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si rien n'est sélectionné -->
    <div v-else class="bg-primary/5 border border-primary/20 rounded-xl p-12 text-center">
      <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="material-symbols-rounded text-primary text-3xl">school</span>
      </div>
      <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Sélection requise</h3>
      <p class="text-slate-500 max-w-md mx-auto">
        Veuillez sélectionner une matière et une classe pour gérer les dispensations.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { success: toastSuccess, error: toastError } = useToast()

const matieres = ref([])
const classes = ref([])
const eleves = ref([])
const currentDispensations = ref([])
const selectedMatiere = ref('')
const selectedClasse = ref('')
const defaultMotif = ref('Raisons médicales')
const loadingEleves = ref(false)

const dispensationsCount = computed(() => currentDispensations.value.length)

const fetchInitialData = async () => {
  try {
    const [matRes, clsRes] = await Promise.all([
      api.getMatieres(),
      api.getClasses()
    ])
    matieres.value = matRes.data.data
    classes.value = clsRes.data.data
  } catch (err) {
    console.error('Erreur initialisation:', err)
  }
}

const onSelectionChange = async () => {
  if (selectedMatiere.value && selectedClasse.value) {
    loadingEleves.value = true
    try {
      const [elevesRes, dispRes] = await Promise.all([
        api.getUsers({ role: 'ELEVE', classe: selectedClasse.value }),
        api.getDispensations({ matiere: selectedMatiere.value, classe: selectedClasse.value })
      ])
      eleves.value = elevesRes.data.data
      currentDispensations.value = dispRes.data.data
    } catch (err) {
      console.error('Erreur chargement données:', err)
      toastError('Erreur lors du chargement des élèves')
    } finally {
      loadingEleves.value = false
    }
  } else {
    eleves.value = []
    currentDispensations.value = []
  }
}

const isDispensed = (eleveId) => {
  return currentDispensations.value.some(d => (d.eleve._id || d.eleve) === eleveId)
}

const getDispensationMotif = (eleveId) => {
  const disp = currentDispensations.value.find(d => (d.eleve._id || d.eleve) === eleveId)
  return disp ? disp.motif : ''
}

const toggleDispense = async (eleve, shouldDispense) => {
  if (shouldDispense) {
    // Créer la dispensation
    try {
      const response = await api.createDispensation({
        eleve: eleve._id,
        matiere: selectedMatiere.value,
        motif: defaultMotif.value || 'Raisons médicales',
        anneeScolaire: '2025-2026'
      })
      // On recharge les dispensations pour mettre à jour l'UI avec l'objet complet (important pour la suppression ultérieure)
      const dispRes = await api.getDispensations({ matiere: selectedMatiere.value, classe: selectedClasse.value })
      currentDispensations.value = dispRes.data.data
      toastSuccess(`Dispensation ajoutée pour ${eleve.prenom}`)
    } catch (err) {
      console.error('Erreur ajout dispense:', err)
      toastError('Erreur lors de l’ajout')
      // Re-fetch to sync UI if error
      onSelectionChange()
    }
  } else {
    // Supprimer la dispensation
    const disp = currentDispensations.value.find(d => (d.eleve._id || d.eleve) === eleve._id)
    if (disp) {
      try {
        await api.deleteDispensation(disp._id)
        currentDispensations.value = currentDispensations.value.filter(d => d._id !== disp._id)
        toastSuccess(`Dispensation supprimée pour ${eleve.prenom}`)
      } catch (err) {
        console.error('Erreur suppression dispense:', err)
        toastError('Erreur lors de la suppression')
        // Re-fetch to sync UI if error
        onSelectionChange()
      }
    }
  }
}

onMounted(() => {
  fetchInitialData()
})
</script>

