import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch } from '@neurosity/pipes'
import { generateXTics, standardDeviation } from '../utils/chartUtils'

export function getSettings() {
  return {
    name: "Intro",
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 2,
    srate: 256,
    duration: 512
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionIntro) window.subscriptionIntro.unsubscribe()

  window.pipeIntro$ = null
  window.multicastIntro$ = null
  window.subscriptionIntro = null

  window.pipeIntro$ = zipSamples(window.source.eegReadings$).pipe(
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
  
  window.multicastIntro$ = window.pipeIntro$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastIntro$) {
    window.subscriptionIntro = window.multicastIntro$.subscribe(data => {
      setData(introData => {
        Object.values(introData).forEach((channel, index) => {
          if (index === 0) {
            channel.datasets[0].data = data.data[index]
            channel.xLabels = generateXTics(Settings.srate, Settings.duration)
            channel.datasets[0].qual = standardDeviation(data.data[index])
          }
        })
        return { ch0: introData.ch0 }
      })
    })

    window.multicastIntro$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
