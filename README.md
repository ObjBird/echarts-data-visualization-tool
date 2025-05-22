# ECharts 数据可视化工具

一个基于 React 和 ECharts 的数据可视化工具，支持多种图表类型、维度筛选和交叉分析。

## ✨ 功能特点

- 📊 **多种图表类型**：支持线图、柱状图、饼图、散点图
- 🔍 **维度筛选**：可对数据进行多维度筛选分析
- 🔄 **交叉分析**：支持维度间的交叉分析
- 📱 **响应式设计**：适配桌面端和移动端
- 🎨 **自定义样式**：支持线条样式、形状等个性化配置
- 💻 **代码生成**：自动生成 ECharts 配置代码

## 🚀 快速开始

### 在线体验

访问 [GitHub Pages 部署地址](https://objbird.github.io/echarts-data-visualization-tool) 立即体验！

### 本地开发

#### 安装依赖

```bash
npm install
```

#### 启动开发服务器

```bash
npm start
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

#### 构建生产版本

```bash
npm run build
```

## 📖 使用说明

### 1. 数据输入

在"数据输入"选项卡中：
- 输入符合格式的 JSON 数据
- 点击"加载示例数据"查看数据格式示例
- 点击"解析数据"进行数据验证

### 2. 图表配置

在"图表配置"选项卡中：
- 选择图表类型（线图、柱状图、饼图、散点图）
- 设置 X 轴和指标字段
- 配置线条样式（仅线图）
- 添加维度筛选条件
- 选择交叉分析维度

### 3. 代码导出

在"配置代码"选项卡中：
- 查看生成的 ECharts 配置代码
- 一键复制代码到剪贴板

## 📊 数据格式

数据应包含 `headers` 和 `data` 两部分：

```json
{
  "headers": {
    "month": {
      "aliasName": "月份",
      "columnType": "dimension"
    },
    "sales": {
      "aliasName": "销售额",
      "columnType": "metric"
    }
  },
  "data": [
    { "month": "1月", "sales": 1200 },
    { "month": "2月", "sales": 1800 }
  ]
}
```

### 字段类型说明

- `dimension`: 维度字段，用于分类和筛选
- `metric`: 指标字段，用于数值展示
- `aliasName`: 字段的显示名称

## 🛠️ 技术栈

- **React 18** - 用户界面框架
- **Material-UI** - UI 组件库
- **ECharts** - 图表库
- **Create React App** - 项目脚手架

## 📁 项目结构

```
src/
├── components/           # React 组件
│   ├── ChartPanel.jsx   # 图表展示面板
│   ├── ConfigPanel.jsx  # 配置面板
│   ├── DimensionFilters.jsx  # 维度筛选组件
│   └── DimensionCross.jsx    # 交叉分析组件
├── utils/               # 工具函数
│   ├── echartsTransformer.js # ECharts 配置转换器
│   └── sampleData.js    # 示例数据
├── App.jsx             # 主应用组件
├── index.js            # 应用入口
└── index.css           # 全局样式
```

## 🎯 高级功能

### 维度筛选

支持对维度字段进行筛选：
- 等于、不等于
- 包含、不包含

### 交叉分析

支持多个维度之间的交叉分析，生成多条数据系列。

### 响应式设计

自动适配不同屏幕尺寸，在移动设备上提供优化的用户体验。

## 🔧 开发指南

### 添加新的图表类型

1. 在 `echartsTransformer.js` 中添加新的生成函数
2. 更新 `ConfigPanel.jsx` 中的图表类型选项
3. 在主函数中添加新的 case 分支

### 自定义样式

修改 `index.css` 文件来自定义应用的外观。

## 🤝 贡献

欢迎提交 Issues 和 Pull Requests！

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [ECharts 官方文档](https://echarts.apache.org/)
- [Material-UI 文档](https://mui.com/)
- [React 官方文档](https://reactjs.org/)

## 📞 联系

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/ObjBird/echarts-data-visualization-tool/issues)
- Email: 715824955@qq.com

---

如果这个项目对您有帮助，请给一个 ⭐️ Star！