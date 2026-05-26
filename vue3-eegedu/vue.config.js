const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  devServer: {
    port: 8080,
    open: true
  },
  chainWebpack: config => {
    config.resolve.alias.set('vue', '@vue/runtime-dom')
  }
})
