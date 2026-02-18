<template>
  <div class="validation-evaluations-view">
    <div class="p-8 max-w-7xl mx-auto w-full space-y-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm">
        <router-link to="/censeur" class="text-[#4e7397] hover:text-primary font-medium">Censeur</router-link>
        <span class="text-[#4e7397] material-symbols-outlined text-sm">chevron_right</span>
        <span class="font-medium">Validation Évaluations</span>
      </nav>

    <!-- Back Button -->
    <div class="mb-4">
      <button @click="$router.push('/censeur')" class="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Retour au tableau de bord</span>
      </button>
    </div>

    <!-- Page Heading -->
    <div class="flex flex-wrap justify-between items-end gap-4">
      <div class="flex flex-col gap-1">
        <h1 class="text-4xl font-black tracking-tight text-[#0e141b] dark:text-white">Validation des Évaluations</h1>
        <p class="text-[#4e7397] dark:text-slate-400 text-base">Examinez et validez les demandes d'évaluation des professeurs.</p>
      </div>
      <div class="flex gap-3">
          <button @click="fetchPending" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <span class="material-symbols-outlined text-lg">refresh</span>
            Actualiser
          </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       <div class="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
           <p class="text-sm font-medium text-slate-500">En attente</p>
           <p class="text-3xl font-bold text-amber-500">{{ pendingEvaluations.length }}</p>
       </div>
    </div>

    <!-- List -->
    <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
      <div v-if="pendingEvaluations.length === 0" class="p-12 text-center text-slate-500">
          <span class="material-symbols-outlined text-4xl mb-2 text-slate-300">task_alt</span>
          <p>Aucune évaluation en attente de validation.</p>
      </div>
      
      <div v-else class="divide-y divide-slate-100 dark:divide-slate-700">
        <div v-for="evalItem in pendingEvaluations" :key="evalItem._id" class="p-6 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
          <div class="flex flex-wrap md:flex-nowrap justify-between gap-4">
            <div class="flex-1">
               <div class="flex items-center gap-3 mb-2">
                   <span class="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">{{ evalItem.type }}</span>
                   <span class="text-sm text-slate-500">{{ formatDate(evalItem.date) }} • {{ evalItem.heureDebut }} - {{ evalItem.heureFin }}</span>
               </div>
               <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">{{ evalItem.titre }}</h3>
               <p class="text-sm text-slate-600 dark:text-slate-300 mb-2">
                   <span class="font-semibold text-primary">{{ evalItem.classe.niveau }} {{ evalItem.classe.section }}</span> 
                   • {{ evalItem.matiere.nom }} 
                   • Prof. {{ evalItem.professeur.prenom }} {{ evalItem.professeur.nom }}
               </p>
               <p v-if="evalItem.description" class="text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                   {{ evalItem.description }}
               </p>
            </div>
            
            <div class="flex flex-col gap-2 shrink-0 min-w-[140px]">
                <button @click="validate(evalItem._id, 'VALIDE')" class="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                    <span class="material-symbols-outlined text-lg">check</span> Valider
                </button>
                <button @click="reject(evalItem._id)" class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 font-bold rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <span class="material-symbols-outlined text-lg">close</span> Refuser
                </button>
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

const pendingEvaluations = ref([])

const fetchPending = async () => {
    try {
        const res = await api.getPendingEvaluations();
        pendingEvaluations.value = res.data.data;
    } catch (err) {
        console.error(err);
    }
}

onMounted(() => {
    fetchPending();
})

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

const validate = async (id, status) => {
    if(!confirm("Confirmer la validation ? Cela ajoutera l'évaluation au calendrier.")) return;
    try {
        await api.validateEvaluation(id, { statut: status });
        // Remove from list
        pendingEvaluations.value = pendingEvaluations.value.filter(e => e._id !== id);
        alert("Évaluation validée avec succès.");
    } catch (err) {
        console.error(err);
        alert("Erreur lors de la validation.");
    }
}

const reject = async (id) => {
    const reason = prompt("Motif du refus (optionnel):");
    if(reason === null) return;
    
    try {
        await api.validateEvaluation(id, { statut: 'REFUSE', commentaire: reason });
        pendingEvaluations.value = pendingEvaluations.value.filter(e => e._id !== id);
         alert("Évaluation refusée.");
    } catch (err) {
        console.error(err);
         alert("Erreur lors du refus.");
    }
}
</script>
