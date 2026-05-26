<template>
  <div class="raw-module">
    <el-card shadow="hover">
      <template #header>
        <span>{{ t.title }}</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="24" :md="12">
          <p>{{ t.description }}</p>
          <el-image
            src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/electrodelocations.png"
            fit="contain"
            style="width: 80%; max-width: 300px; margin: 15px 0;"
          />
        </el-col>
        <el-col :span="24" :md="12">
          <div class="chart-container">
            <canvas ref="chartCanvas"></canvas>
          </div>
        </el-col>
      </el-row>

      <!-- 伪影说明 -->
      <el-divider />
      <h3>Artifacts in EEG</h3>
      
      <el-collapse>
        <el-collapse-item title="Eye Blinks/Movements" name="1">
          <p>The eyeballs create an electrical field. As they move around, they create electrical potentials that are picked up by the EEG sensors. Eye movement and blink artifacts are some of the largest and most difficult to remove from the data.</p>
        </el-collapse-item>
        
        <el-collapse-item title="Muscle Activity (EMG)" name="2">
          <p>When signals are sent from our brain to our muscles, the motor neurons release Acetylcholine onto the muscle fibers. This release causes the muscles to contract, and these contractions create electrical potentials that are also picked up by electrodes.</p>
        </el-collapse-item>
        
        <el-collapse-item title="Mechanical Artifacts" name="3">
          <p>The EEG electrodes measure the voltage of the human body between two points. Changes in the electrical resistance of the electrode-body connection can change the voltage. Movement of the electrodes against the head leads to large voltage changes not due to brain activity.</p>
        </el-collapse-item>
        
        <el-collapse-item title="Drifts" name="4">
          <p>Resistance between the sensor and the body leads to less current and smaller measured voltage. We can sometimes see slow drifts in our EEG data as the connection strength changes, such as when you first put on the device or when you sweat.</p>
        </el-collapse-item>
        
        <el-collapse-item title="Electrical Noise (60Hz)" name="5">
          <p>Buildings are supplied with 120 Volts of alternating current that alternates 60 times a second. This 60 Hz electrical noise is everywhere in any building and is easily picked up by EEG electrodes. We can use filtering to remove this type of noise.</p>
        </el-collapse-item>
      </el-collapse>

      <el-alert
        v-if="!hasData"
        title="Press connect above to see the chart."
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      />
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import Chart from 'chart.js'
import translations from '../../utils/translations'
import { generalOptions } from '../../utils/chartUtils'

export default {
  name: 'RawModule',
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
    const t = translations.raw
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
            pointRadius: 0
          }))
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
            text: 'Raw data from EEG electrodes'
          },
          legend: {
            display: true
          }
        }
      })
    }

    function updateChart() {
      if (!chartInstance || !hasData.value) return

      const offsets = [300, 200, 100, 0, -100]
      
      chartInstance.data.labels = props.data.ch0.xLabels || []
      
      Object.keys(props.data).forEach((key, index) => {
        const channel = props.data[key]
        if (channel.datasets[0].data) {
          chartInstance.data.datasets[index].data = channel.datasets[0].data.map(x => x + offsets[index])
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
.raw-module {
  padding: 10px 0;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
