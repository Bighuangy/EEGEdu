import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch, fft, sliceFFT } from '@neurosity/pipes'

export function getSettings() {
  return {
    cutOffLow: 1,
    cutOffHigh: 100,
    interval: 100,
    bins: 256,
    sliceFFTLow: 1,
    sliceFFTHigh: 100,
    duration: 1024,
    srate: 256,
    name: 'Spectra',
    secondsToSave: 10
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionSpectra) window.subscriptionSpectra.unsubscribe()

  window.pipeSpectra$ = null
  window.multicastSpectra$ = null
  window.subscriptionSpectra = null

  window.pipeSpectra$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastSpectra$ = window.pipeSpectra$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastSpectra$) {
    window.subscriptionSpectra = window.multicastSpectra$.subscribe(data => {
      setData(spectraData => {
        Object.values(spectraData).forEach((channel, index) => {
          channel.datasets[0].data = data.psd[index]
          channel.xLabels = data.freqs
        })
        return {
          ch0: spectraData.ch0,
          ch1: spectraData.ch1,
          ch2: spectraData.ch2,
          ch3: spectraData.ch3,
          ch4: spectraData.ch4
        }
      })
    })

    window.multicastSpectra$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
