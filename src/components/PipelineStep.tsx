import React from 'react';
import { JSONViewer } from './JSONViewer';

interface PipelineStepProps {
  step: number;
  title: string;
  description: string;
  input?: any;
  output?: any;
  status: 'pending' | 'running' | 'completed' | 'error';
  error?: string;
  streamingText?: string;
  streamingType?: 'risk_analysis' | 'fix_suggestion' | null;
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  step,
  title,
  description,
  input,
  output,
  status,
  error,
  streamingText,
  streamingType,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'running':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-apple-gray-100 border-apple-gray-300 text-apple-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'running':
        return '⟳';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-4 mb-4 transition-all ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center font-bold text-sm">
            {step}
          </div>
          <div>
            <h3 className="font-semibold text-base">{title}</h3>
            <p className="text-sm opacity-80 mt-1">{description}</p>
          </div>
        </div>
        <div className="text-2xl">{getStatusIcon()}</div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 流式输出显示（仅在第4、5步显示） */}
      {(step === 4 || step === 5) && streamingText && 
       ((step === 4 && streamingType === 'risk_analysis') || 
        (step === 5 && streamingType === 'fix_suggestion')) && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            {step === 4 ? '🔍 AI 风险评估中...' : '💡 AI 修复建议生成中...'}
          </h4>
          <div className="bg-white rounded p-3 border border-blue-200 max-h-64 overflow-y-auto">
            <pre className="text-xs font-mono text-apple-gray-800 whitespace-pre-wrap break-words">
              {streamingText}
            </pre>
            {status === 'running' && (
              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {input !== undefined && (
          <div>
            <JSONViewer data={input} title="输入 (Input)" collapsed={true} />
          </div>
        )}
        {output !== undefined && (
          <div>
            <JSONViewer data={output} title="输出 (Output)" collapsed={true} />
          </div>
        )}
      </div>
    </div>
  );
};

