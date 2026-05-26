<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Frequency Bands</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          This module shows the power in traditional EEG frequency bands: Delta (1-4 Hz), Theta (4-7 Hz), 
          Alpha (7-12 Hz), Beta (12-30 Hz), and Gamma (30+ Hz). These bands are associated with different brain states.
        </p>
        <p>
          For example, alpha oscillations increase when we close our eyes and relax, while beta increases during active thinking.
        </p>
      </div>
    </div>
    <div class="card-section">
      <div class="chart-wrapper">
        <div v-if="hasData" style="width: 100%; max-width: 800px;">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
        <p v-else>Press connect above to see the chart.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { channelNames } from '../utils/chartOptions'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

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
    'rgba(217, 95, 2, 0.8)',
    'rgba(27, 158, 119, 0.8)',
    'rgba(117, 112, 179, 0.8)',
    'rgba(231, 41, 138, 0.8)',
    'rgba(20, 20, 20, 0.8)'
  ]

  const datasets = []
  for (let i = 0; i < 5; i++) {
    const ch = props.data[`ch${i}`]
    if (ch?.datasets?.[0]?.data) {
      datasets.push({
        label: channelNames[i],
        data: ch.datasets[0].data,
        backgroundColor: colors[i]
      })
    }
  }

  return {
    labels: props.data.ch0?.xLabels || ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'],
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
      text: 'Power by Frequency Band'
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Frequency Band' }
    },
    y: {
      title: { display: true, text: 'Power (uV^2)' },
      min: 0,
      max: 100
    }
  }
}))
</script>
