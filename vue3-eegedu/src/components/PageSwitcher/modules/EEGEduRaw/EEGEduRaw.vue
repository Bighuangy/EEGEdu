<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Raw and Filtered EEG Data</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          This module shows the raw EEG data from all four electrodes. Time is on the horizontal X-axis 
          and voltage is on the Y-axis. An offset has been added to separate the electrodes vertically.
        </p>
        <p>
          The filter settings above control what frequencies are allowed through. Play around with the 
          cutoff settings to observe how they change the plotted data.
        </p>
      </div>
    </div>
    <div class="card-section">
      <div class="chart-wrapper">
        <div v-if="hasData" style="width: 100%; max-width: 900px;">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <p v-else>Press connect above to see the chart.</p>
      </div>
    </div>
    <div class="card-section">
      <div class="card-section-title">Artifacts</div>
      <div class="text-container">
        <p>
          Before we try to use the EEG to estimate brain activity, we need to observe what other things 
          can influence the signal. Artifacts refer to non-EEG noise in the recording that will cloud the results.
        </p>
        <p>
          Common artifacts include: eye blinks and movements, muscle activity (EMG), mechanical artifacts 
          from electrode movement, signal drift from sweating, and electrical noise from the environment.
        </p>
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
  const offsets = [300, 200, 100, 0, -100]

  const datasets = []
  for (let i = 0; i < 5; i++) {
    const ch = props.data[`ch${i}`]
    if (ch?.datasets?.[0]?.data) {
      datasets.push({
        label: channelNames[i],
        data: ch.datasets[0].data.map(x => x + offsets[i]),
        borderColor: colors[i],
        backgroundColor: 'transparent',
        borderWidth: 1,
        pointRadius: 0
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
      text: 'Raw data from EEG electrodes'
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Time (ms)' }
    },
    y: {
      title: { display: true, text: 'Voltage (uV)' }
    }
  }
}))
</script>
