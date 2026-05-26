<template>
  <el-card class="record-panel" shadow="hover">
    <template #header>
      <span>Record {{ settings.name }} Data</span>
    </template>

    <el-form label-position="top">
      <!-- 录制时长设置 -->
      <el-form-item v-if="settings.secondsToSave !== undefined" :label="`Recording Length: ${settings.secondsToSave} Seconds`">
        <el-slider
          :model-value="settings.secondsToSave"
          :min="2"
          :max="180"
          show-input
          :disabled="isDisabled"
          @update:model-value="updateSetting('secondsToSave', $event)"
        />
      </el-form-item>

      <!-- 录制按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          :disabled="isDisabled"
          :loading="isRecording"
          @click="startRecording"
        >
          {{ isRecording ? 'Recording...' : 'Save to CSV' }}
        </el-button>
      </el-form-item>

      <!-- 说明文字 -->
      <el-form-item v-if="moduleType === 'raw'">
        <el-alert
          title="Recording Tips"
          type="info"
          :closable="false"
          show-icon
        >
          When recording raw data, it is recommended to first set the sampling point between epochs to 1,
          then set the epoch duration to 1. This will make each row of the output file a single time point.
        </el-alert>
      </el-form-item>
    </el-form>

    <!-- 录制中对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="Recording Data"
      width="400px"
      :close-on-click-modal="false"
    >
      <p>
        Your data is currently recording. Once complete, it will be downloaded as a .csv file
        and can be opened with your favorite spreadsheet program.
      </p>
      <el-progress :percentage="recordProgress" :stroke-width="15" />
      <template #footer>
        <el-button @click="dialogVisible = false">Close</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script>
import { ref, computed } from 'vue'
import { timer } from 'rxjs'
import { takeUntil, take } from 'rxjs/operators'
import { saveAs } from 'file-saver'
import translations from '../utils/translations'
import { bandLabels } from '../utils/chartUtils'

export default {
  name: 'RecordPanel',
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
    const isRecording = ref(false)
    const dialogVisible = ref(false)
    const recordProgress = ref(0)

    const isDisabled = computed(() => props.status === translations.connect)

    function updateSetting(key, value) {
      emit('update:settings', { [key]: value })
    }

    function startRecording() {
      isRecording.value = true
      dialogVisible.value = true
      recordProgress.value = 0

      const Settings = props.settings
      const moduleType = props.moduleType
      const dataToSave = []

      // 获取对应的multicast流
      const multicast$ = window[`multicast${moduleType}$`]

      if (!multicast$) {
        console.error('No multicast stream found for', moduleType)
        isRecording.value = false
        return
      }

      // 生成CSV头部
      if (['raw', 'heartRaw', 'evoked', 'intro'].includes(moduleType)) {
        dataToSave.push('Timestamp (ms),ch0,ch1,ch2,ch3,chAux\n')
      } else if (['spectra', 'heartSpectra', 'spectro', 'ssvep'].includes(moduleType)) {
        // 先获取一个样本来确定频率
        const headerObservable$ = multicast$.pipe(take(1))
        headerObservable$.subscribe({
          next(x) {
            const freqs = Object.values(x.freqs)
            dataToSave.push(
              'Timestamp (ms),' +
              freqs.map(f => `ch0_${f}Hz`).join(',') + ',' +
              freqs.map(f => `ch1_${f}Hz`).join(',') + ',' +
              freqs.map(f => `ch2_${f}Hz`).join(',') + ',' +
              freqs.map(f => `ch3_${f}Hz`).join(',') + ',' +
              freqs.map(f => `chAux_${f}Hz`).join(',') + '\n'
            )
          }
        })
      } else if (['bands', 'alpha'].includes(moduleType)) {
        dataToSave.push(
          'Timestamp (ms),' +
          'delta0,delta1,delta2,delta3,deltaAux,' +
          'theta0,theta1,theta2,theta3,thetaAux,' +
          'alpha0,alpha1,alpha2,alpha3,alphaAux,' +
          'beta0,beta1,beta2,beta3,betaAux,' +
          'gamma0,gamma1,gamma2,gamma3,gammaAux\n'
        )
      }

      // 创建定时器
      const timer$ = timer(Settings.secondsToSave * 1000)

      // 更新进度
      const progressInterval = setInterval(() => {
        recordProgress.value = Math.min(recordProgress.value + (100 / Settings.secondsToSave), 100)
      }, 1000)

      // 订阅数据流
      const localObservable$ = multicast$.pipe(takeUntil(timer$))

      localObservable$.subscribe({
        next(x) {
          if (['raw', 'heartRaw', 'evoked', 'intro'].includes(moduleType)) {
            const rowData = x.data.map(ch => ch.join(';')).join(',')
            dataToSave.push(Date.now() + ',' + rowData + '\n')
          } else if (['spectra', 'heartSpectra', 'spectro', 'ssvep'].includes(moduleType)) {
            const rowData = x.psd.map(ch => ch.join(';')).join(',')
            dataToSave.push(Date.now() + ',' + rowData + '\n')
          } else if (['bands', 'alpha'].includes(moduleType)) {
            dataToSave.push(Date.now() + ',' + Object.values(x).join(',') + '\n')
          }
        },
        error(err) {
          console.log('Recording error:', err)
          isRecording.value = false
          clearInterval(progressInterval)
        },
        complete() {
          clearInterval(progressInterval)
          recordProgress.value = 100

          const blob = new Blob(dataToSave, { type: 'text/plain;charset=utf-8' })
          saveAs(blob, `${Settings.name}_Recording_${Date.now()}.csv`)

          console.log('Recording completed')
          isRecording.value = false
        }
      })
    }

    return {
      isRecording,
      dialogVisible,
      recordProgress,
      isDisabled,
      updateSetting,
      startRecording
    }
  }
}
</script>

<style scoped>
.record-panel {
  margin-bottom: 20px;
}
</style>
