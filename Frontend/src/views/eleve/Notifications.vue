<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-50 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Page Heading -->
      <div class="mb-8">
        <h1 class="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-tight">Mes Notifications</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base mt-1">Restez informé de vos dernières activités scolaires en temps réel.</p>
      </div>

      <!-- Filter Chips -->
      <div class="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button class="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20">Toutes</button>
        <button class="px-5 py-2 rounded-full bg-white dark:bg-slate-800 text-[#0e141b] dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Notes</button>
        <button class="px-5 py-2 rounded-full bg-white dark:bg-slate-800 text-[#0e141b] dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Emploi du temps</button>
        <button class="px-5 py-2 rounded-full bg-white dark:bg-slate-800 text-[#0e141b] dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Vie Scolaire</button>
        <button class="px-5 py-2 rounded-full bg-white dark:bg-slate-800 text-[#0e141b] dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Convocations</button>
      </div>

      <!-- Notification Feed -->
      <div class="space-y-4">
        <div v-if="isLoading" class="py-20 text-center">
          <span class="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
        </div>
        
        <div v-else-if="notifications.length === 0" class="py-20 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
          <span class="material-symbols-outlined text-6xl text-slate-200 mb-4">notifications_off</span>
          <p class="text-slate-500">Vous n'avez aucune notification pour le moment.</p>
        </div>

        <div v-else v-for="notif in notifications" :key="notif._id" 
             @click="markAsRead(notif._id)"
             class="group bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-transparent hover:border-primary/30 transition-all flex gap-4 relative cursor-pointer"
             :class="!notif.read ? 'ring-1 ring-primary/20' : 'opacity-80'">
          
          <div v-if="!notif.read" class="absolute right-5 top-5 size-2.5 bg-primary rounded-full"></div>
          
          <div class="size-14 rounded-xl flex items-center justify-center shrink-0"
               :class="!notif.read ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'">
            <span class="material-symbols-outlined text-lg">campaign</span>
          </div>
          
          <div class="flex-1">
            <div class="flex justify-between items-start mb-2">
              <h4 class="text-[#0e141b] dark:text-white font-bold text-lg" :class="!notif.read ? '' : 'font-medium'">
                {{ notif.subject }}
              </h4>
              <span class="text-xs text-[#4e7397] dark:text-slate-500 whitespace-nowrap ml-4">{{ formatDate(notif.createdAt) }}</span>
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400 mb-2 leading-relaxed prose dark:prose-invert max-w-none" v-html="notif.content"></div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Par {{ notif.sender?.prenom }} {{ notif.sender?.nom }} ({{ notif.sender?.role }})</span>
            </div>
          </div>
        </div>
      </div>

      <!-- View More Button -->
      <div class="mt-8 flex justify-center">
        <button class="px-6 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
          Charger les notifications précédentes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const notifications = ref([]);
const isLoading = ref(false);

const fetchData = async () => {
  try {
    isLoading.value = true;
    
    // Récupérer l'utilisateur connecté
    const userRes = await api.getMe();
    const user = userRes.data.data;
    
    // Récupérer les notifications de l'élève
    if (user._id) {
      const response = await api.getStudentNotifications(user._id.toString());
      notifications.value = response.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement notifications:', error);
    // Utiliser des données par défaut si API indisponible
    notifications.value = [
      {
        _id: '1',
        subject: 'Nouveau bulletin disponible',
        content: 'Votre bulletin du Trimestre 1 est prêt à être consulté.',
        createdAt: new Date('2023-12-15'),
        read: false,
        sender: { prenom: 'Admin', nom: 'Système', role: 'ADMIN' }
      },
      {
        _id: '2', 
        subject: 'Rappel devoir',
        content: 'Pensez à rendre votre devoir de mathématiques pour demain.',
        createdAt: new Date('2023-12-14'),
        read: true,
        sender: { prenom: 'M.', nom: 'Martin', role: 'PROFESSEUR' }
      }
    ];
  } finally {
    isLoading.value = false;
  }
};

const markAsRead = async (id) => {
  try {
    await api.markNotificationAsRead(id);
    // Update local state
    const index = notifications.value.findIndex(n => n._id === id);
    if (index !== -1) {
      notifications.value[index].read = true;
    }
  } catch (error) {
    console.error('Erreur marquage lecture:', error);
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 3600000) return `Il y a ${Math.floor(diff/60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff/3600000)}h`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
};

onMounted(() => {
  fetchData();
});

</script>
