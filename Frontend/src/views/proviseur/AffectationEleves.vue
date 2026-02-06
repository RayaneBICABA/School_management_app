<template>
  <div class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
    <div class="max-w-7xl mx-auto w-full p-8">
      <!-- Header -->
      <div class="flex flex-wrap justify-between items-center gap-4 mb-8">
        <div class="flex flex-col gap-2">
          <h2 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Affectation des Élèves</h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-lg font-normal">Gérez l'inscription et la répartition des nouveaux élèves</p>
        </div>
        <div class="flex gap-3">
          <input ref="fileInput" type="file" accept=".xlsx,.xls" @change="handleFileUpload" class="hidden" />
          <button @click="$refs.fileInput.click()" class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[#d0dbe7] dark:border-slate-700 text-[#0e141b] dark:text-white text-sm font-bold shadow-sm hover:bg-slate-50">
            <span class="material-symbols-outlined text-xl">upload_file</span>
            <span>Importer Excel</span>
          </button>
          <button @click="finaliserRepartition" class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all">
            <span class="material-symbols-outlined text-xl">check_circle</span>
            <span>Finaliser la répartition</span>
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Total élèves</p>
            <span class="material-symbols-outlined text-blue-500">groups</span>
          </div>
          <p class="text-3xl font-bold text-[#0e141b] dark:text-white">{{ stats.totalEleves }}</p>
          <p class="text-slate-400 text-xs">Inscrits cette année</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Non affectés</p>
            <span class="material-symbols-outlined text-amber-500">person_off</span>
          </div>
          <p class="text-3xl font-bold text-[#0e141b] dark:text-white">{{ stats.nonAffectes }}</p>
          <p class="text-slate-400 text-xs">En attente d'affectation</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
          <div class="flex justify-between items-start">
            <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Classes disponibles</p>
            <span class="material-symbols-outlined text-green-500">school</span>
          </div>
          <p class="text-3xl font-bold text-[#0e141b] dark:text-white">{{ stats.classesDisponibles }}</p>
          <p class="text-slate-400 text-xs">Places disponibles</p>
        </div>

      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Students List -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm">
            <div class="p-6 border-b border-[#d0dbe7] dark:border-slate-700">
              <div class="flex items-center justify-between">
                <h3 class="text-[#0e141b] dark:text-white text-lg font-bold">Élèves non affectés</h3>
                <div class="flex items-center gap-2">
                  <select v-model="filtreNiveau" class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                    <option>Tous les niveaux</option>
                    <option>6ème</option>
                    <option>5ème</option>
                    <option>4ème</option>
                    <option>3ème</option>
                  </select>
                  <select v-model="filtreFiliere" class="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                    <option>Toutes les filières</option>
                    <option>Général</option>
                    <option>Technique</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="p-6">
              <!-- Search -->
              <div class="relative mb-4">
                <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input v-model="searchQuery" class="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="Rechercher un élève...">
              </div>
              
              <!-- Students List -->
              <div class="space-y-2 max-h-96 overflow-y-auto">
                <div v-for="eleve in filteredEleves" :key="eleve.id" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer">
                  <input v-model="eleve.selected" type="checkbox" class="w-4 h-4 text-primary rounded">
                  <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {{ eleve.initials }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-[#0e141b] dark:text-white">{{ eleve.nom }}</p>
                    <p class="text-sm text-slate-500">{{ eleve.niveau }} • {{ eleve.filiere }}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs" :class="getStatutClass(eleve.statut)">
                      {{ eleve.statut }}
                    </span>
                    <button @click="deleteStudent(eleve)" class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title="Supprimer l'élève">
                      <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Class Assignment -->
        <div class="space-y-6">
          <!-- Target Class -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm p-6">
            <h3 class="text-[#0e141b] dark:text-white text-lg font-bold mb-4">Classe de destination</h3>
            <select v-model="classeDestination" class="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
              <option v-for="classe in classes" :key="classe.id" :value="classe">
                {{ classe.nom }} ({{ classe.current }}/{{ classe.capacite }})
              </option>
            </select>
            
            <div v-if="classeDestination" class="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-[#0e141b] dark:text-white">{{ classeDestination.nom }}</span>
                <span class="text-sm text-slate-500">{{ classeDestination.current }}/{{ classeDestination.capacite }}</span>
              </div>
              <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div class="bg-primary h-2 rounded-full transition-all" :style="`width: ${(classeDestination.current / classeDestination.capacite) * 100}%`"></div>
              </div>
              <div class="mt-2 text-xs text-slate-500">
                Professeur principal: {{ classeDestination.profPrincipal }}
              </div>
            </div>
            <div v-else class="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg text-center text-slate-500 text-sm">
              Aucune classe disponible
            </div>
          </div>

          <!-- Selected Students -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-[#0e141b] dark:text-white text-lg font-bold">Élèves sélectionnés</h3>
              <span class="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{{ selectedCount }}</span>
            </div>
            <div class="space-y-2 max-h-64 overflow-y-auto">
              <div v-for="eleve in selectedEleves" :key="eleve.id" class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {{ eleve.initials }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.nom }}</p>
                  <p class="text-xs text-slate-500">{{ eleve.niveau }} • {{ eleve.filiere }}</p>
                </div>
                <button @click="removeSelection(eleve.id)" class="text-slate-400 hover:text-danger">
                  <span class="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
            <button @click="assignerSelection" class="w-full mt-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
              Assigner à la classe
            </button>
          </div>

          <!-- Recent Assignments -->
          <div class="bg-white dark:bg-slate-800 rounded-xl border border-[#d0dbe7] dark:border-slate-700 shadow-sm p-6">
            <h3 class="text-[#0e141b] dark:text-white text-lg font-bold mb-4">Affectations récentes</h3>
            <div class="space-y-2">
              <div v-for="affectation in affectationsRecentes" :key="affectation.id" class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-xs">
                  {{ affectation.eleve.initials }}
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-[#0e141b] dark:text-white">{{ affectation.eleve.nom }}</p>
                  <p class="text-xs text-slate-500">→ {{ affectation.classe }}</p>
                </div>
                <span class="text-xs text-slate-400">{{ affectation.heure }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      :confirm-text="confirmModalActionText"
      :cancel-text="confirmModalCancelText"
      :type="confirmModalType"
      @confirm="executeConfirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

const { success, error, warning } = useToast()

const searchQuery = ref('')
const filtreNiveau = ref('Tous les niveaux')
const filtreFiliere = ref('Toutes les filières')

const stats = ref({
  totalEleves: 0,
  nonAffectes: 0,
  classesDisponibles: 0
})

const fileInput = ref(null)

const classeDestination = ref(null)
const nonAffectes = ref([])
const classes = ref([])
const affectationsRecentes = ref([])

// Confirmation Modal State
const showConfirmModal = ref(false)
const confirmModalTitle = ref('')
const confirmModalMessage = ref('')
const confirmModalActionText = ref('Confirmer')
const confirmModalCancelText = ref('Annuler')
const confirmModalType = ref('info')
const pendingAction = ref(null)

onMounted(async () => {
  await fetchData()
})

const fetchData = async () => {
  try {
    // Fetch students first to calculate class enrollment
    const studentsRes = await api.getUsers({ role: 'ELEVE' })
    const allStudents = studentsRes.data.data
    
    // Fetch all classes
    const classesRes = await api.getClasses()
    classes.value = classesRes.data.data.map(c => {
      // Count students in this class
      const studentsInClass = allStudents.filter(s => s.classe?._id === c._id || s.classe === c._id).length
      
      return {
        id: c._id,
        nom: `${c.niveau} ${c.section}`,
        code: c.code || `${c.niveau}${c.section}`,
        capacite: c.capacite || 30,
        current: studentsInClass,
        profPrincipal: c.professeurPrincipal?.nom || 'Non assigné',
        salle: c.salle || 'N/A',
        _id: c._id
      }
    })

    if (classes.value.length > 0) {
      classeDestination.value = classes.value[0]
    }

    nonAffectes.value = allStudents
      .filter(s => !s.classe)
      .map(s => ({
        id: s._id,
        nom: `${s.prenom} ${s.nom}`,
        initials: `${s.prenom[0]}${s.nom[0]}`.toUpperCase(),
        niveau: 'Non défini',
        filiere: 'Non défini',
        statut: 'Nouveau',
        selected: false,
        _id: s._id
      }))

    // Calculate stats
    stats.value.totalEleves = allStudents.length
    stats.value.nonAffectes = nonAffectes.value.length
    stats.value.classesDisponibles = classes.value.length

  } catch (err) {
    console.error('Error fetching data:', err)
    error('Erreur lors du chargement des données')
  }
}

const filteredEleves = computed(() => {
  return nonAffectes.value.filter(eleve => {
    const matchSearch = eleve.nom.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchNiveau = filtreNiveau.value === 'Tous les niveaux' || eleve.niveau === filtreNiveau.value
    const matchFiliere = filtreFiliere.value === 'Toutes les filières' || eleve.filiere === filtreFiliere.value
    return matchSearch && matchNiveau && matchFiliere
  })
})

const selectedEleves = computed(() => {
  return nonAffectes.value.filter(eleve => eleve.selected)
})

const selectedCount = computed(() => {
  return selectedEleves.value.length
})

const getStatutClass = (statut) => {
  switch(statut) {
    case 'Nouveau': return 'bg-blue-100 text-blue-700'
    case 'Transfert': return 'bg-amber-100 text-amber-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const removeSelection = (eleveId) => {
  const eleve = nonAffectes.value.find(e => e.id === eleveId)
  if (eleve) {
    eleve.selected = false
  }
}

const assignerSelection = async () => {
  if (!classeDestination.value) {
    warning('Veuillez sélectionner une classe de destination')
    return
  }

  if (selectedEleves.value.length === 0) {
    warning('Veuillez sélectionner au moins un élève')
    return
  }

  try {
    // Update each student's class in the database
    for (const eleve of selectedEleves.value) {
      await api.updateUser(eleve._id, {
        classe: classeDestination.value._id
      })
    }

    success(`${selectedEleves.value.length} élève(s) affecté(s) à ${classeDestination.value.nom}`)
    
    // Refresh data to show updated assignments
    await fetchData()
  } catch (err) {
    console.error('Error assigning students:', err)
    error('Erreur lors de l\'affectation: ' + (err.response?.data?.error || err.message))
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (!classeDestination.value) {
    warning('Veuillez sélectionner une classe de destination')
    return
  }

  try {
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    // Validate columns
    if (jsonData.length === 0) {
      warning('Le fichier Excel est vide')
      return
    }

    const firstRow = jsonData[0]
    if (!firstRow.Matricule || !firstRow.Nom || !firstRow.Prenom) {
      warning('Le fichier doit contenir les colonnes: Matricule, Nom, Prénom')
      return
    }

    // Send to backend
    const response = await api.bulkCreateStudents({
      students: jsonData,
      classeId: classeDestination.value._id
    })

    if (response.data.success) {
      success(response.data.message)
      await fetchData() // Refresh data
      fileInput.value.value = '' // Reset file input
    }
  } catch (err) {
    console.error('Error importing students:', err)
    error('Erreur lors de l\'importation: ' + (err.response?.data?.error || err.message))
  }
}

const openConfirmModal = (title, message, actionText, action, type = 'danger', cancelText = 'Annuler') => {
  confirmModalTitle.value = title
  confirmModalMessage.value = message
  confirmModalActionText.value = actionText
  confirmModalCancelText.value = cancelText
  confirmModalType.value = type
  pendingAction.value = action
  showConfirmModal.value = true
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  pendingAction.value = null
}

const executeConfirmAction = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
  }
  closeConfirmModal()
}

const deleteStudent = (eleve) => {
  openConfirmModal(
    'Supprimer l\'élève',
    `Êtes-vous sûr de vouloir supprimer ${eleve.nom} ?`,
    'Supprimer',
    async () => {
      try {
        await api.deleteUser(eleve._id)
        success('Élève supprimé avec succès')
        await fetchData() // Refresh data
      } catch (err) {
        console.error('Error deleting student:', err)
        error('Erreur lors de la suppression: ' + (err.response?.data?.error || err.message))
      }
    }
  )
}

const finaliserRepartition = () => {
  success('Répartition finalisée')
}
</script>
