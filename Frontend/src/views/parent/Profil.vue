<template>
  <div v-if="user" class="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
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
            <p class="text-slate-500 font-medium">Parent d'élève • {{ user.role }}</p>
            <div class="flex items-center gap-3 mt-2">
              <span class="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg tracking-wider uppercase">ID: {{ user._id.substring(0,8).toUpperCase() }}</span>
              <span class="text-slate-400 text-[10px] font-bold uppercase italic">Membre depuis Sept. 2023</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button @click="handleUpdateDetails" :disabled="isUpdating" class="flex-1 md:flex-none px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-sm" v-if="isUpdating">sync</span>
            {{ isUpdating ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Details -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Personal Info -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-blue-500">contact_page</span>
              </div>
              <h2 class="text-xl font-bold">Informations Personnelles</h2>
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
                <label class="text-sm font-bold text-slate-500 ml-1">E-mail</label>
                <input v-model="user.email" disabled type="email" class="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 cursor-not-allowed text-slate-400 font-medium"/>
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-500 ml-1">Téléphone</label>
                <input v-model="user.telephone" type="tel" class="w-full px-4 py-3 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"/>
              </div>
            </div>
          </div>

          <!-- Notification Preferences -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-purple-500">notifications_active</span>
              </div>
              <h2 class="text-xl font-bold">Préférences de Notification</h2>
            </div>

            <div class="space-y-4">
              <div v-for="pref in notificationPreferences" :key="pref.id" class="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 gap-4">
                <div>
                  <h3 class="font-bold text-slate-900 dark:text-white">{{ pref.title }}</h3>
                  <p class="text-sm text-slate-500">{{ pref.description }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-400">Application</span>
                    <button @click="toggleNotification(pref.id, 'app')" :class="pref.app ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'" class="w-10 h-6 rounded-full relative transition-colors">
                      <div :class="pref.app ? 'translate-x-5' : 'translate-x-1'" class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                    </button>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold text-slate-400">E-mail</span>
                    <button @click="toggleNotification(pref.id, 'email')" :class="pref.email ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'" class="w-10 h-6 rounded-full relative transition-colors">
                      <div :class="pref.email ? 'translate-x-5' : 'translate-x-1'" class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Login History -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div class="flex items-center gap-3 mb-8">
              <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-orange-500">history</span>
              </div>
              <h2 class="text-xl font-bold">Dernières connexions</h2>
            </div>

            <div class="space-y-4">
              <div v-for="(login, index) in (user?.lastLogins || [])" :key="index" class="flex items-center justify-between p-4 rounded-xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span class="material-symbols-outlined text-slate-500">
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
                  <span v-if="index === 0" class="text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">Session actuelle</span>
                </div>
              </div>
              <div v-if="!(user.lastLogins && user.lastLogins.length)" class="text-center py-6 text-sm italic text-slate-500">
                Aucun historique disponible
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Security & Family -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Security -->
          <div class="bg-slate-900 dark:bg-primary/10 rounded-3xl p-6 text-white border border-slate-800">
            <div class="flex items-center gap-3 mb-6">
              <span class="material-symbols-outlined text-primary">security</span>
              <h2 class="text-lg font-bold">Sécurité</h2>
            </div>

            <div class="space-y-4">
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Ancien mot de passe</label>
                <input v-model="securityData.currentPassword" type="password" class="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"/>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nouveau mot de passe</label>
                <input v-model="securityData.newPassword" type="password" class="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"/>
              </div>
              <div class="space-y-1">
                <label class="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Confirmer</label>
                <input v-model="securityData.confirmPassword" type="password" class="w-full bg-white/10 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"/>
              </div>
              <div v-if="passwordError" class="text-red-400 text-[10px] italic">{{ passwordError }}</div>
              <button @click="handleUpdatePassword" :disabled="isUpdatingPassword" class="w-full py-4 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                {{ isUpdatingPassword ? 'En cours...' : 'Changer le mot de passe' }}
              </button>
            </div>
          </div>

          <!-- Family -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 class="text-lg font-bold mb-6">Enfants rattachés</h2>
            <div class="space-y-4">
              <div v-for="child in children" :key="child.id" class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group">
                <div class="flex items-center gap-3">
                  <div :class="child.avatarColor" class="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg">
                    {{ child.initials }}
                  </div>
                  <div>
                    <h3 class="font-bold text-sm">{{ child.name }}</h3>
                    <p class="text-xs text-slate-500">{{ child.class }}</p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
              <button @click="attachChild" class="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-sm">add_circle</span>
                Rattacher un autre enfant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Rattacher un enfant -->
  <div v-if="showAttachModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div @click="showAttachModal = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
    <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-xl font-bold">Rattacher un enfant</h3>
        <button @click="showAttachModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <div class="p-6 space-y-6">
        <div class="space-y-2">
          <label class="text-sm font-bold text-slate-500 ml-1">Rechercher par nom ou matricule</label>
          <div class="relative">
            <input v-model="searchQuery" @input="handleSearch" type="text" placeholder="Ex: Lucas ou 2023-..." class="w-full pl-12 pr-4 py-4 rounded-2xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"/>
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          </div>
        </div>

        <!-- Search Results -->
        <div class="max-h-[300px] overflow-y-auto space-y-2 pr-2">
          <div v-if="isSearching" class="text-center py-8">
            <div class="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p class="text-sm text-slate-500 mt-2 font-medium">Recherche en cours...</p>
          </div>
          
          <div v-else-if="searchResults.length > 0" v-for="student in searchResults" :key="student._id" class="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <img v-if="student.photo && student.photo !== 'no-photo.jpg'" :src="`/uploads/${student.photo}`" class="w-full h-full object-cover"/>
                <div v-else class="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold">
                  {{ student.prenom[0] }}{{ student.nom[0] }}
                </div>
              </div>
              <div>
                <p class="font-bold text-sm">{{ student.prenom }} {{ student.nom }}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ student.matricule }} • {{ student.classe?.niveau }} {{ student.classe?.section }}</p>
              </div>
            </div>
            <button @click="handleAddChild(student._id)" :disabled="isAddingChild" class="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all">
              Ajouter
            </button>
          </div>
          
          <div v-else-if="searchQuery.length >= 2" class="text-center py-12 px-4">
            <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">person_search</span>
            <p class="text-sm text-slate-500 font-medium leading-relaxed">Aucun élève trouvé pour cette recherche</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

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

const fetchData = async () => {
    try {
        const res = await api.getMe();
        if (res.data.success) {
            user.value = res.data.data;
        }
    } catch (error) {
        console.error('Erreur chargement profil parent:', error);
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
            alert('Profil mis à jour !');
        }
    } catch (error) {
        console.error('Erreur:', error);
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
        const res = await api.updatePassword({
            currentPassword: securityData.value.currentPassword,
            newPassword: securityData.value.newPassword
        });
        if (res.data.success) {
            alert('Mot de passe mis à jour !');
            securityData.value = { currentPassword: '', newPassword: '', confirmPassword: '' };
        }
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

// Préférences de notification
const notificationPreferences = ref([
  {
    id: 1,
    title: 'Absences et Retards',
    description: 'Notifications instantanées pour votre enfant',
    app: true,
    email: true
  },
  {
    id: 2,
    title: 'Résultats Scolaires',
    description: 'Publication de notes et rapports',
    app: false,
    email: true
  },
  {
    id: 3,
    title: 'Événements & Vie Scolaire',
    description: 'Réunions, fêtes et sorties scolaires',
    app: false,
    email: true
  }
])

const toggleNotification = (prefId, type) => {
  const pref = notificationPreferences.value.find(p => p.id === prefId)
  if (pref) {
    pref[type] = !pref[type]
  }
}

// Enfants rattachés
const children = ref([])

// Fetch children for profile
const fetchChildren = async () => {
  try {
    const res = await api.getChildren()
    if (res.data.success) {
      children.value = res.data.data.map(child => ({
        id: child._id,
        name: `${child.prenom} ${child.nom}`,
        class: child.classe ? `${child.classe.niveau} ${child.classe.section}` : 'Sans classe',
        initials: `${child.prenom[0]}${child.nom[0]}`.toUpperCase(),
        avatarColor: child.prenom === 'Lucas' ? 'bg-blue-100 dark:bg-blue-900/30 text-primary' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-600'
      }))
    }
  } catch (error) {
    console.error('Error fetching children for profile:', error)
  }
}

const showAttachModal = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const isAddingChild = ref(false)

const handleSearch = async () => {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  
  isSearching.value = true
  try {
    const res = await api.searchStudents(searchQuery.value)
    if (res.data.success) {
      searchResults.value = res.data.data
    }
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    isSearching.value = false
  }
}

const handleAddChild = async (studentId) => {
  isAddingChild.value = true
  try {
    const res = await api.addChild({ matricule: studentId })
    if (res.data.success) {
      alert('Enfant rattaché avec succès !')
      showAttachModal.value = false
      searchQuery.value = ''
      searchResults.value = []
      await fetchChildren()
    }
  } catch (error) {
    alert(error.response?.data?.error || 'Erreur lors du rattachement')
  } finally {
    isAddingChild.value = false
  }
}

const attachChild = () => {
  showAttachModal.value = true
}

onMounted(async () => {
    await Promise.all([
        fetchData(),
        fetchChildren()
    ]);
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
});
</script>
