export const chartStyles = {
  wrapperStyle: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: '20px'
  }
}

export const emptyChannelData = {
  ch0: { datasets: [{}] },
  ch1: { datasets: [{}] },
  ch2: { datasets: [{}] },
  ch3: { datasets: [{}] }
}

export const emptyAuxChannelData = {
  ch0: { datasets: [{}] },
  ch1: { datasets: [{}] },
  ch2: { datasets: [{}] },
  ch3: { datasets: [{}] },
  ch4: { datasets: [{}] }
}

export const emptySingleChannelData = {
  ch1: { datasets: [{}] }
}

// Chart.js v4 options format
export const generalOptions = {
  scales: {
    x: {
      title: {
        display: true,
        text: ''
      }
    },
    y: {
      title: {
        display: true,
        text: ''
      }
    }
  },
  elements: {
    point: {
      radius: 0
    }
  },
  plugins: {
    title: {
      display: true,
      text: 'Channel: '
    },
    tooltip: { 
      enabled: false 
    },
    legend: { 
      display: false 
    }
  },
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0
  }
}

// Generate options for a specific channel
export function getChannelOptions(channelIndex, title = 'Channel') {
  return {
    ...generalOptions,
    plugins: {
      ...generalOptions.plugins,
      title: {
        display: true,
        text: `${title}: ${channelIndex + 1}`
      }
    }
  }
}

// Generate options for spectra chart
export function getSpectraOptions(channelIndex) {
  return {
    ...generalOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Frequency (Hz)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Power (uV²/Hz)'
        }
      }
    },
    plugins: {
      ...generalOptions.plugins,
      title: {
        display: true,
        text: `Channel: ${channelIndex + 1}`
      }
    }
  }
}

// Generate options for bands chart
export function getBandsOptions(channelIndex) {
  return {
    ...generalOptions,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Frequency Band'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Power (uV²)'
        }
      }
    },
    plugins: {
      ...generalOptions.plugins,
      title: {
        display: true,
        text: `Channel: ${channelIndex + 1}`
      }
    }
  }
}

// Chart colors
export const chartColors = [
  'rgba(217, 95, 2, 1)',     // Orange
  'rgba(27, 158, 119, 1)',   // Green
  'rgba(117, 112, 179, 1)',  // Purple
  'rgba(231, 41, 138, 1)',   // Pink
  'rgba(102, 166, 30, 1)'    // Yellow-green
]

// Generate dataset config
export function generateDataset(data, label, colorIndex = 0) {
  return {
    label,
    data,
    fill: false,
    borderColor: chartColors[colorIndex % chartColors.length],
    backgroundColor: chartColors[colorIndex % chartColors.length],
    borderWidth: 1,
    tension: 0.1
  }
}
