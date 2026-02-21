<template>
  <div v-if="user" class="max-w-4xl mx-auto py-10 px-8 flex flex-col gap-8">
    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
      <div class="flex flex-col gap-1">
        <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Profil Professeur</h1>
        <p class="text-slate-500 dark:text-slate-400 text-base font-normal">Gérez vos informations personnelles, votre sécurité et vos préférences.</p>
      </div>
      <button @click="handleUpdateDetails" :disabled="isUpdating" class="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50">
        <span class="material-symbols-outlined text-sm" v-if="!isUpdating">save</span>
        <span class="material-symbols-outlined text-sm animate-spin" v-else>sync</span>
        <span>{{ isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications' }}</span>
      </button>
    </div>

    <!-- Profile Header Section -->
    <section class="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div class="flex flex-col md:flex-row gap-6 items-center">
        <div class="relative group">
          <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-32 ring-4 ring-slate-100 dark:ring-slate-800 flex items-center justify-center bg-slate-200 dark:bg-slate-700">
            <span v-if="!userPhotoUrl" class="material-symbols-outlined text-4xl text-slate-400">person</span>
            <img v-else :src="userPhotoUrl" class="w-full h-full object-cover rounded-full"/>
          </div>
          <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
          <button @click="$refs.fileInput.click()" class="absolute bottom-0 right-0 bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
            <span class="material-symbols-outlined text-sm text-slate-600 dark:text-slate-200">edit</span>
          </button>
        </div>
        <div class="flex flex-col text-center md:text-left flex-grow">
          <h2 class="text-[#0e141b] dark:text-white text-3xl font-bold tracking-tight">{{ user.nom }} {{ user.prenom }}</h2>
          <p class="text-slate-500 dark:text-slate-400 text-base font-medium">{{ user.role }}</p>
          <p class="text-slate-400 dark:text-slate-500 text-sm font-normal">Identifiant: {{ user._id.substring(0,8) }}</p>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div v-for="stat in stats" :key="stat.id" :class="stat.bg" class="p-6 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span :class="stat.color" class="material-symbols-outlined">{{ stat.icon }}</span>
          <span class="text-2xl font-black">{{ stat.value }}</span>
        </div>
        <span class="text-xs font-bold uppercase tracking-widest text-slate-500">{{ stat.label }}</span>
      </div>
    </div>

    <!-- Information Cards -->
    <section class="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <h2 class="text-[#0e141b] dark:text-white text-lg font-bold">Informations Personnelles</h2>
      </div>
      <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div class="flex flex-col gap-2">
          <label class="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">Nom</label>
          <input v-model="user.nom" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary h-11 px-4 text-sm"/>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">Prénom</label>
          <input v-model="user.prenom" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary h-11 px-4 text-sm"/>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">Email</label>
          <input v-model="user.email" :disabled="true" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed h-11 px-4 text-sm"/>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-bold">Téléphone</label>
          <input v-model="user.telephone" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary h-11 px-4 text-sm"/>
        </div>
      </div>
    </section>

    <!-- Security & Password -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section class="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 class="text-[#0e141b] dark:text-white text-lg font-bold">Sécurité du Compte</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Mot de passe actuel</label>
              <input v-model="securityData.currentPassword" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-all text-sm py-2.5 px-4" placeholder="••••••••" type="password"/>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Nouveau mot de passe</label>
              <input v-model="securityData.newPassword" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-all text-sm py-2.5 px-4" placeholder="••••••••" type="password"/>
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmer le nouveau mot de passe</label>
              <input v-model="securityData.confirmPassword" class="rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-primary focus:border-primary transition-all text-sm py-2.5 px-4" placeholder="••••••••" type="password"/>
            </div>
          </div>
          <div v-if="passwordError" class="mt-4 text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {{ passwordError }}
          </div>
          <div class="mt-6">
            <button @click="handleUpdatePassword" :disabled="isUpdatingPassword" class="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-sm" v-if="isUpdatingPassword">sync</span>
              {{ isUpdatingPassword ? 'Mise à jour...' : 'Modifier le mot de passe' }}
            </button>
          </div>
        </div>
      </section>

      <!-- History -->
    <section class="bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <h2 class="text-[#0e141b] dark:text-white text-lg font-bold">Historique de connexion</h2>
          <button @click="clearHistory" class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1" title="Vider l'historique de connexion" v-if="user?.lastLogins?.length > 1">
            <span class="material-symbols-outlined text-sm">delete_sweep</span>
            Vider
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                  <span class="material-symbols-outlined text-slate-400">
                    {{ getDeviceIcon(login.userAgent) }}
                  </span>
                </div>
                <div>
                  <p class="font-bold text-sm">{{ parseUserAgent(login.userAgent) }}</p>
                  <p class="text-xs text-slate-500">{{ formatDate(login.date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-mono text-slate-400">{{ login.ip }}</p>
                <span v-if="index === 0" class="text-[9px] font-bold text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Session actuelle</span>
              </div>
            </div>
            <div v-if="!(user.lastLogins && user.lastLogins.length)" class="text-center py-6 text-sm italic text-slate-500">
              Aucun historique disponible
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api, { BASE_ASSET_URL } from '@/services/api';

const user = ref(null);
const isUpdating = ref(false);
const isUpdatingPassword = ref(false);
const passwordError = ref('');
const fileInput = ref(null);

const userPhotoUrl = computed(() => {
    return getPhotoUrl(user.value?.photo);
});

const getPhotoUrl = (photoPath) => {
    if (!photoPath || photoPath === 'no-photo.jpg' || photoPath.includes('undefined')) {
        return null;
    }
    if (photoPath.startsWith('http') || photoPath.startsWith('data:')) {
        return photoPath;
    }
    if (photoPath.startsWith('/uploads')) {
        return `${BASE_ASSET_URL}${photoPath}`;
    }
    return `${BASE_ASSET_URL}/uploads/${photoPath}`;
};

const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('L\'image est trop volumineuse (max 2Mo)');
        return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
        const res = await api.uploadPhoto(formData);
        if (res.data.success) {
            user.value.photo = res.data.data;
            alert('Photo de profil mise à jour !');
        }
    } catch (error) {
        console.error('Erreur upload photo:', error);
        alert('Erreur lors de l\'envoi de la photo');
    }
};

const securityData = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const stats = ref([
    { id: 1, label: 'Classes', value: '0', icon: 'groups', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 2, label: 'Matières', value: '0', icon: 'menu_book', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 3, label: 'Absences', value: '0', icon: 'person_off', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' }
]);

const fetchData = async () => {
    try {
        const res = await api.getMe();
        if (res.data.success) {
            user.value = res.data.data;
            
            // Fetch real stats
            const userId = user.value._id || user.value.id;
            
            // Get professor's class assignments
            const assignmentsRes = await api.getMyClasses();
            const profAssignments = assignmentsRes.data.data || [];
            
            // Count unique classes
            const uniqueClasses = new Set(profAssignments.map(a => a.classe?._id || a.classe));
            stats.value[0].value = uniqueClasses.size.toString();
            
            // Count unique subjects
            const uniqueSubjects = new Set(profAssignments.map(a => a.matiere?._id || a.matiere));
            stats.value[1].value = uniqueSubjects.size.toString();
            
            // Get total absences recorded by this professor
            try {
                // We don't have a direct endpoint for this, so we'll leave it at 0 for now
                // or we could fetch from all classes and count
                stats.value[2].value = '0';
            } catch (err) {
                console.error('Error fetching absences:', err);
            }
        }
    } catch (error) {
        console.error('Erreur chargement profil:', error);
    }
};

const handleUpdateDetails = async () => {
    isUpdating.value = true;
    try {
        await api.updateDetails({
            nom: user.value.nom,
            prenom: user.value.prenom,
            telephone: user.value.telephone
        });
        alert('Profil mis à jour !');
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        alert('Erreur lors de la mise à jour');
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
        await api.updatePassword({
            currentPassword: securityData.value.currentPassword,
            newPassword: securityData.value.newPassword
        });
        alert('Mot de passe mis à jour !');
        securityData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
    } catch (error) {
        passwordError.value = error.response?.data?.error || 'Erreur technique';
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

const clearHistory = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vider l\'historique de vos connexions ? (La session actuelle sera conservée)')) {
        return;
    }

    try {
        const res = await api.clearConnectionHistory();
        if (res.data.success) {
            user.value.lastLogins = res.data.data;
            alert('Historique des connexions vidé avec succès.');
        }
    } catch (error) {
        console.error('Erreur lors du vidage de l\'historique:', error);
        alert('Erreur lors du vidage de l\'historique.');
    }
};

onMounted(() => {
    fetchData();
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
</script>
