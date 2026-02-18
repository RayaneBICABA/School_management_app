<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <CPESidebar @logout="handleLogout" />
      <div class="flex-grow pb-8 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import CPESidebar from '@/components/sidebars/CPESidebar.vue'


const router = useRouter()

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
