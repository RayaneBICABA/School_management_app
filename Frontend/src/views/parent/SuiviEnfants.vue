<template>
  <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="max-w-5xl mx-auto py-8 px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Suivi de Mes Enfants</h1>
        <p class="text-slate-500 dark:text-slate-400">Consultez le profil complet et le suivi de chacun de vos enfants</p>
      </div>

      <!-- Children Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="child in children" :key="child.id" class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
          <!-- Child Header -->
          <div class="p-6 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center gap-4">
              <div class="bg-center bg-no-repeat aspect-square bg-cover rounded-xl w-16 h-16 border-2 border-primary/10" :style="`background-image: url('${child.avatar}')`"></div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ child.name }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ child.class }} — {{ child.filiere }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <span class="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Actif</span>
                  <span class="text-xs text-slate-400">Matricule: {{ child.matricule }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 bg-slate-50 dark:bg-slate-800/50">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-lg font-bold text-primary">{{ child.average || '-' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Moyenne</p>
              </div>
              <div>
                <p class="text-lg font-bold text-green-600">{{ child.attendance || '-' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Assiduité</p>
              </div>
              <div>
                <p class="text-lg font-bold text-orange-500">{{ child.absences || '-' }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Absences</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-4 flex gap-2">
            <button @click="viewProfile(child.id)" class="flex-1 flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-md hover:bg-blue-600 transition-all">
              <span class="material-symbols-outlined text-lg">person</span>
              <span>Voir le profil</span>
            </button>
            <button @click="sendMessage(child)" class="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
              <span class="material-symbols-outlined text-lg">mail</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Add Child Button -->
      <div class="mt-8 flex justify-center">
        <button @click="showAddModal = true" class="flex items-center gap-2 rounded-lg h-12 px-6 border-2 border-dashed border-primary/40 text-primary font-bold hover:bg-primary/5 transition-colors">
          <span class="material-symbols-outlined text-xl">add_circle</span>
          <span>Ajouter un enfant</span>
        </button>
      </div>
    </div>
    <!-- Add Child Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-800">
            <h3 class="text-xl font-bold mb-4">Ajouter un enfant</h3>
            <p class="text-sm text-slate-500 mb-4">Entrez le matricule de votre enfant pour le lier à votre compte.</p>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Matricule</label>
                    <input v-model="matriculeToAdd" type="text" class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: 2023-XY-1234">
                </div>
                
                <div class="flex gap-3 justify-end mt-6">
                    <button @click="showAddModal = false" class="px-4 py-2 rounded-lg text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">Annuler</button>
                    <button @click="submitAddChild" :disabled="isLoading" class="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2">
                        <span v-if="isLoading" class="material-symbols-outlined animate-spin text-sm">sync</span>
                        Ajouter
                    </button>
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
import { useToast } from '@/composables/useToast'

const router = useRouter()
const { toastSuccess, toastError } = useToast()

const children = ref([])
const showAddModal = ref(false)
const matriculeToAdd = ref('')
const isLoading = ref(false)

// Fetch children
const fetchChildren = async () => {
    try {
        const res = await api.getChildren();
        children.value = res.data.data.map(child => ({
            id: child._id,
            name: `${child.prenom} ${child.nom}`,
            class: child.classe ? `${child.classe.niveau} ${child.classe.section}` : 'Sans classe',
            filiere: child.classe ? child.classe.filiere : '-',
            matricule: child.matricule,
            avatar: child.photo === 'no-photo.jpg' 
                ? 'https://ui-avatars.com/api/?name=' + child.prenom + '+' + child.nom + '&background=random' 
                : '/uploads/' + child.photo,
            // Mock stats for now as backend aggregate is complex
            average: '-',
            attendance: '-', 
            absences: '-'
        }));
    } catch (error) {
        console.error(error);
    }
};

// Add Child
const submitAddChild = async () => {
    if (!matriculeToAdd.value) return;
    
    isLoading.value = true;
    try {
        await api.addChild(matriculeToAdd.value);
        toastSuccess('Enfant ajouté avec succès');
        matriculeToAdd.value = '';
        showAddModal.value = false;
        fetchChildren();
    } catch (error) {
        // Error handled by interceptor
    } finally {
        isLoading.value = false;
    }
};

const viewProfile = (childId) => {
  router.push(`/parent/enfants/${childId}`)
}

const sendMessage = (child) => {
  router.push('/parent/notifications');
}

onMounted(fetchChildren);
</script>
