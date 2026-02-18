<template>
  <div class="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
    <div class="max-w-4xl mx-auto py-8 px-8">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <span class="material-symbols-outlined text-6xl text-primary animate-spin mb-4">sync</span>
        <p class="text-slate-500 dark:text-slate-400">Chargement des informations...</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header -->
        <div class="mb-6">
          <button @click="goBack" class="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group mb-4">
            <span class="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span class="font-medium">Retour au profil</span>
          </button>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Modifier les informations de {{ childProfile.name }}</h1>
          <p class="text-slate-500 dark:text-slate-400">Complétez ou mettez à jour les informations personnelles de votre enfant</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveChanges" class="space-y-8">
          <!-- Personal Information -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-primary">person</span>
              Informations Personnelles
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Prénom</label>
                <input v-model="formData.prenom" type="text" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Prénom de l'enfant" required>
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Nom</label>
                <input v-model="formData.nom" type="text" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Nom de l'enfant" required>
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Date de naissance</label>
                <input v-model="formData.dateNaissance" type="date" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3">
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Lieu de naissance</label>
                <input v-model="formData.lieuNaissance" type="text" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Ville, Pays">
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Téléphone</label>
                <input v-model="formData.telephone" type="tel" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="+221 77 000 00 00">
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Email personnel</label>
                <input v-model="formData.email" type="email" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="email@exemple.com">
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-red-500">medical_services</span>
              Informations Médicales
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Groupe sanguin</label>
                <select v-model="formData.groupeSanguin" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3">
                  <option value="">Non spécifié</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Allergies</label>
                <input v-model="formData.allergies" type="text" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Aucune connue">
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Médicaments en cours</label>
                <input v-model="formData.medicaments" type="text" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Aucun">
              </div>
              
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Langue maternelle</label>
                <select v-model="formData.langueMaternelle" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3">
                  <option value="Français">Français</option>
                  <option value="Wolof">Wolof</option>
                  <option value="Arabe">Arabe</option>
                  <option value="Anglais">Anglais</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-blue-500">home</span>
              Adresse et Contact
            </h2>
            
            <div class="space-y-4">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse complète</label>
                <textarea v-model="formData.adresse" rows="3" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Numéro, rue, ville..."></textarea>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Personne à contacter en cas d'urgence</label>
                  <input v-model="formData.contactUrgenceNom" type="text" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="Nom complet">
                </div>
                
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Téléphone d'urgence</label>
                  <input v-model="formData.contactUrgenceTel" type="tel" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3" placeholder="+221 77 000 00 00">
                </div>
                
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Relation avec l'enfant</label>
                  <select v-model="formData.contactUrgenceRelation" class="rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary px-4 py-3">
                    <option value="">Sélectionner...</option>
                    <option value="Père">Père</option>
                    <option value="Mère">Mère</option>
                    <option value="Tuteur">Tuteur/Tutrice</option>
                    <option value="Grand-parent">Grand-parent</option>
                    <option value="Oncle/Tante">Oncle/Tante</option>
                    <option value="Frère/Sœur">Frère/Sœur majeur(e)</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-4">
            <button type="button" @click="goBack" class="px-6 py-3 rounded-lg text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Annuler
            </button>
            <button type="submit" :disabled="isSaving" class="px-6 py-3 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              <span v-if="isSaving" class="material-symbols-outlined animate-spin text-sm">sync</span>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'
import { useToast } from '@/composables/useToast'

const router = useRouter()
const route = useRoute()
const { toastSuccess, toastError } = useToast()

const isLoading = ref(true)
const isSaving = ref(false)

// Formulaire de données
const formData = ref({
  prenom: '',
  nom: '',
  dateNaissance: '',
  lieuNaissance: '',
  telephone: '',
  email: '',
  groupeSanguin: '',
  allergies: '',
  medicaments: '',
  langueMaternelle: 'Français',
  adresse: '',
  contactUrgenceNom: '',
  contactUrgenceTel: '',
  contactUrgenceRelation: ''
})

// Profil de l'enfant
const childProfile = ref({
  _id: '',
  name: ''
})

// Charger les données actuelles de l'enfant
const fetchChildData = async () => {
  try {
    isLoading.value = true
    const childId = route.params.id
    
    const res = await api.getChild(childId)
    const child = res.data.data
    
    childProfile.value = {
      _id: child._id,
      name: `${child.prenom} ${child.nom}`
    }
    
    // Pré-remplir le formulaire avec les données existantes
    formData.value = {
      prenom: child.prenom || '',
      nom: child.nom || '',
      dateNaissance: child.dateNaissance ? new Date(child.dateNaissance).toISOString().split('T')[0] : '',
      lieuNaissance: child.lieuNaissance || '',
      telephone: child.telephone || '',
      email: child.email || '',
      groupeSanguin: child.groupeSanguin || '',
      allergies: child.allergies || '',
      medicaments: child.medicaments || '',
      langueMaternelle: child.langueMaternelle || 'Français',
      adresse: child.adresse || '',
      contactUrgenceNom: child.contactUrgenceNom || '',
      contactUrgenceTel: child.contactUrgenceTel || '',
      contactUrgenceRelation: child.contactUrgenceRelation || ''
    }
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    toastError('Erreur lors du chargement des informations de l\'enfant')
  } finally {
    isLoading.value = false
  }
}

// Sauvegarder les modifications
const saveChanges = async () => {
  try {
    isSaving.value = true
    
    const updateData = {
      ...formData.value,
      // Convertir la date si nécessaire
      dateNaissance: formData.value.dateNaissance ? new Date(formData.value.dateNaissance) : null
    }
    
    await api.updateChild(childProfile.value._id, updateData)
    toastSuccess('Informations mises à jour avec succès')
    
    // Rediriger vers le profil
    router.push(`/parent/enfants/${childProfile.value._id}`)
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    toastError('Erreur lors de la mise à jour des informations')
  } finally {
    isSaving.value = false
  }
}

const goBack = () => {
  router.go(-1)
}

onMounted(() => {
  fetchChildData()
})
</script>
