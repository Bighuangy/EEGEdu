<template>
  <div class="bands-module">
    <el-card shadow="hover">
      <template #header>
        <span>{{ t.title }}</span>
      </template>

      <p>{{ t.description }}</p>

      <!-- 频带说明 -->
      <el-row :gutter="20" style="margin: 20px 0;">
        <el-col :span="24" :md="12">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Delta (1-4 Hz)">Associated with deep sleep</el-descriptions-item>
            <el-descriptions-item label="Theta (4-7 Hz)">Associated with drowsiness, memory</el-descriptions-item>
            <el-descriptions-item label="Alpha (7-12 Hz)">Associated with relaxed, awake state</el-descriptions-item>
            <el-descriptions-item label="Beta (12-30 Hz)">Associated with active thinking</el-descriptions-item>
            <el-descriptions-item label="Gamma (30+ Hz)">Associated with higher cognitive functions</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="24" :md="12">
          <el-image
            src="https://upload.wikimedia.org/wikipedia/commons/5/59/Analyse_spectrale_d%27un_EEG.jpg"
            fit="contain"
            style="width: 100%; max-width: 400px;"
          />
        </el-col>
      </el-row>

      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <el-alert
        v-if="!hasData"
        title="Press connect above to see the chart."
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      />
    </el-card>

    <!-- 神经振荡说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Neural Oscillations</span>
      </template>

      <p>
        Oscillations in the brain are important as a mechanism of brain function and communication.
        Within a brain area, cellular firing becomes locked to the ongoing oscillations of the local field potential.
      </p>

      <el-image
        src="https://upload.wikimedia.org/wikipedia/commons/4/4c/SimulationNeuralOscillations.png"
        fit="contain"
        style="width: 50%; max-width: 400px; margin: 15px 0;"
      />

      <p>
        Since oscillations can control the timing of neural firing, they can also be used to communicate
        information and create distributed representations. Two nearby brain regions that oscillate in sync
        will have cells that also fire in sync.
      </p>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js'
import translations from '../../utils/translations'
import { generalOptions, bandLabels } from '../../utils/chartUtils'

export default {
  name: 'BandsModule',
  props: {
    data: {
      type: Object,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
    status: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const t = translations.bands
    const chartCanvas = ref(null)
    let chartInstance = null

    const hasData = computed(() => {
      return props.data.ch0.datasets[0].data && props.data.ch0.datasets[0].data.length > 0
    })

    const channelColors = [
      'rgba(217,95,2, 0.7)',
      'rgba(27,158,119, 0.7)',
      'rgba(117,112,179, 0.7)',
      'rgba(231,41,138, 0.7)',
      'rgba(20,20,20, 0.7)'
    ]

    const channelNames = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX']

    function initChart() {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      
      chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: bandLabels,
          datasets: channelNames.map((name, index) => ({
            label: name,
            backgroundColor: channelColors[index],
            data: [0, 0, 0, 0, 0]
          }))
        },
        options: {
          ...generalOptions,
          animation: { duration: 0 },
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Frequency Band'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Power (uV²)'
              },
              ticks: {
                min: 0,
                max: 100
              }
            }]
          },
          title: {
            display: true,
            text: 'Power by Frequency Band'
          },
          legend: {
            display: true
          }
        }
      })
    }

    function updateChart() {
      if (!chartInstance || !hasData.value) return

      Object.keys(props.data).forEach((key, index) => {
        const channel = props.data[key]
        if (channel.datasets[0].data) {
          chartInstance.data.datasets[index].data = channel.datasets[0].data
        }
      })
      
      chartInstance.update()
    }

    onMounted(() => {
      initChart()
    })

    watch(() => props.data, () => {
      updateChart()
    }, { deep: true })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return {
      t,
      chartCanvas,
      hasData
    }
  }
}
</script>

<style scoped>
.bands-module {
  padding: 10px 0;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
