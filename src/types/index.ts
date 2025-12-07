// 类型定义

export interface ASTNode {
  type: string;
  key?: string;
  value?: any;
  children?: ASTNode[];
  line?: number;
  column?: number;
}

export interface ASTResult {
  ast: ASTNode;
  metadata: {
    format: 'yaml' | 'json';
    parsedAt: string;
  };
}

export interface ExecutionNode {
  id: string;
  type: 'action' | 'condition' | 'resource' | 'dependency';
  name: string;
  properties: Record<string, any>;
  dependencies: string[];
  executionOrder: number;
}

export interface ExecutionGraph {
  nodes: ExecutionNode[];
  edges: Array<{
    from: string;
    to: string;
    type: 'dependency' | 'conditional' | 'sequential';
  }>;
  metadata: {
    totalNodes: number;
    totalEdges: number;
    generatedAt: string;
  };
}

export interface DiffChange {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  path: string;
  oldValue?: any;
  newValue?: any;
  semanticImpact: 'high' | 'medium' | 'low' | 'none';
}

export interface DiffResult {
  changes: DiffChange[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
    highImpact: number;
    mediumImpact: number;
    lowImpact: number;
  };
  metadata: {
    comparedAt: string;
  };
}

export interface RiskItem {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'reliability' | 'compatibility';
  title: string;
  description: string;
  affectedPaths: string[];
  recommendation: string;
}

export interface RiskReport {
  risks: RiskItem[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  metadata: {
    analyzedAt: string;
    analysisDuration: number;
  };
}

export interface FixPatch {
  path: string;
  operation: 'replace' | 'add' | 'remove';
  value?: any;
  description: string;
}

export interface FixSuggestion {
  fixes: Array<{
    id: string;
    riskId: string;
    title: string;
    description: string;
    patches: FixPatch[];
    confidence: number;
    autoApplicable: boolean;
  }>;
  summary: {
    totalFixes: number;
    autoApplicable: number;
    manualReview: number;
  };
  metadata: {
    generatedAt: string;
  };
}

export interface AICallLog {
  timestamp: string;
  type: 'risk_analysis' | 'fix_suggestion';
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
  };
  response: {
    status?: number;
    statusText?: string;
    body?: any;
    error?: string;
  };
  duration?: number;
}

export interface PipelineState {
  rawConfig: string;
  astResult: ASTResult | null;
  executionGraph: ExecutionGraph | null;
  diffResult: DiffResult | null;
  riskReport: RiskReport | null;
  fixSuggestion: FixSuggestion | null;
  isLoading: boolean;
  error: string | null;
  aiCallLogs: AICallLog[];
  streamingText: string; // 流式输出文本
  streamingType: 'risk_analysis' | 'fix_suggestion' | null; // 当前流式输出的类型
}

