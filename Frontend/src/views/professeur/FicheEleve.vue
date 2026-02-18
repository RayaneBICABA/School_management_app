<template>
  <StudentProfile 
    v-if="eleveId"
    :student-id="eleveId"
    view-mode="professeur"
    :can-edit="false"
    :show-back-button="true"
    back-button-text="Retour à la liste des élèves"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import StudentProfile from '@/components/common/StudentProfile.vue'

const route = useRoute()
const eleveId = computed(() => route.params.eleveId)
</script>
