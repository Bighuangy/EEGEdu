<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Collect Raw Heart Rate Data</h3>
    </div>
    <div class="card-section">
      <div class="stack">
        <div class="text-container">
          <p>
            Clicking this button will immediately record a 10 second long segment of data just like it is shown in the plot above.
            Make sure the chart above looks clean and you can see your heart beat clearly before pressing record.
          </p>
        </div>
        <div class="btn-group">
          <button 
            class="btn"
            :class="status !== 'Connect' ? 'btn-primary' : 'btn-default'"
            :disabled="status === 'Connect'"
            @click="saveToCSV"
          >
            Record Raw ECG Data
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Data is recording</h3>
          <button class="modal-close" @click="showModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Your data is currently recording, once complete it will be downloaded as a .csv file 
            and can be opened with your favorite spreadsheet program.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { saveAs } from 'file-saver'
import { take } from 'rxjs/operators'
import { generateXTics } from '../utils/chartUtils'

const props = defineProps({
  settings: { type: Object, required: true },
  status: { type: String, required: true }
})

const showModal = ref(false)

function saveToCSV() {
  console.log('Saving HeartRaw data...')
  showModal.value = true
  
  const dataToSave = []
  let localObservable$ = window.multicastHeartRaw$.pipe(take(1))
  
  localObservable$.subscribe({
    next(x) {
      dataToSave.push(
        generateXTics(x.info.samplingRate, x.data[0].length, false).map(t => t) + ",",
        "\n"
      )
    }
  })

  localObservable$ = window.multicastHeartRaw$.pipe(take(1))

  localObservable$.subscribe({
    next(x) {
      dataToSave.push(Object.values(x.data[1]).join(",") + "\n")
    },
    error(err) { console.log(err) },
    complete() {
      console.log('Trying to save')
      const blob = new Blob(dataToSave, { type: "text/plain;charset=utf-8" })
      saveAs(blob, `HeartRaw_Recording_${Date.now()}.csv`)
      console.log('Completed')
    }
  })
}
</script>
