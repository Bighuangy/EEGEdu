<template>
  <div class="page-switcher">
    <!-- Connection Card -->
    <el-card class="connection-card">
      <div class="connection-row">
        <el-button-group>
          <el-button 
            :type="eegStore.status === generalTranslations.connect ? 'primary' : 'default'"
            :disabled="eegStore.status !== generalTranslations.connect"
            @click="connectMuse"
          >
            {{ eegStore.status }}
          </el-button>
          <el-button 
            :disabled="eegStore.status !== generalTranslations.connect"
            @click="connectMock"
          >
            {{ eegStore.status === generalTranslations.connect ? generalTranslations.connectMock : eegStore.status }}
          </el-button>
          <el-button 
            type="danger"
            :disabled="eegStore.status === generalTranslations.connect"
            @click="disconnect"
          >
            {{ generalTranslations.disconnect }}
          </el-button>
        </el-button-group>
        <el-checkbox 
          v-model="eegStore.enableAux"
          :disabled="!showAux || eegStore.status !== generalTranslations.connect"
          label="Enable Muse Auxillary Channel"
        />
      </div>
    </el-card>

    <!-- Module Selector Card -->
    <el-card>
      <template #header>
        <span>{{ moduleTranslations.title }}</span>
      </template>
      <el-select 
        v-model="settingsStore.selectedModule" 
        style="width: 100%"
        @change="handleModuleChange"
      >
        <el-option
          v-for="item in settingsStore.moduleTypes"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-card>

    <!-- Settings Sliders (conditional) -->
    <component 
      :is="currentSettingsComponent" 
      v-if="currentSettingsComponent"
    />

    <!-- Module Content -->
    <component 
      :is="currentModuleComponent"
      :data="eegStore.moduleData[settingsStore.selectedModule]"
    />

    <!-- Record Component (conditional) -->
    <component 
      :is="currentRecordComponent"
      v-if="currentRecordComponent"
    />
  </div>
</template>

<script setup>
import { computed, watch, markRaw } from 'vue'
import { MuseClient } from 'muse-js'
import { useEegStore } from '@/stores/eeg'
import { useSettingsStore } from '@/stores/settings'
import generalTranslations from '@/translations/general'
import moduleTranslations from '@/translations/modules'
import { mockMuseEEG } from '@/utils/mockMuseEEG'

// Import all modules
import EEGEduIntro from '@/modules/EEGEduIntro/EEGEduIntro.vue'
import EEGEduHeartRaw from '@/modules/EEGEduHeartRaw/EEGEduHeartRaw.vue'
import EEGEduHeartSpectra from '@/modules/EEGEduHeartSpectra/EEGEduHeartSpectra.vue'
import EEGEduRaw from '@/modules/EEGEduRaw/EEGEduRaw.vue'
import EEGEduSpectra from '@/modules/EEGEduSpectra/EEGEduSpectra.vue'
import EEGEduBands from '@/modules/EEGEduBands/EEGEduBands.vue'
import EEGEduAnimate from '@/modules/EEGEduAnimate/EEGEduAnimate.vue'
import EEGEduSpectro from '@/modules/EEGEduSpectro/EEGEduSpectro.vue'
import EEGEduAlpha from '@/modules/EEGEduAlpha/EEGEduAlpha.vue'
import EEGEduSsvep from '@/modules/EEGEduSsvep/EEGEduSsvep.vue'
import EEGEduEvoked from '@/modules/EEGEduEvoked/EEGEduEvoked.vue'
import EEGEduPredict from '@/modules/EEGEduPredict/EEGEduPredict.vue'

// Import module pipe builders
import * as introModule from '@/modules/EEGEduIntro/pipe'
import * as heartRawModule from '@/modules/EEGEduHeartRaw/pipe'
import * as heartSpectraModule from '@/modules/EEGEduHeartSpectra/pipe'
import * as rawModule from '@/modules/EEGEduRaw/pipe'
import * as spectraModule from '@/modules/EEGEduSpectra/pipe'
import * as bandsModule from '@/modules/EEGEduBands/pipe'
import * as animateModule from '@/modules/EEGEduAnimate/pipe'
import * as spectroModule from '@/modules/EEGEduSpectro/pipe'
import * as alphaModule from '@/modules/EEGEduAlpha/pipe'
import * as ssvepModule from '@/modules/EEGEduSsvep/pipe'
import * as evokedModule from '@/modules/EEGEduEvoked/pipe'
import * as predictModule from '@/modules/EEGEduPredict/pipe'

// Stores
const eegStore = useEegStore()
const settingsStore = useSettingsStore()

// Module components map
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

// Module pipe builders map
const modulePipes = {
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
const currentModuleComponent = computed(() => {
  return moduleComponents[settingsStore.selectedModule] || null
})

const currentSettingsComponent = computed(() => {
  // Modules with settings sliders
  const modulesWithSettings = ['raw', 'spectra', 'bands', 'animate', 'spectro', 'alpha', 'ssvep', 'predict']
  if (modulesWithSettings.includes(settingsStore.selectedModule)) {
    // Settings components would be imported if needed
    return null // For now, settings are inside each module
  }
  return null
})

const currentRecordComponent = computed(() => {
  // Record components - handled inside each module
  return null
})

const showAux = computed(() => {
  return settingsStore.showAuxOption(settingsStore.selectedModule)
})

// Methods
function buildAllPipes() {
  const modules = ['intro', 'heartRaw', 'heartSpectra', 'raw', 'spectra', 'bands', 'animate', 'spectro', 'alpha', 'ssvep', 'evoked', 'predict']
  modules.forEach(moduleName => {
    const moduleRef = modulePipes[moduleName]
    if (moduleRef && moduleRef.buildPipe) {
      moduleRef.buildPipe(settingsStore.moduleSettings[moduleName], eegStore)
    }
  })
}

function setupSubscription(moduleName) {
  const moduleRef = modulePipes[moduleName]
  if (moduleRef && moduleRef.setup) {
    moduleRef.setup((data) => {
      eegStore.setModuleData(moduleName, data)
    }, settingsStore.moduleSettings[moduleName], eegStore)
  }
}

async function connectMuse() {
  try {
    eegStore.setStatus(generalTranslations.connecting)
    const client = new MuseClient()
    client.enableAux = eegStore.enableAux
    await client.connect()
    await client.start()
    
    eegStore.setSource({
      eegReadings$: client.eegReadings,
      connectionStatus: { value: true },
      client
    })
    eegStore.setDebugWithMock(false)
    eegStore.setStatus(generalTranslations.connected)
    
    buildAllPipes()
    setupSubscription(settingsStore.selectedModule)
  } catch (err) {
    console.error('Connection error:', err)
    eegStore.setStatus(generalTranslations.connect)
  }
}

function connectMock() {
  try {
    eegStore.setStatus(generalTranslations.connectingMock)
    
    eegStore.setSource({
      eegReadings$: mockMuseEEG(256, eegStore.nchans),
      connectionStatus: { value: true }
    })
    eegStore.setDebugWithMock(true)
    eegStore.setStatus(generalTranslations.connectedMock)
    
    buildAllPipes()
    setupSubscription(settingsStore.selectedModule)
  } catch (err) {
    console.error('Mock connection error:', err)
    eegStore.setStatus(generalTranslations.connect)
  }
}

function disconnect() {
  eegStore.unsubscribeAll()
  if (eegStore.source?.client) {
    eegStore.source.client.disconnect()
  }
  eegStore.reset()
  window.location.reload()
}

function handleModuleChange(newModule) {
  console.log('Switching to:', newModule)
  
  // Unsubscribe all existing subscriptions
  eegStore.unsubscribeAll()
  
  // Setup new subscription if connected
  if (eegStore.source?.connectionStatus?.value) {
    setupSubscription(newModule)
  }
}

// Watch for aux changes to rebuild pipes
watch(() => eegStore.enableAux, () => {
  if (eegStore.source?.connectionStatus?.value) {
    buildAllPipes()
    setupSubscription(settingsStore.selectedModule)
  }
})
</script>

<style scoped>
.page-switcher {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.connection-card {
  margin-bottom: 0;
}

.connection-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.connection-row .el-button-group {
  flex-shrink: 0;
}
</style>
