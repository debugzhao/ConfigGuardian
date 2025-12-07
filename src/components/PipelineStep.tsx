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
        return 'bg-white/15 border-white/30 text-white';
      case 'running':
        return 'bg-white/20 border-white/30 text-white';
      case 'error':
        return 'bg-red-900/30 border-red-700/40 text-red-200';
      default:
        return 'bg-white/10 border-white/20 text-white/60';
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
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 mb-6 transition-all duration-300 ease-out breathing-border ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-lg border-2 border-white/30 flex items-center justify-center font-bold text-base shadow-lg text-white">
            {step}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-white drop-shadow-md">{title}</h3>
            <p className="text-sm text-white/70 mt-1">{description}</p>
          </div>
        </div>
        <div className="text-3xl text-white drop-shadow-md">{getStatusIcon()}</div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-900/30 backdrop-blur-lg border border-red-700/40 rounded-xl text-sm text-red-200 shadow-lg transition-all duration-300 ease-out">
          {error}
        </div>
      )}

      {/* 流式输出显示（仅在第4、5步显示） */}
      {(step === 4 || step === 5) && streamingText && 
       ((step === 4 && streamingType === 'risk_analysis') || 
        (step === 5 && streamingType === 'fix_suggestion')) && (
        <div className="mb-4 p-5 bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl shadow-lg transition-all duration-300 ease-out">
          <h4 className="text-sm font-semibold text-white mb-3 drop-shadow-md">
            {step === 4 ? '🔍 AI 风险评估中...' : '💡 AI 修复建议生成中...'}
          </h4>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 max-h-64 overflow-y-auto shadow-inner">
            <pre className="text-xs font-mono text-white whitespace-pre-wrap break-words">
              {streamingText}
            </pre>
            {status === 'running' && (
              <span className="inline-block w-2 h-4 bg-white/60 ml-1 animate-pulse" />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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

