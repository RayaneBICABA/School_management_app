<template>
  <!-- Modal Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <!-- Modal Container -->
    <div class="bg-white dark:bg-slate-900 w-full max-w-[640px] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-[#0e141b] dark:text-white">Ajouter un Utilisateur</h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-sm mt-1">Créez un nouveau profil pour votre établissement scolaire</p>
        </div>
        <router-link to="/admin/utilisateurs" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </router-link>
      </div>
      <!-- Tabs Navigation (Only for ELEVE) -->
      <div v-if="form.role === 'ELEVE'" class="flex border-b border-slate-100 dark:border-slate-800">
        <button @click="activeTab = 'manual'" :class="['flex-1 py-4 text-sm font-bold transition-all border-b-2', activeTab === 'manual' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50']">
          Saisie Manuelle
        </button>
        <button @click="activeTab = 'import'" :class="['flex-1 py-4 text-sm font-bold transition-all border-b-2', activeTab === 'import' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50']">
          Importation Excel/CSV
        </button>
      </div>

      <!-- Modal Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Manual Form -->
        <form v-if="activeTab === 'manual'" @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Error Message -->
          <div v-if="errorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ errorMessage }}</p>
          </div>
          <!-- Section: Personal Info -->
          <section>
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">person</span>
              Informations personnelles
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Prénom</label>
                <input v-model="form.prenom" required class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base transition-all" placeholder="Ex: Jean" type="text"/>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Nom</label>
                <input v-model="form.nom" required class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base transition-all" placeholder="Ex: Dupont" type="text"/>
              </div>
              <div class="flex flex-col gap-2 md:col-span-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Adresse Email</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-xl">mail</span>
                  <input v-model="form.email" required class="form-input w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 pl-11 pr-4 text-base transition-all" placeholder="jean.dupont@ecole.fr" type="email"/>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Section: Password & Matricule (Optional) -->
          <section>
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">lock</span>
              Mot de passe & Matricule (Optionnel)
            </h3>
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg mb-4">
              <p class="text-sm text-blue-700 dark:text-blue-300">
                <span class="font-bold">💡 Astuce :</span> Si vous laissez le mot de passe vide, il sera généré automatiquement à partir du matricule ou de l'email.
              </p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Matricule (optionnel)</label>
                <input v-model="form.matricule" class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base transition-all" placeholder="Ex: 2024-001" type="text"/>
                <p class="text-xs text-slate-500 dark:text-slate-400">Utilisé comme mot de passe par défaut si fourni</p>
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Mot de passe personnalisé (optionnel)</label>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-xl">lock</span>
                  <input v-model="form.password" class="form-input w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 pl-11 pr-4 text-base transition-all" placeholder="Laisser vide pour génération auto" type="password"/>
                </div>
                <p class="text-xs text-slate-500 dark:text-slate-400">Minimum 6 caractères si renseigné</p>
              </div>
            </div>
          </section>
          
          <!-- Section: Role Selection -->
          <section>
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">badge</span>
              Rôle & Permissions
            </h3>
            <div class="grid grid-cols-1 gap-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Sélectionner un rôle</label>
                <select v-model="form.role" required class="form-select rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all">
                  <option disabled value="">Choisir un rôle...</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="PROFESSEUR">Professeur</option>
                  <option value="ELEVE">Élève</option>
                  <option value="PARENT">Parent</option>
                  <option value="CENSEUR">Censeur</option>
                  <option value="CPE">CPE</option>
                  <option value="PROVISEUR">Proviseur</option>
                  <option value="SECRETAIRE">Secrétaire</option>
                </select>
              </div>
            </div>
          </section>
          
          <!-- Section: Contextual Attribution (Only for PROFESSEUR or ELEVE) -->
          <section v-if="showAttribution || form.role === 'ELEVE'" class="p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
            <h3 class="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-sm">assignment_turned_in</span>
              Affectation
            </h3>
            
            <!-- For Professor -->
            <div v-if="form.role === 'PROFESSEUR'" class="space-y-4">
              <p class="text-sm text-[#4e7397] dark:text-slate-400 italic">Affectez des classes et matières à ce professeur.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Classes & Matières Disponibles</label>
                  <div class="flex gap-2">
                    <select v-model="selectedAssignmentId" class="form-select flex-1 rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all">
                      <option value="">Sélectionner une affectation...</option>
                      <option v-for="cm in availableAssignments" :key="cm._id" :value="cm._id">
                        {{ cm.classe?.niveau }} {{ cm.classe?.section }} - {{ cm.matiere?.nom }}
                      </option>
                    </select>
                    <button @click.prevent="addAssignment" type="button" class="px-4 h-12 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all flex items-center gap-1">
                      <span class="material-symbols-outlined text-base">add</span> Ajouter
                    </button>
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Affectations choisies</label>
                  <div class="flex flex-wrap gap-2 min-h-[48px] p-3 bg-white dark:bg-slate-800 border border-dashed border-[#d0dbe7] dark:border-slate-700 rounded-lg">
                    <div v-for="assignment in assignedCourses" :key="assignment._id" class="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
                      {{ assignment.classe?.niveau }} {{ assignment.classe?.section }} - {{ assignment.matiere?.nom }}
                      <button @click="removeAssignment(assignment._id)" type="button" class="ml-2 hover:text-red-500 transition-colors">
                        <span class="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                    <p v-if="assignedCourses.length === 0" class="text-xs text-slate-400 italic">Aucune affectation choisie</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- For Student -->
            <div v-if="form.role === 'ELEVE'" class="space-y-4">
              <p class="text-sm text-[#4e7397] dark:text-slate-400 italic">Sélectionnez la classe de l'élève.</p>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Classe</label>
                <select v-model="form.classe" class="form-select w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all">
                  <option value="">Sélectionner une classe...</option>
                  <option v-for="c in availableClasses" :key="c._id" :value="c._id">
                    {{ c.niveau }} {{ c.section }}
                  </option>
                </select>
              </div>
            </div>
          </section>
        </form>

        <!-- Import Form -->
        <div v-else class="space-y-6">
          <section>
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">upload_file</span>
              Importation par lot
            </h3>
            
            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6">
              <p class="text-sm text-amber-700 dark:text-amber-300">
                <span class="font-bold">📋 Instructions :</span> Votre fichier doit contenir les colonnes suivantes : <span class="font-bold">Nom, Prenom, Email</span> (et optionnellement Telephone).
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Classe de destination</label>
                <select v-model="importForm.classe" class="form-select w-full rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all">
                  <option value="">Sélectionner une classe...</option>
                  <option v-for="c in availableClasses" :key="c._id" :value="c._id">
                    {{ c.niveau }} {{ c.section }}
                  </option>
                </select>
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Fichier (Excel ou CSV)</label>
                <div 
                  @dragover.prevent="isDragging = true" 
                  @dragleave.prevent="isDragging = false" 
                  @drop.prevent="handleFileDrop"
                  :class="['relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer', isDragging ? 'border-primary bg-primary/5' : 'border-[#d0dbe7] dark:border-slate-700 hover:border-primary/50']"
                  @click="$refs.fileInput.click()"
                >
                  <input type="file" ref="fileInput" class="hidden" accept=".xlsx,.xls,.csv" @change="handleFileSelect" />
                  <span class="material-symbols-outlined text-4xl text-slate-400 mb-2">cloud_upload</span>
                  <p v-if="!importForm.file" class="text-sm text-[#4e7397] dark:text-slate-400 font-medium">Glissez-déposez un fichier ou cliquez pour parcourir</p>
                  <div v-else class="flex flex-col items-center">
                    <p class="text-sm font-bold text-primary">{{ importForm.file.name }}</p>
                    <p class="text-xs text-slate-500">{{ (importForm.file.size / 1024).toFixed(1) }} KB</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div v-if="importResults" class="mt-6 p-4 rounded-xl border" :class="importResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'">
            <p class="font-bold text-sm" :class="importResults.success ? 'text-green-800' : 'text-red-800'">
              {{ importResults.message }}
            </p>
            <ul v-if="importResults.errors && importResults.errors.length > 0" class="mt-2 space-y-1">
              <li v-for="(err, idx) in importResults.errors" :key="idx" class="text-xs text-red-600 list-disc list-inside">
                {{ err }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
        <router-link to="/admin/utilisateurs" class="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Annuler
        </router-link>
        
        <!-- Submit manual -->
        <button v-if="activeTab === 'manual'" @click="handleSubmit" :disabled="isLoading" class="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-sm">person_add</span>
          {{ isLoading ? 'Création...' : "Créer l'utilisateur" }}
        </button>

        <!-- Submit import -->
        <button v-else @click="handleImport" :disabled="isLoading || !importForm.file || !importForm.classe" class="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-symbols-outlined text-sm">publish</span>
          {{ isLoading ? 'Importation...' : "Lancer l'importation" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

const form = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  matricule: '',
  password: '', // Laisser vide pour génération automatique
  role: '',
  classe: ''
})

const activeTab = ref('manual')
const importForm = ref({
  file: null,
  classe: ''
})
const isDragging = ref(false)
const importResults = ref(null)

const availableClasses = ref([])

const classes = ref([])
const matieres = ref([])
const selectedClasses = ref([])
const selectedMatieres = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// Show Attribution Initial section only for PROFESSEUR
const showAttribution = computed(() => {
  return form.value.role === 'PROFESSEUR'
})

const availableAssignments = ref([])
const assignedCourses = ref([])
const selectedAssignmentId = ref('')

const fetchData = async () => {
  try {
    const assignmentsRes = await api.getAllGlobalClasseMatieres()
    availableAssignments.value = Array.isArray(assignmentsRes.data.data) ? assignmentsRes.data.data : []
    
    const classesRes = await api.getClasses()
    availableClasses.value = Array.isArray(classesRes.data.data) ? classesRes.data.data : []
  } catch (error) {
    console.error('Erreur chargement données:', error)
  }
}

const addAssignment = () => {
  if (!selectedAssignmentId.value) return
  
  const assignment = availableAssignments.value.find(a => a._id === selectedAssignmentId.value)
  if (assignment && !assignedCourses.value.find(a => a._id === assignment._id)) {
    assignedCourses.value.push(assignment)
  }
  selectedAssignmentId.value = ''
}

const removeAssignment = (id) => {
  assignedCourses.value = assignedCourses.value.filter(a => a._id !== id)
}

const handleFileSelect = (e) => {
  const file = e.target.files[0]
  if (file) importForm.value.file = file
}

const handleFileDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) importForm.value.file = file
}

const handleImport = async () => {
  if (!importForm.value.file || !importForm.value.classe) return

  isLoading.value = true
  importResults.value = null
  
  try {
    const formData = new FormData()
    formData.append('file', importForm.value.file)
    formData.append('classeId', importForm.value.classe)
    
    const res = await api.importStudents(formData)
    
    importResults.value = {
      success: true,
      message: res.data.message,
      errors: res.data.errors
    }
    
    // Si tout est ok (ou presque), on pourrait rediriger après un délai
    if (!res.data.errors) {
       setTimeout(() => {
          router.back()
       }, 2000)
    }
  } catch (error) {
    console.error('Erreur import:', error)
    importResults.value = {
      success: false,
      message: error.response?.data?.error || 'Erreur lors de l\'importation'
    }
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  
  // Validation
  if (!form.value.prenom || !form.value.nom || !form.value.email || !form.value.role) {
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }

  isLoading.value = true
  try {
    const userData = {
      prenom: form.value.prenom,
      nom: form.value.nom,
      email: form.value.email,
      telephone: form.value.telephone || '',
      matricule: form.value.matricule || '',
      password: form.value.password, // Si vide, le backend générera un mot de passe
      role: form.value.role,
      classe: form.value.role === 'ELEVE' ? form.value.classe : undefined
    }

    const response = await api.createUser(userData)
    const newUser = response.data.data

    // If role is teacher, update assignments
    if (form.value.role === 'PROFESSEUR' && assignedCourses.value.length > 0) {
      await Promise.all(assignedCourses.value.map(assignment => {
        const classeId = assignment.classe?._id || assignment.classe
        return api.updateClasseMatiere(classeId, assignment._id, { professeur: newUser._id })
      }))
    }
    
    // Afficher le mot de passe généré si présent
    if (response.data.generatedPassword) {
      alert(`✅ Utilisateur créé avec succès !\n\n🔑 Mot de passe généré : ${response.data.generatedPassword}\n\n⚠️ IMPORTANT : Notez ce mot de passe et communiquez-le à l'utilisateur. Il devra le changer à la première connexion.`)
    } else {
      alert('✅ Utilisateur créé avec succès !')
    }
    
    // Redirect back to users list based on role
    router.back()
  } catch (error) {
    console.error('Erreur création utilisateur:', error)
    errorMessage.value = error.response?.data?.error || 'Erreur lors de la création de l\'utilisateur'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
  
  // Check for role in query params
  if (route.query.role) {
      const allowedRoles = ['ADMIN', 'PROFESSEUR', 'ELEVE', 'PARENT', 'CENSEUR', 'CPE', 'PROVISEUR', 'SECRETAIRE']
      if (allowedRoles.includes(route.query.role)) {
          form.value.role = route.query.role
          if (route.query.role === 'ELEVE') {
              activeTab.value = 'manual'
          }
      }
  }
  
  // Si on est déjà un élève, on peut forcer l'onglet manual (ou import si specifié)
  if (form.value.role === 'ELEVE' && route.query.tab === 'import') {
      activeTab.value = 'import'
  }
})
</script>
