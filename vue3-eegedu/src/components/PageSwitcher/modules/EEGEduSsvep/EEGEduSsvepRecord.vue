<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Record {{ settings.name }} Data</h3>
    </div>
    <div class="card-section">
      <div class="stack">
        <div class="range-slider">
          <label>Recording Length: {{ localSettings.secondsToSave }} Seconds</label>
          <input type="range" :min="2" :max="180" v-model.number="localSettings.secondsToSave" :disabled="status === 'Connect'" />
        </div>
        <div class="btn-group">
          <button class="btn" :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'" :disabled="status === 'Connect'" @click="saveToCSV('Slow')">
            Record Slow Frequency Data
          </button>
          <button class="btn" :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'" :disabled="status === 'Connect'" @click="saveToCSV('Fast')">
            Record Fast Frequency Data
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Recording {{ currentCondition }} Frequency Data</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div ref="flashContainer" style="width: 300px; height: 300px; margin: 0 auto; border-radius: 8px;"></div>
          <p style="margin-top: 16px;">Stare at the flashing square. Recording in progress.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { saveAs } from 'file-saver'
import { take, takeUntil } from 'rxjs/operators'
import { timer } from 'rxjs'

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const showModal = ref(false)
const currentCondition = ref('')
const flashContainer = ref(null)
const localSettings = reactive({ ...props.settings })
let flashInterval = null

function saveToCSV(condition) {
  currentCondition.value = condition
  showModal.value = true
  
  // Start flashing
  const frequency = condition === 'Slow' ? 5 : 10 // Hz
  const interval = 1000 / (frequency * 2)
  let isOn = true
  
  setTimeout(() => {
    if (flashContainer.value) {
      flashInterval = setInterval(() => {
        flashContainer.value.style.backgroundColor = isOn ? '#ffffff' : '#000000'
        isOn = !isOn
      }, interval)
    }
  }, 100)

  startRecording(condition)
}

function startRecording(condition) {
  const dataToSave = []
  let localObservable$ = window.multicastSsvep$.pipe(take(1))

  localObservable$.subscribe({
    next(x) {
      const freqs = Object.values(x.freqs)
      dataToSave.push(
        "Timestamp (ms),",
        freqs.map(f => "ch0_" + f + "Hz") + ",",
        freqs.map(f => "ch1_" + f + "Hz") + ",",
        freqs.map(f => "ch2_" + f + "Hz") + ",",
        freqs.map(f => "ch3_" + f + "Hz") + ",",
        "info\n"
      )
    }
  })

  const timer$ = timer(localSettings.secondsToSave * 1000)
  localObservable$ = window.multicastSsvep$.pipe(takeUntil(timer$))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(Date.now() + "," + Object.values(x).join(",") + "\n")
    },
    error(err) { console.log(err) },
    complete() {
      if (flashInterval) {
        clearInterval(flashInterval)
        flashInterval = null
      }
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `Ssvep_${condition}_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}

onUnmounted(() => {
  if (flashInterval) {
    clearInterval(flashInterval)
  }
})
</script>
