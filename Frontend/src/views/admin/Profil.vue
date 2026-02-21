<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark font-display text-[#0e141b] dark:text-slate-200">
    <!-- Main Content Area -->
    <main v-if="user" class="flex-1 flex flex-col overflow-y-auto py-8 px-12 max-w-[1200px] mx-auto">
      <!-- ProfileHeader Section -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 mb-8 shadow-sm">
        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-center gap-6">
            <div class="relative group">
              <div class="size-32 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-center bg-no-repeat bg-cover shadow-inner flex items-center justify-center bg-slate-200 dark:bg-slate-700">
                <span v-if="!user.photo || user.photo === 'no-photo.jpg'" class="material-symbols-outlined text-5xl text-slate-400">person</span>
                <img v-else :src="user.photo" class="w-full h-full object-cover"/>
              </div>
              <input type="file" ref="fileInput" class="hidden" @change="handlePhotoUpload" accept="image/*" />
              <button @click="$refs.fileInput.click()" class="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900 hover:scale-110 transition-transform cursor-pointer">
                <span class="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
            <div class="flex flex-col">
              <h2 class="text-[#0e141b] dark:text-white text-3xl font-bold tracking-tight">{{ user.nom }} {{ user.prenom }}</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase">{{ user.role }}</span>
                <span class="text-[#4e7397] dark:text-slate-400 text-sm">Personnel administratif</span>
              </div>
              <div class="flex items-center gap-1.5 mt-3 text-slate-500 dark:text-slate-500 text-sm">
                <span class="material-symbols-outlined text-base">history</span>
                Connecté en tant qu'administrateur
              </div>
            </div>
          </div>
          <button @click="handleUpdateDetails" :disabled="isUpdating" class="px-6 py-2.5 bg-primary text-white rounded-lg font-bold text-sm shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50">
            {{ isUpdating ? 'Enregistrement...' : 'Enregistrer les modifications' }}
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Form Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Personal Info Section -->
          <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span class="material-symbols-outlined text-primary">person_edit</span>
              <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">Informations Personnelles</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label class="flex flex-col gap-2">
                <p class="text-[#0e141b] dark:text-slate-300 text-sm font-semibold">Nom</p>
                <input v-model="user.nom" class="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all" type="text"/>
              </label>
              <label class="flex flex-col gap-2">
                <p class="text-[#0e141b] dark:text-slate-300 text-sm font-semibold">Prénom</p>
                <input v-model="user.prenom" class="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all" type="text"/>
              </label>
              <label class="flex flex-col gap-2">
                <p class="text-[#0e141b] dark:text-slate-300 text-sm font-semibold">Téléphone</p>
                <input v-model="user.telephone" class="form-input w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-primary h-12 px-4 transition-all" type="text"/>
              </label>
              <label class="flex flex-col gap-2">
                <p class="text-[#0e141b] dark:text-slate-300 text-sm font-semibold">Email professionnel</p>
                <div class="relative">
                  <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                  <input v-model="user.email" :disabled="true" class="form-input w-full pl-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 dark:text-slate-500 cursor-not-allowed h-12 transition-all" type="email"/>
                </div>
              </label>
            </div>
          </section>
          
          <!-- Connection History Section -->
          <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div class="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">history</span>
                <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">Historique des dernières connexions</h3>
              </div>
              <button @click="clearHistory" class="text-xs font-bold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1" title="Vider l'historique de connexion" v-if="user?.lastLogins?.length > 1">
                <span class="material-symbols-outlined text-sm">delete_sweep</span>
                Vider
              </button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead>
                  <tr class="text-[#4e7397] dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th class="py-3 font-semibold">Date & Heure</th>
                    <th class="py-3 font-semibold">Appareil</th>
                    <th class="py-3 font-semibold">Localisation / IP</th>
                    <th class="py-3 font-semibold text-right">Statut</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
                  <tr v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="border-b border-slate-50 dark:border-slate-800">
                    <td class="py-4 font-medium">{{ formatDate(login.date) }}</td>
                    <td class="py-4">
                      <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-slate-400 text-lg">
                          {{ getDeviceIcon(login.userAgent) }}
                        </span>
                        {{ parseUserAgent(login.userAgent) }}
                      </div>
                    </td>
                    <td class="py-4 text-[#4e7397]">{{ login.ip }}</td>
                    <td class="py-4 text-right">
                      <span v-if="index === 0" class="text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded text-xs">Session actuelle</span>
                      <span v-else class="text-slate-500 font-medium">Réussi</span>
                    </td>
                  </tr>
                  <tr v-if="!(user.lastLogins && user.lastLogins.length)">
                    <td colspan="4" class="py-8 text-center text-slate-500 italic">Aucun historique de connexion disponible</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
        
        <!-- Sidebar Security Column -->
        <div class="space-y-8">
          <section class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span class="material-symbols-outlined text-primary">security</span>
              <h3 class="text-lg font-bold text-[#0e141b] dark:text-white">Sécurité du Compte</h3>
            </div>
            <div class="space-y-6">
              <div class="flex flex-col gap-3">
                <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Mot de passe</p>
                <button @click="showPasswordModal = true" class="w-full flex items-center justify-center gap-2 py-3 border-2 border-slate-200 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 rounded-lg text-[#0e141b] dark:text-white font-bold text-sm transition-all group">
                  <span class="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">lock_reset</span>
                  Changer le mot de passe
                </button>
              </div>
              <hr class="border-slate-100 dark:border-slate-800"/>
              <div class="flex flex-col gap-4">
                <div class="flex justify-between items-start">
                  <div class="flex flex-col">
                    <p class="text-sm font-bold text-[#0e141b] dark:text-white">Double Authentification (2FA)</p>
                    <p class="text-xs text-[#4e7397] dark:text-slate-400 mt-1">Sécurisez davantage votre accès.</p>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input checked class="sr-only peer" type="checkbox"/>
                    <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                <div class="bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-lg p-3 flex items-start gap-2">
                  <span class="material-symbols-outlined text-primary text-lg">verified_user</span>
                  <p class="text-xs text-primary font-medium leading-relaxed">
                    L'authentification à deux facteurs est actuellement activée via Google Authenticator.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          <!-- Help/Notice Card -->
          <div class="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-6 text-white shadow-lg shadow-primary/20">
            <span class="material-symbols-outlined text-3xl mb-4">support_agent</span>
            <h4 class="font-bold text-lg mb-2">Besoin d'aide ?</h4>
            <p class="text-sm text-blue-100 mb-4 leading-relaxed">Si vous rencontrez des problèmes avec vos accès ou si vous soupçonnez une activité inhabituelle, contactez le service informatique.</p>
            <a class="inline-flex items-center gap-2 text-sm font-bold bg-white text-primary px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors" href="#">
              Contacter le Support
              <span class="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Password Modal -->
      <div v-if="showPasswordModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 class="font-bold text-lg">Changer le mot de passe</h3>
            <button @click="showPasswordModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-semibold">Mot de passe actuel</label>
              <input v-model="passwords.current" type="password" class="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 h-11 px-4 focus:ring-primary focus:border-primary" placeholder="••••••••"/>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold">Nouveau mot de passe</label>
              <input v-model="passwords.new" type="password" class="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 h-11 px-4 focus:ring-primary focus:border-primary" placeholder="••••••••"/>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-semibold">Confirmer le nouveau mot de passe</label>
              <input v-model="passwords.confirm" type="password" class="w-full rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 h-11 px-4 focus:ring-primary focus:border-primary" placeholder="••••••••"/>
            </div>
            <div v-if="passwordError" class="text-red-500 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {{ passwordError }}
            </div>
          </div>
          <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
            <button @click="showPasswordModal = false" class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700">Annuler</button>
            <button @click="handleUpdatePassword" :disabled="isUpdatingPassword" class="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50">
              {{ isUpdatingPassword ? 'En cours...' : 'Mettre à jour' }}
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const user = ref(null);
const isUpdating = ref(false);
const showPasswordModal = ref(false);
const isUpdatingPassword = ref(false);
const passwordError = ref('');
const fileInput = ref(null);

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

const passwords = ref({
    current: '',
    new: '',
    confirm: ''
});

const fetchData = async () => {
    try {
        const res = await api.getMe();
        if (res.data.success) {
            user.value = res.data.data;
        }
    } catch (error) {
        console.error('Erreur chargement profil:', error);
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
            alert('Profil mis à jour avec succès !');
        }
    } catch (error) {
        console.error('Erreur mise à jour:', error);
        alert('Erreur lors de la mise à jour du profil');
    } finally {
        isUpdating.value = false;
    }
};

const handleUpdatePassword = async () => {
    if (passwords.value.new !== passwords.value.confirm) {
        passwordError.value = 'Les mots de passe ne correspondent pas';
        return;
    }
    if (passwords.value.new.length < 6) {
        passwordError.value = 'Le nouveau mot de passe doit faire au moins 6 caractères';
        return;
    }

    passwordError.value = '';
    isUpdatingPassword.value = true;
    try {
        const res = await api.updatePassword({
            currentPassword: passwords.value.current,
            newPassword: passwords.value.new
        });
        if (res.data.success) {
            alert('Mot de passe mis à jour avec succès !');
            showPasswordModal.value = false;
            passwords.value = { current: '', new: '', confirm: '' };
        }
    } catch (error) {
        passwordError.value = error.response?.data?.error || 'Erreur lors de la mise à jour du mot de passe';
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
  // Add Material Symbols font
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  // Add Inter font
  const interLink = document.createElement('link');
  interLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
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
