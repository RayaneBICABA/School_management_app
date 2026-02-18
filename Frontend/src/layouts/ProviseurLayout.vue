<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <ProviseurSidebar @logout="handleLogout" />
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
import ProviseurSidebar from '@/components/sidebars/ProviseurSidebar.vue'

import Header from '@/components/common/Header.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = ref('Tableau de bord')

const pageTitles = {
  'ProviseurDashboard': 'Tableau de bord',
  'ProviseurSuivi': 'Suivi d\'activité',
  'ProviseurValidation': 'Validation des Bulletins',
  'ProviseurClasses': 'Classes & Filières',
  'ProviseurEmploiTemps': 'Emploi du Temps',
  'ProviseurAffectationEleves': 'Affectation des élèves',
  'ProviseurUtilisateurs': 'Gestion des Utilisateurs',
  'ProviseurProfil': 'Mon Profil'
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
