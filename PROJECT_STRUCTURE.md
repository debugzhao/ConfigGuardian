# ConfigGuardian 项目结构

## 📁 完整目录结构

```
config-guardian/
├── .eslintrc.cjs              # ESLint 配置
├── .gitignore                 # Git 忽略文件
├── index.html                 # HTML 入口文件
├── package.json               # 项目依赖配置
├── postcss.config.js          # PostCSS 配置
├── README.md                  # 项目说明文档
├── tailwind.config.js         # Tailwind CSS 配置
├── tsconfig.json              # TypeScript 配置
├── tsconfig.node.json         # Node.js TypeScript 配置
├── vite.config.ts             # Vite 构建配置
│
└── src/
    ├── api/                   # API 服务层
    │   └── aiService.ts       # AI 服务封装（风险评估、修复建议）
    │
    ├── components/            # React 组件
    │   ├── ConfigInput.tsx   # 配置输入组件
    │   ├── JSONViewer.tsx    # JSON 查看器组件
    │   └── PipelineStep.tsx   # 流水线步骤组件
    │
    ├── core/                  # 核心功能模块
    │   ├── astParser.ts       # AST 解析器
    │   ├── diffAnalyzer.ts    # 语义差异分析器
    │   └── executionSimulator.ts  # 执行路径模拟器
    │
    ├── data/                  # 测试数据
    │   └── testData.ts        # 测试数据集（3套完整数据）
    │
    ├── hooks/                 # React Hooks
    │   └── usePipeline.ts     # 流水线状态管理 Hook
    │
    ├── pages/                 # 页面组件
    │   └── Playground.tsx     # 主页面（/playground）
    │
    ├── types/                 # TypeScript 类型定义
    │   └── index.ts           # 所有类型定义
    │
    ├── index.css              # 全局样式
    └── main.tsx               # 应用入口文件
```

## 🔗 模块依赖关系

```
main.tsx
  └── Playground.tsx
      ├── ConfigInput.tsx
      ├── PipelineStep.tsx
      │   └── JSONViewer.tsx
      └── usePipeline.ts
          ├── ASTParser (core/astParser.ts)
          ├── ExecutionSimulator (core/executionSimulator.ts)
          ├── DiffAnalyzer (core/diffAnalyzer.ts)
          └── AIService (api/aiService.ts)
```

## 📊 数据流

```
用户输入 (rawConfig)
    ↓
AST Parser → ASTResult
    ↓
Execution Simulator → ExecutionGraph
    ↓
Diff Analyzer → DiffResult
    ↓
Risk Analyzer (AI) → RiskReport
    ↓
Fix Suggestion (AI) → FixSuggestion
```

## 🧩 核心模块说明

### 1. AST Parser (`core/astParser.ts`)
- 功能：将 YAML/JSON 配置解析为抽象语法树
- 输入：`string` (配置文本)
- 输出：`ASTResult` (包含 AST 和元数据)

### 2. Execution Simulator (`core/executionSimulator.ts`)
- 功能：基于 AST 生成执行图
- 输入：`ASTNode` (AST 根节点)
- 输出：`ExecutionGraph` (包含节点、边和元数据)

### 3. Diff Analyzer (`core/diffAnalyzer.ts`)
- 功能：对新旧执行图进行语义级差异分析
- 输入：`ExecutionGraph | null` (旧图), `ExecutionGraph` (新图)
- 输出：`DiffResult` (包含变更列表和摘要)

### 4. AI Service (`api/aiService.ts`)
- 功能：封装 AI API 调用（风险评估和修复建议）
- 方法：
  - `analyzeRisk()`: 风险评估分析
  - `generateFixSuggestion()`: 生成修复建议
- 支持流式响应和模拟数据回退

## 🎨 UI 组件说明

### ConfigInput
- 配置文本输入框
- 支持 YAML/JSON 格式
- 实时更新状态

### JSONViewer
- JSON 数据可视化
- 支持折叠/展开
- 格式化显示

### PipelineStep
- 流水线步骤卡片
- 显示输入/输出
- 状态指示（pending/running/completed/error）

## 🧪 测试数据

包含 3 套完整的测试数据：

1. **安全风险变更** - 包含敏感信息（密码、SSL）
2. **无风险变更** - 正常配置更新
3. **性能问题** - 需要自动修复的配置问题

每套数据包含完整的流水线输出，可直接加载演示。

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 `http://localhost:3000/playground` 查看应用。

