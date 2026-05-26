<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Record {{ settings.name }} Data</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          When recording raw data, it is recommended to first set the sampling points between epochs to 1, 
          then set the epoch duration to 1. This will make each row of the output file a single time point.
        </p>
      </div>
    </div>
    <div class="card-section">
      <div class="stack">
        <div class="range-slider">
          <label>Recording Length: {{ localSettings.secondsToSave }} Seconds</label>
          <input type="range" :min="2" :max="180" v-model.number="localSettings.secondsToSave" :disabled="status === 'Connect'" />
        </div>
        <div class="btn-group">
          <button class="btn" :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'" :disabled="status === 'Connect'" @click="saveToCSV">
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

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const emit = defineEmits(['update-settings'])

const showModal = ref(false)
const localSettings = reactive({ ...props.settings })

function saveToCSV() {
  console.log('Saving ' + localSettings.secondsToSave + ' seconds...')
  showModal.value = true

  const dataToSave = []
  dataToSave.push("Timestamp (ms),ch0,ch1,ch2,ch3,chAux\n")

  const timer$ = timer(localSettings.secondsToSave * 1000)
  const localObservable$ = window.multicastRaw$.pipe(takeUntil(timer$))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(Date.now() + "," + Object.values(x.data).map(ch => ch.join(';')).join(",") + "\n")
    },
    error(err) { console.log(err) },
    complete() {
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `Raw_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}
</script>
