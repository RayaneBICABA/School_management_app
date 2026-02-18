<template>
  <div class="generation-bulletins-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Bulletins Scolaires</span>
      </nav>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Génération des Bulletins</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Produisez les bulletins de performance après validation complète des notes.</p>
      </div>
    </div>

      <!-- Sélection -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-6 mb-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Classe</label>
            <select v-model="selectedClasse" @change="onClasseChange" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white">
              <option value="">Sélectionner une classe</option>
              <option v-for="classe in classes" :key="classe._id" :value="classe._id">
                {{ classe.niveau }} {{ classe.section }} ({{ classe.filiere }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-[#0e141b] dark:text-white mb-2">Période</label>
            <select v-model="selectedPeriode" @change="checkReadiness" :disabled="!selectedClasse" class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0e141b] dark:text-white disabled:opacity-50">
              <option value="">Sélectionner une période</option>
              <option v-for="periode in periodes" :key="periode" :value="periode">{{ periode }}</option>
            </select>
          </div>
        </div>

        <!-- Vérification -->
        <div v-if="selectedClasse && selectedPeriode" class="mt-6 p-4 rounded-lg" :class="readiness.ready ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined" :class="readiness.ready ? 'text-green-600' : 'text-yellow-600'">
              {{ readiness.ready ? 'check_circle' : 'warning' }}
            </span>
            <div class="flex-1">
              <h3 class="font-bold text-sm mb-2" :class="readiness.ready ? 'text-green-900 dark:text-green-100' : 'text-yellow-900 dark:text-yellow-100'">
                {{ readiness.ready ? 'Prêt pour la génération' : 'Vérification en cours' }}
              </h3>
              <ul class="text-sm space-y-1" :class="readiness.ready ? 'text-green-700 dark:text-green-300' : 'text-yellow-700 dark:text-yellow-300'">
                <li>✓ {{ readiness.totalEleves }} élève(s) dans la classe</li>
                <li>{{ readiness.notesValidees === readiness.totalNotes ? '✓' : '⚠' }} {{ readiness.notesValidees }}/{{ readiness.totalNotes }} notes validées</li>
                <li v-if="!readiness.ready" class="font-bold">⚠ {{ readiness.totalNotes - readiness.notesValidees }} note(s) en attente de validation</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Boutons d'action -->
        <div v-if="selectedClasse && selectedPeriode" class="mt-6 flex gap-3">
          <button 
            @click="generateBulletinsClasse" 
            :disabled="!readiness.ready || isGenerating"
            class="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span class="material-symbols-outlined">description</span>
            <span v-if="isGenerating">Génération en cours...</span>
            <span v-else>Générer tous les bulletins</span>
          </button>
          <button 
            @click="viewExistingBulletins" 
            class="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-[#0e141b] dark:text-white rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2"
          >
            <span class="material-symbols-outlined">folder_open</span>
            Voir les bulletins existants
          </button>
        </div>
      </div>

      <!-- Liste des bulletins générés -->
      <div v-if="bulletins.length > 0" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold text-[#0e141b] dark:text-white">Bulletins générés</h2>
            <p class="text-sm text-[#4e7397] mt-1">{{ bulletins.length }} bulletin(s)</p>
          </div>
          <div class="flex gap-3">
            <button 
              @click="finalizeAllBulletins" 
              :disabled="bulletins.filter(b => b.statut === 'BROUILLON').length === 0"
              class="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Finaliser tous
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-bold text-[#0e141b] dark:text-white">Élève</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-primary">Moyenne</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#0e141b] dark:text-white">Rang</th>
                <th class="px-6 py-4 text-center text-sm font-bold text-[#0e141b] dark:text-white">Statut</th>
                <th class="px-6 py-4 text-right text-sm font-bold text-[#0e141b] dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="bulletin in bulletins" :key="bulletin._id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-[#0e141b] dark:text-white">
                  {{ bulletin.eleve?.prenom }} {{ bulletin.eleve?.nom }}
                  <span class="text-xs text-[#4e7397] block">{{ bulletin.eleve?.matricule }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-2xl font-bold text-primary">{{ bulletin.moyenneGenerale?.toFixed(2) || '-' }}</span>
                  <span class="text-xs text-[#4e7397] block">/20</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-lg font-bold text-[#0e141b] dark:text-white">{{ bulletin.rang || '-' }}</span>
                  <span class="text-xs text-[#4e7397] block">/{{ bulletin.effectif || '-' }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="getBulletinStatutClass(bulletin.statut)" class="px-3 py-1 rounded-full text-xs font-bold">
                    {{ getBulletinStatutLabel(bulletin.statut) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-2">
                    <button 
                      v-if="bulletin.statut === 'BROUILLON'"
                      @click="finalizeBulletin(bulletin._id)" 
                      class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                      title="Finaliser"
                    >
                      <span class="material-symbols-outlined">check_circle</span>
                    </button>
                    <button 
                      @click="viewBulletin(bulletin)" 
                      class="p-2 text-[#4e7397] hover:text-primary transition-colors"
                      title="Voir détails"
                    >
                      <span class="material-symbols-outlined">visibility</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Message si aucune sélection -->
      <div v-else-if="!selectedClasse || !selectedPeriode" class="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
        <span class="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">description</span>
        <p class="text-[#4e7397] text-lg">Sélectionnez une classe et une période pour commencer</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

const classes = ref([]);
const bulletins = ref([]);
const periodes = ref([]);
const selectedClasse = ref('');
const selectedPeriode = ref('');
const isGenerating = ref(false);

const readiness = ref({
  ready: false,
  totalEleves: 0,
  totalNotes: 0,
  notesValidees: 0
});

const loadClasses = async () => {
  try {
    const res = await api.getClasses();
    if (res.data.success) {
      classes.value = res.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement classes:', error);
  }
};

const onClasseChange = () => {
  selectedPeriode.value = '';
  bulletins.value = [];
  readiness.value = { ready: false, totalEleves: 0, totalNotes: 0, notesValidees: 0 };

  if (!selectedClasse.value) return;

  const classe = classes.value.find(c => c._id === selectedClasse.value);
  if (classe) {
    periodes.value = classe.filiere === 'Générale'
      ? ['Trimestre 1', 'Trimestre 2', 'Trimestre 3']
      : ['Semestre 1', 'Semestre 2'];
  }
};

const checkReadiness = async () => {
  if (!selectedClasse.value || !selectedPeriode.value) return;

  try {
    // Charger les élèves
    const elevesRes = await api.getUsers({ classe: selectedClasse.value, role: 'ELEVE' });
    const totalEleves = elevesRes.data.data.length;

    // Charger les notes
    const notesRes = await api.getNotes({
      classe: selectedClasse.value,
      periode: selectedPeriode.value
    });

    const totalNotes = notesRes.data.data.length;
    const notesValidees = notesRes.data.data.filter(n => n.statut === 'VALIDEE').length;

    readiness.value = {
      ready: totalNotes > 0 && totalNotes === notesValidees,
      totalEleves,
      totalNotes,
      notesValidees
    };
  } catch (error) {
    console.error('Erreur vérification:', error);
  }
};

const generateBulletinsClasse = async () => {
  if (!confirm(`Générer les bulletins pour tous les élèves de cette classe ?\n\nCette action créera ${readiness.value.totalEleves} bulletin(s).`)) {
    return;
  }

  isGenerating.value = true;

  try {
    const res = await api.generateBulletinsClasse({
      classe: selectedClasse.value,
      periode: selectedPeriode.value
    });

    if (res.data.success) {
      alert(`${res.data.count} bulletin(s) généré(s) avec succès !`);
      if (res.data.erreurs && res.data.erreurs.length > 0) {
        console.warn('Erreurs:', res.data.erreurs);
      }
      viewExistingBulletins();
    }
  } catch (error) {
    console.error('Erreur génération bulletins:', error);
    alert('Erreur lors de la génération des bulletins');
  } finally {
    isGenerating.value = false;
  }
};

const viewExistingBulletins = async () => {
  if (!selectedClasse.value || !selectedPeriode.value) return;

  try {
    const res = await api.getBulletinsByClasse(selectedClasse.value, {
      periode: selectedPeriode.value
    });

    if (res.data.success) {
      bulletins.value = res.data.data;
    }
  } catch (error) {
    console.error('Erreur chargement bulletins:', error);
  }
};

const finalizeBulletin = async (bulletinId) => {
  if (!confirm('Finaliser ce bulletin ? Il ne pourra plus être modifié après finalisation.')) {
    return;
  }

  try {
    await api.finalizeBulletin(bulletinId);
    alert('Bulletin finalisé avec succès !');
    viewExistingBulletins();
  } catch (error) {
    console.error('Erreur finalisation bulletin:', error);
    alert('Erreur lors de la finalisation du bulletin');
  }
};

const finalizeAllBulletins = async () => {
  const brouillons = bulletins.value.filter(b => b.statut === 'BROUILLON');

  if (!confirm(`Finaliser ${brouillons.length} bulletin(s) ? Ils ne pourront plus être modifiés après finalisation.`)) {
    return;
  }

  try {
    for (const bulletin of brouillons) {
      await api.finalizeBulletin(bulletin._id);
    }
    alert(`${brouillons.length} bulletin(s) finalisé(s) avec succès !`);
    viewExistingBulletins();
  } catch (error) {
    console.error('Erreur finalisation bulletins:', error);
    alert('Erreur lors de la finalisation des bulletins');
  }
};

const viewBulletin = (bulletin) => {
  const details = `
Élève: ${bulletin.eleve?.prenom} ${bulletin.eleve?.nom}
Matricule: ${bulletin.eleve?.matricule}
Classe: ${bulletin.classe?.niveau} ${bulletin.classe?.section}
Période: ${bulletin.periode}

Moyenne Générale: ${bulletin.moyenneGenerale?.toFixed(2)}/20
Rang: ${bulletin.rang}/${bulletin.effectif}
Total Points: ${bulletin.totalPoints?.toFixed(2)}
Total Coefficients: ${bulletin.totalCoefficients}

Statut: ${getBulletinStatutLabel(bulletin.statut)}
Date de génération: ${new Date(bulletin.dateGeneration).toLocaleDateString()}
  `;
  alert(details);
};

const getBulletinStatutClass = (statut) => {
  switch (statut) {
    case 'FINALISE': return 'bg-green-100 text-green-700';
    case 'DISTRIBUE': return 'bg-blue-100 text-blue-700';
    case 'BROUILLON': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

const getBulletinStatutLabel = (statut) => {
  switch (statut) {
    case 'FINALISE': return 'Finalisé';
    case 'DISTRIBUE': return 'Distribué';
    case 'BROUILLON': return 'Brouillon';
    default: return statut;
  }
};

onMounted(() => {
  loadClasses();

  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});
</script>
