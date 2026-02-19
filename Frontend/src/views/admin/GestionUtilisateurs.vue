<template>
  <div class="h-screen flex flex-col bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden">
    <!-- Header Area -->
    <header class="shrink-0 px-8 py-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
       <div class="max-w-[1600px] mx-auto flex flex-col gap-4">
          <div class="flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ pageTitle }}</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    {{ displayedUsers.length }} utilisateur{{ displayedUsers.length > 1 ? 's' : '' }} trouvé{{ displayedUsers.length > 1 ? 's' : '' }}
                </p>
              </div>
              
              <div class="flex items-center gap-4">
                 <!-- Role Filter (Only for Administration) -->
                 <div v-if="currentType === 'administration'" class="w-48">
                    <select v-model="selectedRoleFilter" class="block w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20">
                        <option value="">Tous les rôles</option>
                        <option value="ADMIN">Administrateur</option>
                        <option value="PROVISEUR">Proviseur</option>
                        <option value="CENSEUR">Censeur</option>
                        <option value="CPE">CPE</option>
                        <option value="SECRETAIRE">Secrétaire</option>
                        <option value="PROFESSEUR">Professeur</option>
                    </select>
                 </div>
                 <!-- Class Filter (Only for Students) -->
                 <div v-if="currentType === 'eleves'" class="w-48">
                    <select v-model="selectedClassFilter" class="block w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20">
                        <option value="">Toutes les classes</option>
                        <option v-for="cls in availableClasses" :key="cls._id" :value="cls._id">
                            {{ cls.niveau }} {{ cls.section }}
                        </option>
                    </select>
                 </div>

                 <!-- Search -->
                 <div class="relative w-64">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <span class="material-symbols-outlined text-[18px]">search</span>
                    </span>
                    <input v-model="searchQuery" class="block w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20" placeholder="Rechercher..." type="text"/>
                </div>

                <router-link :to="getAddUserLink" class="btn-organic flex items-center justify-center gap-2 px-5 h-10 bg-primary text-white rounded-lg font-bold shadow-md shadow-primary/20 hover:bg-primary/90 text-sm">
                  <span class="material-symbols-outlined text-[18px]">person_add</span>
                  <span>Ajouter</span>
                </router-link>
              </div>
          </div>
       </div>
    </header>

    <!-- Main Content List -->
    <main class="flex-1 overflow-hidden p-6">
      <div class="max-w-[1600px] mx-auto h-full flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            
            <!-- Table Header -->
            <div v-if="currentType === 'eleves'" class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
                 <div class="col-span-1">Matricule</div>
                 <div class="col-span-3">Nom et Prénoms</div>
                 <div class="col-span-2">Né(e) le / à</div>
                 <div class="col-span-1 text-center">Sexe</div>
                 <div class="col-span-1 text-center">Redoublant</div>
                 <div class="col-span-1 text-center">Classe</div>
                 <div class="col-span-1 text-center">Statut</div>
                 <div class="col-span-2 text-right">Actions</div>
            </div>
            <div v-else class="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div class="col-span-4">Utilisateur</div>
                <div class="col-span-3">Rôle</div>
                <div class="col-span-3">Contact</div>
                <div class="col-span-2 text-right">Actions</div>
            </div>

            <!-- Scrollable List -->
                    <div class="flex-1 overflow-y-auto custom-scrollbar">
                <div v-if="isLoading" class="p-8 text-center text-slate-500">Chargement...</div>
                
                <div v-else-if="paginatedUsers.length === 0" class="flex flex-col items-center justify-center h-full p-8 text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2 text-slate-300">search_off</span>
                    <p>Aucun utilisateur trouvé</p>
                </div>

                <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">

                    <div 
                      v-for="(user, index) in paginatedUsers" 
                      :key="user._id" 
                      class="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group animate-slide-up"
                      :style="{ animationDelay: `${Math.min(index, 15) * 50}ms` }"
                    >
                        
                        <!-- Student Rows -->
                         <template v-if="currentType === 'eleves'">
                            <div class="col-span-1 text-xs font-medium text-slate-900 dark:text-white truncate" :title="user.matricule">{{ user.matricule }}</div>
                            <div class="col-span-3 flex items-center gap-3">
                                <div :class="['size-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0', getAvatarColor(user.role)]">
                                    {{ getInitials(user.nom, user.prenom) }}
                                </div>
                                <div class="min-w-0">
                                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate" :title="user.prenom + ' ' + user.nom">{{ user.prenom }} {{ user.nom }}</p>
                                    <p v-if="user.email" class="text-xs text-slate-500 truncate">{{ user.email }}</p>
                                </div>
                            </div>
                            <div class="col-span-2 flex flex-col">
                                <span class="text-sm text-slate-900 dark:text-white">{{ formatDate(user.dateNaissance) }}</span>
                                <span class="text-xs text-slate-500">{{ user.lieuNaissance || '-' }}</span>
                            </div>
                            <div class="col-span-1 text-center">
                                <span v-if="user.sexe === 'M'" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">M</span>
                                <span v-else-if="user.sexe === 'F'" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 text-xs font-bold">F</span>
                                <span v-else class="text-slate-400 text-xs">-</span>
                            </div>
                            <div class="col-span-1 text-center">
                                 <span v-if="user.isRedoublant" class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">Oui</span>
                                 <span v-else class="text-slate-400 text-xs">Non</span>
                            </div>
                             <div class="col-span-1 text-center">
                                <span v-if="user.classe" class="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    {{ user.classe.niveau }} {{ user.classe.section }}
                                </span>
                                <span v-else class="text-xs text-slate-400 italic">-</span>
                             </div>
                             <div class="col-span-1 text-center">
                                  <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide', getStatusBadgeClass(user.statutEleve || user.status)]">
                                    {{ user.statutEleve || user.status || 'ACTIF' }}
                                </span>
                             </div>
                         </template>

                        <!-- Standard Rows (Admin/Parents/Others) -->
                        <template v-else>
                            <div class="col-span-4 flex items-center gap-3">
                                <div :class="['size-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0', getAvatarColor(user.role)]">
                                    {{ getInitials(user.nom, user.prenom) }}
                                </div>
                                <div class="min-w-0">
                                    <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ user.prenom }} {{ user.nom }}</p>
                                    <p class="text-xs text-slate-500 truncate">{{ user.email }}</p>
                                    <p v-if="user.matricule" class="text-xs text-primary font-medium">Matricule: {{ user.matricule }}</p>
                                </div>
                            </div>
                            <!-- Role & Context -->
                            <div class="col-span-3">
                                 <div class="flex flex-col items-start gap-1">
                                    <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide', getRoleBadgeClass(user.role)]">
                                        {{ user.role }}
                                    </span>
                                 </div>
                            </div>
                            <!-- Contact -->
                            <div class="col-span-3 text-sm text-slate-600 dark:text-slate-400 flex flex-col">
                                <span v-if="user.telephone" class="flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-[14px] text-slate-400">call</span>
                                    {{ user.telephone }}
                                </span>
                                <span v-else class="text-slate-400 italic text-xs">Non renseigné</span>
                            </div>
                        </template>

                        <!-- Actions (Common) -->
                        <div class="col-span-2 flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <router-link v-if="user.role === 'ELEVE'" :to="`/admin/eleves/${user._id}`" class="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:shadow" title="Voir la fiche">
                                <span class="material-symbols-outlined text-[18px]">visibility</span>
                            </router-link>
                            <button @click="openEditModal(user)" class="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:shadow" title="Modifier">
                                <span class="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button @click="toggleUserStatus(user)" class="p-2 text-slate-400 hover:text-amber-600 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:shadow" :title="user.status === 'ACTIF' ? 'Désactiver' : 'Activer'">
                                <span class="material-symbols-outlined text-[18px]">{{ user.status === 'ACTIF' ? 'block' : 'check_circle' }}</span>
                            </button>
                            <button @click="deleteUser(user._id)" class="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-sm hover:shadow" title="Supprimer">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Simple Pagination Footer if needed -->
            <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-xs text-slate-500">
                <span>Affichage de {{ displayedUsers.length }} résultats</span>
            </div>
      </div>
    </main>

  <!-- Edit User Modal -->
  <Transition name="scale">
  <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-slate-900 w-full max-w-[640px] rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-[#0e141b] dark:text-white">Modifier l'utilisateur</h2>
          <p class="text-[#4e7397] dark:text-slate-400 text-sm mt-1">Mettre à jour les informations de {{ editForm.prenom }} {{ editForm.nom }}</p>
        </div>
        <button @click="closeEditModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <!-- Modal Content -->
      <div class="flex-1 overflow-y-auto p-6">
        <form @submit.prevent="handleUpdate" class="space-y-6">
          <div v-if="editErrorMessage" class="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ editErrorMessage }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Prénom</label>
              <input v-model="editForm.prenom" required class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base" type="text"/>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Nom</label>
              <input v-model="editForm.nom" required class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base" type="text"/>
            </div>
            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Email</label>
              <input v-model="editForm.email" required class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base" type="email"/>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Téléphone</label>
              <input v-model="editForm.telephone" class="form-input rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4 text-base" type="text"/>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Rôle</label>
              <select v-model="editForm.role" required class="form-select rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4">
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
            <div v-if="editForm.role === 'ELEVE'" class="flex flex-col gap-2 md:col-span-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Classe</label>
              <select v-model="editForm.classe" class="form-select rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4">
                <option value="">Sélectionner une classe...</option>
                <option v-for="c in availableClasses" :key="c._id" :value="c._id">
                  {{ c.niveau }} {{ c.section }}
                </option>
              </select>
            </div>
            <div class="flex flex-col gap-2 md:col-span-2">
              <label class="text-sm font-medium text-[#0e141b] dark:text-slate-200">Statut</label>
              <select v-model="editForm.status" required class="form-select rounded-lg border-[#d0dbe7] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#0e141b] dark:text-white focus:border-primary focus:ring-primary h-12 px-4">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="BLOQUE">Bloqué</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      
      <!-- Modal Footer -->
      <div class="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end gap-3">
        <button @click="closeEditModal" class="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          Annuler
        </button>
        <button @click="handleUpdate" :disabled="isUpdating" class="px-6 py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50">
          <span class="material-symbols-outlined text-sm">save</span>
          {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
      </div>
    </div>
  </div>
  </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router' // Ensure router is available if needed
import api from '@/services/api'

// Define Props
const props = defineProps(['type'])

const users = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const selectedClassFilter = ref('')
const selectedRoleFilter = ref('')

// Computed: Determine Current Type from Prop
const currentType = computed(() => {
    return props.type || 'administration' // Default
})

// Computed: Page Title
const pageTitle = computed(() => {
    switch(currentType.value) {
        case 'parents': return 'Gestion des Parents'
        case 'eleves': return 'Gestion des Élèves'
        default: return 'Membres de l\'Administration'
    }
})

// Computed: Add User Link
const getAddUserLink = computed(() => {
    switch(currentType.value) {
        case 'parents': return '/admin/ajouter-utilisateur?role=PARENT'
        case 'eleves': return '/admin/ajouter-utilisateur?role=ELEVE'
        default: return '/admin/ajouter-utilisateur?role=ADMIN'
    }
})

// Computed: Filtered Users
const filteredUsers = computed(() => {
  let filtered = Array.isArray(users.value) ? users.value : []
  
  // 1. Filter by Type
  if (currentType.value === 'parents') {
      filtered = filtered.filter(u => u.role === 'PARENT')
  } else if (currentType.value === 'eleves') {
      filtered = filtered.filter(u => u.role === 'ELEVE')
  } else {
      // Administration (All except parents/students)
      filtered = filtered.filter(u => u.role !== 'PARENT' && u.role !== 'ELEVE')
      
      // Role Filter (Only for Administration)
      if (selectedRoleFilter.value) {
          filtered = filtered.filter(u => u.role === selectedRoleFilter.value)
      }
  }

  // 2. Filter by Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => 
      u?.nom?.toLowerCase().includes(query) ||
      u?.prenom?.toLowerCase().includes(query) ||
      u?.email?.toLowerCase().includes(query) ||
      u?.matricule?.toLowerCase().includes(query)
    )
  }

  // 3. Filter by Class (Students only)
  if (currentType.value === 'eleves' && selectedClassFilter.value) {
      filtered = filtered.filter(u => u.classe?._id === selectedClassFilter.value || u.classe === selectedClassFilter.value)
  }
  
  return filtered
})

// Use filteredUsers directly for display (virtually scrollable list handles large data better than pages)
const displayedUsers = computed(() => filteredUsers.value)

// For compatibility with template loop (can be renamed in template)
const paginatedUsers = computed(() => displayedUsers.value)


// --- Logic for Edit Modal ---
const showEditModal = ref(false)
const editForm = ref({
  _id: '',
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  role: '',
  status: '',
  classe: ''
})
const availableClasses = ref([])
const isUpdating = ref(false)
const editErrorMessage = ref('')

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const response = await api.getUsers()
    users.value = Array.isArray(response.data.data) ? response.data.data : []
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error)
  } finally {
    isLoading.value = false
  }
}

const fetchClasses = async () => {
  try {
    const response = await api.getClasses()
    availableClasses.value = Array.isArray(response.data.data) ? response.data.data : []
  } catch (error) {
    console.error('Erreur chargement classes:', error)
  }
}

const getRoleBadgeClass = (role) => {
  const classes = {
    'PROFESSEUR': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'ELEVE': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    'PARENT': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'ADMIN': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'CENSEUR': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    'CPE': 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    'PROVISEUR': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    'SECRETAIRE': 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
  }
  return classes[role] || 'bg-slate-100 text-slate-800'
}

const getAvatarColor = (role) => {
     switch(role) {
         case 'ELEVE': return 'bg-purple-100 text-purple-700'
         case 'PARENT': return 'bg-green-100 text-green-700'
         default: return 'bg-blue-100 text-blue-700'
     }
}

const getInitials = (nom, prenom) => {
  return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusBadgeClass = (status) => {
  const map = {
    'ACTIF': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'AFFECTE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', 
    'INACTIF': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'NON AFFECTE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'EN_ATTENTE': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'BLOQUE': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
  }
  return map[status?.toUpperCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
}

const openEditModal = (user) => {
  editForm.value = {
    _id: user._id,
    prenom: user.prenom,
    nom: user.nom,
    email: user.email,
    telephone: user.telephone || '',
    role: user.role,
    status: user.status,
    classe: user.classe?._id || user.classe || ''
  }
  editErrorMessage.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    _id: '',
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    role: '',
    status: '',
    classe: ''
  }
  
  editErrorMessage.value = ''
}

const handleUpdate = async () => {
  editErrorMessage.value = ''
  isUpdating.value = true
  
  try {
    const updateData = {
      prenom: editForm.value.prenom,
      nom: editForm.value.nom,
      email: editForm.value.email,
      telephone: editForm.value.telephone,
      role: editForm.value.role,
      status: editForm.value.status,
      classe: editForm.value.role === 'ELEVE' ? editForm.value.classe : undefined
    }
    
    await api.updateUser(editForm.value._id, updateData)
    await fetchUsers()
    closeEditModal()
  } catch (error) {
    console.error('Erreur mise à jour:', error)
    editErrorMessage.value = error.response?.data?.error || 'Erreur lors de la mise à jour de l\'utilisateur'
  } finally {
    isUpdating.value = false
  }
}

const toggleUserStatus = async (user) => {
  const newStatus = user.status === 'ACTIF' ? 'INACTIF' : 'ACTIF'
  const action = newStatus === 'ACTIF' ? 'activer' : 'désactiver'
  
  if (confirm(`Êtes-vous sûr de vouloir ${action} cet utilisateur ?`)) {
    try {
      await api.updateUser(user._id, { status: newStatus })
      await fetchUsers()
    } catch (error) {
      console.error('Erreur changement statut:', error)
      alert('Erreur lors du changement de statut')
    }
  }
}

const deleteUser = async (userId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
    try {
      await api.deleteUser(userId)
      await fetchUsers()
    } catch (error) {
      console.error('Erreur suppression:', error)
      alert('Erreur lors de la suppression de l\'utilisateur')
    }
  }
}

onMounted(() => {
  fetchUsers()
  fetchClasses()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 6px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #334155;
}
</style>
