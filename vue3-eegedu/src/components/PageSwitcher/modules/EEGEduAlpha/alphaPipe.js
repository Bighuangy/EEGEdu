import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch, fft, sliceFFT } from '@neurosity/pipes'

export function getSettings() {
  return {
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 100,
    bins: 256,
    sliceFFTLow: 1,
    sliceFFTHigh: 30,
    duration: 1024,
    srate: 256,
    name: 'Alpha',
    secondsToSave: 60
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionAlpha) window.subscriptionAlpha.unsubscribe()

  window.pipeAlpha$ = null
  window.multicastAlpha$ = null
  window.subscriptionAlpha = null

  window.pipeAlpha$ = zipSamples(window.source.eegReadings$).pipe(
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
      console.log(err)
    })
  )

  window.multicastAlpha$ = window.pipeAlpha$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastAlpha$) {
    window.subscriptionAlpha = window.multicastAlpha$.subscribe(data => {
      setData(alphaData => {
        Object.values(alphaData).forEach((channel, index) => {
          channel.datasets[0].data = data.psd[index]
          channel.xLabels = data.freqs
        })
        return {
          ch0: alphaData.ch0,
          ch1: alphaData.ch1,
          ch2: alphaData.ch2,
          ch3: alphaData.ch3,
          ch4: alphaData.ch4
        }
      })
    })

    window.multicastAlpha$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
