<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Eyes Open vs. Eyes Closed Experiment</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          This experiment compares alpha power during eyes open and eyes closed conditions. 
          Alpha oscillations (8-12 Hz) typically increase when we close our eyes and relax.
        </p>
        <p>
          Recording sessions are 60 seconds long. A fixation cross will appear - keep your eyes 
          fixed on it during the eyes open condition, and minimize blinking.
        </p>
      </div>
    </div>
    <div class="card-section">
      <div class="chart-wrapper">
        <div v-if="hasData" style="width: 100%; max-width: 800px;">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <p v-else>Connect the device to see the spectrum.</p>
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
  return props.data?.ch0?.datasets?.[0]?.data?.length > 0
})

const chartData = computed(() => {
  const ch0 = props.data?.ch0
  if (!ch0?.datasets?.[0]?.data) {
    return { labels: [], datasets: [] }
  }

  return {
    labels: ch0.xLabels || [],
    datasets: [{
      label: channelNames[0],
      data: ch0.datasets[0].data,
      borderColor: 'rgba(217, 95, 2, 1)',
      backgroundColor: 'transparent',
      pointRadius: 3
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  animation: { duration: 0 },
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: `Channel: ${channelNames[0]}`
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Frequency (Hz)' }
    },
    y: {
      title: { display: true, text: 'Power (uV^2)' },
      min: 0,
      max: 25
    }
  }
}))
</script>
