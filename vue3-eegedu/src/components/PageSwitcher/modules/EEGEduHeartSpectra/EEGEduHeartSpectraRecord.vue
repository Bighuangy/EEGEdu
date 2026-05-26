<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Record {{ settings.name }} Data</h3>
    </div>
    <div class="card-section">
      <div class="stack">
        <div class="text-container">
          <p>
            Record the heart rate estimates over time. The peak frequency (heart rate) will be saved 
            for {{ settings.secondsToSave }} seconds.
          </p>
        </div>
        <div class="range-slider">
          <label>Recording Length: {{ localSettings.secondsToSave }} Seconds</label>
          <input 
            type="range" 
            :min="2" 
            :max="180" 
            v-model.number="localSettings.secondsToSave"
            :disabled="status === 'Connect'"
            @change="updateSettings"
          />
        </div>
        <div class="btn-group">
          <button 
            class="btn"
            :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'"
            :disabled="status === 'Connect'"
            @click="saveToCSV"
          >
            Save to CSV
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Recording Data</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>Your data is currently recording. Once complete it will be downloaded as a .csv file.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { saveAs } from 'file-saver'
import { takeUntil } from 'rxjs/operators'
import { timer } from 'rxjs'
import { indexOfMax } from '../utils/chartUtils'

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const emit = defineEmits(['update-settings'])

const showModal = ref(false)
const localSettings = reactive({ ...props.settings })

function updateSettings() {
  emit('update-settings', { secondsToSave: localSettings.secondsToSave })
}

function saveToCSV() {
  console.log('Saving ' + localSettings.secondsToSave + ' seconds...')
  showModal.value = true
  
  const dataToSave = []
  dataToSave.push("Timestamp (ms),HeartRate (BPM)\n")

  const timer$ = timer(localSettings.secondsToSave * 1000)
  const localObservable$ = window.multicastHeartSpectra$.pipe(takeUntil(timer$))

  localObservable$.subscribe({
    next(x) {
      const peakInd = indexOfMax(x.psd[1])
      const peakF = x.freqs[peakInd] * 60
      dataToSave.push(Date.now() + "," + peakF + "\n")
    },
    error(err) { console.log(err) },
    complete() {
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `HeartSpectra_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}
</script>
