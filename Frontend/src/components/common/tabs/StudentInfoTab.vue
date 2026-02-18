<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">person</span>
        Informations Générales
        <button v-if="canEdit" @click="toggleEditMode" class="ml-auto px-3 py-1 text-sm bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors">
          <span class="material-symbols-outlined text-sm">{{ isEditing ? 'close' : 'edit' }}</span>
          {{ isEditing ? 'Annuler' : 'Modifier' }}
        </button>
      </h3>
    </div>
    
    <div class="p-6">
      <!-- Display Mode -->
      <div v-if="!isEditing" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Personnelles</h4>
            
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Nom complet</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.name }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Date de naissance</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.birthDate }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Lieu de naissance</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.birthPlace }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Âge</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.age }} ans</span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Contact</h4>
            
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Email</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.email }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Téléphone</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.phone }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Adresse</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.address }}</span>
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Académiques</h4>
            
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Classe</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.class }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Filière</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.filiere }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Matricule</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.matricule }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Parental Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Parentales</h4>
            
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Nom du Père</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.fatherName || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Téléphone du Père</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.fatherPhone || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Email du Père</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.fatherEmail || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Nom de la Mère</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.motherName || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Téléphone de la Mère</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.motherPhone || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Email de la Mère</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.motherEmail || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Tuteur/Légale</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.legalGuardian || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Téléphone Tuteur</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.guardianPhone || 'Non renseigné' }}</span>
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Médicales</h4>
            
            <div class="space-y-2">
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Groupe Sanguin</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.bloodGroup || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Langue Maternelle</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.nativeLanguage || 'Non renseigné' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Allergies</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.allergies || 'Aucune' }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span class="text-sm text-slate-500 dark:text-slate-400">Médicaments</span>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ student.medications || 'Aucun' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-6">
          <!-- Personal Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Personnelles</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Prénom</label>
                <input 
                  v-model="editForm.prenom"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom</label>
                <input 
                  v-model="editForm.nom"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Date de Naissance</label>
                <input 
                  v-model="editForm.dateNaissance"
                  type="date" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lieu de Naissance</label>
                <input 
                  v-model="editForm.lieuNaissance"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Contact</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email</label>
                <input 
                  v-model="editForm.email"
                  type="email" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving || !canEditEmail"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Téléphone</label>
                <input 
                  v-model="editForm.telephone"
                  type="tel" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Adresse</label>
                <textarea 
                  v-model="editForm.adresse"
                  rows="3"
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Academic Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Académiques</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Classe</label>
                <input 
                  v-model="editForm.class"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving || !canEditAcademic"
                  readonly
                />
                <p v-if="!canEditAcademic" class="text-xs text-amber-600 mt-1">Les informations académiques ne sont modifiables que par l'administration</p>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Filière</label>
                <input 
                  v-model="editForm.filiere"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving || !canEditAcademic"
                  readonly
                />
                <p v-if="!canEditAcademic" class="text-xs text-amber-600 mt-1">Les informations académiques ne sont modifiables que par l'administration</p>
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Matricule</label>
                <input 
                  v-model="editForm.matricule"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving || !canEditAcademic"
                  readonly
                />
                <p v-if="!canEditAcademic" class="text-xs text-amber-600 mt-1">Les informations académiques ne sont modifiables que par l'administration</p>
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Médicales</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Groupe Sanguin</label>
                <input 
                  v-model="editForm.bloodGroup"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Langue Maternelle</label>
                <input 
                  v-model="editForm.nativeLanguage"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Allergies</label>
                <input 
                  v-model="editForm.allergens"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Médicaments</label>
                <input 
                  v-model="editForm.medicaments"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>

          <!-- Parental Information -->
          <div class="space-y-3">
            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Informations Parentales</h4>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom du Père</label>
                <input 
                  v-model="editForm.fatherName"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Téléphone du Père</label>
                <input 
                  v-model="editForm.fatherPhone"
                  type="tel" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email du Père</label>
                <input 
                  v-model="editForm.fatherEmail"
                  type="email" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nom de la Mère</label>
                <input 
                  v-model="editForm.motherName"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Téléphone de la Mère</label>
                <input 
                  v-model="editForm.motherPhone"
                  type="tel" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email de la Mère</label>
                <input 
                  v-model="editForm.motherEmail"
                  type="email" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tuteur/Légale</label>
                <input 
                  v-model="editForm.legalGuardian"
                  type="text" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Téléphone Tuteur</label>
                <input 
                  v-model="editForm.guardianPhone"
                  type="tel" 
                  class="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary dark:bg-slate-800 dark:text-white"
                  :disabled="isSaving"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="isEditing" class="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
        <button @click="cancelEdit" :disabled="isSaving" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          Annuler
        </button>
        <button @click="saveInfo" :disabled="isSaving" class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-colors disabled:opacity-50">
          <span class="material-symbols-outlined text-sm" v-if="!isSaving">save</span>
          <span class="material-symbols-outlined text-sm animate-spin" v-else>sync</span>
          {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  student: {
    type: Object,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canEditEmail: {
    type: Boolean,
    default: true
  },
  canEditAcademic: {
    type: Boolean,
    default: false
  },
  isSaving: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['edit-info', 'save-info'])

// Reactive data
const isEditing = ref(false)
const isSaving = ref(false)
const editForm = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  dateNaissance: '',
  lieuNaissance: '',
  adresse: '',
  class: '',
  filiere: '',
  matricule: '',
  fatherName: '',
  fatherPhone: '',
  fatherEmail: '',
  motherName: '',
  motherPhone: '',
  motherEmail: '',
  legalGuardian: '',
  guardianPhone: '',
  bloodGroup: '',
  nativeLanguage: '',
  allergens: '',
  medicaments: ''
})

// Methods
const toggleEditMode = () => {
  if (isEditing.value) {
    cancelEdit()
    return
  }
  
  isEditing.value = true
  // Initialize edit form with current student data
  editForm.value = {
    prenom: props.student.prenom || '',
    nom: props.student.nom || '',
    email: props.student.email || '',
    telephone: props.student.phone || '',
    dateNaissance: props.student.birthDate || '',
    lieuNaissance: props.student.birthPlace || '',
    adresse: props.student.address || '',
    class: props.student.class || '',
    filiere: props.student.filiere || '',
    matricule: props.student.matricule || '',
    fatherName: props.student.fatherName || '',
    fatherPhone: props.student.fatherPhone || '',
    fatherEmail: props.student.fatherEmail || '',
    motherName: props.student.motherName || '',
    motherPhone: props.student.motherPhone || '',
    motherEmail: props.student.motherEmail || '',
    legalGuardian: props.student.legalGuardian || '',
    guardianPhone: props.student.guardianPhone || '',
    bloodGroup: props.student.bloodGroup || '',
    nativeLanguage: props.student.nativeLanguage || '',
    allergens: props.student.allergies || '',
    medicaments: props.student.medications || ''
  }
  emit('edit-info')
}

const cancelEdit = () => {
  isEditing.value = false
  // Reset edit form
  editForm.value = {
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    lieuNaissance: '',
    adresse: '',
    class: '',
    filiere: '',
    matricule: '',
    fatherName: '',
    fatherPhone: '',
    fatherEmail: '',
    motherName: '',
    motherPhone: '',
    motherEmail: '',
    legalGuardian: '',
    guardianPhone: '',
    bloodGroup: '',
    nativeLanguage: '',
    allergens: '',
    medicaments: ''
  }
}

const saveInfo = async () => {
  try {
    isSaving.value = true
    
    const formData = {
      prenom: editForm.value.prenom,
      nom: editForm.value.nom,
      email: editForm.value.email,
      telephone: editForm.value.telephone,
      dateNaissance: editForm.value.dateNaissance,
      lieuNaissance: editForm.value.lieuNaissance,
      adresse: editForm.value.adresse,
      class: editForm.value.class,
      filiere: editForm.value.filiere,
      matricule: editForm.value.matricule,
      fatherName: editForm.value.fatherName,
      fatherPhone: editForm.value.fatherPhone,
      fatherEmail: editForm.value.fatherEmail,
      motherName: editForm.value.motherName,
      motherPhone: editForm.value.motherPhone,
      motherEmail: editForm.value.motherEmail,
      legalGuardian: editForm.value.legalGuardian,
      guardianPhone: editForm.value.guardianPhone,
      bloodGroup: editForm.value.bloodGroup,
      nativeLanguage: editForm.value.nativeLanguage,
      allergens: editForm.value.allergens,
      medicaments: editForm.value.medicaments
    }
    
    emit('save-info', formData)
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
  }
}

// Watch for student changes to reset edit form
watch(() => props.student, () => {
  if (props.student && !isEditing.value) {
    // Update edit form when student data changes
    editForm.value = {
      prenom: props.student.prenom || '',
      nom: props.student.nom || '',
      email: props.student.email || '',
      telephone: props.student.phone || '',
      dateNaissance: props.student.birthDate || '',
      lieuNaissance: props.student.birthPlace || '',
      adresse: props.student.address || '',
      class: props.student.class || '',
      filiere: props.student.filiere || '',
      matricule: props.student.matricule || '',
      fatherName: props.student.fatherName || '',
      fatherPhone: props.student.fatherPhone || '',
      fatherEmail: props.student.fatherEmail || '',
      motherName: props.student.motherName || '',
      motherPhone: props.student.motherPhone || '',
      motherEmail: props.student.motherEmail || '',
      legalGuardian: props.student.legalGuardian || '',
      guardianPhone: props.student.guardianPhone || '',
      bloodGroup: props.student.bloodGroup || '',
      nativeLanguage: props.student.nativeLanguage || '',
      allergens: props.student.allergies || '',
      medicaments: props.student.medications || ''
    }
  }
}, { immediate: true })

// Close editing mode only after successful save
watch(() => props.isSaving, (newVale, oldVal) => {
  if (oldVal === true && newVale === false && isEditing.value) {
    isEditing.value = false
  }
})
</script>
