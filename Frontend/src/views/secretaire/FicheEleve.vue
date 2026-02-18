<template>
  <StudentProfile 
    :student-id="studentId"
    view-mode="secretaire"
    :can-edit="true"
    :show-back-button="true"
    back-button-text="Retour à la liste des élèves"
  />
</template>

<script setup>
import { useRoute } from 'vue-router'
import StudentProfile from '@/components/common/StudentProfile.vue'

const route = useRoute()
const studentId = route.params.id
</script>
