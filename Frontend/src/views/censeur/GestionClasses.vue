<template>
  <div class="gestion-classes-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Classes et Filières</span>
      </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Filières et Classes</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Gérez les départements académiques et leurs classes respectives.</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher une classe, salle..."
            class="pl-10 pr-4 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary w-64 transition-all"
          />
        </div>
        <button class="flex items-center gap-2 rounded-lg h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
          <span class="material-symbols-outlined text-lg">download</span>
          Exporter
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Filières List -->
      <div class="lg:col-span-2 flex flex-col gap-8">
        <!-- Section: Filière Générale -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                <span class="material-symbols-outlined">menu_book</span>
              </div>
              <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Filière: Générale</h2>
            </div>
            <button 
              @click="openAddClassModal('Générale')"
              class="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <span class="material-symbols-outlined text-lg">add_circle</span>
              Ajouter une classe
            </button>
          </div>
          <div class="p-0 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-[#4e7397] font-medium uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Classe</th>
                  <th class="px-6 py-3">Niveau</th>
                  <th class="px-6 py-3">Effectif</th>
                  <th class="px-6 py-3">Salle</th>
                  <th class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr 
                  v-for="classe in filteredGenerale" 
                  :key="classe.id"
                  @click="voirEleves(classe)"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td class="px-6 py-4 font-semibold text-[#0e141b] dark:text-white">{{ classe.nom }}</td>
                  <td class="px-6 py-4 text-[#0e141b] dark:text-slate-300">{{ classe.niveau }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span 
                        :class="[
                          'w-2 h-2 rounded-full',
                          getEffectifColor(classe.effectif, classe.capaciteMax)
                        ]"
                      ></span>
                      {{ classe.effectif }}/{{ classe.capaciteMax }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-[#0e141b] dark:text-slate-300">{{ classe.salle }}</td>
                  <td class="px-6 py-4 text-right" @click.stop>
                    <!-- Censeur peut seulement voir, pas modifier -->
                    <button 
                      @click="voirEleves(classe)"
                      class="p-1 hover:text-primary transition-colors"
                      title="Voir les élèves"
                    >
                      <span class="material-symbols-outlined text-lg">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Section: Filière Technique -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                <span class="material-symbols-outlined">precision_manufacturing</span>
              </div>
              <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Filière: Technique</h2>
            </div>
            <button 
              @click="openAddClassModal('Technique')"
              class="text-primary text-sm font-bold flex items-center gap-1 hover:underline"
            >
              <span class="material-symbols-outlined text-lg">add_circle</span>
              Ajouter une classe
            </button>
          </div>
          <div class="p-0 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-[#4e7397] font-medium uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Classe</th>
                  <th class="px-6 py-3">Spécialité</th>
                  <th class="px-6 py-3">Effectif</th>
                  <th class="px-6 py-3">Salle</th>
                  <th class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr 
                  v-for="classe in filteredTechnique" 
                  :key="classe.id"
                  @click="voirEleves(classe)"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                >
                  <td class="px-6 py-4 font-semibold text-[#0e141b] dark:text-white">{{ classe.nom }}</td>
                  <td class="px-6 py-4 text-[#0e141b] dark:text-slate-300">{{ classe.specialite }}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span 
                        :class="[
                          'w-2 h-2 rounded-full',
                          getEffectifColor(classe.effectif, classe.capaciteMax)
                        ]"
                      ></span>
                      {{ classe.effectif }}/{{ classe.capaciteMax }}
                    </div>
                  </td>
                  <td class="px-6 py-4 text-[#0e141b] dark:text-slate-300">{{ classe.salle }}</td>
                  <td class="px-6 py-4 text-right" @click.stop>
                    <!-- Censeur peut seulement voir, pas modifier -->
                    <button 
                      @click="voirEleves(classe)"
                      class="p-1 hover:text-primary transition-colors"
                      title="Voir les élèves"
                    >
                      <span class="material-symbols-outlined text-lg">visibility</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Add/Edit Class Form Card -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">
              {{ editingClass ? 'Modifier la Classe' : 'Ajouter une Classe' }}
            </h3>
            <p class="text-sm text-[#4e7397] dark:text-slate-400">
              {{ editingClass ? 'Modifiez les informations de la classe.' : 'Créez une nouvelle classe dans une filière existante.' }}
            </p>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Nom de la classe</label>
              <input 
                v-model="form.nom"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="ex: 2nde C" 
                type="text"
                required
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Filière</label>
              <select 
                v-model="form.filiere"
                @change="onFiliereChange"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white"
                required
              >
                <option value="">Sélectionner une filière</option>
                <option value="Generale">Générale</option>
                <option value="Technique">Technique</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">
                {{ form.filiere === 'Technique' ? 'Spécialité' : 'Niveau d\'étude' }}
              </label>
              <select 
                v-if="form.filiere === 'Technique'"
                v-model="form.specialite"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white"
                required
              >
                <option value="">Sélectionner une spécialité</option>
                <option value="Ingénierie">Ingénierie</option>
                <option value="Gestion">Gestion</option>
                <option value="Commerce">Commerce</option>
              </select>
              <select 
                v-else
                v-model="form.niveau"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white"
                required
              >
                <option value="">Sélectionner un niveau</option>
                <option value="Seconde">Seconde</option>
                <option value="Première">Première</option>
                <option value="Terminale">Terminale</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Capacité Max</label>
                <input 
                  v-model.number="form.capaciteMax"
                  class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                  placeholder="35" 
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Salle</label>
                <input 
                  v-model="form.salle"
                  class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                  placeholder="ex: B-102" 
                  type="text"
                  required
                />
              </div>
            </div>

            <!-- Course Management Section -->
            <div v-if="editingClass" class="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-bold text-[#0e141b] dark:text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">school</span>
                  Matières de la classe
                </h3>
                <button 
                  type="button"
                  @click="showAddCourseModal = true"
                  class="text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                >
                  <span class="material-symbols-outlined text-sm">add_circle</span>
                  Ajouter une matière
                </button>
              </div>

              <div v-if="classCourses.length === 0" class="text-center py-4 text-sm text-slate-500">
                Aucune matière assignée à cette classe
              </div>

              <div v-else class="space-y-2">
                <div 
                  v-for="course in classCourses" 
                  :key="course._id"
                  class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div class="flex-1">
                    <p class="font-semibold text-sm text-[#0e141b] dark:text-white">{{ course.matiere?.nom }}</p>
                    <p class="text-xs text-slate-500">Coefficient: {{ course.coefficient }}</p>
                  </div>
                  <button 
                    type="button"
                    @click="removeCourse(course._id)"
                    class="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <span class="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <button 
                type="submit"
                class="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all"
              >
                {{ editingClass ? 'Modifier la classe' : 'Enregistrer la classe' }}
              </button>
              <button 
                type="button"
                @click="resetForm"
                class="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Add Course Modal -->
  <div v-if="showAddCourseModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-2xl">
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-xl font-bold text-[#0e141b] dark:text-white">Ajouter une matière</h3>
        <button @click="closeAddCourseModal" class="text-slate-400 hover:text-slate-600 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <form @submit.prevent="addCourseToClass" class="p-6 space-y-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Matière</label>
            <button 
              type="button" 
              @click="courseForm.isNew = !courseForm.isNew" 
              class="text-xs text-primary font-bold hover:underline"
            >
              {{ courseForm.isNew ? 'Choisir existante' : '+ Créer nouvelle' }}
            </button>
          </div>
          
          <input 
            v-if="courseForm.isNew"
            v-model="courseForm.newNom"
            type="text"
            required
            class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3"
            placeholder="Nom de la nouvelle matière"
          />
          <select 
            v-else
            v-model="courseForm.matiereId"
            required
            class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3"
          >
            <option value="">Sélectionner une matière</option>
            <option v-for="matiere in matieresDisponibles" :key="matiere._id" :value="matiere._id">
              {{ matiere.nom }}
            </option>
          </select>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Coefficient</label>
          <input 
            v-model.number="courseForm.coefficient"
            type="number"
            step="0.5"
            min="0.5"
            max="10"
            required
            class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3"
            placeholder="Ex: 2"
          />
        </div>

        <div class="flex gap-3 mt-6">
          <button 
            type="button"
            @click="closeAddCourseModal"
            class="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            class="flex-1 bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import api from '@/services/api'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// Déclarer les props
const props = defineProps({
  showModal: {
    type: Boolean,
    default: false
  }
})

// Déclarer les emits
const emit = defineEmits(['closeModal'])

// Données des filières et classes
const filieres = reactive({
  Generale: [],
  Technique: []
})

const isLoading = ref(false)
const searchQuery = ref(route.query.q || '')

// Mettre à jour l'URL quand la recherche change
watch(searchQuery, (newQuery) => {
  router.replace({
    query: { ...route.query, q: newQuery || undefined }
  })
})

const filteredGenerale = computed(() => {
  if (!searchQuery.value) return filieres.Generale;
  const q = searchQuery.value.toLowerCase();
  return filieres.Generale.filter(c => 
    c.nom.toLowerCase().includes(q) || 
    c.niveau.toLowerCase().includes(q) ||
    c.salle.toLowerCase().includes(q)
  );
});

const filteredTechnique = computed(() => {
  if (!searchQuery.value) return filieres.Technique;
  const q = searchQuery.value.toLowerCase();
  return filieres.Technique.filter(c => 
    c.nom.toLowerCase().includes(q) || 
    (c.specialite && c.specialite.toLowerCase().includes(q)) ||
    c.salle.toLowerCase().includes(q)
  );
});


// Formulaire
const form = reactive({
  nom: '',
  filiere: '',
  niveau: '',
  specialite: '',
  capaciteMax: 35,
  salle: ''
})

const editingClass = ref(null)

// Course management
const showAddCourseModal = ref(false)
const classCourses = ref([])
const availableMatieres = ref([])
const courseForm = reactive({
  matiereId: '',
  coefficient: 1,
  isNew: false,
  newNom: ''
})

const matieresDisponibles = computed(() => {
  if (!availableMatieres.value) return []
  return availableMatieres.value.filter(m => 
    !classCourses.value.find(cc => cc?.matiere?._id === m?._id)
  )
})

// Charger les classes
const fetchClasses = async () => {
  isLoading.value = true
  try {
    const response = await api.getClasses()
    const classes = Array.isArray(response.data.data) ? response.data.data : []
    
    // Reset lists
    filieres.Generale = []
    filieres.Technique = []

    classes.forEach(cls => {
      // Map API fields to UI fields if necessary
      const uiClass = {
        id: cls._id,
        nom: cls.section, // Backend uses 'section' for name/nom (e.g. 6ème A)
        niveau: cls.niveau,
        salle: cls.salle || 'N/A',
        capaciteMax: cls.capacite,
        effectif: 0, // Mock for now or fetch students count if available
        specialite: cls.serie // Mapping serie to specialite for Technical
      }
      
      if (cls.serie === 'Général') {
         filieres.Generale.push(uiClass)
      } else {
         filieres.Technique.push(uiClass)
      }
    })

  } catch (error) {
    console.error('Erreur chargement classes:', error)
  } finally {
    isLoading.value = false
  }
}

// Redundant onMounted removed (merged with the one at the bottom)

// Fonctions
const getEffectifColor = (effectif, capaciteMax) => {
  const percentage = (effectif / capaciteMax) * 100
  if (percentage >= 100) return 'bg-orange-500'
  if (percentage >= 80) return 'bg-yellow-500'
  return 'bg-green-500'
}

const openAddClassModal = (filiere) => {
  resetForm()
  form.filiere = filiere === 'Générale' ? 'Generale' : filiere
}

const onFiliereChange = () => {
  form.niveau = ''
  form.specialite = ''
}

const editClass = async (classe) => {
  editingClass.value = classe
  form.nom = classe.nom
  form.filiere = filieres.Generale.find(c => c.id === classe.id) ? 'Generale' : 'Technique'
  form.niveau = classe.niveau || ''
  form.specialite = classe.specialite || ''
  form.capaciteMax = classe.capaciteMax
  form.salle = classe.salle
  
  // Load courses for this class
  await fetchClasseCourses(classe.id)
}

const deleteClass = async (id, filiere) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
    try {
      await api.deleteClasse(id)
      
      // Map filiere name to object key (handle accent)
      const filiereKey = filiere === 'Générale' ? 'Generale' : filiere
      
      const index = filieres[filiereKey].findIndex(c => c.id === id)
      if (index > -1) {
        filieres[filiereKey].splice(index, 1)
      }
    } catch (error) {
       console.error('Erreur suppression:', error)
       alert('Erreur lors de la suppression de la classe')
    }
  }
}

const resetForm = () => {
  editingClass.value = null
  form.nom = ''
  form.filiere = ''
  form.niveau = ''
  form.specialite = ''
  form.capaciteMax = 35
  form.salle = ''
}

const handleSubmit = async () => {
  try {
    // Map frontend niveau to backend enum
    const niveauMap = {
      'Seconde': '2nde',
      'Première': '1ère',
      'Terminale': 'Terminale'
    }
    
    const payload = {
      section: form.nom,
      niveau: form.filiere === 'Technique' ? 'Terminale' : niveauMap[form.niveau] || form.niveau,
      filiere: form.filiere === 'Generale' ? 'Générale' : 'Technique',
      serie: form.filiere === 'Generale' ? 'Général' : form.specialite,
      capacite: form.capaciteMax,
      salle: form.salle,
      anneeScolaire: '2023-2024'
    }

    if (editingClass.value) {
      await api.updateClasse(editingClass.value.id, payload)
    } else {
      await api.createClasse(payload)
    }
    
    await fetchClasses()
    resetForm()
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    alert('Erreur lors de la sauvegarde de la classe')
  }
}

// Course management functions
const fetchClasseCourses = async (classeId) => {
  try {
    const response = await api.getClasseMatieres(classeId)
    classCourses.value = Array.isArray(response.data.data) ? response.data.data : []
  } catch (error) {
    console.error('Erreur chargement cours:', error)
  }
}

const fetchMatieres = async () => {
  try {
    const response = await api.getMatieres()
    availableMatieres.value = Array.isArray(response.data.data) ? response.data.data : []
  } catch (error) {
    console.error('Erreur chargement matières:', error)
  }
}

const closeAddCourseModal = () => {
  showAddCourseModal.value = false
  courseForm.matiereId = ''
  courseForm.coefficient = 1
  courseForm.isNew = false
  courseForm.newNom = ''
}

const addCourseToClass = async () => {
  if (!editingClass.value) return
  if (!courseForm.isNew && !courseForm.matiereId) {
    alert('Veuillez sélectionner une matière')
    return
  }
  if (courseForm.isNew && !courseForm.newNom) {
    alert('Veuillez saisir le nom de la matière')
    return
  }
  
  try {
    let matiereId = courseForm.matiereId

    // 1. Create subject if new
    if (courseForm.isNew) {
      const res = await api.createMatiere({
        nom: courseForm.newNom,
        code: courseForm.newNom.substring(0, 3).toUpperCase(),
        coefficient: courseForm.coefficient
      })
      matiereId = res.data.data._id
      // Refresh global list
      await fetchMatieres()
    }

    // 2. Add to class
    await api.addMatiereToClasse(editingClass.value.id, {
      matiereId: matiereId,
      coefficient: courseForm.coefficient
    })
    
    await fetchClasseCourses(editingClass.value.id)
    closeAddCourseModal()
  } catch (error) {
    console.error('Erreur ajout matière:', error)
    alert(error.response?.data?.error || 'Erreur lors de l\'ajout de la matière')
  }
}

const removeCourse = async (courseId) => {
  if (!editingClass.value) return
  
  if (confirm('Êtes-vous sûr de vouloir retirer cette matière de la classe ?')) {
    try {
      await api.removeMatiereFromClasse(editingClass.value.id, courseId)
      await fetchClasseCourses(editingClass.value.id)
    } catch (error) {
      console.error('Erreur suppression matière:', error)
      alert('Erreur lors de la suppression de la matière')
    }
  }
}

// Fonction pour voir les élèves d'une classe
const voirEleves = (classe) => {
  // Rediriger vers la liste des élèves de la classe
  router.push(`/censeur/classes/${classe.id}/eleves`)
}

onMounted(() => {
  fetchClasses()
  fetchMatieres()
})
</script>
