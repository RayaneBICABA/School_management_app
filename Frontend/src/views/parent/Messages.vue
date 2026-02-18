<template>
  <div class="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
    <!-- Header -->
    <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input v-model="searchQuery" class="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary" placeholder="Rechercher..." type="text"/>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="showNewMessageModal = true" class="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
          <span class="material-symbols-outlined">add</span>
          Nouveau message
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Conversations List -->
      <div class="w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
        <!-- Conversations Header -->
        <div class="p-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-900 dark:text-white">Conversations</h3>
            <span v-if="unreadCount > 0" class="bg-primary text-white text-xs px-2 py-1 rounded-full">{{ unreadCount }}</span>
          </div>
          <!-- Filter Tabs -->
          <div class="flex gap-2">
            <button @click="activeFilter = 'all'" :class="activeFilter === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'" class="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors">
              Tous
            </button>
            <button @click="activeFilter = 'unread'" :class="activeFilter === 'unread' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'" class="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors">
              Non lus
            </button>
          </div>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="isLoadingConversations" class="flex justify-center items-center py-8">
            <span class="material-symbols-outlined animate-spin text-2xl text-primary">sync</span>
          </div>
          <div v-else-if="conversations.length === 0" class="text-center py-8">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">forum</span>
            <p class="text-sm text-slate-500">Aucune conversation</p>
          </div>
          <div v-else class="divide-y divide-slate-100 dark:divide-slate-800">
            <div v-for="conversation in filteredConversations" :key="conversation.id" @click="selectConversation(conversation)" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors" :class="{ 'bg-primary/5 border-l-4 border-primary': selectedConversation?.id === conversation.id }">
              <div class="flex items-start gap-3">
                <div class="size-10 rounded-full bg-cover bg-center border-2 border-slate-200" :style="`background-image: url('${conversation.avatar}')`"></div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <h4 class="font-semibold text-slate-900 dark:text-white truncate">{{ conversation.name }}</h4>
                    <span class="text-xs text-slate-500">{{ formatTime(conversation.lastMessage.dateEnvoi) }}</span>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-400 truncate">{{ conversation.lastMessage.contenu }}</p>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs" :class="getPriorityClass(conversation.lastMessage.priorite)">{{ conversation.lastMessage.priorite }}</span>
                    <span v-if="conversation.unreadCount > 0" class="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">{{ conversation.unreadCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-white dark:bg-slate-900">
        <!-- Chat Header -->
        <div v-if="selectedConversation" class="p-4 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="size-10 rounded-full bg-cover bg-center border-2 border-slate-200" :style="`background-image: url('${selectedConversation.avatar}')`"></div>
              <div>
                <h3 class="font-semibold text-slate-900 dark:text-white">{{ selectedConversation.name }}</h3>
                <p class="text-sm text-slate-500">{{ selectedConversation.role }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span class="material-symbols-outlined">info</span>
              </button>
              <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <span class="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <span class="material-symbols-outlined text-6xl text-slate-300 mb-4">chat</span>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Sélectionnez une conversation</h3>
            <p class="text-slate-500">Choisissez une conversation pour commencer à discuter</p>
          </div>
        </div>

        <!-- Messages Area -->
        <div v-if="selectedConversation" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-if="isLoadingMessages" class="flex justify-center py-8">
            <span class="material-symbols-outlined animate-spin text-2xl text-primary">sync</span>
          </div>
          <div v-else>
            <div v-for="message in messages" :key="message._id" class="flex" :class="{ 'justify-end': message.expediteur._id === currentUserId }">
              <div class="max-w-xs lg:max-w-md">
                <div class="flex items-center gap-2 mb-1" :class="{ 'justify-end': message.expediteur._id === currentUserId }">
                  <span class="text-xs text-slate-500">{{ formatDateTime(message.dateEnvoi) }}</span>
                  <span v-if="message.expediteur._id !== currentUserId" class="text-xs font-medium">{{ message.expediteur.nom }}</span>
                </div>
                <div class="rounded-lg px-4 py-2" :class="getMessageClass(message)">
                  <p class="text-sm">{{ message.contenu }}</p>
                  <div v-if="message.pieceJointe" class="mt-2">
                    <a :href="message.pieceJointe" target="_blank" class="flex items-center gap-2 text-xs bg-white/20 rounded px-2 py-1 hover:bg-white/30 transition-colors">
                      <span class="material-symbols-outlined text-sm">attach_file</span>
                      {{ message.nomPieceJointe }}
                    </a>
                  </div>
                </div>
                <div class="flex items-center gap-1 mt-1" :class="{ 'justify-end': message.expediteur._id === currentUserId }">
                  <span v-if="message.expediteur._id === currentUserId" class="text-xs text-slate-400">
                    {{ message.lu ? 'Lu' : 'Envoyé' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div v-if="selectedConversation" class="p-4 border-t border-slate-100 dark:border-slate-800">
          <div class="flex items-end gap-2">
            <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <span class="material-symbols-outlined">attach_file</span>
            </button>
            <div class="flex-1">
              <textarea v-model="newMessage" @keydown.enter.prevent="sendMessage" class="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Tapez votre message..." rows="1"></textarea>
            </div>
            <button @click="sendMessage" :disabled="!newMessage.trim() || isSending" class="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <span class="material-symbols-outlined" v-if="!isSending">send</span>
              <span class="material-symbols-outlined animate-spin" v-else>sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- New Message Modal -->
    <div v-if="showNewMessageModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Nouveau message</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Destinataire</label>
              <select v-model="newMessageForm.destinataire" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="">Choisir un destinataire</option>
                <option v-for="teacher in teachers" :key="teacher._id" :value="teacher._id">
                  {{ teacher.nom }} {{ teacher.prenom }} - {{ teacher.role }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sujet</label>
              <input v-model="newMessageForm.sujet" type="text" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Sujet du message">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
              <textarea v-model="newMessageForm.contenu" rows="4" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary" placeholder="Contenu du message"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priorité</label>
              <select v-model="newMessageForm.priorite" class="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary">
                <option value="BASSE">Basse</option>
                <option value="NORMAL">Normal</option>
                <option value="HAUTE">Haute</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        </div>
        <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button @click="showNewMessageModal = false" class="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Annuler
          </button>
          <button @click="sendNewMessage" :disabled="!newMessageForm.destinataire || !newMessageForm.sujet || !newMessageForm.contenu || isSending" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

// Données réactives
const conversations = ref([])
const messages = ref([])
const selectedConversation = ref(null)
const isLoadingConversations = ref(false)
const isLoadingMessages = ref(false)
const isSending = ref(false)
const searchQuery = ref('')
const activeFilter = ref('all')
const showNewMessageModal = ref(false)
const newMessage = ref('')
const unreadCount = ref(0)

// Formulaire nouveau message
const newMessageForm = ref({
  destinataire: '',
  sujet: '',
  contenu: '',
  priorite: 'NORMAL',
  categorie: 'PERSONNEL'
})

// Données utilisateur
const currentUserId = ref('')
const teachers = ref([])

// Computed
const filteredConversations = computed(() => {
  let filtered = conversations.value

  // Filtrer par recherche
  if (searchQuery.value) {
    filtered = filtered.filter(conv => 
      conv.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filtrer par statut
  if (activeFilter.value === 'unread') {
    filtered = filtered.filter(conv => conv.unreadCount > 0)
  }

  return filtered
})

// Fetch teachers for new message
const fetchTeachers = async () => {
  try {
    const res = await api.getUsers({ role: 'PROFESSEUR' })
    if (res.data.success) {
      teachers.value = res.data.data.map(teacher => ({
        _id: teacher._id,
        nom: teacher.nom,
        prenom: teacher.prenom,
        role: teacher.role
      }))
    }
  } catch (error) {
    console.error('Error fetching teachers:', error)
  }
}

// Fetch conversations
const fetchConversations = async () => {
  isLoadingConversations.value = true
  try {
    const res = await api.getMessages()
    if (res.data.success) {
      // Grouper les messages par conversation
      const conversationMap = new Map()
      
      res.data.data.forEach(message => {
        const otherUserId = message.expediteur._id === currentUserId.value 
          ? message.destinataire._id 
          : message.expediteur._id
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            name: message.expediteur._id === currentUserId.value 
              ? `${message.destinataire.nom} ${message.destinataire.prenom}`
              : `${message.expediteur.nom} ${message.expediteur.prenom}`,
            role: message.expediteur._id === currentUserId.value 
              ? message.destinataire.role
              : message.expediteur.role,
            avatar: message.expediteur._id === currentUserId.value 
              ? message.destinataire.photo
              : message.expediteur.photo,
            lastMessage: message,
            unreadCount: 0
          })
        }
        
        const conv = conversationMap.get(otherUserId)
        if (new Date(message.dateEnvoi) > new Date(conv.lastMessage.dateEnvoi)) {
          conv.lastMessage = message
        }
        
        // Compter les messages non lus
        if (message.destinataire._id === currentUserId.value && !message.lu) {
          conv.unreadCount++
        }
      })

      conversations.value = Array.from(conversationMap.values())
        .sort((a, b) => new Date(b.lastMessage.dateEnvoi) - new Date(a.lastMessage.dateEnvoi))

      // Calculer le total des non lus
      unreadCount.value = conversations.value.reduce((total, conv) => total + conv.unreadCount, 0)
    }
  } catch (error) {
    console.error('Error fetching conversations:', error)
  } finally {
    isLoadingConversations.value = false
  }
}

// Sélectionner une conversation
const selectConversation = async (conversation) => {
  selectedConversation.value = conversation
  await fetchMessages(conversation.id)
}

// Fetch messages for a conversation
const fetchMessages = async (userId) => {
  isLoadingMessages.value = true
  try {
    const res = await api.getConversation(userId)
    if (res.data.success) {
      messages.value = res.data.data.reverse()
    }
  } catch (error) {
    console.error('Error fetching messages:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

// Envoyer un message
const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedConversation.value) return

  isSending.value = true
  try {
    const res = await api.sendMessage({
      destinataire: selectedConversation.value.id,
      sujet: 'Re: Message',
      contenu: newMessage.value,
      categorie: 'PERSONNEL'
    })

    if (res.data.success) {
      messages.value.push(res.data.data)
      newMessage.value = ''
      
      // Mettre à jour la conversation
      const conv = conversations.value.find(c => c.id === selectedConversation.value.id)
      if (conv) {
        conv.lastMessage = res.data.data
      }
    }
  } catch (error) {
    console.error('Error sending message:', error)
  } finally {
    isSending.value = false
  }
}

// Envoyer un nouveau message
const sendNewMessage = async () => {
  if (!newMessageForm.value.destinataire || !newMessageForm.value.sujet || !newMessageForm.value.contenu) return

  isSending.value = true
  try {
    const res = await api.sendMessage(newMessageForm.value)

    if (res.data.success) {
      showNewMessageModal.value = false
      newMessageForm.value = {
        destinataire: '',
        sujet: '',
        contenu: '',
        priorite: 'NORMAL',
        categorie: 'PERSONNEL'
      }
      
      // Rafraîchir les conversations
      await fetchConversations()
      
      // Sélectionner la nouvelle conversation
      const newConv = conversations.value.find(c => c.id === newMessageForm.value.destinataire)
      if (newConv) {
        await selectConversation(newConv)
      }
    }
  } catch (error) {
    console.error('Error sending new message:', error)
  } finally {
    isSending.value = false
  }
}

// Utilitaires
const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMins < 1) return 'À l\'instant'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours} h`
  if (diffDays < 7) return `Il y a ${diffDays} j`
  return date.toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('fr-FR', { 
    day: 'numeric', 
    month: 'short', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getMessageClass = (message) => {
  const isOwn = message.expediteur._id === currentUserId.value
  const baseClass = isOwn 
    ? 'bg-primary text-white ml-auto' 
    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
  
  return `${baseClass} max-w-xs lg:max-w-md`
}

const getPriorityClass = (priority) => {
  switch (priority) {
    case 'URGENT': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'HAUTE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    case 'BASSE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  }
}

// Initialisation
onMounted(async () => {
  // Récupérer l'ID de l'utilisateur actuel
  const userRes = await api.getMe()
  if (userRes.data.success) {
    currentUserId.value = userRes.data.data._id
  }
  
  await Promise.all([
    fetchConversations(),
    fetchTeachers()
  ])
})
</script>
