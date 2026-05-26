<template>
  <div class="animate-module">
    <el-card shadow="hover">
      <template #header>
        <span>{{ t.title }}</span>
      </template>

      <p>{{ t.description }}</p>

      <el-row :gutter="20">
        <el-col :span="24" :md="8">
          <el-image
            src="https://raw.githubusercontent.com/NeuroTechX/eeg-101/master/EEG101/src/assets/electrodediagram2.png"
            fit="contain"
            style="width: 100%; max-width: 200px; margin: 15px 0;"
          />
          <p>Using data from the AF7 (left frontal) electrode to control animations.</p>
          <el-link type="primary" href="https://p5js.org/learn/interactivity.html" target="_blank">
            Learn more about P5.js animations
          </el-link>
        </el-col>
        <el-col :span="24" :md="16">
          <!-- 动画选择器 -->
          <el-form-item label="Choose Animation">
            <el-select v-model="selectedAnimation" style="width: 100%;">
              <el-option
                v-for="option in animationOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>

          <!-- P5画布容器 -->
          <div ref="p5Container" class="p5-container"></div>

          <!-- 当前值显示 -->
          <el-descriptions :column="5" border size="small" style="margin-top: 15px;">
            <el-descriptions-item label="Delta">{{ bandValues.delta.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="Theta">{{ bandValues.theta.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="Alpha">{{ bandValues.alpha.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="Beta">{{ bandValues.beta.toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="Gamma">{{ bandValues.gamma.toFixed(2) }}</el-descriptions-item>
          </el-descriptions>
        </el-col>
      </el-row>

      <el-alert
        v-if="!isConnected"
        title="Connect the device above to see the animation respond to your brain waves."
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
import p5 from 'p5'
import translations from '../../utils/translations'

export default {
  name: 'AnimateModule',
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
    const t = translations.animate
    const p5Container = ref(null)
    const selectedAnimation = ref('bands')
    let p5Instance = null

    const animationOptions = [
      { label: '3D Frequency Bands', value: 'bands' },
      { label: 'Control a Cube with Alpha', value: 'cube' },
      { label: 'Particle System', value: 'particles' },
      { label: 'Wave Visualization', value: 'wave' }
    ]

    const isConnected = computed(() => {
      return props.status.includes('Connected')
    })

    const bandValues = computed(() => {
      return {
        delta: window.delta || 0,
        theta: window.theta || 0,
        alpha: window.alpha || 0,
        beta: window.beta || 0,
        gamma: window.gamma || 0
      }
    })

    // 频带柱状图动画
    function sketchBands(p) {
      p.setup = function() {
        p.createCanvas(400, 300, p.WEBGL)
        p.colorMode(p.HSB, 360, 100, 100)
      }

      p.draw = function() {
        p.background(220)
        p.orbitControl()
        p.rotateX(-0.3)
        p.rotateY(p.frameCount * 0.005)

        const bands = [
          { name: 'Delta', value: window.delta || 0, color: 0 },
          { name: 'Theta', value: window.theta || 0, color: 60 },
          { name: 'Alpha', value: window.alpha || 0, color: 120 },
          { name: 'Beta', value: window.beta || 0, color: 200 },
          { name: 'Gamma', value: window.gamma || 0, color: 280 }
        ]

        const barWidth = 50
        const spacing = 70
        const startX = -2 * spacing

        bands.forEach((band, i) => {
          const height = p.map(band.value, 0, 50, 10, 200)
          p.push()
          p.translate(startX + i * spacing, 0, 0)
          p.fill(band.color, 80, 90)
          p.box(barWidth, height, barWidth)
          p.pop()
        })
      }
    }

    // 立方体控制动画
    function sketchCube(p) {
      let angle = 0

      p.setup = function() {
        p.createCanvas(400, 300, p.WEBGL)
      }

      p.draw = function() {
        p.background(250)
        
        const alpha = window.alpha || 20
        const size = p.map(alpha, 0, 100, 50, 200)
        
        p.rotateX(angle)
        p.rotateY(angle * 0.7)
        
        p.fill(100, 150, 200)
        p.stroke(50, 100, 150)
        p.strokeWeight(2)
        p.box(size)
        
        angle += 0.02
      }
    }

    // 粒子系统动画
    function sketchParticles(p) {
      let particles = []

      p.setup = function() {
        p.createCanvas(400, 300)
        for (let i = 0; i < 100; i++) {
          particles.push({
            x: p.random(p.width),
            y: p.random(p.height),
            vx: p.random(-1, 1),
            vy: p.random(-1, 1)
          })
        }
      }

      p.draw = function() {
        p.background(30, 30, 50)
        
        const speed = p.map(window.beta || 10, 0, 50, 0.5, 3)
        const size = p.map(window.alpha || 20, 0, 50, 2, 10)

        particles.forEach((particle, i) => {
          particle.x += particle.vx * speed
          particle.y += particle.vy * speed

          if (particle.x < 0 || particle.x > p.width) particle.vx *= -1
          if (particle.y < 0 || particle.y > p.height) particle.vy *= -1

          p.fill(100 + i, 200, 255, 200)
          p.noStroke()
          p.ellipse(particle.x, particle.y, size)
        })
      }
    }

    // 波形可视化动画
    function sketchWave(p) {
      p.setup = function() {
        p.createCanvas(400, 300)
      }

      p.draw = function() {
        p.background(240)

        const theta = window.theta || 10
        const alpha = window.alpha || 20
        const beta = window.beta || 15

        // 绘制三层波形
        drawWave(p, theta, p.color(255, 100, 100, 150), 0.02)
        drawWave(p, alpha, p.color(100, 255, 100, 150), 0.03)
        drawWave(p, beta, p.color(100, 100, 255, 150), 0.04)
      }

      function drawWave(p, amplitude, col, frequency) {
        p.beginShape()
        p.noFill()
        p.stroke(col)
        p.strokeWeight(2)

        for (let x = 0; x < p.width; x++) {
          const y = p.height / 2 + p.sin(x * frequency + p.frameCount * 0.05) * amplitude * 3
          p.vertex(x, y)
        }
        p.endShape()
      }
    }

    function createSketch() {
      if (p5Instance) {
        p5Instance.remove()
      }

      if (!p5Container.value) return

      let sketchFunction
      switch (selectedAnimation.value) {
        case 'bands':
          sketchFunction = sketchBands
          break
        case 'cube':
          sketchFunction = sketchCube
          break
        case 'particles':
          sketchFunction = sketchParticles
          break
        case 'wave':
          sketchFunction = sketchWave
          break
        default:
          sketchFunction = sketchBands
      }

      p5Instance = new p5(sketchFunction, p5Container.value)
    }

    onMounted(() => {
      createSketch()
    })

    watch(selectedAnimation, () => {
      createSketch()
    })

    onUnmounted(() => {
      if (p5Instance) {
        p5Instance.remove()
      }
    })

    return {
      t,
      p5Container,
      selectedAnimation,
      animationOptions,
      isConnected,
      bandValues
    }
  }
}
</script>

<style scoped>
.animate-module {
  padding: 10px 0;
}

.p5-container {
  width: 100%;
  min-height: 300px;
  background: #f5f5f5;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.p5-container canvas {
  border-radius: 4px;
}
</style>
