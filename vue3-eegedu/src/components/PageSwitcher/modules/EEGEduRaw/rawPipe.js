import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch } from '@neurosity/pipes'
import { generateXTics } from '../utils/chartUtils'

export function getSettings() {
  return {
    cutOffLow: 0.1,
    cutOffHigh: 100,
    interval: 25,
    srate: 256,
    duration: 1024,
    name: 'Raw',
    secondsToSave: 10
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionRaw) window.subscriptionRaw.unsubscribe()

  window.pipeRaw$ = null
  window.multicastRaw$ = null
  window.subscriptionRaw = null

  window.pipeRaw$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastRaw$ = window.pipeRaw$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastRaw$) {
    window.subscriptionRaw = window.multicastRaw$.subscribe(data => {
      setData(rawData => {
        Object.values(rawData).forEach((channel, index) => {
          channel.datasets[0].data = data.data[index]
          channel.xLabels = generateXTics(Settings.srate, Settings.duration)
        })
        return {
          ch0: rawData.ch0,
          ch1: rawData.ch1,
          ch2: rawData.ch2,
          ch3: rawData.ch3,
          ch4: rawData.ch4
        }
      })
    })

    window.multicastRaw$.connect()
    console.log("Subscribed to Raw")
  }
}
