<template>
  <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
      <h3 class="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span class="material-symbols-outlined text-primary">admin_panel_settings</span>
        Administration
      </h3>
    </div>
    <div class="p-6 space-y-8">
      <!-- Administrative Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">assignment_ind</span>
            Statut Administratif
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Statut scolaire</span>
              <select v-if="canEdit" v-model="adminData.schoolStatus" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
                <option value="GRADUÉ">Diplômé</option>
                <option value="TRANSFÉRÉ">Transféré</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
              <span v-else class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ adminData.schoolStatus }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Date d'inscription</span>
              <input v-if="canEdit" v-model="adminData.enrollmentDate" type="date" class="text-sm border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-800">
              <span v-else class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ formatDate(adminData.enrollmentDate) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Numéro d'inscription</span>
              <span class="text-sm font-medium text-slate-900 dark:text-slate-200 font-mono">{{ adminData.enrollmentNumber || 'Non assigné' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-slate-600 dark:text-slate-400">Redoublant</span>
              <label v-if="canEdit" class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="adminData.repeating" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span v-else class="text-sm font-medium text-slate-900 dark:text-slate-200">{{ adminData.repeating ? 'Oui' : 'Non' }}</span>
            </div>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <h4 class="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">payments</span>
            Situation Financière
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-700 dark:text-blue-300">Frais de scolarité</span>
              <span class="text-sm font-bold text-blue-900 dark:text-blue-100">{{ formatCurrency(adminData.tuitionFees) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-700 dark:text-blue-300">Montant payé</span>
              <span class="text-sm font-bold text-green-600 dark:text-green-400">{{ formatCurrency(adminData.amountPaid) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-blue-700 dark:text-blue-300">Solde dû</span>
              <span class="text-sm font-bold" :class="adminData.balance > 0 ? 'text-red-600' : 'text-green-600'">{{ formatCurrency(adminData.balance) }}</span>
            </div>
            <div class="w-full bg-blue-200 dark:bg-blue-800 h-2 rounded-full overflow-hidden mt-2">
              <div class="bg-green-500 h-full transition-all duration-300" :style="`width: ${paymentPercentage}%`"></div>
            </div>
            <div class="text-xs text-blue-600 dark:text-blue-400 text-center">{{ paymentPercentage }}% payé</div>
          </div>
        </div>
      </div>

      <!-- Academic History -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Historique Académique</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th class="px-4 py-3">Année Scolaire</th>
                <th class="px-4 py-3">Classe</th>
                <th class="px-4 py-3">Établissement</th>
                <th class="px-4 py-3">Moyenne</th>
                <th class="px-4 py-3">Décision</th>
                <th class="px-4 py-3" v-if="canEdit">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              <tr v-for="record in academicHistory" :key="record.id" class="text-sm hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-4 py-4 font-medium">{{ record.year }}</td>
                <td class="px-4 py-4">{{ record.class }}</td>
                <td class="px-4 py-4 text-slate-500">{{ record.school }}</td>
                <td class="px-4 py-4">
                  <span class="font-bold" :class="getGradeColor(record.average)">{{ record.average }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" :class="getDecisionClass(record.decision)">
                    {{ record.decision }}
                  </span>
                </td>
                <td class="px-4 py-4" v-if="canEdit">
                  <button @click="editAcademicRecord(record)" class="text-slate-400 hover:text-primary">
                    <span class="material-symbols-outlined">edit</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Scholarships & Aid -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-bold text-slate-900 dark:text-white">Bourses & Aides</h4>
          <button v-if="canEdit" @click="addScholarship" class="text-sm font-bold text-primary hover:underline">
            + Ajouter une bourse
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="scholarship in scholarships" :key="scholarship.id" class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h5 class="text-sm font-bold text-green-900 dark:text-green-100">{{ scholarship.name }}</h5>
                <p class="text-xs text-green-700 dark:text-green-300">{{ scholarship.type }}</p>
              </div>
              <span class="inline-block px-2 py-0.5 rounded text-xs font-semibold" :class="getScholarshipStatusClass(scholarship.status)">
                {{ scholarship.status }}
              </span>
            </div>
            <div class="space-y-1 text-xs text-green-700 dark:text-green-300">
              <div class="flex justify-between">
                <span>Montant:</span>
                <span class="font-bold">{{ formatCurrency(scholarship.amount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Période:</span>
                <span>{{ scholarship.period }}</span>
              </div>
              <div class="flex justify-between">
                <span>Renouvellement:</span>
                <span>{{ formatDate(scholarship.renewalDate) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Administrative Actions -->
      <div>
        <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Actions Administratives</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button v-for="action in adminActions" :key="action.id" @click="action.handler" :disabled="!canEdit && action.requiresEdit" class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="material-symbols-outlined text-2xl mb-2" :class="action.color">{{ action.icon }}</span>
            <h5 class="text-sm font-bold text-slate-900 dark:text-white mb-1">{{ action.title }}</h5>
            <p class="text-xs text-slate-500">{{ action.description }}</p>
          </button>
        </div>
      </div>

      <!-- Notes & Observations -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">note</span>
            Notes Administratives
          </h4>
          <div v-if="canEdit" class="mb-3">
            <textarea v-model="newAdminNote" class="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-900" rows="3" placeholder="Ajouter une note..."></textarea>
            <button @click="addAdminNote" class="mt-2 px-3 py-1 bg-primary text-white text-xs rounded hover:bg-blue-600">Ajouter</button>
          </div>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div v-for="note in adminNotes" :key="note.id" class="p-2 bg-white dark:bg-slate-900 rounded text-xs">
              <div class="flex justify-between items-start mb-1">
                <span class="font-medium text-slate-700 dark:text-slate-300">{{ note.author }}</span>
                <span class="text-slate-500">{{ formatDate(note.date) }}</span>
              </div>
              <p class="text-slate-600 dark:text-slate-400">{{ note.text }}</p>
            </div>
          </div>
        </div>

        <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <h4 class="text-sm font-bold text-orange-900 dark:text-orange-100 mb-3 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">flag</span>
            Signalements & Alertes
          </h4>
          <div class="space-y-2">
            <div v-for="alert in administrativeAlerts" :key="alert.id" class="p-2 bg-white dark:bg-slate-900 rounded border border-orange-200 dark:border-orange-800">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-xs font-medium text-orange-800 dark:text-orange-200">{{ alert.title }}</p>
                  <p class="text-xs text-orange-600 dark:text-orange-400">{{ alert.description }}</p>
                </div>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="getAlertSeverityClass(alert.severity)">
                  {{ alert.severity }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '@/services/api'

defineProps({
  studentId: {
    type: String,
    required: true
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const adminData = ref({
  schoolStatus: 'ACTIF',
  enrollmentDate: '2023-09-01',
  enrollmentNumber: 'E2023-001',
  repeating: false,
  tuitionFees: 250000,
  amountPaid: 200000,
  balance: 50000
})

const academicHistory = ref([
  {
    id: 1,
    year: '2023-2024',
    class: '3ème B',
    school: 'Lycée Moderne',
    average: 13.5,
    decision: 'Admis'
  },
  {
    id: 2,
    year: '2022-2023',
    class: '4ème A',
    school: 'Lycée Moderne',
    average: 12.8,
    decision: 'Admis'
  },
  {
    id: 3,
    year: '2021-2022',
    class: '5ème C',
    school: 'Collège Excellence',
    average: 11.2,
    decision: 'Admis'
  }
])

const scholarships = ref([
  {
    id: 1,
    name: 'Bourse d\'excellence',
    type: 'Mérite',
    amount: 50000,
    period: 'Annuel',
    status: 'Actif',
    renewalDate: '2024-09-01'
  },
  {
    id: 2,
    name: 'Aide sociale',
    type: 'Social',
    amount: 30000,
    period: 'Semestriel',
    status: 'En attente',
    renewalDate: '2024-02-01'
  }
])

const adminActions = ref([
  {
    id: 1,
    title: 'Générer certificat',
    description: 'Certificat de scolarité',
    icon: 'description',
    color: 'text-blue-500',
    requiresEdit: false,
    handler: () => generateCertificate()
  },
  {
    id: 2,
    title: 'Transférer élève',
    description: 'Changer d\'établissement',
    icon: 'swap_horiz',
    color: 'text-orange-500',
    requiresEdit: true,
    handler: () => transferStudent()
  },
  {
    id: 3,
    title: 'Mettre à jour frais',
    description: 'Modifier les frais de scolarité',
    icon: 'payments',
    color: 'text-green-500',
    requiresEdit: true,
    handler: () => updateFees()
  },
  {
    id: 4,
    title: 'Imprimer dossier',
    description: 'Dossier complet élève',
    icon: 'print',
    color: 'text-purple-500',
    requiresEdit: false,
    handler: () => printFolder()
  },
  {
    id: 5,
    title: 'Archiver dossier',
    description: 'Archivage administratif',
    icon: 'archive',
    color: 'text-slate-500',
    requiresEdit: true,
    handler: () => archiveFolder()
  },
  {
    id: 6,
    title: 'Envoyer notification',
    description: 'Aux parents/professeurs',
    icon: 'notifications',
    color: 'text-red-500',
    requiresEdit: false,
    handler: () => sendNotification()
  }
])

const adminNotes = ref([
  {
    id: 1,
    author: 'Admin Système',
    text: 'Élève inscrit pour l\'année 2023-2024',
    date: '2023-09-01'
  },
  {
    id: 2,
    author: 'Secrétaire',
    text: 'Documents complets reçus',
    date: '2023-09-05'
  }
])

const administrativeAlerts = ref([
  {
    id: 1,
    title: 'Frais impayés',
    description: 'Solde de 50,000 FCFA',
    severity: 'Moyen'
  },
  {
    id: 2,
    title: 'Document expiré',
    description: 'Certificat médical à renouveler',
    severity: 'Faible'
  }
])

const newAdminNote = ref('')

const paymentPercentage = computed(() => {
  if (adminData.value.tuitionFees === 0) return 0
  return Math.round((adminData.value.amountPaid / adminData.value.tuitionFees) * 100)
})

const formatDate = (dateString) => {
  if (!dateString) return '--'
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0
  }).format(amount)
}

const getGradeColor = (grade) => {
  if (typeof grade !== 'number') return 'text-slate-600'
  if (grade >= 16) return 'text-green-600'
  if (grade >= 14) return 'text-blue-600'
  if (grade >= 12) return 'text-yellow-600'
  if (grade >= 10) return 'text-orange-600'
  return 'text-red-600'
}

const getDecisionClass = (decision) => {
  const classes = {
    'Admis': 'bg-green-100 text-green-700',
    'Admis avec mention': 'bg-blue-100 text-blue-700',
    'Conditionnel': 'bg-orange-100 text-orange-700',
    'Redoublant': 'bg-red-100 text-red-700',
    'Exclu': 'bg-red-100 text-red-700'
  }
  return classes[decision] || 'bg-slate-100 text-slate-700'
}

const getScholarshipStatusClass = (status) => {
  const classes = {
    'Actif': 'bg-green-100 text-green-700',
    'En attente': 'bg-orange-100 text-orange-700',
    'Expiré': 'bg-red-100 text-red-700',
    'Suspendu': 'bg-slate-100 text-slate-700'
  }
  return classes[status] || 'bg-slate-100 text-slate-700'
}

const getAlertSeverityClass = (severity) => {
  const classes = {
    'Élevé': 'bg-red-100 text-red-700',
    'Moyen': 'bg-orange-100 text-orange-700',
    'Faible': 'bg-yellow-100 text-yellow-700'
  }
  return classes[severity] || 'bg-slate-100 text-slate-700'
}

const generateCertificate = () => {
  console.log('Générer certificat')
  alert('Génération du certificat en cours (mode démo)')
}

const transferStudent = () => {
  console.log('Transférer élève')
  alert('Transfert d\'élève en cours (mode démo)')
}

const updateFees = () => {
  console.log('Mettre à jour les frais')
  alert('Mise à jour des frais en cours (mode démo)')
}

const printFolder = () => {
  console.log('Imprimer dossier')
  alert('Impression du dossier en cours (mode démo)')
}

const archiveFolder = () => {
  console.log('Archiver dossier')
  alert('Archivage du dossier en cours (mode démo)')
}

const sendNotification = () => {
  console.log('Envoyer notification')
  alert('Envoi de notification en cours (mode démo)')
}

const addScholarship = () => {
  console.log('Ajouter une bourse')
  alert('Ajout de bourse en cours (mode démo)')
}

const editAcademicRecord = (record) => {
  console.log('Modifier l\'enregistrement académique:', record)
  alert(`Modification de: ${record.year} - ${record.class}`)
}

const addAdminNote = () => {
  if (!newAdminNote.value.trim()) return
  
  adminNotes.value.unshift({
    id: Date.now(),
    author: 'Utilisateur actuel',
    text: newAdminNote.value,
    date: new Date().toISOString().split('T')[0]
  })
  
  newAdminNote.value = ''
}

onMounted(() => {
  // Load admin data if needed
})
</script>
