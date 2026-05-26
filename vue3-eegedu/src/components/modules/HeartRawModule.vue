<template>
  <div class="heart-raw-module">
    <el-card shadow="hover">
      <template #header>
        <span>Electrocardiogram (ECG/EKG)</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="24" :md="12">
          <p>
            The ECG measures the electrical activity of the heart. Each heartbeat produces a distinctive
            waveform pattern called the PQRST complex.
          </p>
          <p>
            To record ECG with the Muse, place two fingers from your left hand on the left forehead sensors
            and two fingers from your right hand on the right forehead sensors.
          </p>
          <el-image
            src="https://upload.wikimedia.org/wikipedia/commons/9/9e/ECG_Principle_fast.gif"
            fit="contain"
            style="width: 100%; max-width: 300px; margin: 15px 0;"
          />
        </el-col>
        <el-col :span="24" :md="12">
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </el-col>
      </el-row>

      <el-alert
        v-if="!hasData"
        title="Press connect above and place your fingers on the sensors to see your heart rhythm."
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      />
    </el-card>

    <!-- ECG说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Understanding the ECG Waveform</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="24" :md="12">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="P Wave">Atrial depolarization (contraction)</el-descriptions-item>
            <el-descriptions-item label="QRS Complex">Ventricular depolarization</el-descriptions-item>
            <el-descriptions-item label="T Wave">Ventricular repolarization (relaxation)</el-descriptions-item>
          </el-descriptions>
        </el-col>
        <el-col :span="24" :md="12">
          <el-image
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/SinusRhythmLabels.svg/800px-SinusRhythmLabels.svg.png"
            fit="contain"
            style="width: 100%; max-width: 400px;"
          />
        </el-col>
      </el-row>
    </el-card>

    <!-- 手指放置说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Finger Placement Guide</span>
      </template>

      <el-steps :active="3" finish-status="success" simple>
        <el-step title="Connect" description="Connect your Muse headband" />
        <el-step title="Position" description="Hold the Muse in front of you" />
        <el-step title="Place Fingers" description="Left fingers on left sensors, right on right" />
        <el-step title="Observe" description="Watch your heart rhythm appear" />
      </el-steps>

      <el-alert
        type="warning"
        title="Important"
        :closable="false"
        show-icon
        style="margin-top: 15px;"
      >
        This is for educational purposes only and should not be used for medical diagnosis.
        The Muse headband is not a medical device.
      </el-alert>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js'
import { generalOptions } from '../../utils/chartUtils'

export default {
  name: 'HeartRawModule',
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

    const hasData = computed(() => {
      return props.data.ch0.datasets[0].data && props.data.ch0.datasets[0].data.length > 0
    })

    function initChart() {
      if (!chartCanvas.value) return

      const ctx = chartCanvas.value.getContext('2d')
      
      chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'ECG Signal',
            borderColor: 'rgba(220, 53, 69, 0.9)',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            data: [],
            fill: true,
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
              }
            }]
          },
          title: {
            display: true,
            text: 'ECG - Electrocardiogram'
          },
          legend: {
            display: true
          }
        }
      })
    }

    function updateChart() {
      if (!chartInstance || !hasData.value) return

      // 使用通道0和1的差值来获取更好的ECG信号
      const ch0 = props.data.ch0.datasets[0].data || []
      const ch1 = props.data.ch1.datasets[0].data || []
      
      let ecgData = ch0
      if (ch1.length === ch0.length) {
        ecgData = ch0.map((val, i) => val - (ch1[i] || 0))
      }

      chartInstance.data.labels = props.data.ch0.xLabels || []
      chartInstance.data.datasets[0].data = ecgData
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
      chartCanvas,
      hasData
    }
  }
}
</script>

<style scoped>
.heart-raw-module {
  padding: 10px 0;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
