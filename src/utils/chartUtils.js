// Function to count by n to something
export function customCount(start, end, step = 1) {
  const len = Math.floor((end - start) / step) + 1
  return Array(len)
    .fill()
    .map((_, idx) => start + idx * step)
}

// Average of values in data
function average(data) {
  const sum = data.reduce((sum, value) => sum + value, 0)
  return sum / data.length
}

export const bandLabels = ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']

// Generate xTics
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
  return tics.map(each_element => Number(each_element.toFixed(0)))
}

// Standard deviation of values in values
export function standardDeviation(values) {
  const avg = average(values)
  const squareDiffs = values.map(value => {
    const diff = value - avg
    return diff * diff
  })
  
  const avgSquareDiff = average(squareDiffs)
  const stdDev = Math.sqrt(avgSquareDiff).toFixed(0)
  return stdDev
}
