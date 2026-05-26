<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Run ERP Experiment</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          Click the button to begin the oddball experiment. A series of circles will appear.
          Press spacebar when you see a RED circle. The experiment will run for {{ localSettings.secondsToSave }} seconds.
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
          <button class="btn" :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'" :disabled="status === 'Connect'" @click="runExperiment">
            Run Oddball Experiment
          </button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Press Spacebar when you see RED circle</h3>
          <button class="modal-close" @click="stopExperiment">&times;</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; justify-content: center; align-items: center; height: 300px; background: #1a1a2e; border-radius: 8px; position: relative;">
            <span style="color: red; font-size: 24px; position: absolute;">+</span>
            <div 
              v-if="showStimulus"
              :style="{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: isTarget ? '#e74c3c' : '#3498db'
              }"
            ></div>
          </div>
          <p style="margin-top: 16px;">Recording in progress. Data will download when complete.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { saveAs } from 'file-saver'
import { take, takeUntil } from 'rxjs/operators'
import { timer } from 'rxjs'
import { generateXTics } from '../utils/chartUtils'

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const showModal = ref(false)
const showStimulus = ref(false)
const isTarget = ref(false)
const localSettings = reactive({ ...props.settings })

let stimulusInterval = null
let keyHandler = null

function runExperiment() {
  showModal.value = true
  window.marker = 0
  window.responseMarker = 0
  
  // Setup keyboard handler
  keyHandler = (e) => {
    if (e.code === 'Space') {
      window.responseMarker = 100
      setTimeout(() => { window.responseMarker = 0 }, 50)
    }
  }
  document.addEventListener('keydown', keyHandler)
  
  // Start stimulus presentation
  stimulusInterval = setInterval(() => {
    const rand = Math.random()
    isTarget.value = rand < 0.2 // 20% targets
    window.marker = isTarget.value ? 20 : 10
    showStimulus.value = true
    
    setTimeout(() => {
      showStimulus.value = false
      window.marker = 0
    }, 200)
  }, 1000)
  
  startRecording()
}

function stopExperiment() {
  if (stimulusInterval) {
    clearInterval(stimulusInterval)
    stimulusInterval = null
  }
  if (keyHandler) {
    document.removeEventListener('keydown', keyHandler)
    keyHandler = null
  }
  showModal.value = false
}

function startRecording() {
  const dataToSave = []
  let localObservable$ = window.multicastEvoked$.pipe(take(1))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(
        "Timestamp (ms),Marker,SpaceBar,",
        generateXTics(x.info.samplingRate, x.data[0].length, false).map(f => "ch0_" + f + "ms") + ",",
        generateXTics(x.info.samplingRate, x.data[0].length, false).map(f => "ch1_" + f + "ms") + ",",
        "info\n"
      )
    }
  })

  const timer$ = timer(localSettings.secondsToSave * 1000)
  localObservable$ = window.multicastEvoked$.pipe(takeUntil(timer$))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(
        Date.now() + "," +
        window.marker + "," +
        window.responseMarker + "," +
        Object.values(x).join(",") + "\n"
      )
    },
    error(err) { console.log(err) },
    complete() {
      stopExperiment()
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `Evoked_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}

onUnmounted(() => {
  stopExperiment()
})
</script>
