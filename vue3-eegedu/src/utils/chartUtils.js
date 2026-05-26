// 图表基础配置
export const chartStyles = {
  wrapperStyle: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '20px'
  }
}

// 空通道数据初始化
export const emptyAuxChannelData = {
  ch0: { datasets: [{}] },
  ch1: { datasets: [{}] },
  ch2: { datasets: [{}] },
  ch3: { datasets: [{}] },
  ch4: { datasets: [{}] }
}

// 通用图表配置
export const generalOptions = {
  scales: {
    xAxes: [{
      scaleLabel: {
        display: true
      }
    }],
    yAxes: [{
      scaleLabel: {
        display: true
      }
    }]
  },
  elements: {
    point: {
      radius: 0
    }
  },
  title: {
    display: true,
    text: 'Channel'
  },
  responsive: true,
  tooltips: { enabled: false },
  legend: { display: false }
}

// 频带标签
export const bandLabels = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']

// 自定义计数函数
export function customCount(start, end, step = 1) {
  const len = Math.floor((end - start) / step) + 1
  return Array(len).fill().map((_, idx) => start + idx * step)
}

// 计算平均值
function average(data) {
  const sum = data.reduce((sum, value) => sum + value, 0)
  return sum / data.length
}

// 生成X轴刻度
export function generateXTics(srate, duration, reverse = true) {
  let tics = []
  if (reverse) {
    tics = customCount(
      (1000 / srate) * duration,
      1000 / srate,
      -(1000 / srate)
    )
  } else {
    tics = customCount(
      1000 / srate,
      (1000 / srate) * duration,
      1000 / srate
    )
  }
  return tics.map(each => Number(each.toFixed(0)))
}

// 计算标准差
export function standardDeviation(values) {
  const avg = average(values)
  const squareDiffs = values.map(value => {
    const diff = value - avg
    return diff * diff
  })
  const avgSquareDiff = average(squareDiffs)
  return Math.sqrt(avgSquareDiff).toFixed(0)
}
