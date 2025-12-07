# ConfigGuardian

配置变更风险分析工具 - 基于 React 19 + Tailwind CSS 的完整配置分析流水线

## 🚀 功能特性

ConfigGuardian 提供了一个完整的配置变更分析流水线，包括：

1. **配置输入 (Config Input)** - 支持 YAML/JSON 格式的配置输入
2. **AST 解析 (AST Parser)** - 将配置解析为抽象语法树
3. **执行路径模拟 (Execution Simulator)** - 基于 AST 生成执行图
4. **变更差异分析 (Semantic Diff Analyzer)** - 对新旧执行图进行语义级差异分析
5. **风险检测分析 (Risk Analyzer)** - 使用 AI 进行风险评估
6. **修复建议生成 (Fix Suggestion)** - 基于风险评估生成自动修复建议

## 📦 技术栈

- **React 19** - 最新版本的 React
- **TypeScript** - 类型安全
- **Tailwind CSS** - 苹果极简风格 UI
- **Vite** - 快速构建工具
- **React Router** - 路由管理

## 🛠️ 安装与运行

### 前置要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 🎯 使用说明

### 基本使用

1. 在左侧配置输入框中输入 YAML 或 JSON 格式的配置
2. 点击"运行全链路"按钮执行完整的分析流程
3. 查看右侧流水线中每个步骤的输入和输出结果

### 测试数据

点击"显示测试数据"按钮可以加载预设的测试数据集：

- **测试数据 1**: 安全风险变更（包含敏感信息）
- **测试数据 2**: 无风险变更（正常配置更新）
- **测试数据 3**: 需要自动修复（性能问题）

### AI 接口配置

项目默认使用 `http://localhost:3001/v1/chat/completions` 作为 AI 接口。如果接口不可用，系统会自动使用模拟数据。

要配置自定义 AI 接口，请修改 `src/api/aiService.ts` 中的 `AI_API_URL` 常量。

## 📁 项目结构

```
config-guardian/
├── src/
│   ├── api/              # API 服务
│   │   └── aiService.ts  # AI 服务封装
│   ├── components/       # React 组件
│   │   ├── ConfigInput.tsx
│   │   ├── JSONViewer.tsx
│   │   └── PipelineStep.tsx
│   ├── core/             # 核心功能模块
│   │   ├── astParser.ts
│   │   ├── diffAnalyzer.ts
│   │   └── executionSimulator.ts
│   ├── data/             # 测试数据
│   │   └── testData.ts
│   ├── hooks/            # React Hooks
│   │   └── usePipeline.ts
│   ├── pages/            # 页面组件
│   │   └── Playground.tsx
│   ├── types/            # TypeScript 类型定义
│   │   └── index.ts
│   ├── index.css         # 全局样式
│   └── main.tsx          # 应用入口
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔗 核心功能链路

项目严格按照以下链路实现，每一环的输入来自上一环的输出：

```
用户输入配置（Config Input）
      ↓
解析 & 语法树（AST Parser）
      ↓
执行路径模拟（Execution Simulator）
      ↓
变更差异分析（Semantic Diff Analyzer）
      ↓
风险检测分析（Risk Analyzer - AI）
      ↓
修复建议生成（Fix Suggestion - AI）
```

## 🧪 测试数据

项目包含 3 套完整的测试数据，涵盖：

- 安全风险变更示例
- 无风险变更示例
- 需要自动修复的示例

每套测试数据都包含完整的流水线输出，可以直接加载查看效果。

## 🎨 UI 设计

采用苹果极简风格设计，使用 Tailwind CSS 实现：

- 简洁的卡片式布局
- 清晰的步骤可视化
- 响应式设计，支持移动端
- 优雅的 JSON 查看器

## 📝 开发说明

### 添加新的分析步骤

1. 在 `src/core/` 目录下创建新的分析器类
2. 在 `src/types/index.ts` 中添加相应的类型定义
3. 在 `src/hooks/usePipeline.ts` 中集成新步骤
4. 在 `src/pages/Playground.tsx` 中添加新的 PipelineStep 组件

### 自定义 AI 接口

修改 `src/api/aiService.ts` 中的 `callAI` 方法以适配不同的 AI 服务接口。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**ConfigGuardian** - 让配置变更更安全、更可靠

