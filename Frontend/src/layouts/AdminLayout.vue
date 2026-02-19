<template>
  <div class="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
    <!-- Sidebar -->
    <AdminSidebar @logout="handleLogout" />
    
    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Common Header -->
      <Header :title="pageTitle">
      </Header>

      
      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-8">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <div :key="$route.fullPath" class="w-full h-full">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AdminSidebar from '@/components/sidebars/AdminSidebar.vue'

import Header from '@/components/common/Header.vue'

const route = useRoute()
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

const pageTitle = ref('Tableau de bord')

// Page titles mapping
const pageTitles = {
  'AdminDashboard': 'Tableau de bord',
  'AdminUsers': 'Gestion des Utilisateurs',
  'AdminAjouterUtilisateur': 'Ajouter un Utilisateur',
  'AdminClasses': 'Classes & Filières',
  'AdminCours': 'Cours & Emplois du temps',
  'AdminExamens': 'Gestion des Examens',
  'AdminAffectations': 'Affectations',
  'AdminNotes': 'Gestion des Notes',
  'AdminConfig': 'Configuration Année',
  'AdminDroits': 'Droits d\'Accès',
  'AdminProfil': 'Profil Administrateur'
}

watch(() => route.name, (newRouteName) => {
  if (newRouteName && pageTitles[newRouteName]) {
    pageTitle.value = pageTitles[newRouteName]
  }
}, { immediate: true })
</script>
