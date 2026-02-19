<template>
  <div class="gestion-professeurs-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Gestion des Professeurs</span>
      </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Gestion des Professeurs</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Créez, modifiez et gérez les professeurs de l'établissement.</p>
      </div>
      <div class="flex items-center gap-4">
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Rechercher un professeur..."
            class="pl-10 pr-4 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary w-64 transition-all"
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

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Teachers List -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Liste des Professeurs</h2>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="p-12 text-center">
            <p class="text-slate-500">Chargement...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="professeurs.length === 0" class="p-12 text-center">
            <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4 block">person_off</span>
            <p class="text-slate-500">Aucun professeur trouvé</p>
          </div>

          <!-- Teachers Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-50 dark:bg-slate-800/50 text-[#4e7397] font-medium uppercase text-xs">
                <tr>
                  <th class="px-6 py-3">Professeur</th>
                  <th class="px-6 py-3">Contact</th>
                  <th class="px-6 py-3">Classe Principale</th>
                  <th class="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr 
                  v-for="prof in filteredProfesseurs" 
                  :key="prof._id"
                  class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td class="px-6 py-4">
                    <div class="font-semibold text-[#0e141b] dark:text-white">{{ prof.prenom }} {{ prof.nom }}</div>
                    <div class="text-xs text-slate-500">ID: {{ prof._id.substring(0, 8) }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-[#0e141b] dark:text-slate-300">{{ prof.email }}</div>
                    <div class="text-xs text-slate-500">{{ prof.telephone || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span v-if="prof.classePrincipale" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                      {{ prof.classePrincipale }}
                    </span>
                    <span v-else class="text-slate-400 text-xs">Aucune</span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button 
                      @click="editProfesseur(prof)"
                      class="p-1 hover:text-primary transition-colors"
                      title="Modifier"
                    >
                      <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button 
                      @click="deleteProfesseur(prof._id)"
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
              {{ editingProfesseur ? 'Modifier le Professeur' : 'Nouveau Professeur' }}
            </h3>
            <p class="text-sm text-[#4e7397] dark:text-slate-400">
              {{ editingProfesseur ? 'Modifiez les informations du professeur.' : 'Créez un nouveau compte professeur.' }}
            </p>
          </div>
          <form @submit.prevent="handleSubmit" class="p-6 flex flex-col gap-4">
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
            <div v-if="!editingProfesseur" class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-[#0e141b] dark:text-slate-200">Mot de passe *</label>
              <input 
                v-model="form.password"
                class="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-primary focus:border-primary h-10 px-3 text-[#0e141b] dark:text-white" 
                placeholder="Minimum 6 caractères" 
                type="password"
                :required="!editingProfesseur"
                minlength="6"
              />
            </div>
            <div class="flex flex-col gap-1.5">
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
                {{ isSaving ? 'Enregistrement...' : (editingProfesseur ? 'Modifier' : 'Créer le professeur') }}
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
</div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import api from '@/services/api'

const professeurs = ref([])
const classes = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const editingProfesseur = ref(null)
const searchQuery = ref('')

const filteredProfesseurs = computed(() => {
  if (!searchQuery.value) return professeurs.value
  const q = searchQuery.value.toLowerCase()
  return professeurs.value.filter(p => 
    p.nom.toLowerCase().includes(q) || 
    p.prenom.toLowerCase().includes(q) ||
    p.email.toLowerCase().includes(q) ||
    p.telephone?.toLowerCase().includes(q)
  )
})

const form = reactive({
  prenom: '',
  nom: '',
  email: '',
  telephone: '',
  password: '',
  classePrincipale: ''
})

const fetchProfesseurs = async () => {
  isLoading.value = true
  try {
    const res = await api.getUsers({ role: 'PROFESSEUR' })
    const profs = Array.isArray(res.data.data) ? res.data.data : []
    
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
      } catch (error) {
        return { ...prof, classePrincipale: null }
      }
    }))
  } catch (error) {
    console.error('Erreur chargement professeurs:', error)
    professeurs.value = []
  } finally {
    isLoading.value = false
  }
}

const fetchClasses = async () => {
  try {
    const res = await api.getClasses()
    classes.value = Array.isArray(res.data.data) ? res.data.data : []
  } catch (error) {
    console.error('Erreur chargement classes:', error)
    classes.value = []
  }
}

const openCreateModal = () => {
  resetForm()
}

const editProfesseur = (prof) => {
  editingProfesseur.value = prof
  form.prenom = prof.prenom
  form.nom = prof.nom
  form.email = prof.email
  form.telephone = prof.telephone || ''
  
  // Find the class ID if professor has a main class
  const mainClass = classes.value.find(c => 
    c.professeurPrincipal?._id === prof._id || c.professeurPrincipal === prof._id
  )
  form.classePrincipale = mainClass?._id || ''
}

const deleteProfesseur = async (id) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce professeur ?')) return
  
  try {
    await api.deleteUser(id)
    await fetchProfesseurs()
    alert('Professeur supprimé avec succès')
  } catch (error) {
    console.error('Erreur suppression:', error)
    alert('Erreur lors de la suppression du professeur')
  }
}

const resetForm = () => {
  editingProfesseur.value = null
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
      role: 'PROFESSEUR'
    }

    if (!editingProfesseur.value) {
      payload.password = form.password
    }

    let profId
    if (editingProfesseur.value) {
      await api.updateUser(editingProfesseur.value._id, payload)
      profId = editingProfesseur.value._id
    } else {
      const res = await api.createUser(payload)
      profId = res.data.data._id
    }

    // Update class if a main class was selected
    if (form.classePrincipale) {
      await api.updateClasse(form.classePrincipale, {
        professeurPrincipal: profId
      })
    } else if (editingProfesseur.value) {
      // Remove as principal from previous class if any
      const previousClass = classes.value.find(c => 
        c.professeurPrincipal?._id === profId || c.professeurPrincipal === profId
      )
      if (previousClass) {
        await api.updateClasse(previousClass._id, {
          professeurPrincipal: null
        })
      }
    }

    await fetchProfesseurs()
    await fetchClasses()
    resetForm()
    alert(editingProfesseur.value ? 'Professeur modifié avec succès' : 'Professeur créé avec succès')
  } catch (error) {
    console.error('Erreur sauvegarde:', error)
    alert(error.response?.data?.error || 'Erreur lors de la sauvegarde du professeur')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  fetchProfesseurs()
  fetchClasses()
})
</script>
