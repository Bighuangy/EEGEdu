<template>
  <div class="app-container">
    <el-container>
      <el-header class="app-header">
        <h1 class="app-title">{{ translations.title }}</h1>
      </el-header>
      <el-main class="app-main">
        <div class="page-container">
          <p class="app-subtitle">{{ translations.subtitle.join('') }}</p>
          <PageSwitcher />
          <el-card class="footer-card">
            <p>
              {{ translations.footer }}
              A 
              <el-link href="http://kylemathewson.com" target="_blank"> Ky</el-link>
              <el-link href="http://korymathewson.com" target="_blank">Kor</el-link>
              <el-link href="http://keyfer.ca" target="_blank">Key </el-link>
              Production.
              <el-link href="https://github.com/kylemath/EEGEdu/" target="_blank"> Github source code </el-link>
            </p>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import PageSwitcher from './components/PageSwitcher.vue'
import translations from './translations/app'
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background-color: #f4f6f8;
}

.app-header {
  background-color: #5c6ac4;
  color: white;
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.app-main {
  padding: 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.app-subtitle {
  font-size: 14px;
  line-height: 1.6;
  color: #637381;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px rgba(63, 63, 68, 0.05), 0 1px 3px 0 rgba(63, 63, 68, 0.15);
}

.footer-card {
  margin-top: 24px;
}

.footer-card p {
  margin: 0;
  font-size: 14px;
  color: #637381;
}

.footer-card .el-link {
  margin: 0 4px;
}
</style>
