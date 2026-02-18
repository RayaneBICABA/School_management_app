<template>
  <div class="flex-1 flex flex-col overflow-y-auto">
    <div class="max-w-4xl w-full mx-auto p-8">
      <!-- Page Heading -->
      <div class="flex flex-wrap justify-between items-end gap-4 mb-6">
        <div class="flex flex-col gap-2">
          <h2 class="text-slate-900 dark:text-white text-4xl font-black tracking-tight">Mes Notifications</h2>
          <p class="text-slate-500 dark:text-slate-400 text-base">Consultez les dernières mises à jour concernant la scolarité de vos enfants.</p>
        </div>
        <button @click="markAllAsRead" class="flex items-center gap-2 px-4 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <span class="material-symbols-outlined text-[20px]">done_all</span>
          <span>Tout marquer comme lu</span>
        </button>
      </div>

      <!-- Filters and Search -->
      <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 mb-8 sticky top-0 z-10">
        <div class="flex flex-col md:flex-row md:items-center gap-4">
          <!-- Search Bar Component -->
          <div class="flex-1">
            <label class="flex flex-col min-w-40 h-11 w-full">
              <div class="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div class="text-slate-500 flex border-none bg-slate-50 dark:bg-slate-800 items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span class="material-symbols-outlined">search</span>
                </div>
                <input v-model="searchQuery" class="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-slate-50 dark:bg-slate-800 placeholder:text-slate-500 px-4 pl-2 text-sm font-normal leading-normal" placeholder="Rechercher une alerte..."/>
              </div>
            </label>
          </div>
          <!-- Chips / Child Selector -->
          <div class="flex gap-2 p-1 overflow-x-auto">
            <button @click="handleChildSelect('all')" class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all" :class="selectedChild === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'">
              <span class="material-symbols-outlined text-[18px]">group</span>
              <p class="text-xs font-semibold">Toutes</p>
            </button>
            <button v-for="child in children" :key="child._id" @click="handleChildSelect(child._id)" class="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all" :class="selectedChild === child._id ? 'bg-primary text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'">
              <div class="size-5 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                <img v-if="child.photo && child.photo !== 'no-photo.jpg'" :src="`/uploads/${child.photo}`" class="w-full h-full object-cover">
                <span v-else class="text-[10px] font-bold text-primary">{{ child.prenom[0] }}{{ child.nom[0] }}</span>
              </div>
              <p class="text-xs font-medium">{{ child.prenom }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Feed -->
      <div class="space-y-6">
        <div v-if="isLoading" class="py-20 text-center">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>

        <!-- Section: Today -->
        <section v-if="todayNotifications.length > 0">
          <h3 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight mb-4 flex items-center gap-2">
            Aujourd'hui
            <span class="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{{ todayNotifications.filter(n => !n.read).length }} Nouvelles</span>
          </h3>
          <div class="flex flex-col gap-3">
            <div v-for="notif in todayNotifications" :key="notif._id" 
                 @click="markAsRead(notif._id)"
                 class="group relative flex gap-4 p-4 transition-all" :class="getNotificationClass(notif)">
              <div class="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span class="material-symbols-outlined">campaign</span>
              </div>
              <div class="flex flex-col flex-1 gap-1">
                <div class="flex justify-between items-start">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ notif.subject }}</h4>
                  <span class="text-[11px] text-slate-500 font-medium">{{ formatDate(notif.createdAt) }}</span>
                </div>
                <div class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed prose dark:prose-invert max-w-none" v-html="notif.content"></div>
                <div class="flex gap-2 mt-2">
                   <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Par {{ notif.sender?.prenom }} {{ notif.sender?.nom }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Section: Older -->
        <section v-if="olderNotifications.length > 0">
          <h3 class="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight mb-4">Plus anciennes</h3>
          <div class="flex flex-col gap-3">
            <div v-for="notif in olderNotifications" :key="notif._id" 
                 @click="markAsRead(notif._id)"
                 class="flex gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-primary/30 transition-all cursor-pointer opacity-80 hover:opacity-100">
              <div class="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                <span class="material-symbols-outlined">campaign</span>
              </div>
              <div class="flex flex-col flex-1 gap-1">
                <div class="flex justify-between items-start">
                  <h4 class="text-sm font-bold text-slate-900 dark:text-white">{{ notif.subject }}</h4>
                  <span class="text-[11px] text-slate-500 font-medium">{{ new Date(notif.createdAt).toLocaleDateString() }}</span>
                </div>
                <div class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed prose dark:prose-invert max-w-none" v-html="notif.content"></div>
              </div>
            </div>
          </div>
        </section>

        <div v-if="!isLoading && notifications.length === 0" class="py-20 text-center">
            <span class="material-symbols-outlined text-6xl text-slate-200 mb-4">notifications_off</span>
            <p class="text-slate-400">Aucune notification pour le moment.</p>
        </div>
      </div>

      <!-- Footer Empty State Logic (Visual Only) -->
      <div class="mt-12 py-8 text-center">
        <div class="inline-flex items-center justify-center size-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
          <span class="material-symbols-outlined text-slate-400 text-3xl">task_alt</span>
        </div>
        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Vous avez consulté toutes vos notifications des 7 derniers jours.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/services/api'

// Données réactives
const searchQuery = ref('')
const notifications = ref([])
const children = ref([])
const selectedChild = ref('all')
const isLoading = ref(false)

const fetchChildren = async () => {
  try {
    const res = await api.getChildren()
    if (res.data.success) {
      children.value = res.data.data
    }
  } catch (error) {
    console.error('Erreur chargement enfants:', error)
  }
}

const fetchData = async () => {
  try {
    isLoading.value = true
    let response
    
    if (selectedChild.value === 'all') {
      response = await api.getNotifications()
    } else {
      response = await api.getStudentNotifications(selectedChild.value)
    }
    
    notifications.value = response.data.data
  } catch (error) {
    console.error('Erreur chargement notifications:', error)
  } finally {
    isLoading.value = false
  }
}

const handleChildSelect = (childId) => {
  selectedChild.value = childId
  fetchData()
}

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  if (searchQuery.value) {
    filtered = filtered.filter(n => 
      n.subject.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  return filtered
})

const todayNotifications = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0)
  return filteredNotifications.value.filter(n => new Date(n.createdAt).setHours(0, 0, 0, 0) === today)
})

const olderNotifications = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0)
  return filteredNotifications.value.filter(n => new Date(n.createdAt).setHours(0, 0, 0, 0) !== today)
})

const markAsRead = async (id) => {
  try {
    await api.markNotificationAsRead(id)
    const index = notifications.value.findIndex(n => n._id === id)
    if (index !== -1) notifications.value[index].read = true
  } catch (error) {
    console.error('Erreur lecture:', error)
  }
}

const markAllAsRead = async () => {
  try {
    const unread = notifications.value.filter(n => !n.read)
    await Promise.all(unread.map(n => api.markNotificationAsRead(n._id)))
    notifications.value.forEach(n => n.read = true)
  } catch (error) {
    console.error('Erreur lecture groupée:', error)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const getNotificationClass = (notification) => {
  if (!notification.read) {
    return 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer'
  }
  return 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-primary/30 transition-all cursor-pointer opacity-80'
}

onMounted(async () => {
  isLoading.value = true
  await fetchChildren()
  await fetchData()
  isLoading.value = false
})
</script>
