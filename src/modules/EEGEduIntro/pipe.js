import { catchError, multicast } from 'rxjs/operators'
import { Subject } from 'rxjs'
import { zipSamples } from 'muse-js'
import { bandpassFilter, epoch } from '@neurosity/pipes'
import { generateXTics, standardDeviation } from '@/utils/chartUtils'

export function getSettings() {
  return {
    name: 'Intro',
    cutOffLow: 2,
    cutOffHigh: 20,
    interval: 2,
    srate: 256,
    duration: 512
  }
}

export function buildPipe(settings, eegStore) {
  if (eegStore.subscriptions.intro) {
    eegStore.subscriptions.intro.unsubscribe()
  }

  if (!eegStore.source?.eegReadings$) return

  const pipe$ = zipSamples(eegStore.source.eegReadings$).pipe(
    bandpassFilter({
      cutoffFrequencies: [settings.cutOffLow, settings.cutOffHigh],
      nbChannels: eegStore.nchans
    }),
    epoch({
      duration: settings.duration,
      interval: settings.interval,
      samplingRate: settings.srate
    }),
    catchError(err => {
      console.log(err)
    })
  )

  const multicast$ = pipe$.pipe(
    multicast(() => new Subject())
  )

  eegStore.setPipe('intro', pipe$)
  eegStore.setMulticast('intro', multicast$)
}

export function setup(setData, settings, eegStore) {
  console.log('Subscribing to ' + settings.name)

  const multicast$ = eegStore.getMulticast('intro')

  if (multicast$) {
    const subscription = multicast$.subscribe(data => {
      const newData = {
        ch0: {
          datasets: [{
            data: data.data[0],
            qual: standardDeviation(data.data[0])
          }],
          xLabels: generateXTics(settings.srate, settings.duration)
        },
        ch1: { datasets: [{}] },
        ch2: { datasets: [{}] },
        ch3: { datasets: [{}] },
        ch4: { datasets: [{}] }
      }
      setData(newData)
    })

    eegStore.setSubscription('intro', subscription)
    multicast$.connect()
    console.log('Subscribed to ' + settings.name)
  }
}
