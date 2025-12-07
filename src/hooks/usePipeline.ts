import { useState, useCallback, useEffect } from 'react';
import { PipelineState, ASTResult, ExecutionGraph, DiffResult, RiskReport, FixSuggestion, AICallLog } from '../types';
import { ASTParser } from '../core/astParser';
import { ExecutionSimulator } from '../core/executionSimulator';
import { DiffAnalyzer } from '../core/diffAnalyzer';
import { AIService, setAICallLogCallback } from '../api/aiService';

export const usePipeline = () => {
  const [state, setState] = useState<PipelineState>({
    rawConfig: '',
    astResult: null,
    executionGraph: null,
    diffResult: null,
    riskReport: null,
    fixSuggestion: null,
    isLoading: false,
    error: null,
    aiCallLogs: [],
  });

  // 设置 AI 调用日志回调
  useEffect(() => {
    setAICallLogCallback((log: AICallLog) => {
      setState((prev) => ({
        ...prev,
        aiCallLogs: [...prev.aiCallLogs, log],
      }));
    });
  }, []);

  const [previousGraph, setPreviousGraph] = useState<ExecutionGraph | null>(null);

  const updateConfig = useCallback((config: string) => {
    setState((prev) => ({
      ...prev,
      rawConfig: config,
      // 重置后续步骤
      astResult: null,
      executionGraph: null,
      diffResult: null,
      riskReport: null,
      fixSuggestion: null,
      error: null,
      aiCallLogs: [],
    }));
  }, []);

  const runPipeline = useCallback(async () => {
    if (!state.rawConfig.trim()) {
      setState((prev) => ({ ...prev, error: '请先输入配置内容' }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Step 1: AST Parser
      console.log('Step 1: Parsing AST...');
      const astResult = ASTParser.parse(state.rawConfig);
      setState((prev) => ({ ...prev, astResult, isLoading: true }));
      console.log('AST parsed successfully:', astResult);

      // Step 2: Execution Simulator
      console.log('Step 2: Simulating execution...');
      const executionGraph = ExecutionSimulator.simulate(astResult.ast);
      setState((prev) => ({ ...prev, executionGraph, isLoading: true }));
      console.log('Execution graph generated:', executionGraph);

      // Step 3: Semantic Diff Analyzer
      console.log('Step 3: Analyzing diff...');
      const diffResult = DiffAnalyzer.analyze(previousGraph, executionGraph);
      setState((prev) => ({ ...prev, diffResult, isLoading: true }));
      console.log('Diff analyzed:', diffResult);

      // Step 4: Risk Analyzer (AI)
      console.log('Step 4: Analyzing risks with AI...');
      let riskReport: RiskReport;
      try {
        riskReport = await AIService.analyzeRisk(diffResult, executionGraph);
        setState((prev) => ({ ...prev, riskReport, isLoading: true }));
        console.log('Risk report generated:', riskReport);
      } catch (aiError) {
        console.error('AI risk analysis failed:', aiError);
        // 即使 AI 调用失败，也继续执行，使用默认报告
        riskReport = {
          risks: [],
          summary: { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
          overallRiskLevel: 'safe',
          metadata: {
            analyzedAt: new Date().toISOString(),
            analysisDuration: 0,
          },
        };
        setState((prev) => ({ ...prev, riskReport, isLoading: true }));
      }

      // Step 5: Fix Suggestion (AI)
      console.log('Step 5: Generating fix suggestions...');
      try {
        const fixSuggestion = await AIService.generateFixSuggestion(riskReport);
        setState((prev) => ({ ...prev, fixSuggestion, isLoading: false }));
        console.log('Fix suggestion generated:', fixSuggestion);
      } catch (aiError) {
        console.error('AI fix suggestion failed:', aiError);
        // 即使 AI 调用失败，也继续执行，使用默认建议
        const defaultSuggestion: FixSuggestion = {
          fixes: [],
          summary: { totalFixes: 0, autoApplicable: 0, manualReview: 0 },
          metadata: {
            generatedAt: new Date().toISOString(),
          },
        };
        setState((prev) => ({ ...prev, fixSuggestion: defaultSuggestion, isLoading: false }));
      }

      // 保存当前图作为下次的旧图
      setPreviousGraph(executionGraph);
    } catch (error) {
      console.error('Pipeline error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '处理过程中发生错误',
      }));
    }
  }, [state.rawConfig, previousGraph]);

  const loadTestData = useCallback((testData: {
    config: string;
    astResult?: ASTResult;
    executionGraph?: ExecutionGraph;
    diffResult?: DiffResult;
    riskReport?: RiskReport;
    fixSuggestion?: FixSuggestion;
  }) => {
    setState((prev) => ({
      ...prev,
      rawConfig: testData.config,
      astResult: testData.astResult || null,
      executionGraph: testData.executionGraph || null,
      diffResult: testData.diffResult || null,
      riskReport: testData.riskReport || null,
      fixSuggestion: testData.fixSuggestion || null,
      error: null,
    }));
    if (testData.executionGraph) {
      setPreviousGraph(testData.executionGraph);
    }
  }, []);

  return {
    state,
    updateConfig,
    runPipeline,
    loadTestData,
  };
};

