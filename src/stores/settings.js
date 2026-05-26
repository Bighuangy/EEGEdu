import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Module definitions - same order as original
export const moduleNames = {
  INTRO: 'intro',
  HEART_RAW: 'heartRaw',
  HEART_SPECTRA: 'heartSpectra',
  RAW: 'raw',
  SPECTRA: 'spectra',
  BANDS: 'bands',
  ANIMATE: 'animate',
  SPECTRO: 'spectro',
  ALPHA: 'alpha',
  SSVEP: 'ssvep',
  EVOKED: 'evoked',
  PREDICT: 'predict'
}

export const moduleList = [
  { key: moduleNames.INTRO, title: 'Introduction', icon: 'InfoFilled' },
  { key: moduleNames.HEART_RAW, title: 'Heart (Raw)', icon: 'TrendCharts' },
  { key: moduleNames.HEART_SPECTRA, title: 'Heart (Spectra)', icon: 'DataLine' },
  { key: moduleNames.RAW, title: 'Raw', icon: 'TrendCharts' },
  { key: moduleNames.SPECTRA, title: 'Spectra', icon: 'DataLine' },
  { key: moduleNames.BANDS, title: 'Bands', icon: 'Histogram' },
  { key: moduleNames.ANIMATE, title: 'Animate', icon: 'VideoPlay' },
  { key: moduleNames.SPECTRO, title: 'Spectrogram', icon: 'PictureFilled' },
  { key: moduleNames.ALPHA, title: 'Alpha', icon: 'View' },
  { key: moduleNames.SSVEP, title: 'SSVEP', icon: 'MagicStick' },
  { key: moduleNames.EVOKED, title: 'Evoked', icon: 'Lightning' },
  { key: moduleNames.PREDICT, title: 'Predict', icon: 'cpu' }
]

export const useSettingsStore = defineStore('settings', () => {
  // Current module
  const currentModule = ref(moduleNames.INTRO)
  
  // General settings
  const sampleRate = ref(256) // Muse default sample rate
  const duration = ref(256) // Number of samples to display
  const interval = ref(1) // Update interval in samples
  const filterEnabled = ref(true)
  const cutOffLow = ref(2) // Low cutoff frequency
  const cutOffHigh = ref(50) // High cutoff frequency
  const nbChannels = ref(4) // Number of EEG channels
  
  // Chart settings
  const chartTheme = ref('dark') // 'dark' | 'light'
  const showAllChannels = ref(true)
  const selectedChannel = ref(0)
  
  // Spectra settings
  const nfft = ref(256) // FFT size
  const sliceFFTLow = ref(1) // Low frequency display
  const sliceFFTHigh = ref(50) // High frequency display
  const bins = ref(256)
  
  // Bands settings
  const bandRanges = ref({
    delta: [1, 4],
    theta: [4, 8],
    alpha: [8, 13],
    beta: [13, 30],
    gamma: [30, 50]
  })
  
  // Animate settings
  const animationType = ref('bands') // 'bands' | 'cube' | 'draw' | 'flock' | 'flock3d' | 'tone'
  const animationSpeed = ref(1)
  
  // Spectrogram settings
  const spectroColorMap = ref('plasma')
  const spectroScale = ref('linear')
  
  // Alpha settings
  const alphaThreshold = ref(0.5)
  const eyesClosedDuration = ref(3000) // ms
  
  // SSVEP settings
  const ssvepFrequencyFast = ref(15) // Hz
  const ssvepFrequencySlow = ref(10) // Hz
  const ssvepTestDuration = ref(10000) // ms
  
  // Evoked settings
  const evokedStimDuration = ref(100) // ms
  const evokedTrials = ref(20)
  const evokedInterval = ref(2000) // ms
  
  // Predict settings
  const predictModel = ref('knn') // 'knn' | 'nn'
  const predictEpochs = ref(50)
  const predictK = ref(3)
  const predictionLabels = ref(['Relaxed', 'Focused'])
  
  // Module-specific settings
  const moduleSettings = ref({})
  
  // Computed
  const currentModuleInfo = computed(() => {
    return moduleList.find(m => m.key === currentModule.value) || moduleList[0]
  })
  
  // Actions
  function setModule(moduleName) {
    if (moduleList.some(m => m.key === moduleName)) {
      currentModule.value = moduleName
    }
  }
  
  function updateSetting(key, value) {
    if (key in this) {
      this[key] = value
    }
  }
  
  function updateModuleSettings(moduleName, settings) {
    moduleSettings.value[moduleName] = {
      ...moduleSettings.value[moduleName],
      ...settings
    }
  }
  
  function getModuleSettings(moduleName) {
    return moduleSettings.value[moduleName] || {}
  }
  
  function resetToDefaults() {
    sampleRate.value = 256
    duration.value = 256
    interval.value = 1
    filterEnabled.value = true
    cutOffLow.value = 2
    cutOffHigh.value = 50
    nbChannels.value = 4
    nfft.value = 256
    sliceFFTLow.value = 1
    sliceFFTHigh.value = 50
    bins.value = 256
  }
  
  return {
    // State
    currentModule,
    sampleRate,
    duration,
    interval,
    filterEnabled,
    cutOffLow,
    cutOffHigh,
    nbChannels,
    chartTheme,
    showAllChannels,
    selectedChannel,
    nfft,
    sliceFFTLow,
    sliceFFTHigh,
    bins,
    bandRanges,
    animationType,
    animationSpeed,
    spectroColorMap,
    spectroScale,
    alphaThreshold,
    eyesClosedDuration,
    ssvepFrequencyFast,
    ssvepFrequencySlow,
    ssvepTestDuration,
    evokedStimDuration,
    evokedTrials,
    evokedInterval,
    predictModel,
    predictEpochs,
    predictK,
    predictionLabels,
    moduleSettings,
    
    // Computed
    currentModuleInfo,
    
    // Actions
    setModule,
    updateSetting,
    updateModuleSettings,
    getModuleSettings,
    resetToDefaults
  }
})
