<template>
  <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="max-w-6xl mx-auto p-6">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined text-6xl text-primary animate-spin mb-4">sync</span>
        <p class="text-slate-500 dark:text-slate-400">Chargement du profil...</p>
      </div>

      <!-- Content -->
      <div v-else-if="student">
        <!-- Back Button -->
        <div v-if="showBackButton" class="mb-6">
          <button 
            @click="$router.go(-1)"
            class="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
          >
            <span class="material-symbols-outlined">arrow_back</span>
            <span>{{ backButtonText || 'Retour' }}</span>
          </button>
        </div>

        <!-- Student Header Profile -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm mb-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="flex gap-6 items-center">
              <div class="relative group">
                <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-32 border-4 border-slate-50 dark:border-slate-800 shadow-md overflow-hidden flex items-center justify-center bg-slate-200 dark:bg-slate-700" :style="studentAvatarUrl ? `background-image: url('${studentAvatarUrl}')` : ''">
                  <span v-if="!studentAvatarUrl" class="material-symbols-outlined text-5xl text-slate-400">person</span>
                  <img v-else :src="studentAvatarUrl" class="w-full h-full object-cover" @error="handleImageError"/>
                </div>
                <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
                <button @click="$refs.fileInput.click()" class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform cursor-pointer">
                  <span class="material-symbols-outlined text-sm">photo_camera</span>
                </button>
              </div>
              <div class="flex flex-col">
                <div class="flex items-center gap-3">
                  <h2 class="text-slate-900 dark:text-white text-2xl font-extrabold tracking-tight">{{ student.name }}</h2>
                  <span class="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{{ student.status || 'ACTIF' }}</span>
                </div>
                <p class="text-slate-500 dark:text-slate-400 text-base font-medium mt-1">{{ student.class }} | Matricule: {{ student.matricule }}</p>
                <p class="text-slate-500 dark:text-slate-400 text-sm">Né le {{ student.birthDate }} ({{ student.age }} ans)</p>
                <div class="flex items-center gap-4 mt-3">
                  <div class="flex items-center gap-1.5 text-sm text-slate-500">
                    <span class="material-symbols-outlined text-sm">call</span>
                    <span>{{ student.phone }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-sm text-slate-500">
                    <span class="material-symbols-outlined text-sm">mail</span>
                    <span>{{ student.email }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
              <button @click="exportProfile" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span class="material-symbols-outlined text-sm">download</span>
                Exporter
              </button>
              <button v-if="showContactButton" @click="contactParents" class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-colors">
                <span class="material-symbols-outlined text-sm">send</span>
                Contacter
              </button>
            </div>
          </div>
        </div>

        <!-- Profile Navigation -->
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          <div class="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/20">
            <button 
              @click="activeSection = 'infos'"
              class="flex items-center gap-2 border-b-[3px] px-4 py-4 text-sm font-medium tracking-wide transition-colors" 
              :class="activeSection === 'infos' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-primary'"
            >
              <span class="material-symbols-outlined text-sm">person</span>
              Informations Générales
            </button>
            <button 
              v-if="!['censeur', 'professeur'].includes(viewMode)"
              @click="activeSection = 'settings'"
              class="flex items-center gap-2 border-b-[3px] px-4 py-4 text-sm font-medium tracking-wide transition-colors" 
              :class="activeSection === 'settings' ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-primary'"
            >
              <span class="material-symbols-outlined text-sm">settings</span>
              Paramètres
            </button>
          </div>
        </div>

        <!-- Other Tabs Navigation -->
        <div v-if="visibleTabs.length > 0" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/50 dark:bg-slate-800/20">
            <button 
              v-for="tab in visibleTabs" 
              :key="tab.key"
              @click="activeTab = tab.key"
              class="flex items-center gap-2 border-b-[3px] px-4 py-4 text-sm font-medium tracking-wide transition-colors" 
              :class="activeTab === tab.key ? 'border-primary text-primary font-bold' : 'border-transparent text-slate-500 hover:text-primary'"
            >
              <span class="material-symbols-outlined text-sm">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </div>

          <!-- Profile Sections -->
          <div class="p-6">
            <!-- Info Section -->
            <StudentInfoTab 
              v-if="activeSection === 'infos'" 
              :student="student" 
              :can-edit="canEdit"
              :can-edit-academic="canEditAcademic"
              :is-saving="isSaving"
              @edit-info="startEditing"
              @save-info="saveStudentInfo"
            />

            <!-- Settings Section -->
            <StudentSettingsSection 
              v-if="activeSection === 'settings'" 
              :student="student"
            />
          </div>
        </div>

        <!-- Other Tabs Content -->
        <div v-if="visibleTabs.length > 0" class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-6">
            <!-- Discipline Tab -->
            <StudentDisciplineTab 
              v-if="activeTab === 'discipline'" 
              :student-id="props.studentId"
              :can-edit="canEditDiscipline"
            />

            <!-- Pedagogy Tab -->
            <StudentPedagogyTab 
              v-if="activeTab === 'pedagogy'" 
              :student-id="props.studentId"
            />

            <!-- Attendance Tab -->
            <StudentAttendanceTab 
              v-if="activeTab === 'attendance'" 
              :student-id="props.studentId"
            />

            <!-- Documents Tab -->
            <StudentDocumentsTab 
              v-if="activeTab === 'documents'" 
              :student-id="props.studentId"
              :can-edit="canEditDocuments"
            />

            <!-- Admin Tab -->
            <StudentAdminTab 
              v-if="activeTab === 'admin'" 
              :student-id="props.studentId"
              :can-edit="canEditAdmin"
            />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-red-600">error</span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Élève non trouvé</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              L'élève demandé n'existe pas ou a été supprimé.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Contact Modal -->
    <div v-if="showAddContactModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="showAddContactModal = false"></div>
      <div class="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <h2 class="text-slate-900 dark:text-white text-xl font-bold">Ajouter un Contact d'Urgence</h2>
          <button @click="showAddContactModal = false" class="text-slate-500 hover:text-red-500 transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <form @submit.prevent="addContact" class="p-6 overflow-y-auto max-h-[80vh]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-slate-900 dark:text-slate-300 text-sm font-semibold">Nom</label>
              <input v-model="newContact.lastName" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary" placeholder="ex: Dupont" type="text"/>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-slate-900 dark:text-slate-300 text-sm font-semibold">Prénom</label>
              <input v-model="newContact.firstName" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary" placeholder="ex: Marie" type="text"/>
            </div>
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-slate-900 dark:text-slate-300 text-sm font-semibold">Lien de parenté</label>
              <select v-model="newContact.relation" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary">
                <option value="">Sélectionner un lien</option>
                <option value="Père">Père</option>
                <option value="Mère">Mère</option>
                <option value="Tuteur">Tuteur/Tutrice</option>
                <option value="Grand-parent">Grand-parent</option>
                <option value="Oncle/Tante">Oncle/Tante</option>
                <option value="Frère/Sœur">Frère/Sœur majeur(e)</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="text-slate-900 dark:text-slate-300 text-sm font-semibold">Téléphone</label>
              <input v-model="newContact.phone" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary" placeholder="+221 77 000 00 00" type="tel"/>
            </div>
            <div class="flex flex-col gap-1.5 md:col-span-2">
              <label class="inline-flex items-center gap-2 cursor-pointer group">
                <input v-model="newContact.priority" class="rounded border-slate-200 text-primary focus:ring-primary size-4" type="checkbox"/>
                <span class="text-sm font-medium text-slate-900 dark:text-slate-300 group-hover:text-primary transition-colors">Contact prioritaire (en cas d'urgence immédiate)</span>
              </label>
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button @click="showAddContactModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Annuler
            </button>
            <button type="submit" class="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-colors">
              <span class="material-symbols-outlined text-lg">save</span>
              Enregistrer le contact
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/services/api'
import StudentInfoTab from './tabs/StudentInfoTab.vue'
import StudentDisciplineTab from './tabs/StudentDisciplineTab.vue'
import StudentPedagogyTab from './tabs/StudentPedagogyTab.vue'
import StudentAttendanceTab from './tabs/StudentAttendanceTab.vue'
import StudentDocumentsTab from './tabs/StudentDocumentsTab.vue'
import StudentAdminTab from './tabs/StudentAdminTab.vue'
import StudentSettingsSection from './StudentSettingsSection.vue'

// Props
const props = defineProps({
  studentId: {
    type: String,
    required: true
  },
  viewMode: {
    type: String,
    default: 'parent',
    validator: (value) => ['parent', 'admin', 'cpe', 'proviseur', 'eleve', 'censeur', 'professeur', 'secretaire'].includes(value)
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  showBackButton: {
    type: Boolean,
    default: true
  },
  backButtonText: {
    type: String,
    default: 'Retour'
  }
})

// Reactive data
const isLoading = ref(true)
const student = ref(null)
const activeTab = ref('infos')
const activeSection = ref('infos')
const showAddContactModal = ref(false)
const isSaving = ref(false)
const fileInput = ref(null)

// Emergency contacts
const emergencyContacts = ref([])
const newContact = ref({
  lastName: '',
  firstName: '',
  relation: '',
  phone: '',
  priority: false
})

// Computed properties based on viewMode
const canEditEmail = computed(() => ['parent', 'admin', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const canEditAcademic = computed(() => ['admin', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const canEditStatus = computed(() => ['admin', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const canEditDiscipline = computed(() => ['cpe', 'admin', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const canEditDocuments = computed(() => ['parent', 'admin', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const canEditAdmin = computed(() => ['admin', 'proviseur', 'secretaire'].includes(props.viewMode))
const canEditContacts = computed(() => ['parent', 'admin', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const showEmergencyContacts = computed(() => ['parent', 'admin', 'cpe', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))
const showContactButton = computed(() => ['admin', 'cpe', 'proviseur', 'censeur', 'secretaire'].includes(props.viewMode))

// Available tabs configuration
const allTabs = [
  { key: 'infos', label: 'Infos Générales', icon: 'person', roles: ['parent', 'admin', 'cpe', 'proviseur', 'eleve', 'censeur', 'professeur', 'secretaire'] },
  { key: 'discipline', label: 'Discipline', icon: 'gavel', roles: ['parent', 'admin', 'cpe', 'proviseur', 'censeur', 'secretaire'] },
  { key: 'pedagogy', label: 'Pédagogie', icon: 'grade', roles: ['parent', 'admin', 'cpe', 'proviseur', 'censeur', 'professeur', 'secretaire'] },
  { key: 'attendance', label: 'Assiduité', icon: 'event_available', roles: ['parent', 'admin', 'cpe', 'proviseur', 'censeur', 'secretaire'] },
  { key: 'documents', label: 'Documents', icon: 'folder_open', roles: ['parent', 'admin', 'proviseur', 'censeur', 'professeur', 'secretaire'] },
  { key: 'admin', label: 'Admin', icon: 'admin_panel_settings', roles: ['admin', 'proviseur', 'secretaire'] }
]

const visibleTabs = computed(() => {
  return allTabs.filter(tab => tab.roles.includes(props.viewMode))
})

const studentAvatarUrl = computed(() => {
  return getPhotoUrl(student.value?.avatar || student.value?.photo)
})

// Utility functions
const calculateAge = (birthDate) => {
  if (!birthDate) return 'N/A'
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// Methods
const fetchStudentProfile = async () => {
  if (!props.studentId || props.studentId === 'undefined') {
    isLoading.value = false
    return
  }
  try {
    isLoading.value = true
    
    let res;
    if (props.viewMode === 'eleve') {
      // Use student-specific route for own profile
      res = await api.getStudentProfile(props.studentId);
    } else if (props.viewMode === 'parent') {
      // Use parent-specific route for children
      res = await api.getChild(props.studentId);
    } else if (props.viewMode === 'censeur' || props.viewMode === 'professeur') {
      // Use generic student route for censeur and professeur
      res = await api.getStudentProfile(props.studentId);
    } else {
      // Use general user route for other roles
      res = await api.getUser(props.studentId);
    }
    
    const studentData = res.data.data
    
    student.value = {
      _id: studentData._id,
      name: `${studentData.prenom} ${studentData.nom}`,
      prenom: studentData.prenom,
      nom: studentData.nom,
      class: studentData.classe && typeof studentData.classe === 'object' && studentData.classe.niveau
        ? `${studentData.classe.niveau} ${studentData.classe.section}` 
        : (studentData.classe && typeof studentData.classe === 'string' ? 'ID: ' + studentData.classe : 'Non assignée'),
      filiere: studentData.classe && typeof studentData.classe === 'object' ? studentData.classe.filiere || 'Générale' : 'Non définie',
      matricule: studentData.matricule || 'Non défini',
      avatar: studentData.photo === 'no-photo.jpg' 
        ? `https://ui-avatars.com/api/?name=${studentData.prenom}+${studentData.nom}&background=random` 
        : `/uploads/${studentData.photo}`,
      birthDate: studentData.dateNaissance || 'Non renseignée',
      birthPlace: studentData.lieuNaissance || 'Non renseigné',
      address: studentData.adresse || 'Non renseignée',
      age: calculateAge(studentData.dateNaissance),
      phone: studentData.telephone || 'Non renseigné',
      email: studentData.email || 'Non renseigné',
      status: studentData.status || 'ACTIF',
      // Parental info
      fatherName: studentData.fatherName || '',
      fatherPhone: studentData.fatherPhone || '',
      fatherEmail: studentData.fatherEmail || '',
      motherName: studentData.motherName || '',
      motherPhone: studentData.motherPhone || '',
      motherEmail: studentData.motherEmail || '',
      legalGuardian: studentData.legalGuardian || '',
      guardianPhone: studentData.guardianPhone || '',
      // Medical info
      bloodGroup: studentData.bloodGroup || '',
      nativeLanguage: studentData.nativeLanguage || '',
      allergies: studentData.allergens || '',
      medications: studentData.medicaments || ''
    }
    
    // Load additional data
    await Promise.all([
      fetchEmergencyContacts()
    ])
    
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error)
    student.value = null
  } finally {
    isLoading.value = false
  }
}

const fetchEmergencyContacts = async () => {
  try {
    let res;
    if (props.viewMode === 'parent') {
      // Use parent route for parents
      res = await api.getChildEmergencyContacts(props.studentId);
    } else {
      // Use generic student route for all other roles (eleve, admin, proviseur, censeur, cpe, professeur)
      // This route is protected by selfAccess which allows these roles
      res = await api.getStudentEmergencyContacts(props.studentId);
    }
    
    emergencyContacts.value = res.data.data.map((contact, index) => ({
      id: contact._id,
      name: `${contact.prenom} ${contact.nom}`,
      relation: contact.relation || 'Non spécifiée',
      phone: contact.telephone,
      priority: contact.prioritaire || index === 0
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des contacts d\'urgence:', error)
    emergencyContacts.value = []
  }
}

const startEditing = () => {
  // This will be handled by the StudentInfoTab component
  console.log('Start editing student info')
}

const saveStudentInfo = async (formData) => {
  try {
    isSaving.value = true
    
    let res;
    if (props.viewMode === 'eleve') {
      // Use student-specific route for own profile update
      res = await api.updateStudentProfile(props.studentId, formData);
    } else if (props.viewMode === 'censeur' || props.viewMode === 'professeur') {
      // Use generic student route for censeur and professeur
      res = await api.updateStudentProfile(props.studentId, formData);
    } else {
      // Use general user route for other roles
      res = await api.updateUser(props.studentId, formData);
    }
    
    console.log('Save response:', res.data);
    
    if (res.data.success) {
      // Update student data with new values
      Object.assign(student.value, {
        prenom: formData.prenom,
        nom: formData.nom,
        phone: formData.telephone,
        birthDate: formData.dateNaissance,
        birthPlace: formData.lieuNaissance,
        address: formData.adresse,
        class: student.value.class, // Keep existing class string
        filiere: formData.filiere || student.value.filiere,
        name: `${formData.prenom} ${formData.nom}`,
        age: calculateAge(formData.dateNaissance),
        // Add parent data if available
        fatherName: formData.fatherName,
        fatherPhone: formData.fatherPhone,
        fatherEmail: formData.fatherEmail,
        motherName: formData.motherName,
        motherPhone: formData.motherPhone,
        motherEmail: formData.motherEmail,
        legalGuardian: formData.legalGuardian,
        guardianPhone: formData.guardianPhone,
        bloodGroup: formData.bloodGroup,
        nativeLanguage: formData.nativeLanguage,
        allergies: formData.allergens,
        medications: formData.medicaments
      })
      
      console.log('Student updated locally:', student.value);
      alert('Informations de l\'élève mises à jour avec succès')
    } else {
      console.error('Save failed:', res.data.error);
      alert('Erreur lors de la mise à jour: ' + (res.data.error || 'Erreur inconnue'))
    }
    
  } catch (error) {
    console.error('Erreur sauvegarde élève:', error)
    alert('Erreur lors de la mise à jour des informations de l\'élève')
  } finally {
    isSaving.value = false
  }
}

const addContact = async () => {
  try {
    const contactData = {
      enfant: props.studentId,
      nom: newContact.value.lastName,
      prenom: newContact.value.firstName,
      relation: newContact.value.relation,
      telephone: newContact.value.phone,
      prioritaire: newContact.value.priority
    }
    
    await api.addEmergencyContact(contactData)
    alert('Contact d\'urgence ajouté avec succès')
    
    // Reset form and reload
    newContact.value = {
      lastName: '',
      firstName: '',
      relation: '',
      phone: '',
      priority: false
    }
    showAddContactModal.value = false
    await fetchEmergencyContacts()
    
  } catch (error) {
    console.error('Erreur ajout contact:', error)
    alert('Erreur lors de l\'ajout du contact d\'urgence')
  }
}

const exportProfile = () => {
  console.log('Export du profil...')
  
  // Ask user for export format
  const exportFormat = confirm('Voulez-vous exporter en PDF ?\n\nOK = PDF\nAnnuler = JSON')
  
  if (exportFormat) {
    exportToPDF()
  } else {
    exportToJSON()
  }
}

const exportToJSON = () => {
  // Create profile data for export
  const profileData = {
    photo: student.value.photo || student.value.avatar || 'no-photo.jpg',
    name: student.value.name,
    firstName: student.value.prenom,
    lastName: student.value.nom,
    email: student.value.email,
    phone: student.value.telephone,
    class: student.value.class,
    matricule: student.value.matricule,
    birthDate: student.value.birthDate || student.value.dateNaissance,
    age: student.value.age,
    address: student.value.adresse,
    status: student.value.status || 'ACTIF',
    // Personal info
    birthPlace: student.value.lieuNaissance,
    // Academic info
    filiere: student.value.filiere,
    // Parent info
    fatherName: student.value.fatherName,
    fatherPhone: student.value.fatherPhone,
    fatherEmail: student.value.fatherEmail,
    motherName: student.value.motherName,
    motherPhone: student.value.motherPhone,
    motherEmail: student.value.motherEmail,
    legalGuardian: student.value.legalGuardian,
    guardianPhone: student.value.guardianPhone,
    // Medical info
    bloodGroup: student.value.bloodGroup,
    nativeLanguage: student.value.nativeLanguage,
    allergens: student.value.allergens,
    medications: student.value.medicaments,
    exportDate: new Date().toLocaleDateString('fr-FR')
  }
  
  // Create JSON string
  const dataStr = JSON.stringify(profileData, null, 2)
  
  // Create blob
  const blob = new Blob([dataStr], { type: 'application/json' })
  
  // Create download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `profil-${student.value.prenom}-${student.value.nom}-${new Date().toISOString().split('T')[0]}.json`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up
  URL.revokeObjectURL(url)
  
  alert('Profil exporté en JSON avec succès !')
}

const exportToPDF = async () => {
  try {
    isLoading.value = true
    
    const response = await api.exportStudentProfile(props.studentId)
    
    // Create a blob from the PDF data
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    const fileName = `fiche-eleve-${student.value.prenom}-${student.value.nom}.pdf`.replace(/\s+/g, '-').toLowerCase()
    
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    
    // Clean up
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    isLoading.value = false
    alert('Fiche élève exportée avec succès !')
    
  } catch (error) {
    console.error('Erreur export PDF:', error)
    alert('Erreur lors de l\'exportation de la fiche. Veuillez réessayer.')
  } finally {
    isLoading.value = false
  }
}

const contactParents = () => {
  console.log('Contacter les parents...')
  alert('Envoi de message aux parents en cours (mode démo)')
}

const handlePhotoUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Veuillez sélectionner une image valide')
    return
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('L\'image ne doit pas dépasser 5MB')
    return
  }
  
  try {
    const formData = new FormData()
    formData.append('photo', file)
    
    // Debug: Log FormData contents
    console.log('FormData contents:')
    for (let [key, value] of formData.entries()) {
      console.log(key, value)
    }
    console.log('FormData length:', formData.entries().length)
    
    const res = await api.uploadPhoto(formData)
    
    console.log('Upload response:', res)
    
    if (res.data.success) {
      // Update student photo immediately
      const photoUrl = res.data.data
      console.log('Photo URL received:', photoUrl)
      
      student.value.photo = photoUrl
      student.value.avatar = photoUrl
      
      console.log('Student updated:', {
        photo: student.value.photo,
        avatar: student.value.avatar
      })
      
      alert('Photo de profil mise à jour avec succès')
    }
  } catch (error) {
    console.error('Erreur upload photo:', error)
    alert('Erreur lors du téléchargement de la photo')
  }
  
  // Reset file input
  event.target.value = ''
}

// Helper functions
const getPhotoUrl = (photoPath) => {
  if (!photoPath || photoPath === 'no-photo.jpg' || photoPath.includes('undefined')) {
    return null
  }
  
  // If it's already a full URL or data URI, return as is
  if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
    return photoPath
  }
  
  // If it starts with /uploads, add the backend base URL
  if (photoPath.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000'
    return `${baseUrl}${photoPath}`
  }
  
  // Otherwise, assume it's a relative path in uploads
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api/v1', '') : 'http://localhost:5000'
  return `${baseUrl}/uploads/${photoPath}`
}

const handleImageError = (event) => {
  console.log('Image failed to load:', event.target.src)
  // Optionally set a fallback image
  event.target.style.display = 'none'
}

// Watch for studentId changes
watch(() => props.studentId, () => {
  if (props.studentId) {
    fetchStudentProfile()
  }
}, { immediate: true })

// Load data on mount
onMounted(() => {
  if (props.studentId) {
    fetchStudentProfile()
  }
})
</script>
