<template>
  <div id="app">
    <el-container>
      <el-header height="auto" style="padding: 20px 0;">
        <div class="header-content">
          <h1>EEGEdu</h1>
          <p class="subtitle">Interactive Brain Wave Exploration</p>
        </div>
      </el-header>
      <el-main>
        <PageSwitcher />
      </el-main>
      <el-footer height="auto" style="padding: 20px;">
        <el-card shadow="never">
          <p>
            An Interactive EEG Learning Tool. A 
            <a href="http://kylemathewson.com" target="_blank">Ky</a>
            <a href="http://korymathewson.com" target="_blank">Kor</a>
            <a href="http://keyfer.ca" target="_blank">Key</a>
            Production.
            <a href="https://github.com/kylemath/EEGEdu/" target="_blank">Github source code</a>
          </p>
        </el-card>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import PageSwitcher from './components/PageSwitcher.vue'

export default {
  name: 'App',
  components: {
    PageSwitcher
  }
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.header-content {
  text-align: center;
}

.header-content h1 {
  margin: 0;
  font-size: 2.5em;
  color: #409EFF;
}

.subtitle {
  margin: 10px 0 0;
  color: #606266;
  font-size: 1.1em;
}

.el-footer {
  text-align: center;
  background-color: #f5f7fa;
}

.el-footer a {
  color: #409EFF;
  text-decoration: none;
  margin: 0 5px;
}

.el-footer a:hover {
  text-decoration: underline;
}
</style>
