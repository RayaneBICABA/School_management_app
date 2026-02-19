<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div class="flex items-center gap-3">
            <button @click="router.back()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 class="text-3xl font-black text-[#0e141b] dark:text-white">Liste des Élèves</h1>
          </div>
          <div class="relative flex-1 max-w-md">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Rechercher un élève..."
              class="w-full pl-10 pr-4 h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            />
          </div>
        </div>
        <p class="text-[#4e7397] dark:text-slate-400 ml-14" v-if="classe">
          {{ classe.niveau }} {{ classe.section }} - 
          <span v-if="searchQuery" class="font-bold text-primary">{{ filteredEleves.length }} trouvé(s)</span>
          <span v-else>{{ eleves.length }} élève(s)</span>
        </p>
        <div class="mt-4 flex gap-3" v-if="classe">
           <button @click="goToAttendance" class="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 shadow-sm hover:bg-blue-600 transition-colors">
              <span class="material-symbols-outlined text-lg">fact_check</span>
              Faire l'appel
           </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-center">
          <span class="material-symbols-outlined text-6xl text-primary animate-spin">progress_activity</span>
          <p class="text-[#4e7397] mt-4">Chargement des élèves...</p>
        </div>
      </div>

      <!-- Students Table -->
      <div v-else-if="eleves.length > 0" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Matricule</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom et prénoms</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date de naissance</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lieu de naissance</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Redoublant</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Sexe</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="eleve in filteredEleves" :key="eleve._id || eleve.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.matricule }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-primary font-bold text-sm">{{ getInitials(eleve) }}</span>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-[#0e141b] dark:text-white">{{ eleve.prenom }} {{ eleve.nom }}</p>
                        <p v-if="eleve.email" class="text-xs text-slate-500">{{ eleve.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="text-sm text-[#0e141b] dark:text-slate-200">{{ formatDate(eleve.dateNaissance) }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                   <span class="text-sm text-[#0e141b] dark:text-slate-200">{{ eleve.lieuNaissance || '-' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <div v-if="eleve.telephone" class="flex items-center justify-center gap-1 text-[#0e141b] dark:text-slate-200">
                      <span class="material-symbols-outlined text-[16px] text-slate-400">call</span>
                      <span class="text-sm">{{ eleve.telephone }}</span>
                   </div>
                   <span v-else class="text-slate-400 text-xs italic">Non renseigné</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span v-if="eleve.isRedoublant" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                     Oui
                   </span>
                   <span v-else class="text-slate-400 text-xs">Non</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span v-if="eleve.sexe === 'M'" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold" title="Masculin">M</span>
                   <span v-else-if="eleve.sexe === 'F'" class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400 text-xs font-bold" title="Féminin">F</span>
                   <span v-else class="text-slate-400 text-xs">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                   <span :class="['px-2 py-1 rounded-full text-xs font-bold', getStatusClass(eleve.statutEleve || eleve.status)]">
                      {{ eleve.statutEleve || eleve.status || 'ACTIF' }}
                   </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    @click="viewProfile(eleve._id || eleve.id)"
                    class="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                  >
                    <span class="material-symbols-outlined text-sm">visibility</span>
                    Voir profil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">school</span>
        <p class="text-[#4e7397] text-lg">Aucun élève dans cette classe</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();

const eleves = ref([]);
const classe = ref(null);
const isLoading = ref(false);
const searchQuery = ref('');

const filteredEleves = computed(() => {
  if (!searchQuery.value) return eleves.value;
  const q = searchQuery.value.toLowerCase();
  return eleves.value.filter(e => 
    e.nom.toLowerCase().includes(q) || 
    e.prenom.toLowerCase().includes(q) ||
    e.matricule.toLowerCase().includes(q)
  );
});

const getInitials = (eleve) => {
  const firstInitial = eleve.prenom ? eleve.prenom.charAt(0).toUpperCase() : '';
  const lastInitial = eleve.nom ? eleve.nom.charAt(0).toUpperCase() : '';
  return firstInitial + lastInitial;
};

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

const getStatusClass = (status) => {
  const map = {
    'ACTIF': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'AFFECTE': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    'INACTIF': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'NON AFFECTE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    'EN_ATTENTE': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    'BLOQUE': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
  }
  return map[status?.toUpperCase()] || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
}

// Générer un matricule unique
const generateMatricule = (student, index) => {
  // Si l'étudiant a déjà un matricule, le conserver
  if (student.matricule && student.matricule !== 'N/A' && student.matricule !== '-') {
    return student.matricule
  }
  
  // Sinon, générer un matricule dynamiquement
  const currentYear = new Date().getFullYear()
  const baseMatricule = `${currentYear}`
  
  // Utiliser le nom et prénom pour créer une partie unique
  const namePart = `${student.nom?.slice(0, 3).toUpperCase() || 'ELV'}${student.prenom?.slice(0, 3).toUpperCase() || 'ELE'}`
  
  // Ajouter un index pour garantir l'unicité
  const indexPart = String(index + 1).padStart(3, '0')
  
  return `${baseMatricule}-${namePart}${indexPart}`
};

const viewProfile = (eleveId) => {
  router.push(`/professeur/profil-eleve/${eleveId}`);
};

const goToAttendance = () => {
    router.push({ path: '/professeur/faire-appel', query: { id: route.query.classe } });
};

const loadData = async () => {
  const classeId = route.query.classe;
  
  if (!classeId) {
    console.error('Aucun ID de classe fourni');
    return;
  }

  isLoading.value = true;

  try {
    // Charger les informations de la classe
    const classeRes = await api.getClasse(classeId);
    if (classeRes.data.success) {
      classe.value = classeRes.data.data;
    }

    // Charger les élèves de la classe
    const elevesRes = await api.getUsers({ 
      classe: classeId, 
      role: 'ELEVE' 
    });
    
    if (elevesRes.data.success) {
      // Transformer les données avec génération de matricules
      const rawData = elevesRes.data.data;
      eleves.value = rawData.map((student, index) => ({
        ...student,
        matricule: generateMatricule(student, index)
      }));
    }
  } catch (error) {
    console.error('Erreur chargement données:', error);
  } finally {
    isLoading.value = false;
  }
};

// Watch for route changes
watch(() => route.query.classe, (newClasseId, oldClasseId) => {
  if (newClasseId && newClasseId !== oldClasseId) {
    loadData();
  }
});

onMounted(() => {
  loadData();

  // Load Material Symbols font
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
