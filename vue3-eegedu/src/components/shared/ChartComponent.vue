<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const props = defineProps({
  type: {
    type: String,
    default: 'line'
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
});

const chartContainer = ref(null);
let chart = null;
let canvas = null;

onMounted(() => {
  canvas = document.createElement('canvas');
  chartContainer.value.appendChild(canvas);
  createChart();
});

onUnmounted(() => {
  if (chart) {
    chart.destroy();
  }
});

watch(() => props.data, (newData) => {
  if (chart) {
    chart.data = newData;
    chart.update('none');
  }
}, { deep: true });

watch(() => props.options, (newOptions) => {
  if (chart) {
    chart.options = { ...chart.options, ...newOptions };
    chart.update('none');
  }
}, { deep: true });

function createChart() {
  const ctx = canvas.getContext('2d');
  chart = new Chart(ctx, {
    type: props.type,
    data: props.data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      ...props.options
    }
  });
}
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-container canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
