<template>
  <div ref="sketchContainer" class="sketch-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import p5 from 'p5';

const props = defineProps({
  sketch: {
    type: Function,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

const sketchContainer = ref(null);
let p5Instance = null;

onMounted(() => {
  createSketch();
});

onUnmounted(() => {
  if (p5Instance) {
    p5Instance.remove();
  }
});

watch(() => props.data, (newData) => {
  if (p5Instance && p5Instance.updateData) {
    p5Instance.updateData(newData);
  }
}, { deep: true });

function createSketch() {
  p5Instance = new p5((p) => {
    props.sketch(p, props.data);
    
    // Add method to update data
    p.updateData = (newData) => {
      Object.assign(props.data, newData);
    };
  }, sketchContainer.value);
}
</script>

<style scoped>
.sketch-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
