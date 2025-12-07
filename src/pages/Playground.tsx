import React, { useState } from 'react';
import { ConfigInput } from '../components/ConfigInput';
import { PipelineStep } from '../components/PipelineStep';
import { AICallLogViewer } from '../components/AICallLogViewer';
import { usePipeline } from '../hooks/usePipeline';
import { testDataSets } from '../data/testData';

export const Playground: React.FC = () => {
  const { state, updateConfig, runPipeline, loadTestData } = usePipeline();
  const [showTestData, setShowTestData] = useState(false);
  const [showAILogs, setShowAILogs] = useState(true);

  const getStepStatus = (stepNumber: number): 'pending' | 'running' | 'completed' | 'error' => {
    if (state.error && stepNumber <= 3) return 'error';
    if (state.isLoading) {
      if (stepNumber === 1 && !state.astResult) return 'running';
      if (stepNumber === 2 && state.astResult && !state.executionGraph) return 'running';
      if (stepNumber === 3 && state.executionGraph && !state.diffResult) return 'running';
      if (stepNumber === 4 && state.diffResult && !state.riskReport) return 'running';
      if (stepNumber === 5 && state.riskReport && !state.fixSuggestion) return 'running';
    }
    if (stepNumber === 1 && state.astResult) return 'completed';
    if (stepNumber === 2 && state.executionGraph) return 'completed';
    if (stepNumber === 3 && state.diffResult) return 'completed';
    if (stepNumber === 4 && state.riskReport) return 'completed';
    if (stepNumber === 5 && state.fixSuggestion) return 'completed';
    return 'pending';
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 transition-all duration-300 ease-out breathing-glow">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
            ConfigGuardian
          </h1>
          <p className="text-white/80 text-lg drop-shadow-md">
            基于Parallax AI的配置变更风险分析工具
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Config Input */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 h-[600px] transition-all duration-300 ease-out breathing-border">
            <ConfigInput
              value={state.rawConfig}
              onChange={updateConfig}
            />
          </div>

          {/* Right: Actions */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 transition-all duration-300 ease-out breathing-border">
            <div className="flex flex-col gap-4">
              <button
                onClick={runPipeline}
                disabled={state.isLoading || !state.rawConfig.trim()}
                className="w-full px-6 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-xl rounded-xl text-white font-medium
                         disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed
                         transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-white/10"
              >
                {state.isLoading ? '运行中...' : '运行全链路'}
              </button>

              <button
                onClick={() => setShowTestData(!showTestData)}
                className="w-full px-6 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-xl rounded-xl text-white font-medium
                         transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-white/10"
              >
                {showTestData ? '隐藏' : '显示'}测试数据
              </button>

              <button
                onClick={() => setShowAILogs(!showAILogs)}
                className="w-full px-6 py-4 bg-white/15 hover:bg-white/25 backdrop-blur-xl rounded-xl text-white font-medium
                         transition-all duration-300 ease-out shadow-lg hover:shadow-xl border border-white/10"
              >
                {showAILogs ? '隐藏' : '显示'}AI 调用日志
              </button>
            </div>

            {showTestData && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 shadow-lg transition-all duration-300 ease-out">
                <h3 className="text-sm font-semibold mb-3 text-white">测试数据集</h3>
                <div className="space-y-2">
                  {testDataSets.map((testData, index) => (
                    <button
                      key={index}
                      onClick={() => loadTestData(testData)}
                      className="w-full text-left px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20
                               text-sm text-white transition-all duration-300 ease-out shadow-md hover:shadow-lg"
                    >
                      {testData.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state.error && (
              <div className="mt-6 p-4 bg-red-900/30 backdrop-blur-xl border border-red-700/40 rounded-xl text-sm text-red-200 shadow-lg transition-all duration-300 ease-out">
                {state.error}
              </div>
            )}

            {showAILogs && state.aiCallLogs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold mb-3 text-white">
                  AI 调用日志 ({state.aiCallLogs.length})
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <AICallLogViewer logs={state.aiCallLogs} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Steps */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 transition-all duration-300 ease-out breathing-glow">
          <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-lg">分析流水线</h2>

          <PipelineStep
            step={1}
            title="配置解析 (AST Parser)"
            description="将配置文本解析为抽象语法树 (AST)"
            input={state.rawConfig ? { rawConfig: state.rawConfig } : undefined}
            output={state.astResult || undefined}
            status={getStepStatus(1)}
            error={state.error && !state.astResult ? state.error : undefined}
          />

          <PipelineStep
            step={2}
            title="执行路径模拟 (Execution Simulator)"
            description="基于 AST 生成执行图 (Execution Graph)"
            input={state.astResult || undefined}
            output={state.executionGraph || undefined}
            status={getStepStatus(2)}
          />

          <PipelineStep
            step={3}
            title="变更差异分析 (Semantic Diff Analyzer)"
            description="对新旧 Execution Graph 做语义级 diff"
            input={state.executionGraph ? { 
              newGraph: state.executionGraph,
              oldGraph: null 
            } : undefined}
            output={state.diffResult || undefined}
            status={getStepStatus(3)}
          />

          <PipelineStep
            step={4}
            title="风险检测分析 (Risk Analyzer - AI)"
            description="基于 diff 结果和执行图进行 AI 风险评估"
            input={state.diffResult && state.executionGraph ? {
              diffResult: state.diffResult,
              executionGraph: state.executionGraph,
            } : undefined}
            output={state.riskReport || undefined}
            status={getStepStatus(4)}
            streamingText={state.streamingType === 'risk_analysis' ? state.streamingText : undefined}
            streamingType={state.streamingType}
          />

          <PipelineStep
            step={5}
            title="修复建议生成 (Fix Suggestion - AI)"
            description="基于风险评估生成自动修复建议"
            input={state.riskReport || undefined}
            output={state.fixSuggestion || undefined}
            status={getStepStatus(5)}
            streamingText={state.streamingType === 'fix_suggestion' ? state.streamingText : undefined}
            streamingType={state.streamingType}
          />
        </div>
      </div>
    </div>
  );
};

