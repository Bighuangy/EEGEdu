import { pipelines, zipSamples, epoch, fft, powerByBand } from "@neurosity/pipes";

// Build the predict pipeline for machine learning classification
export function buildPredictPipe(settings) {
  if (settings.status === "on") {
    return null;
  }

  const { epoch: epochDuration, duration, interval, srate, cutOffLow, cutOffHigh, nbChannels } = settings;
  const fftLength = Math.pow(2, Math.ceil(Math.log2(epochDuration * (srate / 1000))));

  return pipelines.addInfo({ nbChannels, samplingRate: srate })
    .pipe(
      pipelines.bufferTime({ 
        duration: duration, 
        interval: interval 
      }),
      pipelines.filter({ 
        lowpassHz: cutOffHigh, 
        highpassHz: cutOffLow 
      }),
      epoch({
        duration: epochDuration,
        interval: interval,
        samplingRate: srate
      }),
      fft({ bins: fftLength }),
      powerByBand()
    );
}

// Extract features from EEG data for classification
export function extractFeatures(bandPowers) {
  const features = [];
  
  // Extract power values for each band and channel
  const bands = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
  
  bands.forEach(band => {
    if (bandPowers[band]) {
      bandPowers[band].forEach(channelPower => {
        features.push(channelPower);
      });
    }
  });
  
  return features;
}

// Simple classifier using K-Nearest Neighbors approach
export class SimpleClassifier {
  constructor() {
    this.trainingData = [];
    this.labels = [];
  }

  // Add training sample
  addTrainingSample(features, label) {
    this.trainingData.push(features);
    this.labels.push(label);
  }

  // Clear training data
  clear() {
    this.trainingData = [];
    this.labels = [];
  }

  // Predict class using KNN (k=3)
  predict(features) {
    if (this.trainingData.length === 0) {
      return null;
    }

    const k = Math.min(3, this.trainingData.length);
    const distances = [];

    // Calculate Euclidean distance to all training samples
    this.trainingData.forEach((sample, index) => {
      let distance = 0;
      for (let i = 0; i < features.length && i < sample.length; i++) {
        distance += Math.pow(features[i] - sample[i], 2);
      }
      distances.push({
        distance: Math.sqrt(distance),
        label: this.labels[index]
      });
    });

    // Sort by distance and get k nearest neighbors
    distances.sort((a, b) => a.distance - b.distance);
    const nearestK = distances.slice(0, k);

    // Count votes
    const votes = {};
    nearestK.forEach(neighbor => {
      votes[neighbor.label] = (votes[neighbor.label] || 0) + 1;
    });

    // Return label with most votes
    let maxVotes = 0;
    let predictedLabel = null;
    Object.keys(votes).forEach(label => {
      if (votes[label] > maxVotes) {
        maxVotes = votes[label];
        predictedLabel = parseInt(label);
      }
    });

    return predictedLabel;
  }

  // Get training data count for each class
  getClassCounts() {
    const counts = {};
    this.labels.forEach(label => {
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }
}
