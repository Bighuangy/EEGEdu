<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Spectrogram (Spectra Over Time)</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          A spectrogram shows how the frequency content of a signal changes over time. 
          The vertical axis represents frequency, the horizontal axis represents time, 
          and the color intensity represents power at each frequency-time point.
        </p>
      </div>
    </div>
    <div class="card-section">
      <div class="p5-container">
        <div v-if="hasData">
          <p>{{ minFreq }} Hz</p>
          <canvas ref="spectroCanvas" width="400" height="200" style="border: 1px solid #ddd; border-radius: 4px;"></canvas>
          <p>{{ maxFreq }} Hz</p>
        </div>
        <p v-else>Connect the device to see the spectrogram.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  data: { type: Object, required: true }
})

const spectroCanvas = ref(null)
const spectrogramData = ref([])
const maxColumns = 100

const hasData = computed(() => {
  return props.data?.ch1?.datasets?.[0]?.data?.length > 0
})

const minFreq = computed(() => {
  const freqs = window.freqs
  return freqs ? freqs[0]?.toFixed(1) : '0'
})

const maxFreq = computed(() => {
  const freqs = window.freqs
  return freqs ? freqs[freqs.length - 1]?.toFixed(1) : '50'
})

function updateSpectrogram() {
  if (!hasData.value || !spectroCanvas.value) return

  const psd = window.psd
  if (!psd) return

  // Add new column
  spectrogramData.value.push([...psd])
  if (spectrogramData.value.length > maxColumns) {
    spectrogramData.value.shift()
  }

  // Draw spectrogram
  const canvas = spectroCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  const colWidth = width / maxColumns

  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  spectrogramData.value.forEach((column, colIndex) => {
    const x = colIndex * colWidth
    const numBins = column.length
    const binHeight = height / numBins

    column.forEach((value, binIndex) => {
      const y = height - (binIndex + 1) * binHeight
      const intensity = Math.min(value / 20, 1)
      const hue = 240 - intensity * 240
      ctx.fillStyle = `hsl(${hue}, 80%, ${30 + intensity * 40}%)`
      ctx.fillRect(x, y, colWidth + 1, binHeight + 1)
    })
  })
}

watch(() => props.data, () => {
  updateSpectrogram()
}, { deep: true })

onMounted(() => {
  if (hasData.value) {
    updateSpectrogram()
  }
})
</script>
