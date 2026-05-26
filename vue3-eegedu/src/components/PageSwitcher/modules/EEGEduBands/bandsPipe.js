import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch, fft, powerByBand } from '@neurosity/pipes'
import { bandLabels } from '../utils/chartUtils'

export function getSettings() {
  return {
    cutOffLow: 2,
    cutOffHigh: 50,
    interval: 100,
    bins: 256,
    duration: 1024,
    srate: 256,
    name: 'Bands',
    secondsToSave: 10
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionBands) window.subscriptionBands.unsubscribe()

  window.pipeBands$ = null
  window.multicastBands$ = null
  window.subscriptionBands = null

  window.pipeBands$ = zipSamples(window.source.eegReadings$).pipe(
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
      console.log(err)
    })
  )

  window.multicastBands$ = window.pipeBands$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastBands$) {
    window.subscriptionBands = window.multicastBands$.subscribe(data => {
      setData(bandsData => {
        Object.values(bandsData).forEach((channel, index) => {
          channel.datasets[0].data = [
            data.delta[index],
            data.theta[index],
            data.alpha[index],
            data.beta[index],
            data.gamma[index]
          ]
          channel.xLabels = bandLabels
        })
        return {
          ch0: bandsData.ch0,
          ch1: bandsData.ch1,
          ch2: bandsData.ch2,
          ch3: bandsData.ch3,
          ch4: bandsData.ch4
        }
      })
    })

    window.multicastBands$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
