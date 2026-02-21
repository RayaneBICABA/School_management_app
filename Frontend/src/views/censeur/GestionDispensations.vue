<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Gestion des Dispensations</h1>
        <p class="text-slate-500 dark:text-slate-400">Gérez les élèves dispensés de certaines matières (ex: EPS)</p>
      </div>
      <button 
        @click="showAddModal = true"
        class="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
      >
        <span class="material-symbols-rounded">add</span>
        Ajouter une dispensation
      </button>
    </div>

    <!-- Liste des dispensations -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-slate-50 dark:bg-slate-900/50">
          <tr>
            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Élève</th>
            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Matière</th>
            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Motif</th>
            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Année Scolaire</th>
            <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500">Chargement...</td>
          </tr>
          <tr v-else-if="dispensations.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500">Aucune dispensation enregistrée.</td>
          </tr>
          <tr v-for="disp in dispensations" :key="disp._id" class="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900 dark:text-white">
                {{ disp.eleve?.prenom }} {{ disp.eleve?.nom }}
              </div>
              <div class="text-xs text-slate-500">{{ disp.eleve?.matricule }}</div>
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
              {{ disp.matiere?.nom }}
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
              {{ disp.motif }}
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
              {{ disp.anneeScolaire }}
            </td>
            <td class="px-6 py-4 text-right">
              <button 
                @click="confirmDelete(disp)"
                class="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                <span class="material-symbols-rounded">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Ajout -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-xl font-bold text-slate-800 dark:text-white">Nouvelle Dispensation</h3>
        </div>
        
        <form @submit.prevent="createDispensation" class="p-6 space-y-4">
          <!-- Recherche Élève -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Élève</label>
            <div class="relative">
              <input 
                v-model="studentSearch"
                @input="searchStudents"
                type="text"
                placeholder="Rechercher par nom ou matricule..."
                class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20"
              />
              <div v-if="searchResults.length > 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <div 
                  v-for="student in searchResults" 
                  :key="student._id"
                  @click="selectStudent(student)"
                  class="px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-sm"
                >
                  {{ student.prenom }} {{ student.nom }} ({{ student.matricule }})
                </div>
              </div>
            </div>
            
            <!-- Liste des élèves sélectionnés -->
            <div v-if="selectedStudents.length > 0" class="mt-3 space-y-2">
              <div class="text-xs font-semibold text-slate-500 uppercase">Élèves sélectionnés ({{ selectedStudents.length }})</div>
              <div class="flex flex-wrap gap-2">
                <div 
                  v-for="student in selectedStudents" 
                  :key="student._id"
                  class="bg-primary/5 text-primary rounded-full px-3 py-1 text-xs flex items-center gap-2 border border-primary/20"
                >
                  <span>{{ student.prenom }} {{ student.nom }}</span>
                  <button @click="removeStudent(student)" type="button" class="hover:text-primary-dark">
                    <span class="material-symbols-rounded text-base">close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sélection Matière -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Matière</label>
            <select 
              v-model="newDisp.matiere"
              class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="" disabled>Sélectionner une matière</option>
              <option v-for="mat in matieres" :key="mat._id" :value="mat._id">{{ mat.nom }}</option>
            </select>
          </div>

          <!-- Motif -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif</label>
            <textarea 
              v-model="newDisp.motif"
              rows="3"
              class="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Ex: Raisons médicales"
              required
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              :disabled="submitting || selectedStudents.length === 0"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { success: toastSuccess, error: toastError } = useToast()

const dispensations = ref([])
const matieres = ref([])
const loading = ref(false)
const showAddModal = ref(false)
const submitting = ref(false)

const studentSearch = ref('')
const searchResults = ref([])
const selectedStudents = ref([])

const newDisp = ref({
  eleve: '',
  matiere: '',
  motif: '',
  anneeScolaire: '2025-2026'
})

const fetchDispensations = async () => {
  loading.value = true
  try {
    const response = await api.getDispensations()
    dispensations.value = response.data.data
  } catch (err) {
    console.error('Erreur chargement dispensations:', err)
    toastError('Erreur lors du chargement des dispensations')
  } finally {
    loading.value = false
  }
}

const fetchMatieres = async () => {
  try {
    const response = await api.getMatieres()
    matieres.value = response.data.data
  } catch (err) {
    console.error('Erreur chargement matières:', err)
  }
}

const searchStudents = async () => {
  if (studentSearch.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const response = await api.getUsers({ role: 'ELEVE', q: studentSearch.value })
    searchResults.value = response.data.data
  } catch (err) {
    console.error('Erreur recherche élèves:', err)
  }
}

const selectStudent = (student) => {
  if (!selectedStudents.value.some(s => s._id === student._id)) {
    selectedStudents.value.push(student)
  }
  studentSearch.value = ''
  searchResults.value = []
}

const removeStudent = (student) => {
  selectedStudents.value = selectedStudents.value.filter(s => s._id !== student._id)
}

const createDispensation = async () => {
  if (selectedStudents.value.length === 0) return

  submitting.value = true
  try {
    const dispensationsData = selectedStudents.value.map(student => ({
      ...newDisp.value,
      eleve: student._id
    }))

    await api.createDispensation(dispensationsData)
    toastSuccess(`${selectedStudents.value.length} dispensation(s) enregistrée(s) avec succès`)
    showAddModal.value = false
    // Reset form
    newDisp.value = { eleve: '', matiere: '', motif: '', anneeScolaire: '2025-2026' }
    selectedStudents.value = []
    fetchDispensations()
  } catch (err) {
    console.error('Erreur création dispensation:', err)
    toastError(err.response?.data?.message || 'Erreur lors de l’enregistrement')
  } finally {
    submitting.value = false
  }
}

const confirmDelete = async (disp) => {
  if (confirm(`Supprimer la dispensation pour ${disp.eleve.prenom} ${disp.eleve.nom} ?`)) {
    try {
      await api.deleteDispensation(disp._id)
      toastSuccess('Dispensation supprimée')
      fetchDispensations()
    } catch (err) {
      console.error('Erreur suppression dispensation:', err)
      toastError('Erreur lors de la suppression')
    }
  }
}

onMounted(() => {
  fetchDispensations()
  fetchMatieres()
})
</script>
