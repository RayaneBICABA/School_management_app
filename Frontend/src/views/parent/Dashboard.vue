<template>
  <div class="flex-1 flex flex-col overflow-y-auto">
    <!-- Page Content -->
    <div class="p-8 max-w-6xl mx-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
          <p class="mt-4 text-slate-500">Chargement des données...</p>
        </div>
      </div>

      <!-- Content when loaded -->
      <div v-else>
        <div class="mb-8">
          <h1 class="text-3xl font-bold tracking-tight mb-2">Bonjour, {{ userProfile.name }}</h1>
          <p class="text-slate-500 dark:text-slate-400">Voici un aperçu de la progression de vos enfants pour aujourd'hui.</p>
        </div>

        <!-- Children Grid Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="(child, index) in children" :key="child.id" class="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden soft-lift transition-all duration-300">
            <div class="p-6">
              <div class="flex items-start justify-between mb-6">
                <div class="flex items-center gap-4 group">
                  <div class="size-16 rounded-2xl bg-cover bg-center border-4 border-primary/10 group-hover:border-primary/30 transition-all duration-500 shadow-sm" :style="`background-image: url('${child.avatar}')`"></div>
                  <div>
                    <h3 class="text-xl font-black tracking-tight group-hover:text-primary transition-colors">{{ child.name }}</h3>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">{{ child.class }}</p>
                  </div>
                </div>
                <div class="bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-primary/10 shadow-sm">
                  {{ child.status }}
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                  <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Moyenne</p>
                  <p class="text-3xl font-black text-primary">{{ child.average }}<span class="text-sm text-slate-400 font-medium">/20</span></p>
                </div>
                <div class="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl text-center border border-slate-100 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                  <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">Dernière note</p>
                  <p class="text-2xl font-black text-green-600">{{ child.lastNote }}<span class="text-sm text-slate-400 font-medium">/20</span></p>
                  <p class="text-[10px] font-bold text-slate-400 mt-0.5 truncate">{{ child.lastNoteSubject }}</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3 p-3 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl transition-transform hover:scale-[1.02]">
                  <span class="material-symbols-outlined text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-lg text-lg">event</span>
                  <div class="flex-1">
                    <p class="text-[9px] font-black text-yellow-700/60 dark:text-yellow-400/60 uppercase tracking-widest">Événement à venir</p>
                    <p class="text-sm font-bold text-yellow-900 dark:text-yellow-100 truncate">{{ child.nextEvent }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 rounded-xl transition-transform hover:scale-[1.02]">
                  <span class="material-symbols-outlined text-slate-400 bg-white dark:bg-slate-800 p-1.5 rounded-lg text-lg border border-slate-100 dark:border-slate-700">info</span>
                  <div class="flex-1">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Actualité récente</p>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{{ child.recentNote }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-slate-50/30 dark:bg-slate-800/20 px-6 py-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-center items-center">
              <button @click="viewProfile(child)" class="text-xs font-black text-primary hover:bg-primary/5 px-4 py-2 rounded-xl transition-all flex items-center gap-2 group/btn click-press uppercase tracking-widest">
                <span class="material-symbols-outlined text-lg transition-transform group-hover/btn:scale-110">person</span>
                Profil complet
              </button>
            </div>
          </div>

          <!-- Add Child Action Card -->
          <button @click="showAddModal = true" class="group h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 click-press">
            <div class="size-20 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:rotate-90 transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-primary/20">
              <span class="material-symbols-outlined text-4xl text-slate-300 group-hover:text-white transition-colors">add</span>
            </div>
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight transition-colors group-hover:text-primary">Ajouter un enfant</h3>
            <p class="text-sm font-medium text-slate-400 text-center max-w-[200px]">Associez un nouvel élève à votre compte parent en quelques clics.</p>
          </button>
        </div>

        <!-- Recent School Notifications Section -->
        <div v-if="notifications.length > 0" class="mt-16">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                <span class="material-symbols-outlined text-2xl">campaign</span>
              </div>
              <div>
                <h2 class="text-2xl font-black tracking-tight">Actualités de l'école</h2>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Dernières communications officielles</p>
              </div>
            </div>
            <button @click="viewAllNews" class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary text-sm font-black shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all group click-press">
              <span>Voir tout</span>
              <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </div>
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-sm">
            <TransitionGroup
              enter-active-class="transition-all duration-700 ease-out-expo"
              enter-from-class="opacity-0 translate-y-8"
              enter-to-class="opacity-100 translate-y-0"
            >
              <div v-for="notification in notifications" :key="notification.id" class="p-6 flex gap-6 items-start hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group cursor-default">
                <div class="size-14 rounded-2xl flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3" :class="getNotificationIconColor(notification.type)">
                  <span class="material-symbols-outlined text-2xl">{{ notification.icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="text-base font-black tracking-tight group-hover:text-primary transition-colors">{{ notification.title }}</h4>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{{ notification.time }}</span>
                  </div>
                  <p class="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">{{ notification.description }}</p>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Child Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">Ajouter un enfant</h3>
          <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <!-- Search Section -->
        <div class="mb-6">
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Rechercher un élève</label>
          <div class="relative">
            <span class="absolute left-3 top-3 text-slate-400">
              <span class="material-symbols-outlined">search</span>
            </span>
            <input 
              v-model="searchQuery" 
              @input="searchStudents"
              class="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 text-sm" 
              placeholder="Rechercher par nom, prénom ou matricule..." 
              type="text"
            />
          </div>
          
          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mt-2 max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-lg shadow-inner bg-slate-50 dark:bg-slate-800/50">
            <div 
              v-for="student in searchResults" 
              :key="student._id"
              @click="selectStudent(student)"
              class="p-3 hover:bg-white dark:hover:bg-slate-800 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span class="text-primary font-bold text-xs">{{ student.prenom[0] }}{{ student.nom[0] }}</span>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-900 dark:text-white">{{ student.prenom }} {{ student.nom }}</p>
                  <p class="text-[10px] text-primary font-bold uppercase tracking-tight">{{ student.matricule }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Manual Entry -->
        <div class="space-y-4">
          <div class="relative flex items-center justify-center">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-100 dark:border-slate-800"></div>
            </div>
            <span class="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase font-bold">ou</span>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Matricule de l'élève</label>
            <input 
              v-model="matriculeToAdd" 
              type="text" 
              class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 text-sm" 
              placeholder="Ex: 2023-XY-1234"
            >
          </div>
        </div>
            
        <div class="flex gap-3 justify-end mt-8">
          <button @click="showAddModal = false" class="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100">Annuler</button>
          <button @click="submitAddChild" :disabled="isSubmitting || !matriculeToAdd" class="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20">
            <span v-if="isSubmitting" class="material-symbols-outlined animate-spin text-sm">sync</span>
            <span>Associer l'enfant</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { success: toastSuccess, error: toastError } = useToast()

// Dashboard states
const isLoading = ref(true)
const isSubmitting = ref(false)

// User Profile
const userProfile = ref({
  name: '',
  role: 'Parent',
  avatar: ''
})

// Children & Notifications
const children = ref([])
const notifications = ref([])

// Add Child Modal states
const showAddModal = ref(false)
const matriculeToAdd = ref('')
const searchQuery = ref('')
const searchResults = ref([])
const searchTimeout = ref(null)

// Actions
const viewReport = (child) => {
  router.push(`/parent/bulletins?child=${child.id}`)
}

const viewProfile = (child) => {
  router.push(`/parent/enfants/${child.id}`)
}

const viewAllNews = () => {
  router.push('/parent/notifications')
}

// Search students with debounce
const searchStudents = () => {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  searchTimeout.value = setTimeout(async () => {
    try {
      const res = await api.searchStudents({
        query: searchQuery.value,
        limit: 10
      })
      searchResults.value = res.data.data
    } catch (error) {
      console.error('Error searching students:', error)
      searchResults.value = []
    }
  }, 400)
}

const selectStudent = (student) => {
  matriculeToAdd.value = student.matricule
  searchResults.value = []
  searchQuery.value = student.prenom + ' ' + student.nom
}

const submitAddChild = async () => {
  if (!matriculeToAdd.value) return
  
  isSubmitting.value = true
  try {
    await api.addChild(matriculeToAdd.value)
    toastSuccess('Enfant ajouté avec succès')
    matriculeToAdd.value = ''
    searchQuery.value = ''
    showAddModal.value = false
    await fetchDashboardData() // Refresh children list
  } catch (error) {
    if (error.response?.status === 404) {
      toastError('Matricule non trouvé. Veuillez vérifier les informations.')
    }
  } finally {
    isSubmitting.value = false
  }
}

// Fetch user profile
const fetchUserProfile = async () => {
  try {
    const res = await api.getMe()
    if (res.data.success) {
      const user = res.data.data
      userProfile.name = `${user.prenom} ${user.nom}`
      userProfile.avatar = user.photo === 'no-photo.jpg' 
        ? `https://ui-avatars.com/api/?name=${user.prenom}+${user.nom}&background=random`
        : `/uploads/${user.photo}`
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  }
}

// Fetch dashboard data
const fetchDashboardData = async () => {
  try {
    const res = await api.getParentDashboard()
    if (res.data.success) {
      const { children: childrenStats, notifications: notifs } = res.data.data
      children.value = childrenStats
      notifications.value = notifs.map(notif => ({
        id: notif._id,
        type: notif.type || 'info',
        icon: notif.type === 'meeting' ? 'groups' : 
              notif.type === 'food' ? 'restaurant' : 'campaign',
        title: notif.subject || notif.titre || 'Notification',
        time: formatTime(notif.createdAt),
        description: notif.content || notif.message || notif.description
      }))
    }
  } catch (error) {
    console.error('Error fetching dashboard info:', error)
  }
}

// Format time helper
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
  if (diffHours > 0) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`
  return 'À l\'instant'
}

const getNotificationIconColor = (type) => {
  switch (type) {
    case 'info': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
    case 'success': return 'bg-green-100 dark:bg-green-900/30 text-green-600'
    case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
    case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-600'
    default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600'
  }
}

// Initialize
onMounted(async () => {
  isLoading.value = true
  await Promise.all([
    fetchUserProfile(),
    fetchDashboardData()
  ])
  isLoading.value = false
})
</script>
