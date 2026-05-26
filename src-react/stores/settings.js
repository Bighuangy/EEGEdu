import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // Current selected module
  const selectedModule = ref('intro')
  
  // Recording state
  const recordPop = ref(false)
  const recordTwoPop = ref(false)
  
  // Module settings with default values
  const moduleSettings = reactive({
    intro: {
      cutOffLow: 2,
      cutOffHigh: 20,
      interval: 100,
      srate: 256,
      duration: 1024,
      name: 'intro'
    },
    heartRaw: {
      cutOffLow: 0.1,
      cutOffHigh: 30,
      interval: 50,
      srate: 256,
      duration: 1024,
      name: 'heartRaw'
    },
    heartSpectra: {
      cutOffLow: 0.1,
      cutOffHigh: 30,
      interval: 50,
      srate: 256,
      duration: 1024,
      bins: 256,
      sliceFFTLow: 0,
      sliceFFTHigh: 15,
      name: 'heartSpectra'
    },
    raw: {
      cutOffLow: 2,
      cutOffHigh: 20,
      interval: 100,
      srate: 256,
      duration: 1024,
      name: 'raw'
    },
    spectra: {
      cutOffLow: 1,
      cutOffHigh: 30,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      sliceFFTLow: 1,
      sliceFFTHigh: 30,
      name: 'spectra'
    },
    bands: {
      cutOffLow: 1,
      cutOffHigh: 50,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      name: 'bands'
    },
    animate: {
      cutOffLow: 1,
      cutOffHigh: 50,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      name: 'animate'
    },
    spectro: {
      cutOffLow: 1,
      cutOffHigh: 50,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      sliceFFTLow: 1,
      sliceFFTHigh: 50,
      name: 'spectro'
    },
    alpha: {
      cutOffLow: 1,
      cutOffHigh: 30,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      sliceFFTLow: 1,
      sliceFFTHigh: 30,
      name: 'alpha'
    },
    ssvep: {
      cutOffLow: 1,
      cutOffHigh: 50,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      sliceFFTLow: 1,
      sliceFFTHigh: 30,
      name: 'ssvep'
    },
    evoked: {
      cutOffLow: 0.1,
      cutOffHigh: 30,
      interval: 50,
      srate: 256,
      duration: 768,
      name: 'evoked'
    },
    predict: {
      cutOffLow: 1,
      cutOffHigh: 50,
      interval: 100,
      srate: 256,
      duration: 1024,
      bins: 256,
      name: 'predict'
    }
  })
  
  // Module types list
  const moduleTypes = [
    { label: '1. Introduction', value: 'intro' },
    { label: '2. Electrocardiogram (Heart beats)', value: 'heartRaw' },
    { label: '3. Heart Rate (Beats per minute)', value: 'heartSpectra' },
    { label: '4. Raw and Filtered Data', value: 'raw' },
    { label: '5. Frequency Spectra', value: 'spectra' },
    { label: '6. Frequency Bands', value: 'bands' },
    { label: '7. Brain Controlled Animation', value: 'animate' },
    { label: '8. Spectrogram (spectra over time)', value: 'spectro' },
    { label: '9. Eyes open vs. Eyes closed Experiment', value: 'alpha' },
    { label: '10. Steady-State Visual Evoked Potential (SSVEP) Experiment', value: 'ssvep' },
    { label: '11. Stimulus Evoked Event-related potential (ERP)', value: 'evoked' },
    { label: '12. Predict brain states with a trained classifier', value: 'predict' }
  ]
  
  // Modules that show aux channel option
  const modulesWithAux = ['raw', 'spectra', 'bands', 'alpha', 'ssvep', 'evoked']
  
  // Actions
  function setSelectedModule(module) {
    selectedModule.value = module
  }
  
  function setRecordPop(value) {
    recordPop.value = value
  }
  
  function toggleRecordPop() {
    recordPop.value = !recordPop.value
  }
  
  function setRecordTwoPop(value) {
    recordTwoPop.value = value
  }
  
  function toggleRecordTwoPop() {
    recordTwoPop.value = !recordTwoPop.value
  }
  
  function updateModuleSettings(moduleName, settings) {
    if (moduleSettings[moduleName]) {
      Object.assign(moduleSettings[moduleName], settings)
    }
  }
  
  function getModuleSettings(moduleName) {
    return moduleSettings[moduleName] || {}
  }
  
  function showAuxOption(moduleName) {
    return modulesWithAux.includes(moduleName)
  }
  
  return {
    // State
    selectedModule,
    recordPop,
    recordTwoPop,
    moduleSettings,
    moduleTypes,
    modulesWithAux,
    // Actions
    setSelectedModule,
    setRecordPop,
    toggleRecordPop,
    setRecordTwoPop,
    toggleRecordTwoPop,
    updateModuleSettings,
    getModuleSettings,
    showAuxOption
  }
})
