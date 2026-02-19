<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <SecretaireSidebar @logout="handleLogout" />
    <div class="flex-1 flex flex-col overflow-hidden">
      <Header :title="pageTitle" />
      <div class="flex-grow pb-8 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <div :key="$route.fullPath" class="w-full h-full">
               <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import SecretaireSidebar from '@/components/sidebars/SecretaireSidebar.vue'

import Header from '@/components/common/Header.vue'

const router = useRouter()
const route = useRoute()

const pageTitle = ref('Espace Secrétariat')

const pageTitles = {
  'SecretaireInscription': 'Inscription d\'un Élève',
  'SecretaireAffectation': 'Affectation aux Classes',
  'SecretaireBulletins': 'Impression des Bulletins',

  'SecretaireArchives': 'Archives Scolaires'
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
