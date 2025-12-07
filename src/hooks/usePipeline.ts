import { useState, useCallback } from 'react';
import { PipelineState, ASTResult, ExecutionGraph, DiffResult, RiskReport, FixSuggestion } from '../types';
import { ASTParser } from '../core/astParser';
import { ExecutionSimulator } from '../core/executionSimulator';
import { DiffAnalyzer } from '../core/diffAnalyzer';
import { AIService } from '../api/aiService';

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
  });

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
      setState((prev) => ({ ...prev, isLoading: true }));
      const astResult = ASTParser.parse(state.rawConfig);
      setState((prev) => ({ ...prev, astResult }));

      // Step 2: Execution Simulator
      const executionGraph = ExecutionSimulator.simulate(astResult.ast);
      setState((prev) => ({ ...prev, executionGraph }));

      // Step 3: Semantic Diff Analyzer
      const diffResult = DiffAnalyzer.analyze(previousGraph, executionGraph);
      setState((prev) => ({ ...prev, diffResult }));

      // Step 4: Risk Analyzer (AI)
      const riskReport = await AIService.analyzeRisk(diffResult, executionGraph);
      setState((prev) => ({ ...prev, riskReport }));

      // Step 5: Fix Suggestion (AI)
      const fixSuggestion = await AIService.generateFixSuggestion(riskReport);
      setState((prev) => ({ ...prev, fixSuggestion }));

      // 保存当前图作为下次的旧图
      setPreviousGraph(executionGraph);

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
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

