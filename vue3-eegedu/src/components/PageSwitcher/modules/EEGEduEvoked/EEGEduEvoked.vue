<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Event-Related Potential (ERP) Experiment</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          Event-related potentials (ERPs) are brain responses that are time-locked to specific events or stimuli.
          In this oddball experiment, you will see a series of circles - most are blue (standards), 
          but some are red (targets).
        </p>
        <p>
          Your task is to press spacebar or tap the screen when you see a RED circle, 
          as quickly as possible. The EEG data is recorded along with markers for stimuli and responses.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: { type: Object, required: true }
})
</script>
