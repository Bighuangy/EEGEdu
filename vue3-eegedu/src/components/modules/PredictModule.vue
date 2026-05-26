<template>
  <div class="predict-module">
    <el-card shadow="hover">
      <template #header>
        <span>{{ t.title }}</span>
      </template>

      <p>{{ t.description }}</p>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        This module uses a K-Nearest Neighbors (KNN) classifier to learn to distinguish between different brain states.
        Record at least 5 examples of each state before predicting.
      </el-alert>
    </el-card>

    <!-- 训练数据录制 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Record Training Data</span>
      </template>

      <el-row :gutter="20">
        <el-col :span="24" :md="8">
          <el-button
            type="primary"
            :disabled="isPredicting || !isConnected"
            @click="addExample('A')"
            style="width: 100%; margin-bottom: 10px;"
          >
            Record Eyes Closed Data - Count: {{ exampleCounts.A }}
          </el-button>
        </el-col>
        <el-col :span="24" :md="8">
          <el-button
            type="success"
            :disabled="isPredicting || !isConnected"
            @click="addExample('B')"
            style="width: 100%; margin-bottom: 10px;"
          >
            Record Eyes Open Data - Count: {{ exampleCounts.B }}
          </el-button>
        </el-col>
        <el-col :span="24" :md="8">
          <el-button
            type="danger"
            :disabled="isPredicting || !isConnected"
            @click="addExample('C')"
            style="width: 100%; margin-bottom: 10px;"
          >
            Record Blinking Data - Count: {{ exampleCounts.C }}
          </el-button>
        </el-col>
      </el-row>

      <el-progress
        v-if="exampleCounts.A > 0 || exampleCounts.B > 0 || exampleCounts.C > 0"
        :percentage="trainingProgress"
        :format="formatProgress"
        style="margin-top: 15px;"
      />
    </el-card>

    <!-- 预测 -->
    <el-card shadow="hover" style="margin-top: 20px;">
      <template #header>
        <span>Predict Current Brain State</span>
      </template>

      <el-button
        type="primary"
        size="large"
        :disabled="isPredicting || !enoughLabels || !isConnected"
        @click="startPrediction"
        style="width: 100%; margin-bottom: 20px;"
      >
        {{ isPredicting ? 'Predicting...' : 'Start Prediction' }}
      </el-button>

      <el-button
        v-if="isPredicting"
        type="warning"
        @click="stopPrediction"
        style="width: 100%; margin-bottom: 20px;"
      >
        Stop Prediction
      </el-button>

      <!-- 预测结果显示 -->
      <div v-if="isPredicting || hasResults" class="prediction-results">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="Eyes Closed">
              <template #value>
                <span :class="{ 'active-state': currentLabel === 'A' }">
                  {{ (confidences.A * 100).toFixed(1) }}%
                </span>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="Eyes Open">
              <template #value>
                <span :class="{ 'active-state': currentLabel === 'B' }">
                  {{ (confidences.B * 100).toFixed(1) }}%
                </span>
              </template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="Blinking">
              <template #value>
                <span :class="{ 'active-state': currentLabel === 'C' }">
                  {{ (confidences.C * 100).toFixed(1) }}%
                </span>
              </template>
            </el-statistic>
          </el-col>
        </el-row>

        <!-- 可视化状态指示器 -->
        <div class="state-indicator" :class="stateClass">
          <div class="state-icon">{{ stateEmoji }}</div>
          <div class="state-text">{{ stateText }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import translations from '../../utils/translations'

// 简单的KNN分类器
class SimpleKNN {
  constructor() {
    this.examples = { A: [], B: [], C: [] }
  }

  addExample(features, label) {
    if (this.examples[label]) {
      this.examples[label].push([...features])
    }
  }

  getNumLabels() {
    return Object.keys(this.examples).filter(k => this.examples[k].length > 0).length
  }

  getExampleCounts() {
    return {
      A: this.examples.A.length,
      B: this.examples.B.length,
      C: this.examples.C.length
    }
  }

  // 计算欧氏距离
  distance(a, b) {
    if (!a || !b || a.length !== b.length) return Infinity
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow((a[i] || 0) - (b[i] || 0), 2)
    }
    return Math.sqrt(sum)
  }

  classify(features, k = 3, callback) {
    if (!features || features.length === 0) {
      callback(null, { label: 'A', confidencesByLabel: { A: 0.33, B: 0.33, C: 0.33 } })
      return
    }

    const allExamples = []
    Object.keys(this.examples).forEach(label => {
      this.examples[label].forEach(example => {
        allExamples.push({ features: example, label, distance: this.distance(features, example) })
      })
    })

    allExamples.sort((a, b) => a.distance - b.distance)
    const nearest = allExamples.slice(0, k)

    // 计算置信度
    const counts = { A: 0, B: 0, C: 0 }
    nearest.forEach(n => counts[n.label]++)
    
    const total = nearest.length || 1
    const confidencesByLabel = {
      A: counts.A / total,
      B: counts.B / total,
      C: counts.C / total
    }

    // 找到最高置信度的标签
    let maxLabel = 'A'
    let maxConf = 0
    Object.keys(confidencesByLabel).forEach(label => {
      if (confidencesByLabel[label] > maxConf) {
        maxConf = confidencesByLabel[label]
        maxLabel = label
      }
    })

    callback(null, { label: maxLabel, confidencesByLabel })
  }
}

export default {
  name: 'PredictModule',
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
    const t = translations.predict
    const classifier = new SimpleKNN()
    
    const exampleCounts = ref({ A: 0, B: 0, C: 0 })
    const isPredicting = ref(false)
    const enoughLabels = ref(false)
    const currentLabel = ref('A')
    const confidences = ref({ A: 0.33, B: 0.33, C: 0.33 })
    const hasResults = ref(false)

    let predictionInterval = null

    const isConnected = computed(() => {
      return props.status.includes('Connected')
    })

    const trainingProgress = computed(() => {
      const total = exampleCounts.value.A + exampleCounts.value.B + exampleCounts.value.C
      return Math.min((total / 15) * 100, 100) // 目标是每类5个样本
    })

    const stateClass = computed(() => {
      return {
        'state-a': currentLabel.value === 'A',
        'state-b': currentLabel.value === 'B',
        'state-c': currentLabel.value === 'C'
      }
    })

    const stateEmoji = computed(() => {
      const emojis = { A: '😌', B: '👀', C: '😑' }
      return emojis[currentLabel.value]
    })

    const stateText = computed(() => {
      const texts = { A: 'Eyes Closed', B: 'Eyes Open', C: 'Blinking' }
      return texts[currentLabel.value]
    })

    function formatProgress(percentage) {
      return `Training: ${Math.round(percentage)}%`
    }

    function getCurrentPSD() {
      // 从data中提取PSD特征
      const psd = []
      if (props.data.ch0.datasets[0].data) {
        psd.push(...props.data.ch0.datasets[0].data)
      }
      return psd
    }

    function addExample(label) {
      const psd = getCurrentPSD()
      if (psd.length > 0) {
        classifier.addExample(psd, label)
        exampleCounts.value = classifier.getExampleCounts()
        enoughLabels.value = classifier.getNumLabels() >= 3
      }
    }

    function classify() {
      const psd = getCurrentPSD()
      classifier.classify(psd, 3, (err, result) => {
        if (result) {
          confidences.value = result.confidencesByLabel
          currentLabel.value = result.label
          hasResults.value = true
        }
      })
    }

    function startPrediction() {
      isPredicting.value = true
      // 每500ms进行一次分类
      predictionInterval = setInterval(() => {
        if (isPredicting.value) {
          classify()
        }
      }, 500)
    }

    function stopPrediction() {
      isPredicting.value = false
      if (predictionInterval) {
        clearInterval(predictionInterval)
        predictionInterval = null
      }
    }

    onUnmounted(() => {
      stopPrediction()
    })

    return {
      t,
      exampleCounts,
      isPredicting,
      enoughLabels,
      currentLabel,
      confidences,
      hasResults,
      isConnected,
      trainingProgress,
      stateClass,
      stateEmoji,
      stateText,
      formatProgress,
      addExample,
      startPrediction,
      stopPrediction
    }
  }
}
</script>

<style scoped>
.predict-module {
  padding: 10px 0;
}

.prediction-results {
  margin-top: 20px;
}

.active-state {
  color: #409EFF;
  font-weight: bold;
  font-size: 1.2em;
}

.state-indicator {
  margin-top: 30px;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s ease;
}

.state-indicator.state-a {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.state-indicator.state-b {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.state-indicator.state-c {
  background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
  color: white;
}

.state-icon {
  font-size: 60px;
  margin-bottom: 10px;
}

.state-text {
  font-size: 24px;
  font-weight: bold;
}
</style>
