// Store composable for managing global application state
import { ref, computed, reactive } from 'vue';

// Muse client state
const museClient = ref(null);
const connectionStatus = ref('disconnected');
const rawObservable = ref(null);

// Settings for each module
const moduleSettings = reactive({
  raw: {
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 100,
    srate: 256,
    duration: 1024,
    name: 'Raw',
    secondsToSave: 10
  },
  spectra: {
    cutOffLow: 1,
    cutOffHigh: 50,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    sliceFFTLow: 1,
    sliceFFTHigh: 50,
    name: 'Spectra',
    secondsToSave: 10
  },
  bands: {
    cutOffLow: 1,
    cutOffHigh: 50,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    name: 'Bands',
    secondsToSave: 10
  },
  animate: {
    cutOffLow: 1,
    cutOffHigh: 50,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    animate: true,
    name: 'Animate'
  },
  spectro: {
    cutOffLow: 1,
    cutOffHigh: 50,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    name: 'Spectrogram'
  },
  alpha: {
    cutOffLow: 8,
    cutOffHigh: 12,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    name: 'Alpha',
    secondsToSave: 10
  },
  ssvep: {
    cutOffLow: 1,
    cutOffHigh: 50,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    name: 'SSVEP',
    secondsToSave: 10,
    freqSsvep: 10
  },
  evoked: {
    cutOffLow: 1,
    cutOffHigh: 30,
    interval: 100,
    srate: 256,
    duration: 1024,
    bins: 256,
    name: 'Evoked',
    secondsToSave: 10,
    erpStart: -200,
    erpEnd: 600,
    nbTrials: 20,
    isi: 2000
  },
  predict: {
    cutOffLow: 1,
    cutOffHigh: 50,
    interval: 100,
    srate: 256,
    duration: 1024,
    epoch: 256,
    bins: 256,
    name: 'Predict',
    nbChannels: 4
  },
  heartRaw: {
    cutOffLow: 0.1,
    cutOffHigh: 15,
    interval: 100,
    srate: 256,
    duration: 1024,
    name: 'Heart Raw',
    secondsToSave: 30
  },
  heartSpectra: {
    cutOffLow: 0.01,
    cutOffHigh: 0.4,
    interval: 100,
    srate: 256,
    duration: 4096,
    bins: 4096,
    sliceFFTLow: 0.01,
    sliceFFTHigh: 0.4,
    name: 'Heart Spectra',
    secondsToSave: 60
  }
});

export function useStore() {
  // Getters
  const isConnected = computed(() => connectionStatus.value === 'connected');
  
  // Actions
  function setMuseClient(client) {
    museClient.value = client;
  }
  
  function setConnectionStatus(status) {
    connectionStatus.value = status;
  }
  
  function setRawObservable(observable) {
    rawObservable.value = observable;
  }
  
  function updateModuleSettings(moduleName, settings) {
    if (moduleSettings[moduleName]) {
      Object.assign(moduleSettings[moduleName], settings);
    }
  }
  
  function getModuleSettings(moduleName) {
    return moduleSettings[moduleName] || {};
  }
  
  function disconnect() {
    if (museClient.value) {
      museClient.value.disconnect();
    }
    museClient.value = null;
    rawObservable.value = null;
    connectionStatus.value = 'disconnected';
  }
  
  return {
    // State
    museClient,
    connectionStatus,
    rawObservable,
    moduleSettings,
    
    // Getters
    isConnected,
    
    // Actions
    setMuseClient,
    setConnectionStatus,
    setRawObservable,
    updateModuleSettings,
    getModuleSettings,
    disconnect
  };
}
