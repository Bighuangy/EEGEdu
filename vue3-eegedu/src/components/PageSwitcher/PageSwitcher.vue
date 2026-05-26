<template>
  <div>
    <!-- Connection Controls -->
    <div class="card">
      <div class="card-section">
        <div class="stack stack-horizontal">
          <div class="btn-group">
            <button 
              class="btn" 
              :class="status === translations.connect ? 'btn-primary' : 'btn-default'"
              :disabled="status !== translations.connect"
              @click="connect(false)"
            >
              {{ status }}
            </button>
            <button 
              class="btn btn-default"
              :disabled="status !== translations.connect"
              @click="connect(true)"
            >
              {{ status === translations.connect ? translations.connectMock : status }}
            </button>
            <button 
              class="btn"
              :class="status !== translations.connect ? 'btn-destructive' : 'btn-default'"
              :disabled="status === translations.connect"
              @click="refreshPage"
            >
              {{ translations.disconnect }}
            </button>
          </div>
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              id="auxChannel"
              v-model="enableAux"
              :disabled="!showAux || status !== translations.connect"
            />
            <label for="auxChannel">Enable Muse Auxillary Channel</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Selector -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">{{ moduleTranslations.title }}</h3>
      </div>
      <div class="card-section">
        <select class="select" v-model="selectedModule" @change="handleModuleChange">
          <option v-for="type in chartTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Settings Sliders -->
    <component 
      v-if="currentSettingsComponent" 
      :is="currentSettingsComponent"
      :settings="currentSettings"
      :status="status"
      @update-settings="updateSettings"
    />

    <!-- Module Content -->
    <component 
      :is="currentModuleComponent" 
      :data="currentData"
    />

    <!-- Record Section -->
    <component 
      v-if="currentRecordComponent"
      :is="currentRecordComponent"
      :settings="currentSettings"
      :status="status"
      @update-settings="updateSettings"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, markRaw } from 'vue'
import { MuseClient } from 'muse-js'
import { mockMuseEEG } from './utils/mockMuseEEG'
import { emptyAuxChannelData } from './utils/chartOptions'

import translations from './translations/en.json'
import moduleTranslations from './translations/modules.json'

// Module imports
import EEGEduIntro from './modules/EEGEduIntro/EEGEduIntro.vue'
import EEGEduHeartRaw from './modules/EEGEduHeartRaw/EEGEduHeartRaw.vue'
import EEGEduHeartSpectra from './modules/EEGEduHeartSpectra/EEGEduHeartSpectra.vue'
import EEGEduRaw from './modules/EEGEduRaw/EEGEduRaw.vue'
import EEGEduSpectra from './modules/EEGEduSpectra/EEGEduSpectra.vue'
import EEGEduBands from './modules/EEGEduBands/EEGEduBands.vue'
import EEGEduAnimate from './modules/EEGEduAnimate/EEGEduAnimate.vue'
import EEGEduSpectro from './modules/EEGEduSpectro/EEGEduSpectro.vue'
import EEGEduAlpha from './modules/EEGEduAlpha/EEGEduAlpha.vue'
import EEGEduSsvep from './modules/EEGEduSsvep/EEGEduSsvep.vue'
import EEGEduEvoked from './modules/EEGEduEvoked/EEGEduEvoked.vue'
import EEGEduPredict from './modules/EEGEduPredict/EEGEduPredict.vue'

// Settings components
import EEGEduRawSettings from './modules/EEGEduRaw/EEGEduRawSettings.vue'
import EEGEduSpectraSettings from './modules/EEGEduSpectra/EEGEduSpectraSettings.vue'
import EEGEduBandsSettings from './modules/EEGEduBands/EEGEduBandsSettings.vue'
import EEGEduAnimateSettings from './modules/EEGEduAnimate/EEGEduAnimateSettings.vue'
import EEGEduSpectroSettings from './modules/EEGEduSpectro/EEGEduSpectroSettings.vue'
import EEGEduAlphaSettings from './modules/EEGEduAlpha/EEGEduAlphaSettings.vue'
import EEGEduSsvepSettings from './modules/EEGEduSsvep/EEGEduSsvepSettings.vue'
import EEGEduPredictSettings from './modules/EEGEduPredict/EEGEduPredictSettings.vue'

// Record components
import EEGEduHeartRawRecord from './modules/EEGEduHeartRaw/EEGEduHeartRawRecord.vue'
import EEGEduHeartSpectraRecord from './modules/EEGEduHeartSpectra/EEGEduHeartSpectraRecord.vue'
import EEGEduRawRecord from './modules/EEGEduRaw/EEGEduRawRecord.vue'
import EEGEduSpectraRecord from './modules/EEGEduSpectra/EEGEduSpectraRecord.vue'
import EEGEduBandsRecord from './modules/EEGEduBands/EEGEduBandsRecord.vue'
import EEGEduAlphaRecord from './modules/EEGEduAlpha/EEGEduAlphaRecord.vue'
import EEGEduSsvepRecord from './modules/EEGEduSsvep/EEGEduSsvepRecord.vue'
import EEGEduEvokedRecord from './modules/EEGEduEvoked/EEGEduEvokedRecord.vue'
import EEGEduPredictRecord from './modules/EEGEduPredict/EEGEduPredictRecord.vue'

// Pipe builders
import * as introModule from './modules/EEGEduIntro/introPipe'
import * as heartRawModule from './modules/EEGEduHeartRaw/heartRawPipe'
import * as heartSpectraModule from './modules/EEGEduHeartSpectra/heartSpectraPipe'
import * as rawModule from './modules/EEGEduRaw/rawPipe'
import * as spectraModule from './modules/EEGEduSpectra/spectraPipe'
import * as bandsModule from './modules/EEGEduBands/bandsPipe'
import * as animateModule from './modules/EEGEduAnimate/animatePipe'
import * as spectroModule from './modules/EEGEduSpectro/spectroPipe'
import * as alphaModule from './modules/EEGEduAlpha/alphaPipe'
import * as ssvepModule from './modules/EEGEduSsvep/ssvepPipe'
import * as evokedModule from './modules/EEGEduEvoked/evokedPipe'
import * as predictModule from './modules/EEGEduPredict/predictPipe'

// Module types
const moduleTypes = moduleTranslations.types

// Chart types for selector
const chartTypes = [
  { label: moduleTypes.intro, value: 'intro' },
  { label: moduleTypes.heartRaw, value: 'heartRaw' },
  { label: moduleTypes.heartSpectra, value: 'heartSpectra' },
  { label: moduleTypes.raw, value: 'raw' },
  { label: moduleTypes.spectra, value: 'spectra' },
  { label: moduleTypes.bands, value: 'bands' },
  { label: moduleTypes.animate, value: 'animate' },
  { label: moduleTypes.spectro, value: 'spectro' },
  { label: moduleTypes.alpha, value: 'alpha' },
  { label: moduleTypes.ssvep, value: 'ssvep' },
  { label: moduleTypes.evoked, value: 'evoked' },
  { label: moduleTypes.predict, value: 'predict' }
]

// State
const enableAux = ref(false)
const status = ref(translations.connect)
const selectedModule = ref('intro')

// Data state for each module
const moduleData = ref({
  intro: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  heartRaw: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  heartSpectra: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  raw: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  spectra: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  bands: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  animate: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  spectro: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  alpha: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  ssvep: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  evoked: JSON.parse(JSON.stringify(emptyAuxChannelData)),
  predict: JSON.parse(JSON.stringify(emptyAuxChannelData))
})

// Settings state for each module
const moduleSettings = ref({
  intro: introModule.getSettings(),
  heartRaw: heartRawModule.getSettings(),
  heartSpectra: heartSpectraModule.getSettings(),
  raw: rawModule.getSettings(),
  spectra: spectraModule.getSettings(),
  bands: bandsModule.getSettings(),
  animate: animateModule.getSettings(),
  spectro: spectroModule.getSettings(),
  alpha: alphaModule.getSettings(),
  ssvep: ssvepModule.getSettings(),
  evoked: evokedModule.getSettings(),
  predict: predictModule.getSettings()
})

// Module components mapping
const moduleComponents = {
  intro: markRaw(EEGEduIntro),
  heartRaw: markRaw(EEGEduHeartRaw),
  heartSpectra: markRaw(EEGEduHeartSpectra),
  raw: markRaw(EEGEduRaw),
  spectra: markRaw(EEGEduSpectra),
  bands: markRaw(EEGEduBands),
  animate: markRaw(EEGEduAnimate),
  spectro: markRaw(EEGEduSpectro),
  alpha: markRaw(EEGEduAlpha),
  ssvep: markRaw(EEGEduSsvep),
  evoked: markRaw(EEGEduEvoked),
  predict: markRaw(EEGEduPredict)
}

const settingsComponents = {
  raw: markRaw(EEGEduRawSettings),
  spectra: markRaw(EEGEduSpectraSettings),
  bands: markRaw(EEGEduBandsSettings),
  animate: markRaw(EEGEduAnimateSettings),
  spectro: markRaw(EEGEduSpectroSettings),
  alpha: markRaw(EEGEduAlphaSettings),
  ssvep: markRaw(EEGEduSsvepSettings),
  predict: markRaw(EEGEduPredictSettings)
}

const recordComponents = {
  heartRaw: markRaw(EEGEduHeartRawRecord),
  heartSpectra: markRaw(EEGEduHeartSpectraRecord),
  raw: markRaw(EEGEduRawRecord),
  spectra: markRaw(EEGEduSpectraRecord),
  bands: markRaw(EEGEduBandsRecord),
  alpha: markRaw(EEGEduAlphaRecord),
  ssvep: markRaw(EEGEduSsvepRecord),
  evoked: markRaw(EEGEduEvokedRecord),
  predict: markRaw(EEGEduPredictRecord)
}

// Pipe modules mapping
const pipeModules = {
  intro: introModule,
  heartRaw: heartRawModule,
  heartSpectra: heartSpectraModule,
  raw: rawModule,
  spectra: spectraModule,
  bands: bandsModule,
  animate: animateModule,
  spectro: spectroModule,
  alpha: alphaModule,
  ssvep: ssvepModule,
  evoked: evokedModule,
  predict: predictModule
}

// Computed
const showAux = computed(() => {
  const noAuxModules = ['intro', 'heartRaw', 'heartSpectra', 'animate', 'spectro', 'predict']
  return !noAuxModules.includes(selectedModule.value)
})

const currentModuleComponent = computed(() => moduleComponents[selectedModule.value])
const currentSettingsComponent = computed(() => settingsComponents[selectedModule.value] || null)
const currentRecordComponent = computed(() => recordComponents[selectedModule.value] || null)
const currentData = computed(() => moduleData.value[selectedModule.value])
const currentSettings = computed(() => moduleSettings.value[selectedModule.value])

// Watch for aux channel changes
watch(enableAux, (newVal) => {
  window.enableAux = newVal
  window.nchans = newVal ? 5 : 4
})

// Initialize
onMounted(() => {
  window.enableAux = false
  window.nchans = 4
})

// Methods
function unsubscribeAll() {
  const subscriptions = [
    'subscriptionIntro', 'subscriptionHeartRaw', 'subscriptionHeartSpectra',
    'subscriptionRaw', 'subscriptionSpectra', 'subscriptionBands',
    'subscriptionAnimate', 'subscriptionSpectro', 'subscriptionAlpha',
    'subscriptionSsvep', 'subscriptionEvoked', 'subscriptionPredict'
  ]
  subscriptions.forEach(sub => {
    if (window[sub]) {
      window[sub].unsubscribe()
    }
  })
}

function buildPipes() {
  Object.keys(pipeModules).forEach(key => {
    pipeModules[key].buildPipe(moduleSettings.value[key])
  })
}

function subscriptionSetup(module) {
  const setData = (updater) => {
    moduleData.value[module] = updater(moduleData.value[module])
  }
  pipeModules[module].setup(setData, moduleSettings.value[module])
}

async function connect(useMock) {
  try {
    if (useMock) {
      status.value = translations.connectingMock
      window.source = {}
      window.source.connectionStatus = { value: true }
      window.source.eegReadings$ = mockMuseEEG(256)
      status.value = translations.connectedMock
    } else {
      status.value = translations.connecting
      window.source = new MuseClient()
      window.source.enableAux = enableAux.value
      await window.source.connect()
      await window.source.start()
      window.source.eegReadings$ = window.source.eegReadings
      status.value = translations.connected
    }
    
    if (window.source.connectionStatus.value === true && window.source.eegReadings$) {
      buildPipes()
      subscriptionSetup(selectedModule.value)
    }
  } catch (err) {
    status.value = translations.connect
    console.log('Connection error:', err)
  }
}

function refreshPage() {
  window.location.reload()
}

function handleModuleChange() {
  console.log('Switching to:', selectedModule.value)
  unsubscribeAll()
  subscriptionSetup(selectedModule.value)
}

function updateSettings(newSettings) {
  moduleSettings.value[selectedModule.value] = { ...moduleSettings.value[selectedModule.value], ...newSettings }
  pipeModules[selectedModule.value].buildPipe(moduleSettings.value[selectedModule.value])
  subscriptionSetup(selectedModule.value)
}
</script>
