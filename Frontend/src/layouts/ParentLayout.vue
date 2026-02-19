<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <ParentSidebar @logout="handleLogout" />
    <div class="flex-1 flex flex-col overflow-hidden">
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
import ParentSidebar from '@/components/sidebars/ParentSidebar.vue'
import Header from '@/components/common/Header.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = ref('Espace Parent')

const pageTitles = {
  'ParentDashboard': 'Tableau de bord',
  'ParentEnfants': 'Mes Enfants',
  'ParentProfilEnfant': 'Profil de l\'Enfant',
  'ParentBulletins': 'Bulletins Scolaires',
  'ParentNotes': 'Résultats Scolaires',
  'ParentDiscipline': 'Discipline',
  'ParentCalendrier': 'Calendrier Scolaire',
  'ParentNotifications': 'Mes Notifications',
  'ParentJustifierAbsence': 'Justifier une Absence',
  'ParentProfil': 'Mon Profil'
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
