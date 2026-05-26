<template>
  <div class="module-container">
    <EEGEduPredictIntro v-if="!status" />
    <EEGEduPredictTrain 
      v-else
      :status="status"
      :classifier="classifier"
      :currentPrediction="currentPrediction"
      :settings="settings"
      @train="handleTrain"
      @clear="handleClear"
    />
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, inject } from 'vue';
import { buildPredictPipe, extractFeatures, SimpleClassifier } from './predictPipe';
import EEGEduPredictIntro from './EEGEduPredictIntro.vue';
import EEGEduPredictTrain from './EEGEduPredictTrain.vue';

const props = defineProps({
  status: String,
  rawObservable: Object,
  settings: Object
});

const classifier = ref(new SimpleClassifier());
const currentPrediction = ref(null);
const subscription = ref(null);

// Watch for status changes
watch(() => props.status, (newStatus) => {
  if (newStatus === 'on' && props.rawObservable) {
    startPrediction();
  } else {
    stopPrediction();
  }
});

// Watch for rawObservable changes
watch(() => props.rawObservable, (newObservable) => {
  if (props.status === 'on' && newObservable) {
    stopPrediction();
    startPrediction();
  }
});

function startPrediction() {
  if (!props.rawObservable) return;
  
  const pipe = buildPredictPipe(props.settings);
  if (!pipe) return;
  
  subscription.value = props.rawObservable.pipe(pipe).subscribe(data => {
    if (data && data.data) {
      const features = extractFeatures(data.data);
      const prediction = classifier.value.predict(features);
      currentPrediction.value = prediction;
    }
  });
}

function stopPrediction() {
  if (subscription.value) {
    subscription.value.unsubscribe();
    subscription.value = null;
  }
}

function handleTrain(label, features) {
  classifier.value.addTrainingSample(features, label);
}

function handleClear() {
  classifier.value.clear();
  currentPrediction.value = null;
}

onUnmounted(() => {
  stopPrediction();
});
</script>

<style scoped>
.module-container {
  padding: 20px;
}
</style>
