<template>
  <div v-if="user" class="min-h-screen bg-slate-50 dark:bg-slate-910 p-4 md:p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div class="flex items-center gap-6">
          <div class="relative group">
            <div class="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
              <span v-if="!user.photo || user.photo === 'no-photo.jpg'" class="material-symbols-outlined text-4xl text-slate-400">person</span>
              <img v-else :src="user.photo" class="w-full h-full object-cover"/>
              <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
              <div @click="$refs.fileInput.click()" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <span class="material-symbols-outlined text-white">photo_camera</span>
              </div>
            </div>
            <div class="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-green-500 border-4 border-white dark:border-slate-900"></div>
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{{ user.prenom }} {{ user.nom }}</h1>
            <p class="text-slate-500 font-medium">Proviseur • Administration Centrale</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg tracking-wider uppercase">ID: {{ user._id.substring(0,8).toUpperCase() }}</span>
              <span class="text-slate-400 text-[10px] font-bold uppercase italic">Accès Superviseur Activé</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="handleUpdateDetails" :disabled="isUpdating" class="flex-1 md:flex-none px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm" v-if="isUpdating">sync</span>
            {{ isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div v-for="stat in stats" :key="stat.id" class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary w-6 h-6 text-2xl">{{ stat.icon }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 dark:text-white">{{ stat.value }}</p>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Information Section -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-blue-500 text-xl">manage_accounts</span>
              </div>
              <h2 class="text-xl font-bold">Informations Administratives</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-1">Prénom</label>
                <input v-model="user.prenom" type="text" class="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"/>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-1">Nom</label>
                <input v-model="user.nom" type="text" class="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"/>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-1">Email Officiel</label>
                <input v-model="user.email" disabled type="email" class="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-not-allowed text-slate-400 font-medium"/>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-1">Ligne Directe</label>
                <input v-model="user.telephone" type="tel" class="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"/>
              </div>
            </div>
          </div>

          <!-- History Table -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <span class="material-symbols-outlined text-orange-500 text-xl">history</span>
                </div>
                <h2 class="text-xl font-bold">Historique de Connexion</h2>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead>
                  <tr class="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th class="pb-4">Date & Heure</th>
                    <th class="pb-4">Appareil</th>
                    <th class="pb-4">IP Address</th>
                    <th class="pb-4 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody class="text-sm">
                  <tr v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-4 font-bold border-b border-slate-50 dark:border-slate-800">{{ formatDate(login.date) }}</td>
                    <td class="py-4 border-b border-slate-50 dark:border-slate-800">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-slate-400 text-base flex-shrink-0">
                          {{ getDeviceIcon(login.userAgent) }}
                        </span>
                        <span>{{ parseUserAgent(login.userAgent) }}</span>
                      </div>
                    </td>
                    <td class="py-4 font-mono text-xs text-slate-400 border-b border-slate-50 dark:border-slate-800">{{ login.ip }}</td>
                    <td class="py-4 border-b border-slate-50 dark:border-slate-800 text-right">
                      <span v-if="index === 0" class="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 text-[10px] font-black rounded uppercase">Session Active</span>
                      <span v-else class="text-slate-400 font-medium italic">Réussi</span>
                    </td>
                  </tr>
                  <tr v-if="!(user.lastLogins && user.lastLogins.length)">
                    <td colspan="4" class="py-8 text-center text-slate-500 italic text-sm">Aucun historique disponible</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Security Card -->
          <div class="bg-slate-900 dark:bg-primary/20 rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-primary w-5 h-5 text-xl">vps_key</span>
              </div>
              <h2 class="text-lg font-bold">Sécurité Accès</h2>
            </div>

            <div class="space-y-5">
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ancien mot de passe</label>
                <input v-model="securityData.currentPassword" type="password" class="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary placeholder-white/20" placeholder="••••••••"/>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nouveau mot de passe</label>
                <input v-model="securityData.newPassword" type="password" class="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary placeholder-white/20" placeholder="••••••••"/>
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Confirmation</label>
                <input v-model="securityData.confirmPassword" type="password" class="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary placeholder-white/20" placeholder="••••••••"/>
              </div>
              <div v-if="passwordError" class="text-red-400 text-xs font-bold px-2">{{ passwordError }}</div>
              <button @click="handleUpdatePassword" :disabled="isUpdatingPassword" class="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                {{ isUpdatingPassword ? 'Mise à jour...' : 'Modifier les Clés d\'Accès' }}
              </button>
            </div>

            <div class="mt-8 pt-8 border-t border-white/10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-slate-400 text-base flex-shrink-0">shield</span>
                  <span class="text-xs font-bold text-slate-300">Double Authentification</span>
                </div>
                <div class="w-10 h-5 bg-green-500 rounded-full relative">
                  <div class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
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
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const { success, error } = useToast()

// Données réactives
const user = ref(null);
const isUpdating = ref(false);
const isUpdatingPassword = ref(false);
const passwordError = ref('');
const fileInput = ref(null);

const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        error('L\'image est trop volumineuse (max 2Mo)');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await api.uploadPhoto(formData);
        if (res.data.success) {
            user.value.photo = res.data.data;
            success('Photo de profil mise à jour !');
        }
    } catch (err) {
        console.error('Erreur upload photo:', err);
        error('Erreur lors de l\'envoi de la photo');
    }
};

const securityData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const stats = ref([
  { id: 1, label: 'Élèves', value: '0', icon: 'groups' },
  { id: 2, label: 'Enseignants', value: '0', icon: 'person_work' }
])

const fetchStats = async () => {
  try {
    // Fetch students count
    const studentsRes = await api.getUsers({ role: 'ELEVE' })
    if (studentsRes.data.success) {
      stats.value[0].value = studentsRes.data.count || studentsRes.data.data.length
    }
    
    // Fetch teachers count
    const teachersRes = await api.getUsers({ role: 'PROFESSEUR' })
    if (teachersRes.data.success) {
      stats.value[1].value = teachersRes.data.count || teachersRes.data.data.length
    }
  } catch (err) {
    console.error('Erreur chargement stats:', err)
  }
}

const fetchData = async () => {
    try {
        const res = await api.getMe();
        if (res.data.success) {
            user.value = res.data.data;
        }
    } catch (err) {
        console.error('Erreur chargement profil proviseur:', err);
    }
};

const handleUpdateDetails = async () => {
    isUpdating.value = true;
    try {
        const res = await api.updateDetails({
            nom: user.value.nom,
            prenom: user.value.prenom,
            telephone: user.value.telephone
        });
        if (res.data.success) {
            success('Profil mis à jour !');
        }
    } catch (err) {
        console.error('Erreur:', err);
        error('Erreur lors de la mise à jour');
    } finally {
        isUpdating.value = false;
    }
};

const handleUpdatePassword = async () => {
    if (securityData.value.newPassword !== securityData.value.confirmPassword) {
        passwordError.value = 'Les mots de passe ne correspondent pas';
        return;
    }
    if (securityData.value.newPassword.length < 6) {
        passwordError.value = 'Minimum 6 caractères';
        return;
    }

    passwordError.value = '';
    isUpdatingPassword.value = true;
    try {
        const res = await api.updatePassword({
            currentPassword: securityData.value.currentPassword,
            newPassword: securityData.value.newPassword
        });
        if (res.data.success) {
            success('Mot de passe mis à jour !');
            securityData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
        }
    } catch (err) {
        passwordError.value = err.response?.data?.error || 'Erreur technique';
    } finally {
        isUpdatingPassword.value = false;
    }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

const getDeviceIcon = (ua) => {
    if (!ua) return 'desktop_windows';
    if (/mobile/i.test(ua)) return 'smartphone';
    if (/tablet/i.test(ua)) return 'tablet_mac';
    return 'desktop_windows';
};

const parseUserAgent = (ua) => {
    if (!ua) return 'Navigateur inconnu';
    if (ua.includes('Chrome')) return 'Chrome on ' + (ua.includes('Windows') ? 'Windows' : 'OS');
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Navigateur Web';
};

onMounted(() => {
    fetchData();
    fetchStats();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
</script>

<style scoped>
/* Fix Material Symbols icon overflow */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
