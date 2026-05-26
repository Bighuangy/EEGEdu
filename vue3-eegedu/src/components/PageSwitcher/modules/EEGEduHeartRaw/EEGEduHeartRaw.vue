<template>
  <div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Electrocardiogram (ECG)</h3>
      </div>
      <div class="card-section">
        <div class="stack">
          <div class="text-container">
            <p>
              As a first introduction to measurement of electrical potentials from the body we will look at something accessible.
              As the heart beats and pumps blood throughout our body, a series of electrical potentials are created, 
              which can be measured using electrodes placed around the heart. This is referred to as the Electrocardiogram (ECG).
            </p>
            <p>
              The ECG is best measured by comparing the electrical potential across the left vs. right side of the body.
              You can take off the muse from your head and place a finger on your right hand on the muse's reference electrode 
              (in the center of the forehead). Then place a finger of your left hand on the left forehead electrode (position AF7).
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Live Data</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            Here time is on the horizontal axis, and the voltage is on the vertical axis.
            There are 10 seconds of data shown, with the current time shown on the right.
            The signal will be red if it is noisy, and when you relax and hold still it will turn green/black.
          </p>
        </div>
        <div class="chart-wrapper">
          <div v-if="hasData" style="width: 100%; max-width: 800px;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <p v-else>Connect the device and hold the Muse as described above to see your ECG.</p>
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  data: { type: Object, required: true }
})

const hasData = computed(() => {
  return props.data?.ch1?.datasets?.[0]?.data?.length > 0
})

const chartData = computed(() => {
  const ch1 = props.data?.ch1
  if (!ch1?.datasets?.[0]?.data) {
    return { labels: [], datasets: [] }
  }
  
  return {
    labels: ch1.xLabels || [],
    datasets: [{
      label: 'ECG Signal',
      data: ch1.datasets[0].data,
      borderColor: `rgba(${ch1.datasets[0].qual || 128}, 128, 128, 1)`,
      backgroundColor: 'transparent',
      borderWidth: 1,
      pointRadius: 0
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
      text: `Channel: AF7 - SD: ${props.data?.ch1?.datasets?.[0]?.qual || 'N/A'}`
    }
  },
  scales: {
    x: {
      title: { display: true, text: 'Time (seconds)' },
      ticks: { maxTicksLimit: 10 }
    },
    y: {
      title: { display: true, text: 'Voltage (uV)' }
    }
  }
}))
</script>
