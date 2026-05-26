<template>
  <div class="intro-card card">
    <div class="card-section purple">
      <h2>Machine Learning: Predict</h2>
    </div>
    <div class="card-section">
      <p>
        This module allows you to train a simple machine learning classifier using your brain signals.
        You can teach the classifier to recognize different mental states by providing training examples.
      </p>
      <h3>How to use:</h3>
      <ol>
        <li>Connect your Muse device</li>
        <li>Click "Start" to begin streaming</li>
        <li>Train Class 1: Think of one mental state (e.g., relaxed) and click "Train Class 1" several times</li>
        <li>Train Class 2: Think of another mental state (e.g., focused) and click "Train Class 2" several times</li>
        <li>The classifier will then predict which class your current brain state belongs to</li>
      </ol>
      <h3>Tips:</h3>
      <ul>
        <li>Provide at least 10 training samples for each class</li>
        <li>Keep the same mental state consistent while training each class</li>
        <li>Try different mental states like: relaxed vs. focused, eyes open vs. closed</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.intro-card {
  max-width: 800px;
  margin: 0 auto;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-section {
  padding: 20px;
}

.card-section.purple {
  background: #8e44ad;
  color: white;
}

.card-section h2 {
  margin: 0;
  font-size: 24px;
}

.card-section h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
}

.card-section p {
  line-height: 1.6;
  color: #666;
}

.card-section ol,
.card-section ul {
  padding-left: 20px;
  line-height: 1.8;
  color: #666;
}
</style>
