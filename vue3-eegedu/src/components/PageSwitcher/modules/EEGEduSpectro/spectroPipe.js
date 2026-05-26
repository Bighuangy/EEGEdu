import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch, fft, sliceFFT } from '@neurosity/pipes'

export function getSettings() {
  return {
    cutOffLow: 2,
    cutOffHigh: 50,
    interval: 16,
    bins: 128,
    duration: 128,
    srate: 256,
    name: 'Spectro',
    sliceFFTLow: 1,
    sliceFFTHigh: 100
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionSpectro) window.subscriptionSpectro.unsubscribe()

  window.pipeSpectro$ = null
  window.multicastSpectro$ = null
  window.subscriptionSpectro = null

  window.pipeSpectro$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastSpectro$ = window.pipeSpectro$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastSpectro$) {
    window.subscriptionSpectro = window.multicastSpectro$.subscribe(data => {
      setData(spectroData => {
        Object.values(spectroData).forEach((channel, index) => {
          channel.datasets[0].data = data.psd[index]
          channel.xLabels = data.freqs
        })

        window.psd = data.psd[1]
        window.freqs = data.freqs
        window.bins = data.freqs.length

        return {
          ch0: spectroData.ch0,
          ch1: spectroData.ch1,
          ch2: spectroData.ch2,
          ch3: spectroData.ch3,
          ch4: spectroData.ch4
        }
      })
    })

    window.multicastSpectro$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
