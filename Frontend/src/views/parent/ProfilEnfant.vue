<template>
  <StudentProfile 
    :student-id="childId"
    view-mode="parent"
    :can-edit="true"
    :show-back-button="true"
    back-button-text="Retour à la liste des enfants"
  />
</template>

<script setup>
import { useRoute } from 'vue-router'
import StudentProfile from '@/components/common/StudentProfile.vue'

const route = useRoute()
const childId = route.params.id
</script>
