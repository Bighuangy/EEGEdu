<template>
  <div class="spectro-module">
    <el-card shadow="hover">
      <template #header>
        <span>Spectrogram - Spectra Over Time</span>
      </template>

      <p>
        A spectrogram shows how the frequency content of a signal changes over time.
        The x-axis represents time, y-axis represents frequency, and color represents power.
      </p>

      <div class="spectro-container">
        <canvas ref="spectroCanvas"></canvas>
      </div>

      <el-alert
        v-if="!isConnected"
        title="Connect the device above to see the spectrogram."
        type="info"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      />

      <!-- 颜色图例 -->
      <div class="color-legend">
        <span>Low Power</span>
        <div class="gradient-bar"></div>
        <span>High Power</span>
      </div>
    </el-card>

    <!-- 说明 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Understanding Spectrograms</span>
      </template>

      <p>
        Spectrograms are a powerful tool for visualizing how brain activity changes over time.
        Each vertical slice represents the frequency spectrum at that moment in time.
      </p>

      <el-descriptions :column="1" border>
        <el-descriptions-item label="Time (X-axis)">
          Horizontal position represents time, with newer data on the right
        </el-descriptions-item>
        <el-descriptions-item label="Frequency (Y-axis)">
          Vertical position represents frequency in Hz, with low frequencies at the bottom
        </el-descriptions-item>
        <el-descriptions-item label="Color">
          Brighter/warmer colors indicate more power at that frequency
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import translations from '../../utils/translations'

export default {
  name: 'SpectroModule',
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
    const spectroCanvas = ref(null)
    let ctx = null
    const spectroData = ref([])
    const maxHistory = 100 // 保留100个时间点

    const isConnected = computed(() => {
      return props.status.includes('Connected')
    })

    function initCanvas() {
      if (!spectroCanvas.value) return
      ctx = spectroCanvas.value.getContext('2d')
      spectroCanvas.value.width = 600
      spectroCanvas.value.height = 300
      clearCanvas()
    }

    function clearCanvas() {
      if (!ctx) return
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, spectroCanvas.value.width, spectroCanvas.value.height)
    }

    function valueToColor(value, maxVal) {
      // 将值映射到颜色 (深蓝 -> 青色 -> 绿色 -> 黄色 -> 红色)
      const normalized = Math.min(value / (maxVal || 1), 1)
      
      const r = Math.floor(255 * Math.min(normalized * 2, 1))
      const g = Math.floor(255 * (normalized < 0.5 ? normalized * 2 : 2 - normalized * 2))
      const b = Math.floor(255 * Math.max(1 - normalized * 2, 0))
      
      return `rgb(${r}, ${g}, ${b})`
    }

    function updateSpectrogram() {
      if (!ctx || !spectroCanvas.value) return

      const psd = props.data.ch0.datasets[0].data
      if (!psd || psd.length === 0) return

      // 添加新的频谱数据
      spectroData.value.push([...psd])
      
      // 限制历史数据长度
      if (spectroData.value.length > maxHistory) {
        spectroData.value.shift()
      }

      // 绘制频谱图
      const width = spectroCanvas.value.width
      const height = spectroCanvas.value.height
      const timeSliceWidth = width / maxHistory
      const freqBinHeight = height / (psd.length || 1)

      // 找到最大值用于归一化
      let maxVal = 0
      spectroData.value.forEach(slice => {
        slice.forEach(v => {
          if (v > maxVal) maxVal = v
        })
      })

      // 清空并重绘
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)

      spectroData.value.forEach((slice, timeIndex) => {
        const x = timeIndex * timeSliceWidth
        
        slice.forEach((value, freqIndex) => {
          const y = height - (freqIndex + 1) * freqBinHeight
          ctx.fillStyle = valueToColor(value, maxVal)
          ctx.fillRect(x, y, timeSliceWidth + 1, freqBinHeight + 1)
        })
      })

      // 绘制轴标签
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.fillText('Time →', width - 50, height - 5)
      ctx.save()
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('Frequency →', -height / 2, 15)
      ctx.restore()
    }

    onMounted(() => {
      initCanvas()
    })

    watch(() => props.data, () => {
      updateSpectrogram()
    }, { deep: true })

    onUnmounted(() => {
      spectroData.value = []
    })

    return {
      spectroCanvas,
      isConnected
    }
  }
}
</script>

<style scoped>
.spectro-module {
  padding: 10px 0;
}

.spectro-container {
  width: 100%;
  display: flex;
  justify-content: center;
  background: #1a1a2e;
  padding: 20px;
  border-radius: 8px;
}

.spectro-container canvas {
  border: 1px solid #333;
  border-radius: 4px;
}

.color-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  gap: 10px;
  font-size: 12px;
  color: #666;
}

.gradient-bar {
  width: 200px;
  height: 20px;
  background: linear-gradient(to right, 
    rgb(0, 0, 255), 
    rgb(0, 255, 255), 
    rgb(0, 255, 0), 
    rgb(255, 255, 0), 
    rgb(255, 0, 0)
  );
  border-radius: 4px;
}
</style>
