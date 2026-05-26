<template>
  <div class="card" :class="cardClass">
    <div v-if="title" class="card-header" :class="headerClass">
      <h3>{{ title }}</h3>
    </div>
    <div class="card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  color: {
    type: String,
    default: 'default'
  }
});

const cardClass = computed(() => {
  return `card-${props.color}`;
});

const headerClass = computed(() => {
  return `header-${props.color}`;
});
</script>

<style scoped>
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
}

.card-header {
  padding: 15px 20px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.card-body {
  padding: 20px;
}

/* Color variants */
.header-default {
  background: #4834d4;
}

.header-green {
  background: #27ae60;
}

.header-blue {
  background: #3498db;
}

.header-purple {
  background: #8e44ad;
}

.header-red {
  background: #e74c3c;
}

.header-orange {
  background: #f39c12;
}

.header-grey {
  background: #95a5a6;
}
</style>
