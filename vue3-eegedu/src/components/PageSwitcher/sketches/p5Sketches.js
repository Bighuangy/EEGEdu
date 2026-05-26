// P5.js Sketch for EEG Animate module - 3D brain visualization

export function createAnimateSketch(p, data) {
  let rotationX = 0;
  let rotationY = 0;
  let brainValues = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
  
  p.setup = function() {
    p.createCanvas(400, 400, p.WEBGL);
    p.colorMode(p.HSB, 360, 100, 100, 100);
  };
  
  p.draw = function() {
    p.background(220, 10, 95);
    
    // Auto rotation
    rotationX += 0.005;
    rotationY += 0.01;
    
    p.rotateX(rotationX);
    p.rotateY(rotationY);
    
    // Draw brain sphere with EEG-based colors
    const hue = p.map(brainValues.alpha, 0, 100, 200, 280);
    const saturation = p.map(brainValues.beta, 0, 100, 30, 80);
    const brightness = p.map(brainValues.theta, 0, 100, 60, 100);
    
    p.noStroke();
    p.fill(hue, saturation, brightness);
    p.sphere(100);
    
    // Draw electrode positions
    drawElectrodes();
    
    // Draw activity indicators
    drawActivityRings();
  };
  
  function drawElectrodes() {
    const electrodePositions = [
      { name: 'TP9', theta: -45, phi: 90 },
      { name: 'AF7', theta: -30, phi: 60 },
      { name: 'AF8', theta: 30, phi: 60 },
      { name: 'TP10', theta: 45, phi: 90 }
    ];
    
    p.push();
    p.fill(0, 80, 100);
    electrodePositions.forEach(pos => {
      const r = 105;
      const x = r * p.sin(p.radians(pos.phi)) * p.cos(p.radians(pos.theta));
      const y = r * p.cos(p.radians(pos.phi));
      const z = r * p.sin(p.radians(pos.phi)) * p.sin(p.radians(pos.theta));
      
      p.push();
      p.translate(x, y, z);
      p.sphere(8);
      p.pop();
    });
    p.pop();
  }
  
  function drawActivityRings() {
    // Draw rings based on frequency band activity
    p.push();
    p.noFill();
    p.strokeWeight(2);
    
    // Delta ring (slowest, outermost)
    p.stroke(0, 60, 80, 50);
    p.rotateX(p.PI / 2);
    const deltaRadius = 120 + brainValues.delta * 0.5;
    p.circle(0, 0, deltaRadius * 2);
    
    // Alpha ring
    p.stroke(120, 60, 80, 50);
    const alphaRadius = 110 + brainValues.alpha * 0.3;
    p.circle(0, 0, alphaRadius * 2);
    
    // Beta ring (fastest, innermost visual ring)
    p.stroke(240, 60, 80, 50);
    const betaRadius = 105 + brainValues.beta * 0.2;
    p.circle(0, 0, betaRadius * 2);
    
    p.pop();
  }
  
  // Method to update brain values from external data
  p.updateBrainValues = function(newValues) {
    if (newValues) {
      brainValues = { ...brainValues, ...newValues };
    }
  };
  
  p.updateData = function(newData) {
    if (newData && newData.brainValues) {
      p.updateBrainValues(newData.brainValues);
    }
  };
}

// P5.js Sketch for Spectrogram visualization
export function createSpectrogramSketch(p, data) {
  let spectrogramData = [];
  const maxHistory = 100;
  const numBins = 64;
  
  p.setup = function() {
    p.createCanvas(600, 300);
    p.colorMode(p.HSB, 360, 100, 100);
    p.noStroke();
    
    // Initialize empty spectrogram
    for (let i = 0; i < maxHistory; i++) {
      spectrogramData.push(new Array(numBins).fill(0));
    }
  };
  
  p.draw = function() {
    p.background(0);
    
    const binHeight = p.height / numBins;
    const timeWidth = p.width / maxHistory;
    
    // Draw spectrogram
    for (let t = 0; t < spectrogramData.length; t++) {
      for (let f = 0; f < spectrogramData[t].length; f++) {
        const value = spectrogramData[t][f];
        const hue = p.map(value, 0, 100, 240, 0); // Blue to red
        const brightness = p.map(value, 0, 100, 20, 100);
        
        p.fill(hue, 80, brightness);
        p.rect(t * timeWidth, (numBins - f - 1) * binHeight, timeWidth, binHeight);
      }
    }
    
    // Draw frequency labels
    p.fill(255);
    p.textSize(10);
    p.text('50 Hz', 5, 15);
    p.text('25 Hz', 5, p.height / 2);
    p.text('0 Hz', 5, p.height - 5);
  };
  
  p.addSpectrum = function(spectrum) {
    if (spectrum && spectrum.length > 0) {
      // Resample spectrum to fit numBins
      const resampled = [];
      const step = spectrum.length / numBins;
      
      for (let i = 0; i < numBins; i++) {
        const idx = Math.floor(i * step);
        resampled.push(spectrum[idx] || 0);
      }
      
      spectrogramData.push(resampled);
      
      if (spectrogramData.length > maxHistory) {
        spectrogramData.shift();
      }
    }
  };
  
  p.updateData = function(newData) {
    if (newData && newData.spectrum) {
      p.addSpectrum(newData.spectrum);
    }
  };
  
  p.clear = function() {
    spectrogramData = [];
    for (let i = 0; i < maxHistory; i++) {
      spectrogramData.push(new Array(numBins).fill(0));
    }
  };
}

// P5.js Sketch for SSVEP flashing stimuli
export function createSsvepSketch(p, data) {
  let flashFrequency = 10; // Hz
  let isFlashing = false;
  let flashState = false;
  let lastFlashTime = 0;
  
  p.setup = function() {
    p.createCanvas(400, 300);
    p.rectMode(p.CENTER);
  };
  
  p.draw = function() {
    p.background(128);
    
    if (isFlashing) {
      const currentTime = p.millis();
      const flashPeriod = 1000 / (flashFrequency * 2); // Half period for on/off
      
      if (currentTime - lastFlashTime > flashPeriod) {
        flashState = !flashState;
        lastFlashTime = currentTime;
      }
      
      // Draw flashing stimulus
      p.fill(flashState ? 255 : 0);
      p.rect(p.width / 2, p.height / 2, 150, 150);
      
      // Draw frequency indicator
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(16);
      p.text(`${flashFrequency} Hz`, p.width / 2, p.height - 30);
    } else {
      // Draw instruction
      p.fill(50);
      p.textAlign(p.CENTER);
      p.textSize(18);
      p.text('Click to start/stop flashing', p.width / 2, p.height / 2);
    }
  };
  
  p.mousePressed = function() {
    if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      isFlashing = !isFlashing;
      lastFlashTime = p.millis();
    }
  };
  
  p.setFrequency = function(freq) {
    flashFrequency = freq;
  };
  
  p.updateData = function(newData) {
    if (newData && newData.frequency) {
      p.setFrequency(newData.frequency);
    }
    if (newData && typeof newData.isFlashing !== 'undefined') {
      isFlashing = newData.isFlashing;
    }
  };
}

// P5.js Sketch for Evoked potential stimulus (visual oddball)
export function createEvokedSketch(p, data) {
  let stimulusType = 'none'; // 'standard', 'target', 'none'
  let stimulusStartTime = 0;
  const stimulusDuration = 200; // ms
  
  p.setup = function() {
    p.createCanvas(400, 300);
    p.rectMode(p.CENTER);
    p.ellipseMode(p.CENTER);
  };
  
  p.draw = function() {
    p.background(128);
    
    const currentTime = p.millis();
    const elapsed = currentTime - stimulusStartTime;
    
    if (elapsed < stimulusDuration) {
      if (stimulusType === 'standard') {
        // Standard stimulus - blue circle
        p.fill(0, 100, 255);
        p.noStroke();
        p.ellipse(p.width / 2, p.height / 2, 100, 100);
      } else if (stimulusType === 'target') {
        // Target stimulus - red square
        p.fill(255, 50, 50);
        p.noStroke();
        p.rect(p.width / 2, p.height / 2, 100, 100);
      }
    } else {
      // Fixation cross
      p.stroke(50);
      p.strokeWeight(3);
      p.line(p.width / 2 - 20, p.height / 2, p.width / 2 + 20, p.height / 2);
      p.line(p.width / 2, p.height / 2 - 20, p.width / 2, p.height / 2 + 20);
    }
    
    // Instructions
    p.noStroke();
    p.fill(50);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text('Focus on the cross. Count the red squares.', p.width / 2, p.height - 20);
  };
  
  p.showStimulus = function(type) {
    stimulusType = type;
    stimulusStartTime = p.millis();
  };
  
  p.updateData = function(newData) {
    if (newData && newData.stimulus) {
      p.showStimulus(newData.stimulus);
    }
  };
}
