<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-200 transition-colors duration-200">
    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col overflow-y-auto">
      <!-- PageHeading -->
      <header class="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-8">
        <div class="max-w-5xl mx-auto flex flex-wrap justify-between items-end gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-primary font-bold text-sm">
              <span class="material-symbols-outlined text-sm">verified_user</span>
              Clôture Administrative
            </div>
            <h1 class="text-slate-900 dark:text-white text-4xl font-black leading-tight tracking-tight">Année Scolaire {{ year }}</h1>
            <p class="text-slate-500 dark:text-slate-400 text-base max-w-xl">Finalisez l'année académique {{ year }} et préparez la transition vers la nouvelle année.</p>
          </div>
        </div>
      </header>
      
      <!-- Tabs Navigation -->
      <div class="bg-white dark:bg-slate-950 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
        <div class="max-w-5xl mx-auto px-8">
          <nav class="flex gap-10">
            <router-link to="/admin/configuration" class="flex items-center gap-2 border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-4 pt-6 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">schedule</span>
              <p class="text-sm font-bold tracking-wide">Périodes & Dates</p>
            </router-link>
            <router-link to="/admin/gestion-vacances" class="flex items-center gap-2 border-b-4 border-transparent text-slate-500 dark:text-slate-400 pb-4 pt-6 hover:text-slate-700 dark:hover:text-slate-200 transition-all">
              <span class="material-symbols-outlined text-[20px]">beach_access</span>
              <p class="text-sm font-bold tracking-wide">Vacances</p>
            </router-link>
            <router-link to="/admin/cloture-administrative" class="flex items-center gap-2 border-b-4 border-primary text-primary pb-4 pt-6 group">
              <span class="material-symbols-outlined text-[20px] active-icon">verified_user</span>
              <p class="text-sm font-bold tracking-wide">Clôture Administrative</p>
            </router-link>
          </nav>
        </div>
      </div>
      
      <!-- Content Area -->
      <div class="px-6 md:px-40 py-8">
        
        <!-- Danger Zone / Action -->
        <div class="mt-8 px-4">
          <div class="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl">
            <div class="flex gap-4 items-start">
              <div class="text-red-600 dark:text-red-400 mt-1">
                <span class="material-symbols-outlined text-3xl">report</span>
              </div>
              <div class="flex-1">
                <h3 class="text-red-800 dark:text-red-400 font-bold text-lg mb-2">Attention : Action Irréversible</h3>
                <p class="text-red-700 dark:text-red-300 text-sm leading-relaxed mb-6">
                  La clôture définitive verrouille l'accès à toutes les modifications de notes, d'appréciations et de rangs pour l'année {{ year }}. 
                  Cette étape est nécessaire pour préparer le passage à la nouvelle année scolaire. Assurez-vous d'avoir sauvegardé tous les rapports nécessaires.
                </p>
                <div class="flex flex-col gap-4">
                  <label class="flex items-center gap-3 cursor-pointer">
                    <input v-model="confirmed" class="rounded border-red-300 dark:border-red-900 text-red-600 focus:ring-red-500 w-5 h-5" type="checkbox"/>
                    <span class="text-red-900 dark:text-red-200 text-sm font-medium">Je comprends que cette action est définitive.</span>
                  </label>
                  <button @click="performClosure" :disabled="!confirmed || isClosing" class="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-red-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined" v-if="isClosing">sync</span>
                    <span class="material-symbols-outlined" v-else>lock_reset</span>
                    {{ isClosing ? 'Clôture en cours...' : 'Lancer la clôture définitive' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer Support -->
        <div class="mt-12 mb-20 px-4 text-center">
          <p class="text-[#4e7397] dark:text-slate-500 text-xs">
            Besoin d'aide ? Contactez le support technique au 0800-ADMIN-SCHOOL. <br/>
            Dernière mise à jour du système : {{ todayDate }}
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

const year = ref('2023-2024');
const confirmed = ref(false);
const isClosing = ref(false);

const todayDate = computed(() => {
    return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
});

const fetchData = async () => {
    try {
        const configRes = await api.getSetting('academic_year_config');
        if (configRes.data.success && configRes.data.data) {
            year.value = configRes.data.data.value.year || '2023-2024';
        }
    } catch (error) {
        console.error('Erreur chargement configuration:', error);
    }
};

const performClosure = async () => {
    isClosing.value = true;
    try {
        // Fetch current config first
        const configRes = await api.getSetting('academic_year_config');
        let currentConfig = configRes.data.data?.value || {};
        
        // Update it to mark as closed/archived
        currentConfig.isClosed = true;
        currentConfig.closedAt = new Date().toISOString();
        
        await api.updateSetting('academic_year_config', currentConfig);
        
        alert(`L'année ${year.value} a été clôturée avec succès. Le système est maintenant verrouillé.`);
        confirmed.value = false;
        
        // Reload to reflect changes if needed
        await fetchData();
        
    } catch (error) {
        console.error('Erreur clôture:', error);
        alert('Erreur lors de la clôture : ' + (error.response?.data?.error || error.message));
    } finally {
        isClosing.value = false;
    }
};

onMounted(() => {
  fetchData();
  
  // Add Material Symbols font
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Inter font
  const interLink = document.createElement('link');
  interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
  interLink.rel = 'stylesheet';
  document.head.appendChild(interLink);

  // Add custom styles
  const style = document.createElement('style');
  style.textContent = `
    body {
      font-family: 'Inter', sans-serif;
    }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
  `;
  document.head.appendChild(style);
});
</script>
