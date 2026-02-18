<template>
  <div class="flex-1 min-w-0 bg-background-light dark:bg-background-dark overflow-y-auto">
    <div class="max-w-[1200px] mx-auto p-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center min-h-[400px]">
        <div class="flex flex-col items-center gap-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p class="text-slate-500 dark:text-slate-400">Chargement des notes...</p>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm text-slate-500 mb-4 font-display">
          <router-link to="/admin/notes" class="hover:text-primary transition-colors">Supervision des Notes</router-link>
          <span class="material-symbols-outlined text-sm">chevron_right</span>
          <span class="font-medium text-slate-900 dark:text-white">{{ info.matiereNom || 'Détails' }}</span>
        </nav>

        <!-- Page Heading -->
        <div class="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div class="flex items-center gap-3">
            <button @click="$router.go(-1)" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
              <span class="material-symbols-outlined">arrow_back</span>
              <span>Retour</span>
            </button>
            <div class="flex flex-col gap-1 font-display">
              <h1 class="text-[#0e141b] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                {{ info.matiereNom }} - {{ info.classeNom }}
              </h1>
              <div class="flex items-center gap-4 mt-2">
                <div class="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-base">calendar_today</span>
                  {{ periode }}
                </div>
                <div v-if="info.professeurNom" class="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span class="material-symbols-outlined text-base">person</span>
                  Prof: {{ info.professeurNom }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="hasValidatedNotes" class="flex items-center gap-3">
            <button @click="handleUnblock" :disabled="isUnblocking" class="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 shadow-md transition-colors disabled:opacity-50">
              <span class="material-symbols-outlined text-[20px]">lock_open</span>
              <span>{{ isUnblocking ? 'Déblocage...' : 'Débloquer les Notes' }}</span>
            </button>
          </div>
        </div>

        <!-- Notes Table -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm min-h-[300px]">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Élève</th>
                <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider">Notes Saisies</th>
                <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Moyenne</th>
                <th class="px-6 py-4 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-if="notes.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-slate-500 italic">
                  Aucune note saisie pour cette matière et cette période.
                </td>
              </tr>
              <tr v-for="note in notes" :key="note._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-900 dark:text-white">{{ note.eleve?.prenom }} {{ note.eleve?.nom }}</span>
                    <span class="text-xs text-slate-500">ID: {{ note.eleve?.matricule || 'N/A' }}</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex gap-2 flex-wrap">
                    <div v-for="(item, idx) in note.notes" :key="idx" class="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded text-xs border border-slate-100 dark:border-slate-700">
                      <span class="text-slate-400 font-medium mr-1">{{ item.type }}:</span>
                      <span class="font-bold text-primary">{{ item.valeur }}/20</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-center">
                  <span class="text-sm font-black" :class="note.moyenne >= 10 ? 'text-green-600' : 'text-red-500'">
                    {{ (note.moyenne || 0).toFixed(2) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span 
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border shadow-sm"
                    :class="getStatutClass(note.statut)"
                  >
                    <span class="material-symbols-outlined text-[14px]">{{ getStatutIcon(note.statut) }}</span>
                    {{ getStatutLabel(note.statut) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

const route = useRoute();
const router = useRouter();
const { success, error: showError } = useToast();

const classeId = route.query.classe;
const matiereId = route.query.matiere;
const periode = route.query.periode;

const isLoading = ref(true);
const isUnblocking = ref(false);
const notes = ref([]);
const info = ref({
  classeNom: '',
  matiereNom: '',
  professeurNom: ''
});

const loadNotes = async () => {
  if (!classeId || !matiereId || !periode) {
    showError('Paramètres manquants');
    router.push('/admin/notes');
    return;
  }

  isLoading.value = true;
  try {
    const res = await api.getNotes({
      classe: classeId,
      matiere: matiereId,
      periode: periode
    });
    
    notes.value = res.data.data;
    
    if (notes.value.length > 0) {
      const firstNote = notes.value[0];
      info.value = {
        classeNom: `${firstNote.classe?.niveau || ''} ${firstNote.classe?.section || ''}`,
        matiereNom: firstNote.matiere?.nom || '',
        professeurNom: `${firstNote.professeur?.prenom || ''} ${firstNote.professeur?.nom || ''}`
      };
    } else {
      // Fallback: fetch classe and matiere names separately if no notes
      const [classeRes, matiereRes] = await Promise.all([
        api.getClasse(classeId),
        api.getMatiere(matiereId)
      ]);
      info.value.classeNom = `${classeRes.data.data?.niveau || ''} ${classeRes.data.data?.section || ''}`;
      info.value.matiereNom = matiereRes.data.data?.nom || '';
    }
  } catch (error) {
    console.error('Erreur chargement notes:', error);
  } finally {
    isLoading.value = false;
  }
};

const hasValidatedNotes = computed(() => {
  return notes.value.some(n => n.statut === 'VALIDEE');
});

const handleUnblock = async () => {
  if (!confirm('Voulez-vous vraiment débloquer ces notes ? Les professeurs pourront à nouveau les modifier.')) return;

  isUnblocking.value = true;
  try {
    const res = await api.unblockNotes({
      classe: classeId,
      matiere: matiereId,
      periode: periode
    });
    success(res.data.message || 'Notes débloquées avec succès');
    await loadNotes();
  } catch (error) {
    console.error('Erreur déblocage:', error);
  } finally {
    isUnblocking.value = false;
  }
};

const getStatutClass = (statut) => {
  switch(statut) {
    case 'VALIDEE': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
    case 'REJETEE': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
    default: return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800';
  }
};

const getStatutIcon = (statut) => {
  switch(statut) {
    case 'VALIDEE': return 'verified';
    case 'REJETEE': return 'cancel';
    default: return 'pending';
  }
};

const getStatutLabel = (statut) => {
  switch(statut) {
    case 'VALIDEE': return 'Validé';
    case 'REJETEE': return 'Rejeté';
    default: return 'En attente';
  }
};

onMounted(() => {
  loadNotes();
});
</script>
