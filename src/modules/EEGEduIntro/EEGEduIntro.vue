<template>
  <div class="eegedu-intro">
    <!-- Introduction Card with Chart -->
    <el-card>
      <template #header>
        <span>{{ translations.title }}</span>
      </template>
      <div class="text-container">
        <p>{{ translations.intro1.join('') }}</p>
      </div>
      <div class="chart-wrapper">
        <div class="chart-container" style="height: 200px;">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
      <div class="text-container">
        <p>{{ translations.intro2.join('') }}</p>
      </div>
    </el-card>

    <!-- Neurons Card -->
    <el-card>
      <template #header>
        <span>{{ translations.neuronsHead }}</span>
      </template>
      <div class="text-container">
        <p>{{ translations.neurons1.join('') }}</p>
      </div>
      <img 
        :src="neuronarrowImg" 
        alt="Single Neuron"
        class="module-image"
      />
      <el-link href="https://github.com/NeuroTechX/eeg-101/blob/master/EEG101/src/assets/neuronarrow.png" target="_blank">
        Image Source - EEG101
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.neurons2.join('') }}</p>
      </div>
      <img 
        :src="neuronmultiarrowImg" 
        alt="Multiple Neurons"
        class="module-image"
      />
      <el-link href="https://github.com/NeuroTechX/eeg-101/blob/master/EEG101/src/assets/neuronmultiarrow.png" target="_blank">
        Image Source - EEG101
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.neurons3.join('') }}</p>
      </div>
    </el-card>

    <!-- Oscillations Card -->
    <el-card>
      <template #header>
        <span>{{ translations.oscillationsHead }}</span>
      </template>
      <div class="text-container">
        <p>{{ translations.oscillations1.join('') }}</p>
      </div>
      <img 
        :src="awakeasleepImg" 
        alt="Awake/Asleep"
        class="module-image"
      />
      <el-link href="https://github.com/NeuroTechX/eeg-101/blob/master/EEG101/src/assets/awakeasleep.gif" target="_blank">
        Image Source - EEG101
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.oscillations2.join('') }}</p>
      </div>
    </el-card>

    <!-- Hardware Card -->
    <el-card>
      <template #header>
        <span>{{ translations.hardwareHead }}</span>
      </template>
      <div class="text-container">
        <p>{{ translations.hardware1.join('') }}</p>
        <br />
        <p>{{ translations.hardware2.join('') }}</p>
      </div>
      <br />
      <img 
        :src="electrodelocationsImg" 
        alt="Electrode Locations"
        class="module-image"
        style="max-width: 50%;"
      />
      <br /><br />
      <el-link href="https://github.com/NeuroTechX/eeg-101/blob/master/EEG101/src/assets/electrodelocations.png" target="_blank">
        Image Source - EEG101
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.hardware3.join('') }}</p>
        <br />
        <p>{{ translations.hardware4.join('') }}</p>
      </div>
      <img 
        :src="digitalDAQImg" 
        alt="DAQ Diagram"
        class="module-image"
      />
      <el-link href="https://upload.wikimedia.org/wikipedia/commons/9/97/DigitalDAQv2.pdf" target="_blank">
        Image Source - Wikipedia
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.hardware5.join('') }}</p>
      </div>
    </el-card>

    <!-- Muse Card -->
    <el-card>
      <template #header>
        <span>{{ translations.museHead }}</span>
      </template>
      <div class="text-container">
        <p>{{ translations.muse1.join('') }}</p>
      </div>
      <br />
      <img 
        :src="musepictureImg" 
        alt="Muse Picture"
        class="module-image"
        style="max-width: 75%;"
      />
      <br /><br />
      <el-link href="https://miro.medium.com/max/2854/1*pK_tLFd8c7_xlOTm1lHdAw.png" target="_blank">
        Image Source - @urish
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.muse2.join('') }}</p>
      </div>
      <img 
        :src="electrodediagramImg" 
        alt="Muse Electrodes"
        class="module-image"
        style="max-width: 50%;"
      />
      <br />
      <img 
        :src="electrodelegendImg" 
        alt="Electrode Legend"
        class="module-image"
        style="max-width: 50%;"
      />
      <br /><br />
      <el-link href="https://github.com/NeuroTechX/eeg-101/blob/master/EEG101/src/assets/electrodediagram" target="_blank">
        Image Source - EEG101
      </el-link>
      <br /><br />
      <div class="text-container">
        <p>{{ translations.muse3.join('') }}</p>
      </div>
    </el-card>

    <!-- Signal Card -->
    <el-card>
      <template #header>
        <span>{{ translations.signalHead }}</span>
      </template>
      <div class="text-container">
        <p>{{ translations.signal1.join('') }}</p>
      </div>
      <img 
        :src="electrodediagram1Img" 
        alt="Single Electrode"
        class="module-image"
        style="max-width: 50%;"
      />
      <br />
      <el-link href="https://github.com/NeuroTechX/eeg-101/blob/master/EEG101/src/assets/electrodediagram" target="_blank">
        Image Source - EEG101
      </el-link>
      <br /><br />
      <div class="chart-wrapper">
        <div class="chart-container" style="height: 200px;">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
      <div class="text-container">
        <p>{{ translations.signal2.join('') }}</p>
      </div>
    </el-card>

    <!-- Credits Card -->
    <el-card>
      <template #header>
        <span>{{ translations.creditsHead }}</span>
      </template>
      <div class="text-container">
        <p>
          {{ translations.credits1.join('') }}
          <el-link href="http://learn.neurotechedu.com/" target="_blank">NeurotechEdu.</el-link>
        </p>
        <p>
          {{ translations.credits2.join('') }}
          <el-link href="https://choosemuse.com/muse-research/" target="_blank">Interaxon.</el-link>
        </p>
        <p>
          {{ translations.credits3.join('') }}
          <el-link href="https://github.com/urish/muse-js" target="_blank">muse-js</el-link>
          {{ translations.credits4.join('') }}
          <el-link href="https://medium.com/neurotechx/a-techys-introduction-to-neuroscience-3f492df4d3bf" target="_blank">
            A Techy's Introduction to Neuroscience.
          </el-link>
        </p>
        <p>
          {{ translations.credits5.join('') }}
          <el-link href="https://github.com/neurosity/eeg-pipes" target="_blank">eeg-pipes</el-link>
          {{ translations.credits6.join('') }}
          <el-link href="https://medium.com/@castillo.io/muse-2016-headband-web-bluetooth-11ddcfa74c83" target="_blank">
            Muse 2016 Headband + Web Bluetooth.
          </el-link>
        </p>
      </div>
    </el-card>
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

import translations from './translations'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

// Import images
import neuronarrowImg from './assets/neuronarrow.png'
import neuronmultiarrowImg from './assets/neuronmultiarrow.png'
import awakeasleepImg from './assets/awakeasleep.gif'
import electrodelocationsImg from './assets/electrodelocations.png'
import digitalDAQImg from './assets/DigitalDAQv2.png'
import musepictureImg from './assets/musepicture.png'
import electrodediagramImg from './assets/electrodediagram.png'
import electrodelegendImg from './assets/electrodelegend.png'
import electrodediagram1Img from './assets/electrodediagram1.png'

// Props
const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      ch0: { datasets: [{}], xLabels: [] }
    })
  }
})

// Computed chart data
const chartData = computed(() => {
  const channel = props.data?.ch0 || { datasets: [{}], xLabels: [] }
  const qual = channel.datasets?.[0]?.qual || 100
  
  return {
    labels: channel.xLabels || [],
    datasets: [{
      label: 'EEG Signal',
      data: channel.datasets?.[0]?.data || [],
      fill: false,
      borderColor: `rgba(${qual * 10}, 128, 128, 1)`,
      borderWidth: 1,
      tension: 0.1,
      pointRadius: 0
    }]
  }
})

// Chart options
const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  },
  scales: {
    x: {
      title: {
        display: true,
        text: translations.xlabel
      }
    },
    y: {
      title: {
        display: true,
        text: translations.ylabel
      },
      min: -300,
      max: 300
    }
  },
  plugins: {
    title: {
      display: true,
      text: 'Voltage signal over time'
    },
    tooltip: {
      enabled: false
    },
    legend: {
      display: false
    }
  }
}))
</script>

<style scoped>
.eegedu-intro {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.text-container {
  font-size: 14px;
  line-height: 1.6;
  color: #212b36;
}

.text-container p {
  margin: 0 0 12px 0;
}

.chart-wrapper {
  padding: 20px 0;
}

.chart-container {
  position: relative;
  width: 100%;
}

.module-image {
  width: 100%;
  max-width: 500px;
  border-radius: 4px;
  margin: 8px 0;
}
</style>
