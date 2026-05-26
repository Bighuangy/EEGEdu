import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch, fft, sliceFFT } from '@neurosity/pipes'

export function getSettings() {
  return {
    cutOffLow: 0.01,
    cutOffHigh: 20,
    interval: 100,
    bins: 8192,
    sliceFFTLow: 0.5,
    sliceFFTHigh: 2.5,
    duration: 2048,
    srate: 256,
    name: 'HeartSpectra',
    secondsToSave: 10
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionHeartSpectra) window.subscriptionHeartSpectra.unsubscribe()

  window.pipeHeartSpectra$ = null
  window.multicastHeartSpectra$ = null
  window.subscriptionHeartSpectra = null

  window.pipeHeartSpectra$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastHeartSpectra$ = window.pipeHeartSpectra$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastHeartSpectra$) {
    window.subscriptionHeartSpectra = window.multicastHeartSpectra$.subscribe(data => {
      setData(heartSpectraData => {
        Object.values(heartSpectraData).forEach((channel, index) => {
          channel.datasets[0].data = data.psd[1]
          channel.xLabels = data.freqs.map(x => x * 60)
        })
        return { ch1: heartSpectraData.ch1 }
      })
    })

    window.multicastHeartSpectra$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
