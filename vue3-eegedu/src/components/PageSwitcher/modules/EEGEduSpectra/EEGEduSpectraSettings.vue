<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">{{ settings.name }} Settings</h3>
    </div>
    <div class="card-section">
      <div class="range-slider">
        <label>Epoch duration (Sampling Points): {{ localSettings.duration }}</label>
        <input type="range" :min="128" :max="4096" :step="128" v-model.number="localSettings.duration" :disabled="status === 'Connect'" @change="updateSettings" />
      </div>
      <div class="range-slider">
        <label>Sampling points between epochs: {{ localSettings.interval }}</label>
        <input type="range" :min="10" :max="localSettings.duration" :step="5" v-model.number="localSettings.interval" :disabled="status === 'Connect'" @change="updateSettings" />
      </div>
      <div class="range-slider">
        <label>Cutoff Frequency Low: {{ localSettings.cutOffLow }} Hz</label>
        <input type="range" :min="0.01" :max="localSettings.cutOffHigh - 0.5" :step="0.5" v-model.number="localSettings.cutOffLow" :disabled="status === 'Connect'" @change="updateSettings" />
      </div>
      <div class="range-slider">
        <label>Cutoff Frequency High: {{ localSettings.cutOffHigh }} Hz</label>
        <input type="range" :min="localSettings.cutOffLow + 0.5" :max="128" :step="0.5" v-model.number="localSettings.cutOffHigh" :disabled="status === 'Connect'" @change="updateSettings" />
      </div>
      <div class="range-slider">
        <label>Slice FFT Lower limit: {{ localSettings.sliceFFTLow }} Hz</label>
        <input type="range" :min="1" :max="localSettings.sliceFFTHigh - 1" v-model.number="localSettings.sliceFFTLow" :disabled="status === 'Connect'" @change="updateSettings" />
      </div>
      <div class="range-slider">
        <label>Slice FFT Upper limit: {{ localSettings.sliceFFTHigh }} Hz</label>
        <input type="range" :min="localSettings.sliceFFTLow + 1" :max="128" v-model.number="localSettings.sliceFFTHigh" :disabled="status === 'Connect'" @change="updateSettings" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const emit = defineEmits(['update-settings'])
const localSettings = reactive({ ...props.settings })

watch(() => props.settings, (newVal) => {
  Object.assign(localSettings, newVal)
}, { deep: true })

function updateSettings() {
  emit('update-settings', { ...localSettings })
}
</script>
