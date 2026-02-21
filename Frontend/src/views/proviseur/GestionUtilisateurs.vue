<template>
  <div class="space-y-8">
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-sm">
      <router-link to="/proviseur" class="text-[#4e7397] hover:text-primary font-medium">Proviseur</router-link>
      <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
      <span class="font-medium">Gestion des Utilisateurs</span>
    </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Gestion des Utilisateurs</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Gérez les censeurs et professeurs de l'établissement.</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher (Nom, Email, Tel)..."
            class="pl-10 pr-4 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary w-64 transition-all shadow-sm"
          />
        </div>
        <button 
          @click="openCreateModal"
          class="flex items-center gap-2 rounded-lg h-10 px-4 bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <span class="material-symbols-outlined text-lg">add</span>
          Nouveau
        </button>
      </div>
    </div>

    <!-- Role Tabs -->
    <div class="border-b border-slate-200 dark:border-slate-800">
      <div class="flex gap-6">
        <button 
          @click="activeRole = 'PROFESSEUR'"
          :class="activeRole === 'PROFESSEUR' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-white'"
          class="flex items-center gap-2 border-b-2 pb-3 transition-colors"
        >
          <span class="material-symbols-outlined text-lg">person</span>
          <span class="font-bold text-sm">Professeurs ({{ professeurs.length }})</span>
        </button>
        <button 
          @click="activeRole = 'CENSEUR'"
          :class="activeRole === 'CENSEUR' ? 'border-primary text-primary' : 'border-transparent text-slate-600 hover:text-slate-900 dark:hover:text-white'"
          class="flex items-center gap-2 border-b-2 pb-3 transition-colors"
        >
          <span class="material-symbols-outlined text-lg">admin_panel_settings</span>
          <span class="font-bold text-sm">Censeurs ({{ censeurs.length }})</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Users List -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">
              {{ activeRole === 'PROFESSEUR' ? 'Liste des Professeurs' : 'Liste des Censeurs' }}
            </h2>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="p-12 text-center">
            <p class="text-slate-500">Chargement...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="currentUsers.length === 0" class="p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">person_off</span>
            <p class="text-slate-500">Aucun {{ activeRole === 'PROFESSEUR' ? 'professeur' : 'censeur' }} trouvé</p>
          </div>

          <!-- Users Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-[#4e7397] font-medium uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Utilisateur</th>
                  <th class="px-6 py-3">Contact</th>
                  <th v-if="activeRole === 'PROFESSEUR'" class="px-6 py-3">Classe Principale</th>
                  <th class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr 
                  v-for="user in currentUsers" 
                  :key="user._id"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="font-semibold text-[#0e141b] dark:text-white">{{ user.nom }} {{ user.prenom }}</div>
                    <div class="text-xs text-slate-500">ID: {{ user._id.substring(0, 8) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-[#0e141b] dark:text-slate-300">{{ user.email }}</div>
                    <div class="text-xs text-slate-500">{{ user.telephone || 'N/A' }}</div>
                  </td>
                  <td v-if="activeRole === 'PROFESSEUR'" class="px-6 py-4">
                    <span v-if="user.classePrincipale" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {{ user.classePrincipale }}
                    </span>
                    <span v-else class="text-slate-400 text-xs">Aucune</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button 
                      @click="editUser(user)"
                      class="p-1 hover:text-primary transition-colors"
                      title="Modifier"
                    >
                      <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      @click="deleteUser(user)"
                      class="p-1 hover:text-red-500 transition-colors ml-2"
                      title="Supprimer"
                    >
                      <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Right Column: Create/Edit Form -->
      <div class="lg:col-span-1">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm sticky top-24">
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">
              {{ editingUser ? 'Modifier l\'Utilisateur' : 'Nouvel Utilisateur' }}
            </h3>
            <p class="text-sm text-[#4e7397] dark:text-slate-400">
              {{ editingUser ? 'Modifiez les informations de l\'utilisateur.' : 'Créez un nouveau compte.' }}
            </p>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Rôle *</label>
              <select 
                v-model="form.role"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white"
                required
              >
                <option value="PROFESSEUR">Professeur</option>
                <option value="CENSEUR">Censeur</option>
              </select>
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Prénom *</label>
              <input 
                v-model="form.prenom"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="ex: Jean" 
                type="text"
                required
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Nom *</label>
              <input 
                v-model="form.nom"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="ex: Dupont" 
                type="text"
                required
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Email *</label>
              <input 
                v-model="form.email"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="ex: jean.dupont@ecole.com" 
                type="email"
                required
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Téléphone</label>
              <input 
                v-model="form.telephone"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="ex: 0123456789" 
                type="tel"
              />
            </div>
            <div v-if="!editingUser" class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Mot de passe *</label>
              <input 
                v-model="form.password"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="Minimum 6 caractères" 
                type="password"
                :required="!editingUser"
                minlength="6"
              />
            </div>
            <div v-if="form.role === 'PROFESSEUR'" class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Classe Principale</label>
              <select 
                v-model="form.classePrincipale"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white"
              >
                <option value="">Aucune</option>
                <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                  {{ classe.niveau }} {{ classe.section }}
                </option>
              </select>
            </div>

            <div class="mt-4 flex flex-col gap-2">
              <button 
                type="submit"
                :disabled="isSaving"
                class="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {{ isSaving ? 'Enregistrement...' : (editingUser ? 'Modifier' : 'Créer l\'utilisateur') }}
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
    <!-- Confirmation Modal -->
    <ConfirmationModal
      :is-open="showDeleteModal"
      title="Supprimer l'utilisateur"
      :message="`Êtes-vous sûr de vouloir supprimer ${userToDelete?.nom} ${userToDelete?.prenom} ? Cette action est irréversible.`"
      confirm-text="Supprimer"
      cancel-text="Annuler"
      type="danger"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'
import ConfirmationModal from '@/components/modals/ConfirmationModal.vue'

const { success, error } = useToast()

const professeurs = ref([])
const censeurs = ref([])
const classes = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const editingUser = ref(null)
const activeRole = ref('PROFESSEUR')
const searchQuery = ref('')

// Delete Modal State
const showDeleteModal = ref(false)
const userToDelete = ref(null)

const form = reactive({
  role: 'PROFESSEUR',
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  password: '',
  classePrincipale: ''
})

const currentUsers = computed(() => {
  const users = activeRole.value === 'PROFESSEUR' ? professeurs.value : censeurs.value
  if (!searchQuery.value) return users
  const q = searchQuery.value.toLowerCase()
  return users.filter(u => 
    u.nom.toLowerCase().includes(q) || 
    u.prenom.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    (u.telephone && u.telephone.toLowerCase().includes(q))
  )
})

const fetchUsers = async () => {
  isLoading.value = true
  try {
    // Fetch professors
    const profRes = await api.getUsers({ role: 'PROFESSEUR' })
    const profs = Array.isArray(profRes.data.data) ? profRes.data.data : []
    
    // For each professor, find their main class
    professeurs.value = await Promise.all(profs.map(async (prof) => {
      try {
        const classesRes = await api.getClasses()
        const allClasses = Array.isArray(classesRes.data.data) ? classesRes.data.data : []
        const mainClass = allClasses.find(c => c.professeurPrincipal?._id === prof._id || c.professeurPrincipal === prof._id)
        
        return {
          ...prof,
          classePrincipale: mainClass ? `${mainClass.niveau} ${mainClass.section}` : null
        }
      } catch (err) {
        return { ...prof, classePrincipale: null }
      }
    }))

    // Fetch censeurs
    const censeurRes = await api.getUsers({ role: 'CENSEUR' })
    censeurs.value = Array.isArray(censeurRes.data.data) ? censeurRes.data.data : []
  } catch (err) {
    console.error('Erreur chargement utilisateurs:', err)
    error('Erreur lors du chargement des utilisateurs')
    professeurs.value = []
    censeurs.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchClasses = async () => {
  try {
    const res = await api.getClasses()
    classes.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (err) {
    console.error('Erreur chargement classes:', err)
  }
}

const openCreateModal = () => {
  resetForm()
}

const editUser = (user) => {
  editingUser.value = user
  form.role = user.role
  form.prenom = user.prenom
  form.nom = user.nom
  form.email = user.email
  form.telephone = user.telephone || ''
  
  // Find the class ID if professor has a main class
  if (user.role === 'PROFESSEUR') {
    const mainClass = classes.value.find(c => 
      c.professeurPrincipal?._id === user._id || c.professeurPrincipal === user._id
    )
    form.classePrincipale = mainClass?._id || ''
  }
}

const deleteUser = (user) => {
  // Instead of confirm(), open the modal
  userToDelete.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

const confirmDelete = async () => {
  if (!userToDelete.value) return
  
  try {
    await api.deleteUser(userToDelete.value._id) // Changed from _id to user object passed in deleteUser
    await fetchUsers()
    success('Utilisateur supprimé avec succès')
    closeDeleteModal()
  } catch (err) {
    console.error('Erreur suppression:', err)
    error('Erreur lors de la suppression de l\'utilisateur')
  }
}

const resetForm = () => {
  editingUser.value = null
  form.role = 'PROFESSEUR'
  form.prenom = ''
  form.nom = ''
  form.email = ''
  form.telephone = ''
  form.password = ''
  form.classePrincipale = ''
}

const handleSubmit = async () => {
  isSaving.value = true
  try {
    const payload = {
      prenom: form.prenom,
      nom: form.nom,
      email: form.email,
      telephone: form.telephone,
      role: form.role
    }

    if (!editingUser.value) {
      payload.password = form.password
    }

    let userId
    if (editingUser.value) {
      await api.updateUser(editingUser.value._id, payload)
      userId = editingUser.value._id
    } else {
      const res = await api.createUser(payload)
      userId = res.data.data._id
    }

    // Update class if a main class was selected for professor
    if (form.role === 'PROFESSEUR') {
      if (form.classePrincipale) {
        await api.updateClasse(form.classePrincipale, {
          professeurPrincipal: userId
        })
      } else if (editingUser.value) {
        // Remove as principal from previous class if any
        const previousClass = classes.value.find(c => 
          c.professeurPrincipal?._id === userId || c.professeurPrincipal === userId
        )
        if (previousClass) {
          await api.updateClasse(previousClass._id, {
            professeurPrincipal: null
          })
        }
      }
    }

    await fetchUsers()
    await fetchClasses()
    resetForm()
    success(editingUser.value ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès')
  } catch (err) {
    console.error('Erreur sauvegarde:', err)
    // Error is handled by global interceptor now, but we keep this as fallback or additional log
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchClasses()
})
</script>
