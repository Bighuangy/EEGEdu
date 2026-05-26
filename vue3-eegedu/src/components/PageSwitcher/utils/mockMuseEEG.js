import { customCount } from './chartUtils'
import { interval, from } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'

const samples = () => {
  return Array(12)
    .fill()
    .map(() => Math.random() * 100)
}

const transform = (index) => {
  const timestamp = Date.now()
  const nchans = window.nchans || 4
  const chanNums = customCount(0, nchans - 1)
  return from(chanNums).pipe(
    map(electrode => ({
      timestamp,
      electrode,
      index,
      samples: samples()
    }))
  )
}

export const mockMuseEEG = (sampleRate) => {
  let index = 0
  return interval(1000 / sampleRate).pipe(
    map(() => index += 1),
    mergeMap(transform)
  )
}
