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
}

export const PipelineStep: React.FC<PipelineStepProps> = ({
  step,
  title,
  description,
  input,
  output,
  status,
  error,
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

