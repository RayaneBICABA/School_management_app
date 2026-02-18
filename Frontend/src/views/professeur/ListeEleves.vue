<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <button @click="router.back()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 class="text-3xl font-black text-[#0e141b] dark:text-white">Liste des Élèves</h1>
        </div>
        <p class="text-[#4e7397] dark:text-slate-400 ml-14" v-if="classe">
          {{ classe.niveau }} {{ classe.section }} - {{ eleves.length }} élève(s)
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
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nom Complet</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</th>
                <th class="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="eleve in eleves" :key="eleve._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.matricule }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="text-primary font-bold text-sm">{{ getInitials(eleve) }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-[#0e141b] dark:text-white">{{ eleve.prenom }} {{ eleve.nom }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-[#4e7397]">{{ eleve.email || '-' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-[#4e7397]">{{ eleve.telephone || '-' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <button 
                    @click="viewProfile(eleve._id)"
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
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();

const eleves = ref([]);
const classe = ref(null);
const isLoading = ref(false);

const getInitials = (eleve) => {
  const firstInitial = eleve.prenom ? eleve.prenom.charAt(0).toUpperCase() : '';
  const lastInitial = eleve.nom ? eleve.nom.charAt(0).toUpperCase() : '';
  return firstInitial + lastInitial;
};

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
