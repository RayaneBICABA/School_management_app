<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <ProfesseurSidebar @logout="handleLogout" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header :title="pageTitle" />
      <div class="flex-grow pb-8 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ProfesseurSidebar from '@/components/sidebars/ProfesseurSidebar.vue'

import Header from '@/components/common/Header.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = ref('Espace Enseignement')

const pageTitles = {
  'ProfesseurDashboard': 'Tableau de bord',
  'ProfesseurClasses': 'Mes Classes',
  'ProfesseurFaireAppel': 'Faire l\'appel',
  'ProfesseurSaisieNotes': 'Saisie des Notes',
  'ProfesseurEmploiTemps': 'Mon Emploi du Temps',
  'ProfesseurProfil': 'Mon Profil'
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
