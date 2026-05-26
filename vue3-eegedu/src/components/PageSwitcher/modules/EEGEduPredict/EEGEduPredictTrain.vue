<template>
  <div class="predict-container">
    <div class="card">
      <div class="card-section purple">
        <h2>Brain State Classification</h2>
      </div>
      <div class="card-section">
        <!-- Training Controls -->
        <div class="training-section">
          <h3>Training</h3>
          <div class="button-group">
            <button 
              class="btn btn-class1" 
              @click="trainClass(1)"
              :disabled="status !== 'on'"
            >
              Train Class 1 ({{ classCounts[1] || 0 }} samples)
            </button>
            <button 
              class="btn btn-class2" 
              @click="trainClass(2)"
              :disabled="status !== 'on'"
            >
              Train Class 2 ({{ classCounts[2] || 0 }} samples)
            </button>
            <button 
              class="btn btn-clear" 
              @click="clearTraining"
            >
              Clear All
            </button>
          </div>
        </div>

        <!-- Prediction Display -->
        <div class="prediction-section">
          <h3>Current Prediction</h3>
          <div class="prediction-display" :class="predictionClass">
            <span v-if="currentPrediction === null">No prediction yet</span>
            <span v-else-if="currentPrediction === 1">Class 1</span>
            <span v-else-if="currentPrediction === 2">Class 2</span>
            <span v-else>Unknown</span>
          </div>
        </div>

        <!-- Status -->
        <div class="status-section">
          <div class="status-item">
            <span class="label">Status:</span>
            <span :class="['status-indicator', status === 'on' ? 'active' : 'inactive']">
              {{ status === 'on' ? 'Streaming' : 'Stopped' }}
            </span>
          </div>
          <div class="status-item">
            <span class="label">Total Samples:</span>
            <span>{{ totalSamples }}</span>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions">
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Maintain a consistent mental state (e.g., relaxed)</li>
            <li>Click "Train Class 1" multiple times while maintaining that state</li>
            <li>Switch to a different mental state (e.g., focused)</li>
            <li>Click "Train Class 2" multiple times</li>
            <li>Watch the prediction change as you switch between states</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { extractFeatures } from './predictPipe';

const props = defineProps({
  status: String,
  classifier: Object,
  currentPrediction: Number,
  settings: Object
});

const emit = defineEmits(['train', 'clear']);

const currentFeatures = ref(null);
const classCounts = ref({});

// Update class counts when classifier changes
watch(() => props.classifier, (newClassifier) => {
  if (newClassifier) {
    classCounts.value = newClassifier.getClassCounts();
  }
}, { deep: true });

const predictionClass = computed(() => {
  if (props.currentPrediction === 1) return 'class1';
  if (props.currentPrediction === 2) return 'class2';
  return 'none';
});

const totalSamples = computed(() => {
  return (classCounts.value[1] || 0) + (classCounts.value[2] || 0);
});

function trainClass(classLabel) {
  if (currentFeatures.value) {
    emit('train', classLabel, currentFeatures.value);
    classCounts.value = props.classifier.getClassCounts();
  }
}

function clearTraining() {
  emit('clear');
  classCounts.value = {};
}
</script>

<style scoped>
.predict-container {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-section {
  padding: 20px;
}

.card-section.purple {
  background: #8e44ad;
  color: white;
}

.card-section h2 {
  margin: 0;
  font-size: 24px;
}

.card-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
}

.training-section,
.prediction-section,
.status-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-class1 {
  background: #3498db;
  color: white;
}

.btn-class1:hover:not(:disabled) {
  background: #2980b9;
}

.btn-class2 {
  background: #e74c3c;
  color: white;
}

.btn-class2:hover:not(:disabled) {
  background: #c0392b;
}

.btn-clear {
  background: #95a5a6;
  color: white;
}

.btn-clear:hover {
  background: #7f8c8d;
}

.prediction-display {
  padding: 30px;
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  border-radius: 8px;
  transition: all 0.3s;
}

.prediction-display.none {
  background: #f5f5f5;
  color: #999;
}

.prediction-display.class1 {
  background: #3498db;
  color: white;
}

.prediction-display.class2 {
  background: #e74c3c;
  color: white;
}

.status-section {
  display: flex;
  gap: 30px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item .label {
  color: #666;
}

.status-indicator {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-indicator.active {
  background: #27ae60;
  color: white;
}

.status-indicator.inactive {
  background: #e74c3c;
  color: white;
}

.instructions {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
}

.instructions p {
  margin: 0 0 10px 0;
  color: #333;
}

.instructions ol {
  margin: 0;
  padding-left: 20px;
  color: #666;
  line-height: 1.8;
}
</style>
