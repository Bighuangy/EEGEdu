import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch } from '@neurosity/pipes'
import { generateXTics, standardDeviation } from '../utils/chartUtils'

export function getSettings() {
  return {
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 1,
    srate: 256,
    duration: 1,
    name: 'Evoked',
    secondsToSave: 60
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionEvoked) window.subscriptionEvoked.unsubscribe()

  window.pipeEvoked$ = null
  window.multicastEvoked$ = null
  window.subscriptionEvoked = null

  window.pipeEvoked$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastEvoked$ = window.pipeEvoked$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastEvoked$) {
    window.subscriptionEvoked = window.multicastEvoked$.subscribe(data => {
      setData(evokedData => {
        Object.values(evokedData).forEach((channel, index) => {
          channel.datasets[0].data = data.data[index]
          channel.xLabels = generateXTics(Settings.srate, Settings.duration)
          channel.datasets[0].qual = standardDeviation(data.data[index])
        })
        return {
          ch0: evokedData.ch0,
          ch1: evokedData.ch1,
          ch2: evokedData.ch2,
          ch3: evokedData.ch3,
          ch4: evokedData.ch4
        }
      })
    })

    window.multicastEvoked$.connect()
    console.log("Subscribed to Evoked")
  }
}
