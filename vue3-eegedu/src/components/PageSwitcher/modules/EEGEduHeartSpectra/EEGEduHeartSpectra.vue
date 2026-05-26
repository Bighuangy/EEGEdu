<template>
  <div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Heart Rate (Beats per minute)</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            In this module we use a Fourier transform to estimate heart rate from the ECG signal.
            The Fourier transform converts the time-domain signal into frequency components,
            allowing us to identify the dominant rhythm - your heart rate.
          </p>
          <p>
            Hold the Muse the same way as in the previous module (left fingers on AF7, right fingers on the reference).
            The peak in the spectrum shows your estimated heart rate in beats per minute.
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Live Spectra Plot</h3>
      </div>
      <div class="card-section">
        <div class="chart-wrapper">
          <div v-if="hasData" style="width: 100%; max-width: 800px;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <p v-else>Connect the device above to see the chart.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { indexOfMax } from '../utils/chartUtils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true }
})

const hasData = computed(() => {
  return props.data?.ch1?.xLabels?.length > 0
})

const peakInfo = computed(() => {
  const ch1 = props.data?.ch1
  if (!ch1?.datasets?.[0]?.data || !ch1?.xLabels) return null
  
  const peakInd = indexOfMax(ch1.datasets[0].data)
  return {
    peakF: ch1.xLabels[peakInd],
    peakVal: ch1.datasets[0].data[peakInd]
  }
})

const chartData = computed(() => {
  const ch1 = props.data?.ch1
  if (!ch1?.datasets?.[0]?.data) {
    return { labels: [], datasets: [] }
  }

  const datasets = [{
    label: 'Spectrum',
    data: ch1.datasets[0].data,
    borderColor: 'rgba(180, 180, 180, 1)',
    backgroundColor: 'rgba(180, 180, 180, 0.3)',
    fill: true,
    pointRadius: 0
  }]

  if (peakInfo.value) {
    datasets.unshift({
      label: 'Peak',
      data: [{ x: peakInfo.value.peakF, y: peakInfo.value.peakVal }],
      borderColor: 'rgba(0, 0, 0, 1)',
      backgroundColor: 'rgba(231, 41, 138, 1)',
      pointRadius: 8,
      showLine: false
    })
  }

  return {
    labels: ch1.xLabels || [],
    datasets
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  animation: { duration: 200 },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: `Channel: AF7 - Estimated HR: ${peakInfo.value?.peakF?.toFixed(0) || 'N/A'} BPM`
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Heart Rate (BPM)' }
    },
    y: {
      title: { display: true, text: 'Power (uV^2)' },
      min: 0
    }
  }
}))
</script>
