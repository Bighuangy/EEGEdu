import { customCount } from './chartUtils'
import { interval, from } from 'rxjs'
import { map, mergeMap } from 'rxjs/operators'

// 生成随机样本数据
const samples = () => {
  return Array(12)
    .fill()
    .map(() => Math.random() * 100)
}

// 转换函数
const transform = (index, nchans) => {
  const timestamp = Date.now()
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

// 创建模拟EEG数据流
export const mockMuseEEG = (sampleRate, nchans = 4) => {
  let index = 0
  return interval(1000 / sampleRate).pipe(
    map(() => index += 1),
    mergeMap((idx) => transform(idx, nchans))
  )
}
