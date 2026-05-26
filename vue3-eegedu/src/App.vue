<template>
  <div class="app-container">
    <header>
      <h1 class="page-title">{{ translations.title }}</h1>
      <p class="page-subtitle">{{ translations.subtitle }}</p>
    </header>
    
    <PageSwitcher />
    
    <footer class="card">
      <div class="card-section">
        <p>
          {{ translations.footer }}
          A <a class="link" href="http://kylemathewson.com" target="_blank">Ky</a>
          <a class="link" href="http://korymathewson.com" target="_blank">Kor</a>
          <a class="link" href="http://keyfer.ca" target="_blank">Key</a>
          Production.
          <a class="link" href="https://github.com/kylemath/EEGEdu/" target="_blank">Github source code</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import PageSwitcher from './components/PageSwitcher/PageSwitcher.vue'
import translations from './translations/en.json'
</script>
