import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch } from '@neurosity/pipes'
import { generateXTics, standardDeviation } from '../utils/chartUtils'

export function getSettings() {
  return {
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 10,
    srate: 256,
    duration: 2560,
    name: 'HeartRaw'
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionHeartRaw) window.subscriptionHeartRaw.unsubscribe()

  window.pipeHeartRaw$ = null
  window.multicastHeartRaw$ = null
  window.subscriptionHeartRaw = null

  window.pipeHeartRaw$ = zipSamples(window.source.eegReadings$).pipe(
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
      console.log(err)
    })
  )
  
  window.multicastHeartRaw$ = window.pipeHeartRaw$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastHeartRaw$) {
    window.subscriptionHeartRaw = window.multicastHeartRaw$.subscribe(data => {
      setData(heartRawData => {
        Object.values(heartRawData).forEach((channel, index) => {
          channel.datasets[0].data = data.data[index]
          channel.xLabels = generateXTics(Settings.srate, Settings.duration).map(x => x / 1000)
          channel.datasets[0].qual = standardDeviation(data.data[index])
        })
        return {
          ch0: heartRawData.ch0,
          ch1: heartRawData.ch1
        }
      })
    })

    window.multicastHeartRaw$.connect()
    console.log("Subscribed to HeartRaw")
  }
}
