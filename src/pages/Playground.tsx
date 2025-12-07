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
    <div className="min-h-screen bg-apple-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-apple-gray-900 mb-2">
            ConfigGuardian
          </h1>
          <p className="text-apple-gray-600">
            配置变更风险分析工具 - 完整的配置分析流水线
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Config Input */}
          <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 p-6 h-[600px]">
            <ConfigInput
              value={state.rawConfig}
              onChange={updateConfig}
            />
          </div>

          {/* Right: Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 p-6">
            <div className="flex flex-col gap-4">
              <button
                onClick={runPipeline}
                disabled={state.isLoading || !state.rawConfig.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
                         hover:bg-blue-700 disabled:bg-apple-gray-300 disabled:cursor-not-allowed
                         transition-colors"
              >
                {state.isLoading ? '运行中...' : '运行全链路'}
              </button>

              <button
                onClick={() => setShowTestData(!showTestData)}
                className="w-full px-6 py-3 bg-apple-gray-100 text-apple-gray-700 rounded-lg font-semibold
                         hover:bg-apple-gray-200 transition-colors"
              >
                {showTestData ? '隐藏' : '显示'}测试数据
              </button>

              <button
                onClick={() => setShowAILogs(!showAILogs)}
                className="w-full px-6 py-3 bg-apple-gray-100 text-apple-gray-700 rounded-lg font-semibold
                         hover:bg-apple-gray-200 transition-colors"
              >
                {showAILogs ? '隐藏' : '显示'}AI 调用日志
              </button>
            </div>

            {showTestData && (
              <div className="mt-4 p-4 bg-apple-gray-50 rounded-lg border border-apple-gray-200">
                <h3 className="text-sm font-semibold mb-3 text-apple-gray-700">测试数据集</h3>
                <div className="space-y-2">
                  {testDataSets.map((testData, index) => (
                    <button
                      key={index}
                      onClick={() => loadTestData(testData)}
                      className="w-full text-left px-3 py-2 bg-white rounded border border-apple-gray-200
                               hover:bg-apple-gray-100 text-sm transition-colors"
                    >
                      {testData.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {state.error}
              </div>
            )}

            {showAILogs && state.aiCallLogs.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold mb-3 text-apple-gray-700">
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
        <div className="bg-white rounded-xl shadow-sm border border-apple-gray-200 p-6">
          <h2 className="text-xl font-bold text-apple-gray-900 mb-4">分析流水线</h2>

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

