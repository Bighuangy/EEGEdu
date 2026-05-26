<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Steady-State Visual Evoked Potential (SSVEP)</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          SSVEPs are brain responses to visual stimuli that flicker at specific frequencies. 
          When you look at a flickering light, your visual cortex generates electrical activity 
          at the same frequency as the flicker.
        </p>
        <p>
          In this experiment, you will view flickering stimuli at two different frequencies 
          and record the resulting brain activity to see if you can detect the SSVEP response.
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
