<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Record {{ settings.name }} Data</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          Record two sessions: one with eyes open and one with eyes closed. 
          A fixation cross will appear during recording.
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
          <button class="btn" :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'" :disabled="status === 'Connect' || showModal" @click="saveToCSV('Closed')">
            Record Eyes Closed Data
          </button>
          <button class="btn" :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'" :disabled="status === 'Connect' || showModal" @click="saveToCSV('Open')">
            Record Eyes Open Data
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Recording {{ currentCondition }} Data</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; justify-content: center; align-items: center; height: 200px; background: #1a1a2e; border-radius: 8px;">
            <span style="color: red; font-size: 48px;">+</span>
          </div>
          <p style="margin-top: 16px;">Recording in progress. Close this window when download completes.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { saveAs } from 'file-saver'
import { take, takeUntil } from 'rxjs/operators'
import { timer } from 'rxjs'

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const showModal = ref(false)
const currentCondition = ref('')
const localSettings = reactive({ ...props.settings })

function saveToCSV(condition) {
  console.log('Saving ' + localSettings.secondsToSave + ' seconds...')
  currentCondition.value = condition
  
  setTimeout(() => {
    showModal.value = true
    startRecording(condition)
  }, 2000)
}

function startRecording(condition) {
  const dataToSave = []
  let localObservable$ = window.multicastAlpha$.pipe(take(1))

  localObservable$.subscribe({
    next(x) {
      const freqs = Object.values(x.freqs)
      dataToSave.push(
        "Timestamp (ms),",
        freqs.map(f => "ch0_" + f + "Hz") + ",",
        freqs.map(f => "ch1_" + f + "Hz") + ",",
        freqs.map(f => "ch2_" + f + "Hz") + ",",
        freqs.map(f => "ch3_" + f + "Hz") + ",",
        freqs.map(f => "chAux_" + f + "Hz") + ",",
        "info\n"
      )
    }
  })

  const timer$ = timer(localSettings.secondsToSave * 1000)
  localObservable$ = window.multicastAlpha$.pipe(takeUntil(timer$))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(Date.now() + "," + Object.values(x).join(",") + "\n")
    },
    error(err) { console.log(err) },
    complete() {
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `Alpha_${condition}_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}
</script>
