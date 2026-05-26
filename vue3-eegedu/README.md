# EEGEdu Vue 3

Interactive EEG Education Platform - Vue 3 Version

This is a 1:1 port of the original React-based EEGEdu project to Vue 3.

## Features

- **Module 0: Intro** - Introduction to EEG and the Muse headband
- **Module 1: Heart Raw** - Raw PPG signal visualization
- **Module 2: Heart Spectra** - Heart rate frequency analysis
- **Module 3: Raw** - Raw EEG signal visualization
- **Module 4: Spectra** - Frequency spectrum analysis
- **Module 5: Bands** - Frequency band power visualization
- **Module 6: Animate** - 3D brain animation based on EEG
- **Module 7: Spectrogram** - Time-frequency visualization
- **Module 8: Alpha** - Alpha wave neurofeedback
- **Module 9: SSVEP** - Steady-state visually evoked potentials
- **Module 10: Evoked** - Event-related potentials (P300)
- **Module 11: Predict** - Machine learning classification

## Tech Stack

- Vue 3 with Composition API
- Vite for fast development
- Chart.js for data visualization
- p5.js for creative visualizations
- muse-js for Muse headband connection
- @neurosity/pipes for EEG signal processing

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Requirements

- Modern browser with Web Bluetooth API support (Chrome, Edge, Opera)
- Muse EEG headband (Muse 2 or Muse S recommended)

## Project Structure

```
src/
├── main.js                    # Application entry point
├── App.vue                    # Root component
├── styles/
│   └── main.css              # Global styles
├── composables/
│   ├── useMuse.js            # Muse connection logic
│   ├── useStore.js           # Global state management
│   └── useRecording.js       # Data recording utilities
├── components/
│   ├── shared/               # Shared UI components
│   │   ├── Card.vue
│   │   ├── ChartComponent.vue
│   │   └── P5Sketch.vue
│   └── PageSwitcher/
│       ├── PageSwitcher.vue  # Main module router
│       ├── utils/            # Utility functions
│       ├── translations/     # i18n files
│       ├── sketches/         # p5.js sketches
│       └── modules/          # EEG modules
│           ├── EEGEduIntro/
│           ├── EEGEduHeartRaw/
│           ├── EEGEduHeartSpectra/
│           ├── EEGEduRaw/
│           ├── EEGEduSpectra/
│           ├── EEGEduBands/
│           ├── EEGEduAnimate/
│           ├── EEGEduSpectro/
│           ├── EEGEduAlpha/
│           ├── EEGEduSsvep/
│           ├── EEGEduEvoked/
│           └── EEGEduPredict/
└── translations/
    └── en.json               # Application translations
```

## License

MIT License - See original EEGEdu project for details.

## Credits

Original EEGEdu project by Neurotech@UofT
Vue 3 port maintains all original functionality
