<template>
  <div class="intro-module">
    <!-- 实时图表 -->
    <el-card shadow="hover" class="chart-card">
      <template #header>
        <span>{{ t.title }}</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="24" :md="12">
          <p>{{ t.intro1 }}</p>
        </el-col>
        <el-col :span="24" :md="12">
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </el-col>
      </el-row>
      <p style="margin-top: 15px;">{{ t.intro2 }}</p>
    </el-card>

    <!-- 神经元部分 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <span>{{ t.neuronsHead }}</span>
      </template>
      <p>{{ t.neurons1 }}</p>
      <el-image
        src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/neuronarrow.png"
        fit="contain"
        style="width: 100%; max-width: 600px; margin: 15px 0;"
      />
      <p>{{ t.neurons2 }}</p>
      <el-image
        src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/neuronmultiarrow.png"
        fit="contain"
        style="width: 100%; max-width: 600px; margin: 15px 0;"
      />
      <p>{{ t.neurons3 }}</p>
    </el-card>

    <!-- 脑振荡部分 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <span>{{ t.oscillationsHead }}</span>
      </template>
      <p>{{ t.oscillations1 }}</p>
      <el-image
        src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/awakeasleep.gif"
        fit="contain"
        style="width: 100%; max-width: 600px; margin: 15px 0;"
      />
      <p>{{ t.oscillations2 }}</p>
    </el-card>

    <!-- 硬件部分 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <span>{{ t.hardwareHead }}</span>
      </template>
      <p>{{ t.hardware1 }}</p>
      <p>{{ t.hardware2 }}</p>
      <el-image
        src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/electrodelocations.png"
        fit="contain"
        style="width: 50%; max-width: 400px; margin: 15px 0;"
      />
      <p>{{ t.hardware3 }}</p>
      <p>{{ t.hardware4 }}</p>
      <p>{{ t.hardware5 }}</p>
    </el-card>

    <!-- Muse设备部分 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <span>{{ t.museHead }}</span>
      </template>
      <p>{{ t.muse1 }}</p>
      <el-image
        src="https://miro.medium.com/max/2854/1*pK_tLFd8c7_xlOTm1lHdAw.png"
        fit="contain"
        style="width: 75%; max-width: 500px; margin: 15px 0;"
      />
      <p>{{ t.muse2 }}</p>
      <el-image
        src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/electrodediagram.png"
        fit="contain"
        style="width: 50%; max-width: 400px; margin: 15px 0;"
      />
      <p>{{ t.muse3 }}</p>
    </el-card>

    <!-- 致谢部分 -->
    <el-card shadow="hover" class="info-card">
      <template #header>
        <span>{{ t.creditsHead }}</span>
      </template>
      <p>{{ t.credits1 }}<el-link type="primary" href="http://learn.neurotechedu.com/" target="_blank">NeurotechEdu</el-link></p>
      <p>{{ t.credits2 }}<el-link type="primary" href="https://choosemuse.com/muse-research/" target="_blank">Interaxon</el-link></p>
      <p>{{ t.credits3 }}<el-link type="primary" href="https://github.com/urish/muse-js" target="_blank">muse-js</el-link>
        {{ t.credits4 }}<el-link type="primary" href="https://medium.com/neurotechx/a-techys-introduction-to-neuroscience-3f492df4d3bf" target="_blank">A Techy's Introduction to Neuroscience</el-link>
      </p>
      <p>{{ t.credits5 }}<el-link type="primary" href="https://github.com/neurosity/eeg-pipes" target="_blank">eeg-pipes</el-link>
        {{ t.credits6 }}<el-link type="primary" href="https://medium.com/@castillo.io/muse-2016-headband-web-bluetooth-11ddcfa74c83" target="_blank">Muse 2016 Headband + Web Bluetooth</el-link>
      </p>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js'
import translations from '../../utils/translations'
import { generalOptions } from '../../utils/chartUtils'

export default {
  name: 'IntroModule',
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
    const t = translations.intro
    const chartCanvas = ref(null)
    let chartInstance = null

    // 初始化图表
    function initChart() {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'AF7',
            borderColor: 'rgba(128, 128, 128, 0.8)',
            data: [],
            fill: false,
            pointRadius: 0
          }]
        },
        options: {
          ...generalOptions,
          animation: { duration: 0 },
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Time (ms)'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Voltage (uV)'
              },
              ticks: {
                max: 300,
                min: -300
              }
            }]
          },
          title: {
            display: true,
            text: 'Voltage signal over time'
          }
        }
      })
    }

    // 更新图表数据
    function updateChart() {
      if (!chartInstance || !props.data.ch0.datasets[0].data) return

      const channel = props.data.ch0
      const qual = channel.datasets[0].qual || 50

      chartInstance.data.labels = channel.xLabels || []
      chartInstance.data.datasets[0].data = channel.datasets[0].data
      chartInstance.data.datasets[0].borderColor = `rgba(${qual * 10}, 128, 128)`
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
      chartCanvas
    }
  }
}
</script>

<style scoped>
.intro-module {
  padding: 10px 0;
}

.chart-card,
.info-card {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.el-image {
  display: block;
}
</style>
