<template>
  <div class="page-switcher">
    <!-- 连接控制面板 -->
    <el-card class="connection-card" shadow="hover">
      <el-row :gutter="20" align="middle">
        <el-col :span="24" :md="16">
          <el-button-group>
            <el-button
              :type="status === translations.connect ? 'primary' : 'default'"
              :disabled="status !== translations.connect"
              @click="connectMuse(false)"
            >
              {{ status }}
            </el-button>
            <el-button
              :disabled="status !== translations.connect"
              @click="connectMuse(true)"
            >
              {{ status === translations.connect ? translations.connectMock : status }}
            </el-button>
            <el-button
              type="danger"
              :disabled="status === translations.connect"
              @click="disconnect"
            >
              {{ translations.disconnect }}
            </el-button>
          </el-button-group>
        </el-col>
        <el-col :span="24" :md="8">
          <el-checkbox
            v-model="enableAux"
            :disabled="!showAux || status !== translations.connect"
          >
            Enable Muse Auxillary Channel
          </el-checkbox>
        </el-col>
      </el-row>
    </el-card>

    <!-- 模块选择器 -->
    <el-card class="module-selector" shadow="hover">
      <template #header>
        <span>{{ translations.pageTitle }}</span>
      </template>
      <el-select
        v-model="selectedModule"
        placeholder="Select Module"
        style="width: 100%"
        @change="handleModuleChange"
      >
        <el-option
          v-for="(label, key) in translations.modules"
          :key="key"
          :label="label"
          :value="key"
        />
      </el-select>
    </el-card>

    <!-- 设置面板 -->
    <SettingsPanel
      v-if="showSettings"
      :settings="currentSettings"
      :status="status"
      :module-type="selectedModule"
      @update:settings="handleSettingsUpdate"
    />

    <!-- 模块内容区域 -->
    <component
      :is="currentModuleComponent"
      :data="currentData"
      :settings="currentSettings"
      :status="status"
    />

    <!-- 录制面板 -->
    <RecordPanel
      v-if="showRecord"
      :settings="currentSettings"
      :status="status"
      :module-type="selectedModule"
      @update:settings="handleSettingsUpdate"
    />
  </div>
</template>

<script>
import { ref, computed, onUnmounted, watch } from 'vue'
import { MuseClient, zipSamples, channelNames } from 'muse-js'
import { Subject, timer } from 'rxjs'
import { catchError, multicast, take, takeUntil } from 'rxjs/operators'
import { bandpassFilter, epoch, fft, sliceFFT, powerByBand } from '@neurosity/pipes'
import { saveAs } from 'file-saver'

import translations from '../utils/translations'
import { mockMuseEEG } from '../utils/mockMuseEEG'
import { emptyAuxChannelData, generateXTics, bandLabels, standardDeviation } from '../utils/chartUtils'

import SettingsPanel from './SettingsPanel.vue'
import RecordPanel from './RecordPanel.vue'
import IntroModule from './modules/IntroModule.vue'
import RawModule from './modules/RawModule.vue'
import SpectraModule from './modules/SpectraModule.vue'
import BandsModule from './modules/BandsModule.vue'
import AnimateModule from './modules/AnimateModule.vue'
import PredictModule from './modules/PredictModule.vue'
import HeartRawModule from './modules/HeartRawModule.vue'
import SpectroModule from './modules/SpectroModule.vue'
import AlphaModule from './modules/AlphaModule.vue'

// 全局变量存储
window.nchans = 4
window.enableAux = false
window.source = null
window.channelNames = channelNames

// 默认设置
const defaultSettings = {
  intro: { name: 'Intro', cutOffLow: 2, cutOffHigh: 20, interval: 2, srate: 256, duration: 512 },
  heartRaw: { name: 'HeartRaw', cutOffLow: 1, cutOffHigh: 30, interval: 25, srate: 256, duration: 1024, secondsToSave: 10 },
  heartSpectra: { name: 'HeartSpectra', cutOffLow: 1, cutOffHigh: 30, interval: 100, bins: 256, sliceFFTLow: 0.5, sliceFFTHigh: 4, duration: 2048, srate: 256, secondsToSave: 10 },
  raw: { name: 'Raw', cutOffLow: 0.1, cutOffHigh: 100, interval: 25, srate: 256, duration: 1024, secondsToSave: 10 },
  spectra: { name: 'Spectra', cutOffLow: 1, cutOffHigh: 100, interval: 100, bins: 256, sliceFFTLow: 1, sliceFFTHigh: 100, duration: 1024, srate: 256, secondsToSave: 10 },
  bands: { name: 'Bands', cutOffLow: 2, cutOffHigh: 50, interval: 100, bins: 256, duration: 1024, srate: 256, secondsToSave: 10 },
  animate: { name: 'Animate', cutOffLow: 2, cutOffHigh: 20, interval: 16, bins: 256, duration: 128, srate: 256 },
  spectro: { name: 'Spectro', cutOffLow: 1, cutOffHigh: 100, interval: 100, bins: 256, sliceFFTLow: 1, sliceFFTHigh: 50, duration: 1024, srate: 256 },
  alpha: { name: 'Alpha', cutOffLow: 2, cutOffHigh: 50, interval: 100, bins: 256, duration: 1024, srate: 256, secondsToSave: 10 },
  ssvep: { name: 'SSVEP', cutOffLow: 1, cutOffHigh: 100, interval: 100, bins: 256, sliceFFTLow: 1, sliceFFTHigh: 50, duration: 1024, srate: 256, secondsToSave: 10 },
  evoked: { name: 'Evoked', cutOffLow: 1, cutOffHigh: 30, interval: 1, srate: 256, duration: 256, secondsToSave: 10 },
  predict: { name: 'Predict', cutOffLow: 2, cutOffHigh: 20, interval: 256, bins: 256, sliceFFTLow: 1, sliceFFTHigh: 30, duration: 512, srate: 256 }
}

export default {
  name: 'PageSwitcher',
  components: {
    SettingsPanel,
    RecordPanel,
    IntroModule,
    RawModule,
    SpectraModule,
    BandsModule,
    AnimateModule,
    PredictModule,
    HeartRawModule,
    SpectroModule,
    AlphaModule
  },
  setup() {
    const status = ref(translations.connect)
    const selectedModule = ref('intro')
    const enableAux = ref(false)
    const moduleData = ref(JSON.parse(JSON.stringify(emptyAuxChannelData)))
    const settings = ref(JSON.parse(JSON.stringify(defaultSettings)))

    // 订阅管理
    let currentSubscription = null
    let multicast$ = null
    let pipe$ = null

    // 计算属性
    const currentSettings = computed(() => settings.value[selectedModule.value])
    
    const currentData = computed(() => moduleData.value)

    const showAux = computed(() => {
      const noAuxModules = ['intro', 'heartRaw', 'heartSpectra', 'animate', 'spectro', 'predict']
      return !noAuxModules.includes(selectedModule.value)
    })

    const showSettings = computed(() => {
      const noSettingsModules = ['intro', 'heartRaw', 'heartSpectra', 'evoked']
      return !noSettingsModules.includes(selectedModule.value)
    })

    const showRecord = computed(() => {
      const noRecordModules = ['intro', 'animate', 'spectro']
      return !noRecordModules.includes(selectedModule.value)
    })

    const currentModuleComponent = computed(() => {
      const componentMap = {
        intro: 'IntroModule',
        heartRaw: 'HeartRawModule',
        heartSpectra: 'HeartRawModule',
        raw: 'RawModule',
        spectra: 'SpectraModule',
        bands: 'BandsModule',
        animate: 'AnimateModule',
        spectro: 'SpectroModule',
        alpha: 'AlphaModule',
        ssvep: 'SpectraModule',
        evoked: 'RawModule',
        predict: 'PredictModule'
      }
      return componentMap[selectedModule.value] || 'IntroModule'
    })

    // 监听enableAux变化
    watch(enableAux, (newVal) => {
      window.enableAux = newVal
      window.nchans = newVal ? 5 : 4
    })

    // 构建数据处理管道
    function buildPipe(moduleType, moduleSettings) {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
        currentSubscription = null
      }
      
      if (!window.source || !window.source.eegReadings$) return

      const Settings = moduleSettings

      try {
        // 根据模块类型构建不同的管道
        if (['intro', 'raw', 'heartRaw', 'evoked'].includes(moduleType)) {
          pipe$ = zipSamples(window.source.eegReadings$).pipe(
            bandpassFilter({
              cutoffFrequencies: [Settings.cutOffLow, Settings.cutOffHigh],
              nbChannels: window.nchans
            }),
            epoch({
              duration: Settings.duration,
              interval: Settings.interval,
              samplingRate: Settings.srate
            }),
            catchError(err => {
              console.log('Pipe error:', err)
            })
          )
        } else if (['spectra', 'heartSpectra', 'spectro', 'ssvep'].includes(moduleType)) {
          pipe$ = zipSamples(window.source.eegReadings$).pipe(
            bandpassFilter({
              cutoffFrequencies: [Settings.cutOffLow, Settings.cutOffHigh],
              nbChannels: window.nchans
            }),
            epoch({
              duration: Settings.duration,
              interval: Settings.interval,
              samplingRate: Settings.srate
            }),
            fft({ bins: Settings.bins }),
            sliceFFT([Settings.sliceFFTLow, Settings.sliceFFTHigh]),
            catchError(err => {
              console.log('Pipe error:', err)
            })
          )
        } else if (['bands', 'alpha', 'animate'].includes(moduleType)) {
          pipe$ = zipSamples(window.source.eegReadings$).pipe(
            bandpassFilter({
              cutoffFrequencies: [Settings.cutOffLow, Settings.cutOffHigh],
              nbChannels: window.nchans
            }),
            epoch({
              duration: Settings.duration,
              interval: Settings.interval,
              samplingRate: Settings.srate
            }),
            fft({ bins: Settings.bins }),
            powerByBand(),
            catchError(err => {
              console.log('Pipe error:', err)
            })
          )
        } else if (moduleType === 'predict') {
          pipe$ = zipSamples(window.source.eegReadings$).pipe(
            bandpassFilter({
              cutoffFrequencies: [Settings.cutOffLow, Settings.cutOffHigh],
              nbChannels: window.nchans
            }),
            epoch({
              duration: Settings.duration,
              interval: Settings.interval,
              samplingRate: Settings.srate
            }),
            fft({ bins: Settings.bins }),
            sliceFFT([Settings.sliceFFTLow, Settings.sliceFFTHigh]),
            catchError(err => {
              console.log('Pipe error:', err)
            })
          )
        }

        multicast$ = pipe$.pipe(multicast(() => new Subject()))
        window[`multicast${moduleType}$`] = multicast$
      } catch (err) {
        console.error('Error building pipe:', err)
      }
    }

    // 设置数据订阅
    function setupSubscription(moduleType, moduleSettings) {
      console.log('Subscribing to ' + moduleType)
      
      if (!multicast$) return

      const Settings = moduleSettings

      currentSubscription = multicast$.subscribe(data => {
        const newData = JSON.parse(JSON.stringify(moduleData.value))

        if (['intro', 'raw', 'heartRaw', 'evoked'].includes(moduleType)) {
          Object.values(newData).forEach((channel, index) => {
            if (data.data && data.data[index]) {
              channel.datasets[0].data = data.data[index]
              channel.xLabels = generateXTics(Settings.srate, Settings.duration)
              channel.datasets[0].qual = standardDeviation(data.data[index])
            }
          })
        } else if (['spectra', 'heartSpectra', 'spectro', 'ssvep', 'predict'].includes(moduleType)) {
          Object.values(newData).forEach((channel, index) => {
            if (data.psd && data.psd[index]) {
              channel.datasets[0].data = data.psd[index]
              channel.xLabels = data.freqs
            }
          })
        } else if (['bands', 'alpha', 'animate'].includes(moduleType)) {
          Object.values(newData).forEach((channel, index) => {
            channel.datasets[0].data = [
              data.delta ? data.delta[index] : 0,
              data.theta ? data.theta[index] : 0,
              data.alpha ? data.alpha[index] : 0,
              data.beta ? data.beta[index] : 0,
              data.gamma ? data.gamma[index] : 0
            ]
            channel.xLabels = bandLabels
          })
          // 存储全局变量供动画使用
          if (data.delta) {
            window.delta = data.delta[1] || 0
            window.theta = data.theta[1] || 0
            window.alpha = data.alpha[1] || 0
            window.beta = data.beta[1] || 0
            window.gamma = data.gamma[1] || 0
          }
        }

        moduleData.value = newData
      })

      multicast$.connect()
      console.log('Subscribed to ' + moduleType)
    }

    // 连接Muse设备
    async function connectMuse(useMock) {
      try {
        if (useMock) {
          status.value = translations.connectingMock
          window.source = {
            connectionStatus: { value: true },
            eegReadings$: mockMuseEEG(256, window.nchans)
          }
          status.value = translations.connectedMock
        } else {
          status.value = translations.connecting
          window.source = new MuseClient()
          window.source.enableAux = window.enableAux
          await window.source.connect()
          await window.source.start()
          window.source.eegReadings$ = window.source.eegReadings
          status.value = translations.connected
        }

        if (window.source.connectionStatus.value === true && window.source.eegReadings$) {
          // 构建所有模块的管道
          Object.keys(settings.value).forEach(moduleType => {
            buildPipe(moduleType, settings.value[moduleType])
          })
          // 设置当前模块的订阅
          buildPipe(selectedModule.value, currentSettings.value)
          setupSubscription(selectedModule.value, currentSettings.value)
        }
      } catch (err) {
        status.value = translations.connect
        console.log('Connection error:', err)
      }
    }

    // 断开连接
    function disconnect() {
      window.location.reload()
    }

    // 模块切换处理
    function handleModuleChange(newModule) {
      console.log('Switching to:', newModule)
      
      if (currentSubscription) {
        currentSubscription.unsubscribe()
        currentSubscription = null
      }

      // 重置数据
      moduleData.value = JSON.parse(JSON.stringify(emptyAuxChannelData))

      // 如果已连接，设置新模块的订阅
      if (status.value === translations.connected || status.value === translations.connectedMock) {
        buildPipe(newModule, settings.value[newModule])
        setupSubscription(newModule, settings.value[newModule])
      }
    }

    // 设置更新处理
    function handleSettingsUpdate(newSettings) {
      settings.value[selectedModule.value] = { ...settings.value[selectedModule.value], ...newSettings }
      
      // 重新构建管道
      if (status.value === translations.connected || status.value === translations.connectedMock) {
        buildPipe(selectedModule.value, settings.value[selectedModule.value])
        setupSubscription(selectedModule.value, settings.value[selectedModule.value])
      }
    }

    // 组件卸载时清理
    onUnmounted(() => {
      if (currentSubscription) {
        currentSubscription.unsubscribe()
      }
    })

    return {
      translations,
      status,
      selectedModule,
      enableAux,
      currentSettings,
      currentData,
      showAux,
      showSettings,
      showRecord,
      currentModuleComponent,
      connectMuse,
      disconnect,
      handleModuleChange,
      handleSettingsUpdate
    }
  }
}
</script>

<style scoped>
.page-switcher {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.connection-card {
  margin-bottom: 20px;
}

.module-selector {
  margin-bottom: 20px;
}

.el-button-group {
  margin-bottom: 10px;
}

@media (min-width: 768px) {
  .el-button-group {
    margin-bottom: 0;
  }
}
</style>
