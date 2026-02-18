<template>
  <header class="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 sticky top-0 z-20">
    <!-- Left Section: Title -->
    <div class="flex items-center gap-6 flex-1">
      <h2 class="text-lg font-bold tracking-tight whitespace-nowrap">{{ title }}</h2>
    </div>

    <!-- Right Section: Actions, Notifications, Profile -->
    <div class="flex items-center gap-4">
      <!-- Custom Actions Slot -->
      <slot name="actions"></slot>

      <!-- Notifications -->
      <router-link :to="notificationPath" 
        class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-primary transition-all duration-300 ease-out-expo relative group click-press"
      >
        <span class="material-symbols-outlined transition-transform group-hover:scale-110">notifications</span>
        <span v-if="unreadCount > 0" class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span>
      </router-link>

      <div class="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

      <!-- Profile Section -->
      <router-link :to="profilePath" 
        class="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 pr-4 rounded-xl transition-all duration-300 ease-out-expo group click-press"
      >
        <div class="text-right flex flex-col justify-center">
          <p class="text-sm font-bold leading-none group-hover:text-primary transition-colors">{{ userName }}</p>
          <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-medium">{{ userRoleLabel }}</p>
        </div>
        <div class="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700 bg-cover bg-center border-2 border-primary/20 group-hover:border-primary group-hover:scale-105 transition-all shadow-sm overflow-hidden"
             :style="`background-image: url('${userAvatar}')`">
        </div>
      </router-link>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const unreadCount = ref(0)

const userName = computed(() => {
  if (user.value.prenom && user.value.nom) {
    return `${user.value.prenom} ${user.value.nom}`
  }
  return 'Utilisateur'
})

const userRoleLabel = computed(() => {
  const roles = {
    'ADMIN': 'Administrateur',
    'PROVISEUR': 'Proviseur',
    'CENSEUR': 'Censeur',
    'CPE': 'CPE Principal',
    'PROFESSEUR': 'Professeur',
    'SECRETAIRE': 'Secrétaire',
    'ELEVE': 'Élève',
    'PARENT': 'Parent'
  }
  return roles[user.value.role] || user.value.role
})

const userAvatar = computed(() => {
  if (user.value.photo) {
    return user.value.photo.startsWith('http') ? user.value.photo : `http://localhost:5000/${user.value.photo}`
  }
  return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName.value) + '&background=0D8ABC&color=fff'
})

const profilePath = computed(() => {
  const base = user.value.role?.toLowerCase() || 'cpe'
  return `/${base}/profil`
})

const notificationPath = computed(() => {
  const base = user.value.role?.toLowerCase() || 'cpe'
  return `/${base}/notifications`
})

const fetchUserData = async () => {
  try {
    const res = await api.getMe()
    user.value = res.data.data
    localStorage.setItem('user', JSON.stringify(user.value))
  } catch (error) {
    console.error('Erreur chargement profil:', error)
  }
}

const fetchNotifications = async () => {
  try {
    // Fetch notifications for students and parents
    if ((user.value?.role === 'ELEVE' || user.value?.role === 'PARENT') && user.value?._id) {
      const res = await api.getNotifications(user.value.role === 'ELEVE' ? user.value._id : undefined)
      const allNotifs = res.data.data || []
      unreadCount.value = allNotifs.filter(n => !n.read).length
    } else {
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('Erreur chargement notifications:', error)
    unreadCount.value = 0
  }
}

onMounted(async () => {
  await fetchUserData()
  fetchNotifications()
})
</script>
