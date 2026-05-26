import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch, fft, powerByBand } from '@neurosity/pipes'
import { bandLabels } from '../utils/chartUtils'

export function getSettings() {
  return {
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 16,
    bins: 256,
    duration: 128,
    srate: 256,
    name: 'Animate'
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionAnimate) window.subscriptionAnimate.unsubscribe()

  window.pipeAnimate$ = null
  window.multicastAnimate$ = null
  window.subscriptionAnimate = null

  window.pipeAnimate$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastAnimate$ = window.pipeAnimate$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastAnimate$) {
    window.subscriptionAnimate = window.multicastAnimate$.subscribe(data => {
      setData(animateData => {
        Object.values(animateData).forEach((channel, index) => {
          channel.datasets[0].data = [
            data.delta[index],
            data.theta[index],
            data.alpha[index],
            data.beta[index],
            data.gamma[index]
          ]
          channel.xLabels = bandLabels
        })

        // Store in window for P5 animations
        window.delta = data.delta[1]
        window.theta = data.theta[1]
        window.alpha = data.alpha[1]
        window.beta = data.beta[1]
        window.gamma = data.gamma[1]

        return {
          ch0: animateData.ch0,
          ch1: animateData.ch1,
          ch2: animateData.ch2,
          ch3: animateData.ch3,
          ch4: animateData.ch4
        }
      })
    })

    window.multicastAnimate$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
