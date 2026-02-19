<template>
  <div class="flex min-h-screen bg-background-light dark:bg-background-dark">
    <!-- Sidebar -->
    <EleveSidebar @logout="handleLogout" />
    <div class="flex-1 flex flex-col overflow-hidden ml-72">
      <Header :title="pageTitle" />
      <div class="flex-grow pb-8 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import EleveSidebar from '@/components/sidebars/EleveSidebar.vue'
import Header from '@/components/common/Header.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = ref('Espace Élève')

const pageTitles = {
  'EleveDashboard': 'Tableau de bord',
  'EleveNotes': 'Mes Notes',
  'EleveProgression': 'Ma Progression',
  'EleveBulletins': 'Mes Bulletins',
  'EleveDiscipline': 'Discipline',
  'EleveCalendrier': 'Mon Emploi du Temps',
  'EleveNotifications': 'Mes Notifications',
  'EleveProfil': 'Mon Profil'
}

watch(() => route.name, (newName) => {
  if (newName && pageTitles[newName]) {
    pageTitle.value = pageTitles[newName]
  }
}, { immediate: true })

const handleLogout = () => {
  console.log('Déconnexion en cours...')
  
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.clear()
    router.push('/login')
  }
}
</script>
