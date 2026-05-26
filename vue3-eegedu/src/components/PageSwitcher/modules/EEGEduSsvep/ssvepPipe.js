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
    name: 'Ssvep',
    secondsToSave: 10
  }
}

export function buildPipe(Settings) {
  if (window.subscriptionSsvep) window.subscriptionSsvep.unsubscribe()

  window.pipeSsvep$ = null
  window.multicastSsvep$ = null
  window.subscriptionSsvep = null

  window.pipeSsvep$ = zipSamples(window.source.eegReadings$).pipe(
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

  window.multicastSsvep$ = window.pipeSsvep$.pipe(
    multicast(() => new Subject())
  )
}

export function setup(setData, Settings) {
  console.log("Subscribing to " + Settings.name)

  if (window.multicastSsvep$) {
    window.subscriptionSsvep = window.multicastSsvep$.subscribe(data => {
      setData(ssvepData => {
        Object.values(ssvepData).forEach((channel, index) => {
          channel.datasets[0].data = data.psd[index]
          channel.xLabels = data.freqs
        })
        return {
          ch0: ssvepData.ch0,
          ch1: ssvepData.ch1,
          ch2: ssvepData.ch2,
          ch3: ssvepData.ch3,
          ch4: ssvepData.ch4
        }
      })
    })

    window.multicastSsvep$.connect()
    console.log("Subscribed to " + Settings.name)
  }
}
