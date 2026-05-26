<template>
  <div class="spectra-module">
    <el-card shadow="hover">
      <template #header>
        <span>{{ t.title }}</span>
      </template>

      <p>{{ t.description }}</p>

      <div class="chart-container">
        <canvas ref="chartCanvas"></canvas>
      </div>

      <el-alert
        v-if="!hasData"
        title="Connect the device above to see the plot"
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      />
    </el-card>

    <!-- 傅里叶变换说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Fourier Transform</span>
      </template>

      <p>
        The Fourier transform turns any series of numbers into a summed set of sine waves of different sizes.
        It was originally developed in the early 1800s to mathematically model the movement of heat.
      </p>

      <el-image
        src="https://upload.wikimedia.org/wikipedia/commons/7/72/Fourier_transform_time_and_frequency_domains_%28small%29.gif"
        fit="contain"
        style="width: 50%; max-width: 400px; margin: 15px 0;"
      />

      <p>
        The Fast Fourier Transform (FFT) was created in the 1960s as an efficient algorithm for computing
        the discrete Fourier transform on digital data. It has become one of the most important algorithms
        in signal processing.
      </p>

      <el-link type="primary" href="http://www.jezzamon.com/fourier/index.html" target="_blank">
        Interactive tutorial on Fourier transforms
      </el-link>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js'
import translations from '../../utils/translations'
import { generalOptions } from '../../utils/chartUtils'

export default {
  name: 'SpectraModule',
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
    const t = translations.spectra
    const chartCanvas = ref(null)
    let chartInstance = null

    const hasData = computed(() => {
      return props.data.ch0.datasets[0].data && props.data.ch0.datasets[0].data.length > 0
    })

    const channelColors = [
      'rgba(217,95,2)',
      'rgba(27,158,119)',
      'rgba(117,112,179)',
      'rgba(231,41,138)',
      'rgba(20,20,20)'
    ]

    const channelNames = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX']

    function initChart() {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: channelNames.map((name, index) => ({
            label: name,
            borderColor: channelColors[index],
            data: [],
            fill: false,
            pointRadius: 3
          }))
        },
        options: {
          ...generalOptions,
          animation: { duration: 0 },
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Frequency (Hz)'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'Power (uV²)'
              }
            }]
          },
          title: {
            display: true,
            text: 'Spectra data from each electrode'
          },
          legend: {
            display: true
          }
        }
      })
    }

    function updateChart() {
      if (!chartInstance || !hasData.value) return

      chartInstance.data.labels = props.data.ch0.xLabels || []
      
      Object.keys(props.data).forEach((key, index) => {
        const channel = props.data[key]
        if (channel.datasets[0].data) {
          chartInstance.data.datasets[index].data = channel.datasets[0].data
        }
      })

      // 动态调整Y轴范围
      const allData = Object.values(props.data)
        .map(ch => ch.datasets[0].data || [])
        .flat()
        .filter(v => !isNaN(v))
      
      if (allData.length > 0) {
        const maxVal = Math.max(...allData)
        chartInstance.options.scales.yAxes[0].ticks = {
          max: Math.ceil(maxVal),
          min: -Math.ceil(maxVal)
        }
      }
      
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
.spectra-module {
  padding: 10px 0;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
