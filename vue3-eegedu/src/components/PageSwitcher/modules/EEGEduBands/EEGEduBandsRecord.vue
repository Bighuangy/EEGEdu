<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Record Data</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          Record frequency band power to compare eyes open vs. eyes closed conditions. 
          We expect alpha power to be higher when eyes are closed.
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

const showModal = ref(false)
const localSettings = reactive({ ...props.settings })

function saveToCSV() {
  console.log('Saving ' + localSettings.secondsToSave + ' seconds...')
  showModal.value = true

  const dataToSave = []
  dataToSave.push(
    "Timestamp (ms),",
    "delta0,delta1,delta2,delta3,deltaAux,",
    "theta0,theta1,theta2,theta3,thetaAux,",
    "alpha0,alpha1,alpha2,alpha3,alphaAux,",
    "beta0,beta1,beta2,beta3,betaAux,",
    "gamma0,gamma1,gamma2,gamma3,gammaAux\n"
  )

  const timer$ = timer(localSettings.secondsToSave * 1000)
  const localObservable$ = window.multicastBands$.pipe(takeUntil(timer$))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(Date.now() + "," + Object.values(x).join(",") + "\n")
    },
    error(err) { console.log(err) },
    complete() {
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `Bands_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}
</script>
