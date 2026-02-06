<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark text-[#0e141b] dark:text-slate-50 p-8">
    <div class="max-w-6xl mx-auto">
      
      <!-- Page Heading -->
      <div class="mb-8 flex justify-between items-end">
        <div>
          <h1 class="text-[#0e141b] dark:text-white text-3xl font-black leading-tight tracking-tight">Centre de Notifications</h1>
          <p class="text-[#4e7397] dark:text-slate-400 text-base mt-1">Gérez vos communications et restez informé.</p>
        </div>
        
        <!-- Tabs for Staff -->
        <div v-if="canSend" class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            @click="activeMainTab = 'inbox'"
            class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
            :class="activeMainTab === 'inbox' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            Boîte de réception
          </button>
          <button 
            @click="activeMainTab = 'compose'"
            class="px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
            :class="activeMainTab === 'compose' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'"
          >
            <span class="material-symbols-outlined text-lg">edit_note</span>
            Nouveau message
          </button>
        </div>
      </div>

      <!-- INBOX TAB -->
      <div v-if="activeMainTab === 'inbox'" class="space-y-6">
        
        <!-- Filter Chips (Inbox) -->
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button class="px-5 py-2 rounded-full bg-primary text-white text-sm font-semibold shadow-md shadow-primary/20">Toutes</button>
          <button class="px-5 py-2 rounded-full bg-white dark:bg-slate-800 text-[#0e141b] dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">Non lues</button>
          <!-- Add more filters if needed -->
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
      </div>

      <!-- COMPOSE TAB (Staff Only) -->
      <div v-else-if="canSend && activeMainTab === 'compose'" class="grid grid-cols-12 gap-8">
         <!-- Recipient Selection -->
         <div class="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <!-- Recipient Selection Card -->
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div class="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 class="font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">person_add</span>
                  Destinataires
                </h3>
                <span class="text-xs font-bold px-2 py-1 bg-primary/10 text-primary rounded-full">{{ selectedCount }} sélectionné(s)</span>
              </div>
              <div class="flex border-b border-slate-100 dark:border-slate-800 px-5 bg-slate-50 dark:bg-slate-800/50">
                <button @click="composeTab = 'classes'" class="border-b-2 px-4 py-3 text-sm font-bold flex items-center gap-2 transition-colors" :class="composeTab === 'classes' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'">
                  <span class="material-symbols-outlined text-lg">meeting_room</span>
                  Par Classe
                </button>
                <button @click="composeTab = 'roles'" class="border-b-2 px-4 py-3 text-sm font-bold flex items-center gap-2 transition-colors" :class="composeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-200'">
                  <span class="material-symbols-outlined text-lg">assignment_ind</span>
                  Par Rôle
                </button>
              </div>
              <div class="p-5">
                <template v-if="composeTab === 'classes'">
                  <div class="relative mb-4">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                    <input v-model="searchQuery" class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 placeholder:text-slate-500 text-sm" placeholder="Rechercher une classe..." type="text"/>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    <label v-for="cls in filteredClasses" :key="cls._id" class="cursor-pointer">
                      <input v-model="selectedClasses" :value="cls._id" class="hidden peer" type="checkbox"/>
                      <div class="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-2 border-transparent rounded-lg text-sm font-medium peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                        {{ cls.niveau }} {{ cls.section }}
                      </div>
                    </label>
                  </div>
                </template>

                <template v-if="composeTab === 'roles'">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label v-for="role in availableRoles" :key="role.value" class="cursor-pointer group">
                      <input v-model="selectedRoles" :value="role.value" class="hidden peer" type="checkbox"/>
                      <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent rounded-xl flex flex-col items-center gap-2 text-center peer-checked:border-primary peer-checked:bg-primary/5 transition-all">
                        <span class="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary transition-colors" :class="selectedRoles.includes(role.value) ? 'text-primary' : ''">{{ role.icon }}</span>
                        <span class="text-xs font-bold">{{ role.label }}</span>
                      </div>
                    </label>
                  </div>
                </template>
              </div>
            </div>

            <!-- Message Form -->
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
              <div class="p-5 border-b border-slate-200 dark:border-slate-800">
                <h3 class="font-bold flex items-center gap-2">
                  <span class="material-symbols-outlined text-primary">edit_note</span>
                  Nouveau Message
                </h3>
              </div>
              <div class="p-6 space-y-4">
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase">Objet</label>
                  <input v-model="message.subject" class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="Sujet de la notification..." type="text"/>
                </div>
                <div class="space-y-1">
                  <label class="text-xs font-bold text-slate-500 uppercase">Contenu</label>
                  <textarea v-model="message.content" class="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg p-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" rows="6" placeholder="Votre message..."></textarea>
                </div>
                <!-- Channels -->
                <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-wrap gap-6 items-center border border-slate-100 dark:border-slate-800">
                    <span class="text-sm font-bold">Via :</span>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="channels.app" class="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" type="checkbox"/>
                        <span class="text-sm font-medium">App</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input v-model="channels.sms" class="w-5 h-5 rounded text-primary border-slate-300 focus:ring-primary" type="checkbox"/>
                        <span class="text-sm font-medium">SMS</span>
                    </label>
                </div>
              </div>
              <div class="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-4">
                <button @click="sendMessage" class="px-8 py-2.5 rounded-lg font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
                  <span class="material-symbols-outlined text-lg">send</span>
                  Envoyer
                </button>
              </div>
            </div>
         </div>
         
         <!-- Sent History (Right Column) -->
         <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-full">
                <div class="p-5 border-b border-slate-200 dark:border-slate-800">
                    <h3 class="font-bold flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary">history</span>
                        Historique d'envoi
                    </h3>
                </div>
                <div class="p-2 overflow-y-auto max-h-[600px]">
                    <div v-if="sentHistory.length === 0" class="p-8 text-center text-slate-400">Aucun envoi récent</div>
                    <div v-for="item in sentHistory" :key="item._id" class="p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 last:border-0 cursor-pointer">
                        <div class="flex justify-between items-start mb-2">
                             <span class="text-[10px] font-bold text-slate-400">{{ formatDate(item.createdAt) }}</span>
                             <span class="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 font-bold">{{ item.status }}</span>
                        </div>
                        <h4 class="text-sm font-bold mb-1 truncate">{{ item.subject }}</h4>
                        <p class="text-xs text-slate-500 line-clamp-2">{{ item.content }}</p>
                    </div>
                </div>
            </div>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/services/api';

// Props / State
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));
const activeMainTab = ref('inbox');
const isLoading = ref(false);

// Inbox State
const notifications = ref([]);

// Compose State
const composeTab = ref('classes');
const searchQuery = ref('');
const message = ref({ subject: '', content: '' });
const channels = ref({ app: true, sms: false });
const selectedClasses = ref([]);
const selectedRoles = ref([]);
const classes = ref([]);
const sentHistory = ref([]);

// Permissions
const canSend = computed(() => {
    const role = user.value.role;
    return ['ADMIN', 'PROVISEUR', 'CENSEUR', 'CPE', 'SECRETAIRE', 'PROFESSEUR'].includes(role);
});

// Roles Config
const availableRoles = [
  { label: 'Administrateurs', value: 'ADMIN', icon: 'settings_accessibility' },
  { label: 'Direction', value: 'PROVISEUR', icon: 'account_balance' },
  { label: 'Censeurs', value: 'CENSEUR', icon: 'gavel' },
  { label: 'CPE', value: 'CPE', icon: 'supervisor_account' },
  { label: 'Professeurs', value: 'PROFESSEUR', icon: 'school' },
  { label: 'Secrétaires', value: 'SECRETAIRE', icon: 'support_agent' },
  { label: 'Éleves', value: 'ELEVE', icon: 'person' },
  { label: 'Parents', value: 'PARENT', icon: 'family_restroom' }
];

// Computed
const selectedCount = computed(() => composeTab.value === 'classes' ? selectedClasses.value.length : selectedRoles.value.length);
const filteredClasses = computed(() => {
  if (!searchQuery.value) return classes.value;
  return classes.value.filter(c => `${c.niveau} ${c.section}`.toLowerCase().includes(searchQuery.value.toLowerCase()));
});

// Fetch Data
const fetchData = async () => {
  isLoading.value = true;
  try {
     // Always fetch received
     const resReceived = await api.getNotifications();
     notifications.value = resReceived.data.data;
     
     // If staff, fetch classes and sent items
     if (canSend.value) {
        const [resClasses, resSent] = await Promise.all([
            api.getClasses(),
            api.getSentNotifications()
        ]);
        classes.value = resClasses.data.data;
        sentHistory.value = resSent.data.data;
     }
  } catch (error) {
     console.error('Error loading notifications:', error);
  } finally {
     isLoading.value = false;
  }
};

// Actions
const markAsRead = async (id) => {
    try {
        await api.markNotificationAsRead(id);
        const idx = notifications.value.findIndex(n => n._id === id);
        if (idx !== -1) notifications.value[idx].read = true;
    } catch (e) { console.error(e); }
};

const sendMessage = async () => {
    if (!message.value.subject || !message.value.content) return alert('Veuillez remplir le sujet et le contenu.');
    if (selectedCount.value === 0) return alert('Veuillez sélectionner au moins un destinataire.');
    
    try {
        isLoading.value = true;
        const payload = {
            subject: message.value.subject,
            content: message.value.content,
            type: composeTab.value === 'classes' ? 'classe' : 'role',
            targetClasses: composeTab.value === 'classes' ? selectedClasses.value : [],
            targetRoles: composeTab.value === 'roles' ? selectedRoles.value : [],
            channels: channels.value
        };
        await api.sendNotification(payload);
        alert('Notification envoyée !');
        // Reset and refresh
        message.value = { subject: '', content: '' };
        selectedClasses.value = [];
        selectedRoles.value = [];
        fetchData();
    } catch (e) {
        console.error(e);
        alert('Erreur lors de l\'envoi');
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (d) => {
    if (!d) return '-';
    const date = new Date(d);
    const now = new Date();
    if (now - date < 86400000) return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return date.toLocaleDateString();
};

onMounted(fetchData);

</script>
