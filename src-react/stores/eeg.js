import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEegStore = defineStore('eeg', () => {
  // Connection state
  const source = ref(null)
  const status = ref('Connect')
  const debugWithMock = ref(false)
  const enableAux = ref(false)
  
  // Computed channel count
  const nchans = computed(() => enableAux.value ? 5 : 4)
  
  // Module data (reactive data pulled from observables)
  const moduleData = ref({
    intro: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    heartRaw: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    heartSpectra: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    raw: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    spectra: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    bands: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    animate: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    spectro: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    alpha: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    ssvep: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    evoked: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } },
    predict: { ch0: { datasets: [{}] }, ch1: { datasets: [{}] }, ch2: { datasets: [{}] }, ch3: { datasets: [{}] }, ch4: { datasets: [{}] } }
  })
  
  // RxJS observables and subscriptions (stored but not reactive)
  const pipes = {}
  const multicasts = {}
  const subscriptions = {}
  
  // Actions
  function setSource(newSource) {
    source.value = newSource
  }
  
  function setStatus(newStatus) {
    status.value = newStatus
  }
  
  function setDebugWithMock(value) {
    debugWithMock.value = value
  }
  
  function setEnableAux(value) {
    enableAux.value = value
  }
  
  function setModuleData(moduleName, data) {
    moduleData.value[moduleName] = data
  }
  
  function setPipe(name, pipe) {
    pipes[name] = pipe
  }
  
  function setMulticast(name, multicast) {
    multicasts[name] = multicast
  }
  
  function setSubscription(name, subscription) {
    subscriptions[name] = subscription
  }
  
  function unsubscribe(name) {
    if (subscriptions[name]) {
      subscriptions[name].unsubscribe()
      subscriptions[name] = null
    }
  }
  
  function unsubscribeAll() {
    Object.keys(subscriptions).forEach(name => {
      if (subscriptions[name]) {
        subscriptions[name].unsubscribe()
        subscriptions[name] = null
      }
    })
  }
  
  function getPipe(name) {
    return pipes[name]
  }
  
  function getMulticast(name) {
    return multicasts[name]
  }
  
  function getSubscription(name) {
    return subscriptions[name]
  }
  
  function reset() {
    unsubscribeAll()
    source.value = null
    status.value = 'Connect'
    debugWithMock.value = false
  }
  
  return {
    // State
    source,
    status,
    debugWithMock,
    enableAux,
    nchans,
    moduleData,
    pipes,
    multicasts,
    subscriptions,
    // Actions
    setSource,
    setStatus,
    setDebugWithMock,
    setEnableAux,
    setModuleData,
    setPipe,
    setMulticast,
    setSubscription,
    unsubscribe,
    unsubscribeAll,
    getPipe,
    getMulticast,
    getSubscription,
    reset
  }
})
