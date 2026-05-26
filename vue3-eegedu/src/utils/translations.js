// 英文翻译配置
export default {
  // 连接相关
  connect: 'Connect Muse Headband',
  connectMock: 'Connect Mock Data',
  connecting: 'Connecting to Muse',
  connectingMock: 'Connecting to Mock Data',
  connected: 'Muse Headband Connected',
  connectedMock: 'Mock Data Connected',
  connectionFailed: 'Connection failed',
  disconnect: 'Disconnect',
  channel: 'Channel: ',

  // 页面切换器
  pageTitle: 'Choose your Module',

  // 模块类型
  modules: {
    intro: '1. Introduction',
    heartRaw: '2. Electrocardiogram (Heart beats)',
    heartSpectra: '3. Heart Rate (Beats per minute)',
    raw: '4. Raw and Filtered Data',
    spectra: '5. Frequency Spectra',
    bands: '6. Frequency Bands',
    animate: '7. Brain Controlled Animation',
    spectro: '8. Spectrogram (spectra over time)',
    alpha: '9. Eyes open vs. Eyes closed Experiment',
    ssvep: '10. Steady-State Visual Evoked Potential (SSVEP) Experiment',
    evoked: '11. Stimulus Evoked Event-related potential (ERP)',
    predict: '12. Predict brain states with a trained classifier'
  },

  // 各模块翻译
  intro: {
    title: 'Introduction to EEG',
    xlabel: 'Time (ms)',
    ylabel: 'Voltage (uV)',
    intro1: 'Welcome to EEGEdu! This interactive tool will guide you through the basics of electroencephalography (EEG). Connect your Muse headband above to see real brain data in real time!',
    intro2: 'The chart above shows the raw voltage signal recorded from your scalp. This signal is a combination of many neurons firing in your brain, mixed with noise from muscle movements and the environment.',
    neuronsHead: 'Neurons and the EEG Signal',
    neurons1: 'A single neuron communicates through electrical signals. When a neuron fires, it creates a tiny electrical potential.',
    neurons2: 'When millions of neurons fire together in synchrony, the combined electrical signal is large enough to be measured from the scalp.',
    neurons3: 'The EEG measures these combined electrical potentials from electrodes placed on the scalp.',
    oscillationsHead: 'Brain Oscillations',
    oscillations1: 'Brain waves, or neural oscillations, are patterns of rhythmic electrical activity. Different brain states produce different patterns.',
    oscillations2: 'When you are awake and alert, your brain produces fast, small amplitude waves. When you are drowsy or asleep, your brain produces slower, larger amplitude waves.',
    hardwareHead: 'EEG Hardware',
    hardware1: 'EEG systems typically use metal electrodes placed on the scalp to measure voltage differences.',
    hardware2: 'The international 10-20 system is a standard method for electrode placement.',
    hardware3: 'The electrical signals are very small (microvolts), so they must be amplified before digitization.',
    hardware4: 'A digital-to-analog converter (DAQ) samples the continuous signal at regular intervals.',
    hardware5: 'The sampling rate determines how many measurements are taken per second. The Muse samples at 256 Hz.',
    museHead: 'The Muse Headband',
    muse1: 'The Muse is a consumer EEG device designed for meditation and focus training.',
    muse2: 'It has four EEG electrodes positioned at AF7, AF8, TP9, and TP10.',
    muse3: 'It communicates wirelessly via Bluetooth Low Energy (BLE).',
    signalHead: 'Understanding the Signal',
    signal1: 'Each electrode measures voltage relative to a reference point.',
    signal2: 'The signal you see contains brain activity, artifacts from eye and muscle movements, and environmental noise.',
    creditsHead: 'Credits',
    credits1: 'This tool is based on content from ',
    credits2: 'EEG data is collected using the Muse headband by ',
    credits3: 'Web Bluetooth connectivity provided by ',
    credits4: ' by @urish. See his excellent article ',
    credits5: 'Signal processing provided by ',
    credits6: ' by @castillo.io. See his article '
  },

  raw: {
    title: 'Raw EEG Data',
    xlabel: 'Time (ms)',
    ylabel: 'Voltage (uV)',
    description: 'This module displays the raw EEG signal from each electrode. The data is filtered with a bandpass filter to remove very slow drifts and high frequency noise.'
  },

  spectra: {
    title: 'Frequency Spectra',
    xlabel: 'Frequency (Hz)',
    ylabel: 'Power (uV²)',
    description: 'This module shows the frequency content of the EEG signal using the Fast Fourier Transform (FFT). Different brain states produce different patterns of frequency activity.'
  },

  bands: {
    title: 'Frequency Bands',
    xlabel: 'Band',
    ylabel: 'Power (uV²)',
    description: 'Brain oscillations are typically grouped into frequency bands: Delta (1-4 Hz), Theta (4-7 Hz), Alpha (7-12 Hz), Beta (12-30 Hz), and Gamma (30+ Hz).'
  },

  animate: {
    title: 'Brain Controlled Animation',
    description: 'Use your brain waves to control interactive animations. The power in different frequency bands is used to drive the animation parameters.'
  },

  predict: {
    title: 'Brain State Prediction',
    description: 'Train a simple machine learning classifier to predict your brain state (eyes open, eyes closed, or blinking) from EEG features.'
  }
}
