import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MuseClient } from 'muse-js'

export const useEegStore = defineStore('eeg', () => {
  // State
  const client = ref(null)
  const connected = ref(false)
  const connecting = ref(false)
  const status = ref('disconnected') // 'disconnected' | 'connecting' | 'connected'
  const deviceName = ref('')
  const batteryLevel = ref(0)
  
  // Raw EEG data channels
  const rawData = ref({
    ch0: [], // TP9 (left ear)
    ch1: [], // AF7 (left forehead)
    ch2: [], // AF8 (right forehead)
    ch3: [], // TP10 (right ear)
    aux: []  // auxiliary
  })
  
  // PPG (Heart) data
  const ppgData = ref({
    ambient: [],
    infrared: [],
    red: []
  })
  
  // Accelerometer data
  const accelerometerData = ref({
    x: [],
    y: [],
    z: []
  })
  
  // Gyroscope data
  const gyroscopeData = ref({
    x: [],
    y: [],
    z: []
  })
  
  // Processed data
  const spectraData = ref({
    ch0: [],
    ch1: [],
    ch2: [],
    ch3: []
  })
  
  const bandsData = ref({
    delta: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
    theta: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
    alpha: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
    beta: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
    gamma: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 }
  })
  
  // Subscriptions
  const subscriptions = ref([])
  
  // Computed
  const isConnected = computed(() => status.value === 'connected')
  const isConnecting = computed(() => status.value === 'connecting')
  
  // Actions
  async function connect() {
    if (connecting.value || connected.value) return
    
    try {
      connecting.value = true
      status.value = 'connecting'
      
      const museClient = new MuseClient()
      await museClient.connect()
      await museClient.start()
      
      client.value = museClient
      connected.value = true
      status.value = 'connected'
      deviceName.value = museClient.deviceName || 'Muse'
      
      // Get battery level
      museClient.telemetryData.subscribe(telemetry => {
        batteryLevel.value = telemetry.batteryLevel
      })
      
      return museClient
    } catch (error) {
      console.error('EEG connection error:', error)
      status.value = 'disconnected'
      throw error
    } finally {
      connecting.value = false
    }
  }
  
  async function disconnect() {
    // Unsubscribe all
    subscriptions.value.forEach(sub => {
      if (sub && typeof sub.unsubscribe === 'function') {
        sub.unsubscribe()
      }
    })
    subscriptions.value = []
    
    // Disconnect client
    if (client.value) {
      try {
        await client.value.disconnect()
      } catch (e) {
        console.warn('Disconnect error:', e)
      }
      client.value = null
    }
    
    connected.value = false
    status.value = 'disconnected'
    deviceName.value = ''
    batteryLevel.value = 0
    
    // Clear data
    clearData()
  }
  
  function clearData() {
    rawData.value = { ch0: [], ch1: [], ch2: [], ch3: [], aux: [] }
    ppgData.value = { ambient: [], infrared: [], red: [] }
    accelerometerData.value = { x: [], y: [], z: [] }
    gyroscopeData.value = { x: [], y: [], z: [] }
    spectraData.value = { ch0: [], ch1: [], ch2: [], ch3: [] }
    bandsData.value = {
      delta: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
      theta: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
      alpha: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
      beta: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 },
      gamma: { ch0: 0, ch1: 0, ch2: 0, ch3: 0 }
    }
  }
  
  function addSubscription(subscription) {
    subscriptions.value.push(subscription)
  }
  
  function updateRawData(channelIndex, data) {
    const key = channelIndex === 4 ? 'aux' : `ch${channelIndex}`
    rawData.value[key] = data
  }
  
  function updatePpgData(type, data) {
    ppgData.value[type] = data
  }
  
  function updateSpectraData(channelIndex, data) {
    spectraData.value[`ch${channelIndex}`] = data
  }
  
  function updateBandsData(band, channelData) {
    bandsData.value[band] = channelData
  }
  
  return {
    // State
    client,
    connected,
    connecting,
    status,
    deviceName,
    batteryLevel,
    rawData,
    ppgData,
    accelerometerData,
    gyroscopeData,
    spectraData,
    bandsData,
    subscriptions,
    
    // Computed
    isConnected,
    isConnecting,
    
    // Actions
    connect,
    disconnect,
    clearData,
    addSubscription,
    updateRawData,
    updatePpgData,
    updateSpectraData,
    updateBandsData
  }
})
