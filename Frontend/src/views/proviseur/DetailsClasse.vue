<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-[1200px] mx-auto p-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-slate-500 dark:text-slate-400">Chargement des détails de la classe...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm text-slate-500 mb-4 font-display">
          <router-link to="/proviseur/validation-bulletins" class="hover:text-primary transition-colors">Validation des bulletins</router-link>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <span class="font-medium text-slate-900 dark:text-white">{{ classeInfo.nom }}</span>
        </nav>

        <!-- Page Heading with Back Button -->
        <div class="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div class="flex items-center gap-3">
            <button @click="$router.go(-1)" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>Retour</span>
            </button>
            <div class="flex flex-col gap-1 font-display">
              <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">{{ classeInfo.nom }}</h1>
              <div class="flex items-center gap-4 mt-2">
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-base">person</span>
                  {{ classeInfo.totalEleves }} Élèves
                </div>
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-base">school</span>
                  Prof. Principal: {{ classeInfo.profPrincipal }}
                </div>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 uppercase">
                  En attente de validation
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="telechargerClassePDF" class="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
              <span class="material-symbols-outlined text-[20px]">download</span>
              Télécharger tous les bulletins
            </button>
            <button @click="validerClasseEntiere" class="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 shadow-md transition-colors">
              <span class="material-symbols-outlined text-[20px]">verified</span>
              Valider la classe entière
            </button>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase">Moyenne Classe</p>
            <p class="text-xl font-black text-primary mt-1">{{ stats.moyenneClasse }}/20</p>
          </div>
          <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p class="text-xs font-bold text-slate-500 uppercase">Plus haute moy.</p>
            <p class="text-xl font-black text-green-600 mt-1">{{ stats.plusHauteMoy }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase">Plus basse moy.</p>
          <p class="text-xl font-black text-red-500 mt-1">{{ stats.plusBasseMoy }}</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p class="text-xs font-bold text-slate-500 uppercase">Bulletins Prêts</p>
          <p class="text-xl font-black text-slate-800 dark:text-white mt-1">{{ stats.bulletinsPrets }}/{{ classeInfo.totalEleves }}</p>
        </div>
      </div>

      <!-- Students Table -->
      <div v-if="students.length > 0" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-12">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse font-display">
            <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16 text-center">Rang</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Élève</th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Moyenne Générale</th>
                <!-- Removed Appreciation Globale Column -->
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="student in students" :key="student.id" class="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center size-8 rounded-full bg-slate-100 text-slate-600 font-bold text-sm" :class="{'bg-yellow-100 text-yellow-700': student.rang === 1}">
                    {{ student.rangText }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                      {{ student.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-bold text-[#0e141b] dark:text-white">{{ student.nom }}</p>
                      <p class="text-xs text-slate-500">ID: {{ student.matricule }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-1">
                    <span class="text-sm font-black" :class="student.moyenne >= 10 ? 'text-green-600' : 'text-red-500'">
                      {{ student.moyenne }} / 20
                    </span>
                    <div class="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full" :class="student.moyenne >= 10 ? 'bg-green-500' : 'bg-red-500'" :style="`width: ${student.moyenne * 5}%`"></div>
                    </div>
                  </div>
                </td>
                <!-- Removed Appreciation Globale Data -->
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-3">
                    <button @click="telechargerBulletinPDF(student)" class="inline-flex items-center justify-center p-2 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Télécharger">
                      <span class="material-symbols-outlined text-lg">download</span>
                    </button>
                    <button @click="voirBulletin(student)" class="inline-flex items-center gap-1 text-primary text-sm font-bold hover:underline">
                      Voir bulletin
                      <span class="material-symbols-outlined text-base">open_in_new</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
          <p class="text-xs text-slate-500 font-medium">Affichage de {{ students.length }} élèves sur {{ classeInfo.totalEleves }}</p>
          <div class="flex gap-2">
            <button class="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold disabled:opacity-50" disabled>Précédent</button>
            <button class="px-3 py-1 bg-primary text-white border border-primary rounded text-xs font-bold">1</button>
            <button class="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded text-xs font-bold">Suivant</button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center mb-12">
        <div class="flex flex-col items-center gap-4">
          <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl text-slate-400">school</span>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Aucun élève trouvé</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Cette classe ne contient aucun élève pour le moment.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const classeId = route.params.id
const { success, error: showError } = useToast()

const isLoading = ref(true)
const classeInfo = ref({
  nom: '',
  totalEleves: 0,
  profPrincipal: '',
  niveau: '',
  section: '',
  serie: ''
})

const stats = ref({
  moyenneClasse: '0.00',
  plusHauteMoy: '0.00',
  plusBasseMoy: '0.00',
  bulletinsPrets: 0
})

const students = ref([])

// Voir le bulletin d'un élève
const voirBulletin = async (student) => {
  if (student.bulletinId) {
    router.push(`/proviseur/bulletin/${student.bulletinId}`)
  } else {
    try {
        const res = await api.getBulletinsByEleve(student.id);
        const bulletins = res.data?.data || [];
        if (bulletins && bulletins.length > 0) {
            student.bulletinId = bulletins[0]._id;
            router.push(`/proviseur/bulletin/${student.bulletinId}`);
        } else {
            showError("Aucun bulletin trouvé pour cet élève, même par défaut.");
        }
    } catch(e) {
        showError("Erreur lors de la récupération du bulletin de base.");
    }
  }
}

// Télécharger le bulletin d'un élève en PDF
const telechargerBulletinPDF = async (student) => {
    let bId = student.bulletinId;
    if (!bId) {
        try {
            const res = await api.getBulletinsByEleve(student.id);
            const bulletins = res.data?.data || [];
            if (bulletins && bulletins.length > 0) {
                bId = bulletins[0]._id;
                student.bulletinId = bId;
            } else {
                showError("Aucun bulletin trouvé pour cet élève, même par défaut.");
                return;
            }
        } catch(e) {
            showError("Erreur lors de la récupération du bulletin de base.");
            return;
        }
    }
    
    try {
        const response = await api.downloadBulletinPDF(bId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bulletin_${student.nom.replace(/\s+/g, '_')}_${classeInfo.value.nom}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        success('Téléchargement démarré');
    } catch (e) {
        console.error("Erreur lors du téléchargement:", e);
        showError('Erreur lors du téléchargement du bulletin');
    }
}

// Télécharger tous les bulletins de la classe en PDF
const telechargerClassePDF = async () => {
    try {
        const response = await api.downloadClassBulletins(classeId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Bulletins_Classe_${classeInfo.value.nom.replace(/\s+/g, '_')}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        success('Téléchargement de la classe démarré');
    } catch (e) {
        console.error("Erreur lors du téléchargement de la classe:", e);
        showError('Erreur lors de la génération du PDF de la classe');
    }
}

// Générer un matricule unique
const generateMatricule = (student, index) => {
  // Si l'étudiant a déjà un matricule, le conserver
  if (student.matricule && student.matricule !== 'N/A') {
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
}

// Charger les données de la classe
const fetchClasseDetails = async () => {
  try {
    isLoading.value = true
    console.log('Chargement détails classe pour ID:', classeId)
    
    // Récupérer les informations de la classe
    const classeResponse = await api.getClasse(classeId)
    const classeData = classeResponse.data?.data || classeResponse.data
    
    if (!classeData) {
      throw new Error('Données de classe non trouvées')
    }
    
    // Mettre à jour les informations de la classe
    classeInfo.value = {
      nom: classeData.section || classeData.nom || `Classe ${classeId}`,
      totalEleves: 0, // Sera mis à jour après chargement des étudiants
      profPrincipal: classeData.profPrincipal ? `${classeData.profPrincipal.nom} ${classeData.profPrincipal.prenom}` : 'Non assigné',
      niveau: classeData.niveau || '',
      section: classeData.section || '',
      serie: classeData.serie || ''
    }
    
    const [bulletinsResponse, studentsResponse] = await Promise.all([
      api.getBulletinsByClasse(classeId),
      api.getStudentsByClass(classeId)
    ]);
    
    const bulletins = bulletinsResponse.data?.data || [];
    const studentsData = studentsResponse.data?.data || [];
    
    // Create a map of student ID -> bulletin
    const bulletinMap = {};
    bulletins.forEach(b => {
      if (b.eleve && b.eleve._id) {
        bulletinMap[b.eleve._id] = b;
      }
    });

    // Strategy: Use official student list as base, overlay bulletin data if exists
    students.value = studentsData.map((s, index) => {
      const studentId = s._id || s.id;
      const b = bulletinMap[studentId];
      
      return {
        id: studentId,
        bulletinId: b ? b._id : null,
        rang: b ? (parseInt(b.rang) || '-') : '-',
        rangText: b && b.rang ? (b.rang === '1' ? '1er' : `${b.rang}e`) : '-',
        nom: `${s.nom || ''} ${s.prenom || ''}`.trim(),
        matricule: s.matricule || 'N/A',
        initials: `${s.nom?.[0] || ''}${s.prenom?.[0] || ''}`.toUpperCase(),
        moyenne: b ? (b.moyenneGenerale || 0).toFixed(2) : '0.00',
        appreciation: b ? (b.appreciationGenerale || '') : ''
      };
    });
    
    // Mettre à jour le nombre total d'élèves
    classeInfo.value.totalEleves = students.value.length
    
    // Calculer les statistiques
    if (students.value.length > 0) {
      const bulletinsWithMoyenne = students.value.filter(s => s.bulletinId && parseFloat(s.moyenne) > 0);
      const allMoyennes = bulletinsWithMoyenne.map(s => parseFloat(s.moyenne));
      
      stats.value = {
        moyenneClasse: allMoyennes.length > 0 
          ? (allMoyennes.reduce((sum, m) => sum + m, 0) / allMoyennes.length).toFixed(2) 
          : '0.00',
        plusHauteMoy: allMoyennes.length > 0 ? Math.max(...allMoyennes).toFixed(2) : '0.00',
        plusBasseMoy: allMoyennes.length > 0 ? Math.min(...allMoyennes).toFixed(2) : '0.00',
        bulletinsPrets: bulletins.length
      }
    } else {
      stats.value = {
        moyenneClasse: '0.00',
        plusHauteMoy: '0.00',
        plusBasseMoy: '0.00',
        bulletinsPrets: 0
      }
    }
    
  } catch (error) {
    console.error('Erreur chargement détails classe:', error)
    
    // Afficher un message d'erreur plus explicite
    if (error.response?.status === 404) {
      alert('Classe non trouvée. Veuillez vérifier l\'identifiant de la classe.')
    } else if (error.response?.status === 403) {
      alert('Vous n\'avez pas les permissions pour voir cette classe.')
    } else {
      alert('Erreur lors du chargement des détails de la classe: ' + (error.message || 'Erreur inconnue'))
    }
    
    // Garder les valeurs par défaut en cas d'erreur
    students.value = []
    classeInfo.value.totalEleves = 0
  } finally {
    isLoading.value = false
  }
}

const validerClasseEntiere = async () => {
    if (!confirm(`Confirmez-vous la validation de tous les bulletins pour la classe ${classeInfo.value.nom} ?`)) return;
    
    try {
        await api.validateClassBulletins(classeId);
        success('Classe validée avec succès !');
        fetchClasseDetails(); // Refresh to see updates (e.g. status)
    } catch (e) {
        console.error(e);
        showError('Erreur lors de la validation de la classe.');
    }
}

onMounted(() => {
  fetchClasseDetails()
})
</script>
