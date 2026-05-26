<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">Brain Controlled Animation</h3>
    </div>
    <div class="card-section">
      <div class="text-container">
        <p>
          This module lets you control animations using your brain activity. The frequency band power 
          from the left frontal electrode (AF7) is used to control various P5.js animations.
        </p>
        <p>
          Select different animations from the dropdown to see how your brain activity can be visualized in real-time.
        </p>
      </div>
    </div>
    <div class="card-section">
      <div class="card-section-title">Choice of Animation</div>
      <select class="select" v-model="selectedAnimation" style="max-width: 400px;">
        <option v-for="anim in animations" :key="anim.value" :value="anim.value">
          {{ anim.label }}
        </option>
      </select>
    </div>
    <div class="card-section">
      <div class="p5-container" ref="canvasContainer">
        <div v-if="!isConnected" style="width: 400px; height: 400px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 8px;">
          <p>Connect the device to see the animation</p>
        </div>
      </div>
      <div class="text-container" style="margin-top: 16px;">
        <p><strong>Current Values:</strong></p>
        <p>Delta: {{ delta.toFixed(2) }} | Theta: {{ theta.toFixed(2) }} | Alpha: {{ alpha.toFixed(2) }} | Beta: {{ beta.toFixed(2) }} | Gamma: {{ gamma.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  data: { type: Object, required: true }
})

const selectedAnimation = ref('bands')
const canvasContainer = ref(null)
let p5Instance = null

const animations = [
  { label: '3D Frequency Bands', value: 'bands' },
  { label: 'Control a Cube with Alpha Power', value: 'cube' },
  { label: 'Control a Flock with Alpha and Beta', value: 'flock' },
  { label: 'Draw with Alpha and Beta', value: 'draw' }
]

const delta = computed(() => window.delta || 0)
const theta = computed(() => window.theta || 0)
const alpha = computed(() => window.alpha || 0)
const beta = computed(() => window.beta || 0)
const gamma = computed(() => window.gamma || 0)

const isConnected = computed(() => {
  return props.data?.ch1?.datasets?.[0]?.data?.length > 0
})

// Simple canvas-based visualization instead of P5.js for compatibility
function drawVisualization() {
  if (!canvasContainer.value || !isConnected.value) return
  
  // Clear existing canvas
  const existingCanvas = canvasContainer.value.querySelector('canvas')
  if (existingCanvas) {
    existingCanvas.remove()
  }
  
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  canvasContainer.value.appendChild(canvas)
  
  const ctx = canvas.getContext('2d')
  
  function animate() {
    if (!isConnected.value) return
    
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 400, 400)
    
    const d = window.delta || 0
    const t = window.theta || 0
    const a = window.alpha || 0
    const b = window.beta || 0
    const g = window.gamma || 0
    
    if (selectedAnimation.value === 'bands') {
      // Draw frequency bands as bars
      const bands = [d, t, a, b, g]
      const colors = ['#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9']
      const labels = ['δ', 'θ', 'α', 'β', 'γ']
      const barWidth = 60
      const spacing = 20
      const startX = (400 - (5 * barWidth + 4 * spacing)) / 2
      
      bands.forEach((val, i) => {
        const height = Math.min(val * 3, 300)
        const x = startX + i * (barWidth + spacing)
        const y = 350 - height
        
        ctx.fillStyle = colors[i]
        ctx.fillRect(x, y, barWidth, height)
        
        ctx.fillStyle = '#fff'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(labels[i], x + barWidth / 2, 380)
        ctx.fillText(val.toFixed(1), x + barWidth / 2, y - 10)
      })
    } else if (selectedAnimation.value === 'cube') {
      // Draw a cube that rotates based on alpha
      const size = 50 + a * 2
      const rotation = Date.now() / 1000 + a / 10
      
      ctx.save()
      ctx.translate(200, 200)
      ctx.rotate(rotation)
      ctx.fillStyle = `hsl(${a * 3}, 70%, 50%)`
      ctx.fillRect(-size / 2, -size / 2, size, size)
      ctx.restore()
    } else if (selectedAnimation.value === 'flock' || selectedAnimation.value === 'draw') {
      // Draw particles influenced by alpha and beta
      const numParticles = 20
      for (let i = 0; i < numParticles; i++) {
        const angle = (Date.now() / 1000 + i * 0.5) * (1 + b / 50)
        const radius = 50 + a * 2 + Math.sin(Date.now() / 500 + i) * 30
        const x = 200 + Math.cos(angle) * radius
        const y = 200 + Math.sin(angle) * radius
        
        ctx.beginPath()
        ctx.arc(x, y, 5 + a / 10, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${(i * 20 + b * 3) % 360}, 70%, 50%, 0.8)`
        ctx.fill()
      }
    }
    
    requestAnimationFrame(animate)
  }
  
  animate()
}

watch([isConnected, selectedAnimation], () => {
  drawVisualization()
})

onMounted(() => {
  if (isConnected.value) {
    drawVisualization()
  }
})

onUnmounted(() => {
  if (p5Instance) {
    p5Instance.remove()
  }
})
</script>
