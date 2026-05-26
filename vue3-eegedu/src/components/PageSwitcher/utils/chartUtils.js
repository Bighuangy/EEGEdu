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

export const bandLabels = ["Delta", "Theta", "Alpha", "Beta", "Gamma"]

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
  return tics.map((each_element) => Number(each_element.toFixed(0)))
}

// Standard deviation of values in values
export function standardDeviation(values) {
  if (!values || values.length === 0) return 0
  const avg = average(values)
  const squareDiffs = values.map((value) => {
    const diff = value - avg
    return diff * diff
  })
  const avgSquareDiff = average(squareDiffs)
  return Math.sqrt(avgSquareDiff).toFixed(0)
}

// Find index of max value in array
export function indexOfMax(arr) {
  if (!arr || arr.length === 0) return -1
  let max = arr[0]
  let maxIndex = 0
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) {
      maxIndex = i
      max = arr[i]
    }
  }
  return maxIndex
}
