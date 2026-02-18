<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-white p-8">
    <div class="max-w-[1400px] mx-auto">
      <div class="flex flex-col gap-1 mb-8">
        <h1 class="text-3xl font-black text-[#0e141b] dark:text-white tracking-tight">Bonjour, {{ user?.prenom || 'Secrétaire' }} !</h1>
        <p class="text-[#4e7397] dark:text-slate-400 font-medium">Voici le récapitulatif de l'activité administrative aujourd'hui.</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <span class="material-symbols-outlined text-4xl animate-spin text-primary">progress_activity</span>
      </div>

      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm card-glow soft-lift transition-all group">
            <div class="flex justify-between items-start mb-6">
              <div class="size-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:rotate-12">
                <span class="material-symbols-outlined text-3xl">description</span>
              </div>
              <div class="bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-500/10">Prêt</div>
            </div>
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Bulletins finalisés</h3>
            <p class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{{ stats.kpis?.bulletinsPrets || 0 }}</p>
            <div class="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span class="material-symbols-outlined text-sm">print</span>
              Prêts à imprimer
            </div>
          </div>
          <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm card-glow soft-lift transition-all group">
            <div class="flex justify-between items-start mb-6">
              <div class="size-14 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:rotate-12">
                <span class="material-symbols-outlined text-3xl">history</span>
              </div>
              <div class="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/10">Hebdo</div>
            </div>
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Volume d'activité</h3>
            <p class="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{{ stats.kpis?.volumeActivite || 0 }}</p>
            <div class="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span class="material-symbols-outlined text-sm">auto_stories</span>
              Documents gérés / 7j
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          <!-- Main Area: Impressions -->
          <div class="xl:col-span-2 space-y-8">
            <div class="flex items-center justify-between px-2">
              <div class="flex items-center gap-4">
                <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm shadow-primary/5">
                  <span class="material-symbols-outlined text-2xl">print_connect</span>
                </div>
                <div>
                  <h2 class="text-2xl font-black tracking-tight">Impressions groupées</h2>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Traitement par classe</p>
                </div>
              </div>
              <router-link to="/secretaire/bulletins" class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary text-sm font-black shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all group click-press">
                <span>Accéder aux bulletins</span>
                <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
              </router-link>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <TransitionGroup
                enter-active-class="transition-all duration-700 ease-out-expo"
                enter-from-class="opacity-0 translate-y-8"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div v-for="classe in stats.printingStatus" :key="classe.id" 
                     class="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between group soft-lift transition-all hover:border-primary/50 cursor-pointer">
                  <div class="flex items-center gap-5">
                    <div class="size-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center font-black text-xl text-primary border-2 border-white dark:border-slate-800 shadow-sm group-hover:shadow-primary/20 transition-all">{{ classe.code }}</div>
                    <div>
                      <p class="font-black text-base text-slate-900 dark:text-white tracking-tight">{{ classe.nom }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ classe.studentsCount }} élèves</span>
                        <span class="size-1 rounded-full bg-slate-300"></span>
                        <span class="text-[10px] font-bold text-primary uppercase tracking-widest">{{ classe.status }}</span>
                      </div>
                    </div>
                  </div>
                  <button @click="goToImpression(classe.id)" class="size-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30 click-press">
                    <span class="material-symbols-outlined text-2xl">print</span>
                  </button>
                </div>
              </TransitionGroup>
              
              <div v-if="!stats.printingStatus?.length" class="col-span-2 text-center py-20 bg-slate-50/50 dark:bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <span class="material-symbols-outlined text-5xl text-slate-300 mb-4">folder_open</span>
                <p class="text-sm font-black uppercase tracking-widest text-slate-400">Aucune classe en attente</p>
              </div>
            </div>
          </div>

          <!-- Sidebar: Échéances & Activité -->
          <div class="space-y-10">

             <!-- Échéances de la semaine -->
            <div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
              <h3 class="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                <span class="material-symbols-outlined text-red-500 text-xl">event_upcoming</span>
                Échéances
              </h3>
              <div class="space-y-6">
                <div v-for="deadline in stats.deadlines" :key="deadline.id" class="flex gap-5 group cursor-default">
                  <div class="flex flex-col items-center justify-center size-14 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 border-2 border-white dark:border-slate-800 shadow-sm transition-transform group-hover:scale-110">
                    <span class="text-[10px] font-black uppercase leading-none tracking-widest mb-1">{{ deadline.month }}</span>
                    <span class="text-xl font-black">{{ deadline.day }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-primary transition-colors">{{ deadline.title }}</p>
                    <p class="text-[11px] font-medium text-slate-400 mt-0.5 line-clamp-1 italic">{{ deadline.subtitle }}</p>
                  </div>
                </div>

                <div v-if="!stats.deadlines?.length" class="text-center py-8 text-slate-400 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p class="text-[10px] font-black uppercase tracking-widest">Zéro échéance</p>
                </div>
              </div>
            </div>

            <!-- Activité Récente (Timeline Style) -->
            <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 shadow-sm h-fit">
              <div class="flex items-center justify-between mb-8">
                <h3 class="font-black text-xs uppercase tracking-[0.2em] text-slate-400 flex items-center gap-3">
                  <span class="material-symbols-outlined text-primary text-xl">history</span>
                  Activité (24h)
                </h3>
              </div>
              <div class="space-y-0 relative max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 <!-- Line -->
                 <div class="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-100 dark:bg-slate-700"></div>

                 <TransitionGroup
                  enter-active-class="transition-all duration-500 ease-out-expo"
                  enter-from-class="opacity-0 translate-x-4"
                  enter-to-class="opacity-100 translate-x-0"
                 >
                   <div v-for="(activity, index) in stats.recentActivity" :key="index" class="relative pl-10 pb-8 last:pb-2 group">
                      <div class="absolute left-0.5 top-1 size-5 rounded-full border-4 bg-white dark:bg-slate-800 z-10 box-content transition-all group-hover:scale-125"
                           :class="{
                              'border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]': activity.status === 'Terminé' || activity.status === 'Délivré',
                              'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]': activity.status === 'En cours',
                              'border-slate-300 dark:border-slate-600': activity.status === 'Archivé'
                           }">
                      </div>
                      <div class="hover:translate-x-1 transition-transform">
                          <p class="text-sm font-black text-slate-900 dark:text-white tracking-tight">{{ activity.action }}</p>
                          <p class="text-[11px] font-medium text-slate-500 my-1">{{ activity.document }}</p>
                          <div class="flex items-center gap-1.5 opacity-60">
                              <span class="material-symbols-outlined text-xs">schedule</span>
                              <span class="text-[10px] font-bold uppercase tracking-widest">{{ activity.time }}</span>
                          </div>
                      </div>
                   </div>
                 </TransitionGroup>
                 
                 <div v-if="!stats.recentActivity?.length" class="text-center py-8 text-slate-400 pl-4 border border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                    <p class="text-[10px] font-black uppercase tracking-widest">Calme plat</p>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const stats = ref({});
const isLoading = ref(true);
const user = ref(null);

const fetchStats = async () => {
    try {
        isLoading.value = true;
        const response = await api.getSecretaireDashboardStats();
        if (response.data.success) {
            stats.value = response.data.data;
        }
    } catch (error) {
        console.error('Erreur chargement stats secrétaire:', error);
    } finally {
        isLoading.value = false;
    }
};

const goToImpression = (classeId) => {
    router.push({ 
        name: 'SecretaireBulletins', // Ensure this route name exists or use path
        query: { classe: classeId } 
    });
};

onMounted(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        user.value = JSON.parse(userStr);
    }
    fetchStats();

    // Add Material Symbols font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add Public Sans font
    const publicSansLink = document.createElement('link');
    publicSansLink.href = 'https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap';
    publicSansLink.rel = 'stylesheet';
    document.head.appendChild(publicSansLink);

    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
    body {
        font-family: 'Public Sans', sans-serif;
    }
    .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .material-symbols-outlined.fill {
        font-variation-settings: 'FILL' 1;
    }
    `;
    document.head.appendChild(style);
});
</script>
