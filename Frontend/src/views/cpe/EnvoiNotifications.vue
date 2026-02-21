<template>
  <div class="flex-1 flex flex-col overflow-y-auto">
    <!-- Common Header -->
    <Header title="Envoi de Notifications" />


    <!-- Content Grid -->
    <div class="max-w-6xl w-full mx-auto p-8 grid grid-cols-12 gap-8">
      <!-- Left Column: Composition -->
      <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <!-- Recipient Selection Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">person_add</span>
              Destinataires
            </h3>
            <span class="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">{{ selectedCount }} sélectionné(s)</span>
          </div>
          <!-- Tabs -->
          <div class="flex border-b border-slate-100 dark:border-slate-800 px-5 bg-slate-50 dark:bg-slate-800/50">
            <button @click="activeTab = 'classes'" class="border-b-2 px-4 py-3 text-sm font-bold flex items-center gap-2 transition-colors" :class="activeTab === 'classes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'">
              <span class="material-symbols-outlined text-lg">meeting_room</span>
              Par Classe
            </button>
            <button @click="activeTab = 'roles'" class="border-b-2 px-4 py-3 text-sm font-bold flex items-center gap-2 transition-colors" :class="activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'">
              <span class="material-symbols-outlined text-lg">assignment_ind</span>
              Par Rôle
            </button>
          </div>
          <!-- Search & Selection -->
          <div class="p-5">
            <template v-if="activeTab === 'classes'">
              <div class="relative mb-4">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                <input v-model="searchQuery" class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-500 text-sm" placeholder="Rechercher une classe..." type="text"/>
              </div>
              <div class="flex flex-wrap gap-2">
                <label v-for="cls in filteredClasses" :key="cls._id" class="cursor-pointer">
                  <input v-model="selectedClasses" :value="cls._id" class="hidden peer" type="checkbox"/>
                  <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-lg text-sm font-medium peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                    {{ cls.niveau }} {{ cls.section }}
                  </div>
                </label>
              </div>
            </template>

            <template v-if="activeTab === 'roles'">
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label v-for="role in availableRoles" :key="role.value" class="cursor-pointer group">
                  <input v-model="selectedRoles" :value="role.value" class="hidden peer" type="checkbox"/>
                  <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-xl flex flex-col items-center gap-2 text-center peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                    <span class="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors" :class="selectedRoles.includes(role.value) ? 'text-primary' : ''">{{ role.icon }}</span>
                    <span class="text-xs font-bold">{{ role.label }}</span>
                  </div>
                </label>
              </div>
            </template>
          </div>
        </div>

        <!-- Message Editor Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
          <div class="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 class="font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">edit_note</span>
              Nouveau Message
            </h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Objet du message</label>
              <input v-model="message.subject" class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Ex: Absence exceptionnelle, Information réunion..." type="text"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-bold text-slate-500 uppercase">Contenu</label>
              <div class="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg overflow-hidden">
                <!-- Toolbar -->
                <div class="bg-slate-50 dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex gap-4">
                  <button @click="insertTag('b')" class="material-symbols-outlined text-slate-500 hover:text-primary" title="Gras">format_bold</button>
                  <button @click="insertTag('i')" class="material-symbols-outlined text-slate-500 hover:text-primary" title="Italique">format_italic</button>
                  <button @click="insertTag('ul')" class="material-symbols-outlined text-slate-500 hover:text-primary" title="Liste">format_list_bulleted</button>
                  <div class="w-[1px] h-6 bg-slate-300 dark:bg-slate-600"></div>
                  <button @click="insertTag('br')" class="material-symbols-outlined text-slate-500 hover:text-primary" title="Saut de ligne">keyboard_return</button>
                </div>
                <textarea id="messageEditor" v-model="message.content" class="w-full border-none focus:ring-0 p-4 dark:bg-slate-800 resize-none font-mono text-sm" placeholder="Rédigez votre notification ici..." rows="6"></textarea>
              </div>
              <div class="flex justify-between items-center mt-2">
                <span class="text-[10px] text-slate-500">Variables disponibles: {nom_eleve}, {prenom_eleve}, {date}</span>
                <span class="text-xs font-medium text-slate-400">{{ message.content.length }} / 160 caractères (1 SMS)</span>
              </div>
            </div>
            <!-- Channels -->
            <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-wrap gap-6 items-center border border-slate-100 dark:border-slate-800">
              <span class="text-sm font-bold">Canaux d'envoi :</span>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="channels.app" class="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" type="checkbox"/>
                <span class="text-sm font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-lg">smartphone</span> Notification App
                </span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="channels.sms" class="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" type="checkbox"/>
                <span class="text-sm font-medium flex items-center gap-1">
                  <span class="material-symbols-outlined text-lg">sms</span> SMS
                </span>
              </label>
            </div>
          </div>
          <div class="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
            <button @click="saveDraft" class="px-6 py-2.5 rounded-lg font-bold text-sm text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Enregistrer brouillon
            </button>
            <button @click="sendMessage" class="px-8 py-2.5 rounded-lg font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
              <span class="material-symbols-outlined text-lg">send</span>
              Envoyer maintenant
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: History -->
      <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
          <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 class="font-bold flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">history</span>
              Historique récent
            </h3>
            <div class="flex items-center gap-3">
              <button @click="clearHistory" class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1" title="Vider l'historique d'envoi">
                <span class="material-symbols-outlined text-sm">delete_sweep</span>
                Vider
              </button>
              <button @click="viewAllHistory" class="text-xs font-bold text-primary hover:underline">Voir tout</button>
            </div>
          </div>
          <div class="p-2 overflow-y-auto max-h-[800px]">
            <div v-if="notificationHistory.length === 0" class="p-8 text-center text-slate-400">
              Aucun historique d'envoi
            </div>
            <div v-for="item in notificationHistory" :key="item._id" class="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase">{{ formatDate(item.createdAt) }}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" :class="getStatusColor(item.status)">
                  {{ item.status }}
                </span>
              </div>
              <h4 class="text-sm font-bold mb-1 truncate">{{ item.subject }}</h4>
              <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ item.content }}</p>
              <div class="mt-3 flex items-center gap-3">
                <div v-if="item.targetClasses?.length > 0" class="flex -space-x-2">
                  <div v-for="cls in item.targetClasses" :key="cls._id" class="px-2 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 text-[8px] flex items-center justify-center font-bold">
                    {{ cls.niveau }}{{ cls.section }}
                  </div>
                </div>
                <div v-if="item.targetRoles?.length > 0" class="flex flex-wrap gap-1">
                  <span v-for="role in item.targetRoles" :key="role" class="px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-bold rounded uppercase">
                    {{ role }}
                  </span>
                </div>
                <span class="text-[10px] font-medium text-slate-500">{{ item.recipients?.length }} destinataires</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'
import Header from '@/components/common/Header.vue'

// Données réactives
const activeTab = ref('classes')
const searchQuery = ref('')
const selectedClasses = ref([])
const selectedRoles = ref([])
const classes = ref([])
const isLoading = ref(false)

const availableRoles = [
  { label: 'Administrateurs', value: 'ADMIN', icon: 'settings_accessibility' },
  { label: 'Direction', value: 'PROVISEUR', icon: 'account_balance' },
  { label: 'Censeurs', value: 'CENSEUR', icon: 'gavel' },
  { label: 'CPE', value: 'CPE', icon: 'supervisor_account' },
  { label: 'Professeurs', value: 'PROFESSEUR', icon: 'school' },
  { label: 'Secrétaires', value: 'SECRETAIRE', icon: 'support_agent' },
  { label: 'Tous les Éleves', value: 'ELEVE', icon: 'person' },
  { label: 'Parents', value: 'PARENT', icon: 'family_restroom' }
]

// Féching real data
const fetchData = async () => {
  try {
    isLoading.value = true
    const [classesRes, historyRes] = await Promise.all([
      api.getClasses(),
      api.getSentNotifications()
    ])
    classes.value = classesRes.data.data
    notificationHistory.value = historyRes.data.data
  } catch (error) {
    console.error('Erreur chargement données:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})

// Message
const message = ref({
  subject: '',
  content: ''
})

// Canaux d'envoi
const channels = ref({
  app: true,
  sms: false
})

// Historique des notifications
const notificationHistory = ref([])



// Computed properties
const selectedCount = computed(() => {
  if (activeTab.value === 'classes') return selectedClasses.value.length
  return selectedRoles.value.length
})

const filteredClasses = computed(() => {
  if (!searchQuery.value) return classes.value
  return classes.value.filter(cls => 
    `${cls.niveau} ${cls.section}`.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Fonctions utilitaires
const getStatusColor = (status) => {
  switch (status) {
    case 'Envoyé': return 'bg-green-100 text-green-700'
    case 'Brouillon': return 'bg-orange-100 text-orange-700'
    case 'Erreur': return 'bg-red-100 text-red-700'
    default: return 'bg-slate-100 text-slate-700'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const insertTag = (tag) => {
  const textarea = document.getElementById('messageEditor')
  if (!textarea) return

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const content = message.value.content
  
  let newText = ''
  if (tag === 'br') {
    newText = content.substring(0, start) + '<br>' + content.substring(end)
  } else if (tag === 'ul') {
    newText = content.substring(0, start) + '<ul>\n  <li></li>\n</ul>' + content.substring(end)
  } else {
    newText = content.substring(0, start) + `<${tag}>` + content.substring(start, end) + `</${tag}>` + content.substring(end)
  }
  
  message.value.content = newText
  textarea.focus()
}

// Fonctions d'action
const saveDraft = () => {
  alert('Fonctionnalité de brouillon bientôt disponible')
}

const sendMessage = async () => {
  if (!message.value.subject || !message.value.content) {
    alert('Veuillez remplir l\'objet et le contenu du message.')
    return
  }

  if (selectedCount.value === 0) {
    alert('Veuillez sélectionner au moins un destinataire (classe ou rôle).')
    return
  }

  try {
    isLoading.value = true
    const payload = {
      subject: message.value.subject,
      content: message.value.content,
      type: activeTab.value === 'classes' ? 'classe' : 'role',
      targetClasses: activeTab.value === 'classes' ? selectedClasses.value : [],
      targetRoles: activeTab.value === 'roles' ? selectedRoles.value : [],
      channels: channels.value
    }

    await api.sendNotification(payload)
    alert('Notification envoyée avec succès !')
    
    // Reset form
    message.value.subject = ''
    message.value.content = ''
    selectedClasses.value = []
    selectedRoles.value = []
    
    // Refresh history
    await fetchData()
  } catch (error) {
    console.error('Erreur envoi notification:', error)
    alert('Erreur lors de l\'envoi de la notification')
  } finally {
    isLoading.value = false
  }
}

const viewAllHistory = () => {
  console.log('Voir tout l\'historique')
}

const clearHistory = async () => {
  if (!confirm('Êtes-vous sûr de vouloir vider votre historique d\'envoi ? Cette action est irréversible pour vous, mais les destinataires conserveront leurs notifications.')) {
    return
  }

  try {
    isLoading.value = true
    const res = await api.clearNotificationHistory()
    if (res.data.success) {
      alert('Historique d\'envoi vidé avec succès.')
      await fetchData() // Refresh history
    }
  } catch (error) {
    console.error('Erreur lors du vidage de l\'historique:', error)
    alert('Erreur lors du vidage de l\'historique.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
