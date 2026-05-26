<template>
  <div class="alpha-module">
    <el-card shadow="hover">
      <template #header>
        <span>Eyes Open vs. Eyes Closed Experiment</span>
      </template>

      <p>
        One of the most reliable findings in EEG research is that alpha power (8-12 Hz) increases
        when the eyes are closed compared to when they are open. This is called the "alpha blocking" effect.
      </p>

      <el-row :gutter="20">
        <el-col :span="24" :md="12">
          <el-image
            src="https://www.researchgate.net/profile/Jing-Mo-37/publication/261991046/figure/fig1/AS:614066628624386@1523416598855/Alpha-oscillations-during-eyes-open-and-closed-conditions-Individual-subject.png"
            fit="contain"
            style="width: 100%; max-width: 400px; margin: 15px 0;"
          />
          <p>
            <small>Image: Alpha power during eyes open and closed conditions (Mo et al., 2013)</small>
          </p>
        </el-col>
        <el-col :span="24" :md="12">
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </el-col>
      </el-row>

      <el-alert
        v-if="!hasData"
        title="Connect the device above to see the frequency bands."
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      />
    </el-card>

    <!-- 实验说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Running the Experiment</span>
      </template>

      <el-steps direction="vertical" :active="activeStep">
        <el-step title="Check Connection" description="First go to the Raw module and check data quality and connection." />
        <el-step title="Eyes Open Recording" description="Record 10 seconds of data while keeping your eyes open and relaxed." />
        <el-step title="Eyes Closed Recording" description="Record 10 seconds of data while keeping your eyes closed and relaxed." />
        <el-step title="Compare Results" description="Compare the alpha power between the two conditions." />
      </el-steps>

      <el-divider />

      <h4>Expected Results</h4>
      <p>
        You should observe higher alpha power (8-12 Hz) when your eyes are closed compared to when they are open.
        This is because alpha oscillations are associated with relaxed wakefulness and are suppressed by visual input.
      </p>

      <el-alert
        type="success"
        title="Why does this happen?"
        :closable="false"
        show-icon
        style="margin-top: 15px;"
      >
        Alpha oscillations are thought to reflect "cortical idling" - when visual cortex is not actively
        processing input (eyes closed), alpha power increases. When the eyes open and visual processing begins,
        alpha is "blocked" or suppressed.
      </el-alert>
    </el-card>

    <!-- 频带说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Frequency Bands Reference</span>
      </template>

      <el-table :data="bandInfo" stripe style="width: 100%">
        <el-table-column prop="band" label="Band" width="120" />
        <el-table-column prop="range" label="Frequency Range" width="150" />
        <el-table-column prop="association" label="Associated With" />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js'
import { generalOptions, bandLabels } from '../../utils/chartUtils'

export default {
  name: 'AlphaModule',
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
    const chartCanvas = ref(null)
    let chartInstance = null
    const activeStep = ref(0)

    const hasData = computed(() => {
      return props.data.ch0.datasets[0].data && props.data.ch0.datasets[0].data.length > 0
    })

    const bandInfo = [
      { band: 'Delta', range: '1-4 Hz', association: 'Deep sleep' },
      { band: 'Theta', range: '4-7 Hz', association: 'Drowsiness, memory encoding' },
      { band: 'Alpha', range: '8-12 Hz', association: 'Relaxed wakefulness (KEY FOR THIS EXPERIMENT)' },
      { band: 'Beta', range: '12-30 Hz', association: 'Active thinking, concentration' },
      { band: 'Gamma', range: '30+ Hz', association: 'Higher cognitive functions' }
    ]

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
            text: 'Power by Frequency Band - Watch Alpha!'
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

    watch(() => props.status, (newStatus) => {
      if (newStatus.includes('Connected')) {
        activeStep.value = 1
      }
    })

    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return {
      chartCanvas,
      hasData,
      activeStep,
      bandInfo
    }
  }
}
</script>

<style scoped>
.alpha-module {
  padding: 10px 0;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
