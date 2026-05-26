export const chartStyles = {
  wrapperStyle: {
    display: "flex",
    flexWrap: "wrap",
    padding: "20px"
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

export const generalOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false }
  },
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
  animation: {
    duration: 0
  }
}

export const channelNames = ['TP9', 'AF7', 'AF8', 'TP10', 'AUX']
