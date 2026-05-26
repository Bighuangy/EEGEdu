<template>
  <div>
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Introduction to EEG</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            Welcome to EEGEdu! This interactive platform will teach you about brain biology using live EEG data.
            Connect a Muse headband to see your own brain signals in real-time.
          </p>
        </div>
        <div class="chart-wrapper">
          <div v-if="chartData.labels && chartData.labels.length > 0" style="width: 100%; max-width: 800px;">
            <Line :data="chartData" :options="chartOptions" />
          </div>
          <p v-else>Connect the device above to see the chart.</p>
        </div>
        <div class="text-container">
          <p>
            The chart above shows the electrical signals from one electrode on your scalp.
            Time is on the horizontal axis and voltage is on the vertical axis.
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Neurons and the Brain</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            The brain is made up of billions of neurons - specialized cells that communicate through electrical and chemical signals.
            When large groups of neurons fire together, they create electrical potentials that can be measured on the scalp using EEG.
          </p>
          <p>
            The EEG measures the summed activity of millions of neurons in the cortex beneath each electrode.
            Different patterns of brain activity are associated with different mental states.
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Brain Oscillations</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            Brain activity naturally oscillates at different frequencies. When we're alert, our brain produces faster oscillations.
            When we're relaxed or drowsy, slower oscillations dominate.
          </p>
          <p>
            These oscillations are categorized into frequency bands: Delta (1-4 Hz), Theta (4-8 Hz), Alpha (8-12 Hz), 
            Beta (12-30 Hz), and Gamma (30+ Hz). Each band is associated with different cognitive states.
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">The Muse Headband</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            The Muse is a consumer EEG device with 4 electrodes positioned at TP9, AF7, AF8, and TP10 according to the 
            international 10-20 system. It samples at 256 Hz and connects via Bluetooth.
          </p>
          <p>
            The electrodes measure the voltage difference between each location and a reference electrode on the forehead.
            This allows us to measure brain activity from the frontal and temporal regions.
          </p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Credits</h3>
      </div>
      <div class="card-section">
        <div class="text-container">
          <p>
            This educational platform was inspired by 
            <a class="link" href="http://learn.neurotechedu.com/" target="_blank">NeurotechEdu</a> and uses the 
            <a class="link" href="https://github.com/urish/muse-js" target="_blank">muse-js</a> library created by Uri Shaked.
          </p>
          <p>
            Signal processing is performed using 
            <a class="link" href="https://github.com/neurosity/eeg-pipes" target="_blank">eeg-pipes</a> from Neurosity.
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => {
  const ch0 = props.data?.ch0
  if (!ch0?.datasets?.[0]?.data) {
    return { labels: [], datasets: [] }
  }
  
  return {
    labels: ch0.xLabels || [],
    datasets: [{
      label: 'EEG Signal',
      data: ch0.datasets[0].data,
      borderColor: `rgba(${(ch0.datasets[0].qual || 10) * 10}, 128, 128, 1)`,
      backgroundColor: 'transparent',
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.1
    }]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: true,
  animation: { duration: 0 },
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
    title: {
      display: true,
      text: 'Voltage signal over time'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Time (ms)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Voltage (uV)'
      },
      min: -300,
      max: 300
    }
  }
}))
</script>
