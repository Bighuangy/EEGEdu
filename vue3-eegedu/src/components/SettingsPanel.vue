<template>
  <el-card class="settings-panel" shadow="hover">
    <template #header>
      <span>{{ settings.name }} Settings</span>
    </template>

    <el-form label-position="top">
      <!-- 时长设置 -->
      <el-form-item v-if="settings.duration !== undefined" label="Epoch duration (Sampling Points)">
        <el-slider
          :model-value="settings.duration"
          :min="1"
          :max="4096"
          :step="moduleType === 'raw' ? 1 : 128"
          show-input
          :disabled="isDisabled"
          @update:model-value="updateSetting('duration', $event)"
        />
      </el-form-item>

      <!-- 间隔设置 -->
      <el-form-item v-if="settings.interval !== undefined" label="Sampling points between epochs onsets">
        <el-slider
          :model-value="settings.interval"
          :min="1"
          :max="settings.duration || 1024"
          :step="moduleType === 'raw' ? 1 : 5"
          show-input
          :disabled="isDisabled"
          @update:model-value="updateSetting('interval', $event)"
        />
      </el-form-item>

      <!-- 低频截止 -->
      <el-form-item v-if="settings.cutOffLow !== undefined" :label="`Cutoff Frequency Low: ${settings.cutOffLow} Hz`">
        <el-slider
          :model-value="settings.cutOffLow"
          :min="0.01"
          :max="(settings.cutOffHigh || 100) - 0.5"
          :step="0.5"
          :disabled="isDisabled"
          @update:model-value="updateSetting('cutOffLow', $event)"
        />
      </el-form-item>

      <!-- 高频截止 -->
      <el-form-item v-if="settings.cutOffHigh !== undefined" :label="`Cutoff Frequency High: ${settings.cutOffHigh} Hz`">
        <el-slider
          :model-value="settings.cutOffHigh"
          :min="(settings.cutOffLow || 0.01) + 0.5"
          :max="(settings.srate || 256) / 2"
          :step="0.5"
          :disabled="isDisabled"
          @update:model-value="updateSetting('cutOffHigh', $event)"
        />
      </el-form-item>

      <!-- FFT切片低频 -->
      <el-form-item v-if="settings.sliceFFTLow !== undefined" :label="`Slice FFT Lower limit: ${settings.sliceFFTLow} Hz`">
        <el-slider
          :model-value="settings.sliceFFTLow"
          :min="1"
          :max="(settings.sliceFFTHigh || 100) - 1"
          :disabled="isDisabled"
          @update:model-value="updateSetting('sliceFFTLow', $event)"
        />
      </el-form-item>

      <!-- FFT切片高频 -->
      <el-form-item v-if="settings.sliceFFTHigh !== undefined" :label="`Slice FFT Upper limit: ${settings.sliceFFTHigh} Hz`">
        <el-slider
          :model-value="settings.sliceFFTHigh"
          :min="(settings.sliceFFTLow || 1) + 1"
          :max="(settings.srate || 256) / 2"
          :disabled="isDisabled"
          @update:model-value="updateSetting('sliceFFTHigh', $event)"
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { computed } from 'vue'
import translations from '../utils/translations'

export default {
  name: 'SettingsPanel',
  props: {
    settings: {
      type: Object,
      required: true
    },
    status: {
      type: String,
      required: true
    },
    moduleType: {
      type: String,
      required: true
    }
  },
  emits: ['update:settings'],
  setup(props, { emit }) {
    const isDisabled = computed(() => props.status === translations.connect)

    function updateSetting(key, value) {
      emit('update:settings', { [key]: value })
    }

    return {
      isDisabled,
      updateSetting
    }
  }
}
</script>

<style scoped>
.settings-panel {
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
