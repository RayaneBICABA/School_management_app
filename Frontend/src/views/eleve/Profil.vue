<template>
  <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
  <StudentProfile 
    v-else
    :student-id="currentUserId"
    view-mode="eleve"
    :can-edit="true"
    :show-back-button="false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StudentProfile from '@/components/common/StudentProfile.vue'
import api from '@/services/api'

const currentUserId = ref('')
const isLoading = ref(true)

// Get current user ID from API when component mounts
onMounted(async () => {
  try {
    const res = await api.getMe()
    if (res.data.success) {
      currentUserId.value = res.data.data._id
    }
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'ID utilisateur:', err)
    // For demo purposes, use a fallback ID
    currentUserId.value = 'demo-student-id'
  } finally {
    isLoading.value = false
  }
})
</script>
