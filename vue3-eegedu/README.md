# vue3-eegedu

## 项目说明

这是一个基于 Vue3 + Element Plus 的 EEG 教育应用，从原始的 React 项目转换而来。

## 功能模块

1. **介绍模块 (Introduction)** - EEG 基础知识介绍
2. **心电图 (ECG)** - 使用 Muse 设备测量心电信号
3. **心率分析 (Heart Rate)** - 心率频谱分析
4. **原始数据 (Raw Data)** - EEG 原始波形显示和伪影识别
5. **频谱分析 (Spectra)** - FFT 频谱分析
6. **频带功率 (Bands)** - Delta/Theta/Alpha/Beta/Gamma 频带分析
7. **脑电动画 (Animation)** - 用脑电波控制 P5.js 动画
8. **频谱图 (Spectrogram)** - 时频分析可视化
9. **睁闭眼实验 (Alpha)** - 经典的 Alpha 阻断实验
10. **SSVEP 实验** - 稳态视觉诱发电位
11. **诱发电位 (ERP)** - 刺激诱发的事件相关电位
12. **状态预测 (Predict)** - 使用 KNN 分类器预测脑状态

## 技术栈

- Vue 3 (Composition API)
- Element Plus (UI 组件库)
- Chart.js (图表可视化)
- P5.js (动画)
- muse-js (蓝牙连接 Muse 设备)
- @neurosity/pipes (EEG 信号处理)
- RxJS (响应式数据流)
- file-saver (CSV 数据导出)

## 安装和运行

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 开发模式运行

```bash
npm run serve
# 或
yarn serve
```

### 生产构建

```bash
npm run build
# 或
yarn build
```

## 使用说明

1. **连接设备**: 点击 "Connect Muse Headband" 按钮通过蓝牙连接 Muse 设备
2. **模拟数据**: 如果没有设备，可以点击 "Connect Mock Data" 使用模拟数据
3. **选择模块**: 从下拉菜单选择要学习的模块
4. **调整参数**: 使用设置面板调整信号处理参数
5. **录制数据**: 点击 "Save to CSV" 按钮保存数据到文件

## 浏览器兼容性

需要支持 Web Bluetooth API 的浏览器：
- Chrome (推荐)
- Edge
- Opera

注意：Safari 和 Firefox 目前不支持 Web Bluetooth API。

## 项目结构

```
vue3-eegedu/
├── public/
│   └── index.html
├── src/
│   ├── main.js              # 应用入口
│   ├── App.vue              # 根组件
│   ├── components/
│   │   ├── PageSwitcher.vue # 主页面控制器
│   │   ├── SettingsPanel.vue # 设置面板
│   │   ├── RecordPanel.vue  # 录制面板
│   │   └── modules/         # 各功能模块
│   │       ├── IntroModule.vue
│   │       ├── RawModule.vue
│   │       ├── SpectraModule.vue
│   │       ├── BandsModule.vue
│   │       ├── AnimateModule.vue
│   │       ├── SpectroModule.vue
│   │       ├── AlphaModule.vue
│   │       ├── HeartRawModule.vue
│   │       └── PredictModule.vue
│   └── utils/
│       ├── chartUtils.js    # 图表工具函数
│       ├── mockMuseEEG.js   # 模拟数据生成器
│       └── translations.js  # 翻译配置
├── package.json
├── vue.config.js
└── babel.config.js
```

## 致谢

- 原始项目: [EEGEdu](https://github.com/kylemath/EEGEdu)
- [NeurotechEdu](http://learn.neurotechedu.com/)
- [Muse by Interaxon](https://choosemuse.com/)
- [muse-js by @urish](https://github.com/urish/muse-js)
- [eeg-pipes by Neurosity](https://github.com/neurosity/eeg-pipes)

## 许可证

MIT License
