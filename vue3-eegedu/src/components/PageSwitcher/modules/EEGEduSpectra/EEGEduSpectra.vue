<template>
  <div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Frequency Spectra</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            This module shows the frequency spectrum of your EEG data. A Fourier transform converts the 
            time-domain signal into frequency components, showing how much power exists at each frequency.
          </p>
        </div>
      </div>
      <div class="card-section">
        <div class="chart-wrapper">
          <div v-if="hasData" style="width: 100%; max-width: 900px;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <p v-else>Connect the device above to see the plot.</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Fourier Transform</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            The Fourier transform is a mathematical technique that decomposes any time series into a sum of 
            sine waves at different frequencies. The resolution in frequency depends on the number of time points, 
            and the maximum frequency is half the sampling rate (128 Hz for 256 Hz sampling).
          </p>
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
import { channelNames } from '../utils/chartOptions'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true }
})

const hasData = computed(() => {
  return props.data?.ch3?.datasets?.[0]?.data?.length > 0
})

const chartData = computed(() => {
  if (!hasData.value) {
    return { labels: [], datasets: [] }
  }

  const colors = [
    'rgba(217, 95, 2, 1)',
    'rgba(27, 158, 119, 1)',
    'rgba(117, 112, 179, 1)',
    'rgba(231, 41, 138, 1)',
    'rgba(20, 20, 20, 1)'
  ]

  const datasets = []
  for (let i = 0; i < 5; i++) {
    const ch = props.data[`ch${i}`]
    if (ch?.datasets?.[0]?.data) {
      datasets.push({
        label: channelNames[i],
        data: ch.datasets[0].data,
        borderColor: colors[i],
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 3
      })
    }
  }

  return {
    labels: props.data.ch0?.xLabels || [],
    datasets
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  animation: { duration: 0 },
  plugins: {
    legend: { display: true },
    title: {
      display: true,
      text: 'Spectra data from each electrode'
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Frequency (Hz)' }
    },
    y: {
      title: { display: true, text: 'Power (uV^2)' }
    }
  }
}))
</script>
