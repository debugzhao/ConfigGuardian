import React from 'react';
import { AICallLog } from '../types';
import { JSONViewer } from './JSONViewer';

interface AICallLogViewerProps {
  logs: AICallLog[];
}

export const AICallLogViewer: React.FC<AICallLogViewerProps> = ({ logs }) => {
  const [expandedLog, setExpandedLog] = React.useState<number | null>(null);

  if (logs.length === 0) {
    return (
      <div className="p-4 bg-apple-gray-50 rounded-lg border border-apple-gray-200 text-sm text-apple-gray-500">
        暂无 AI 调用记录
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((log, index) => {
        const isExpanded = expandedLog === index;
        const isError = !!log.response.error;
        const typeLabel = log.type === 'risk_analysis' ? '风险评估' : '修复建议';

        return (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 transition-all ${
              isError
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedLog(isExpanded ? null : index)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  isError ? 'bg-red-500' : 'bg-green-500'
                }`} />
                <div>
                  <h4 className="font-semibold text-sm">
                    {typeLabel} - {new Date(log.timestamp).toLocaleTimeString()}
                  </h4>
                  <p className="text-xs text-apple-gray-600 mt-1">
                    {log.response.status ? `状态: ${log.response.status}` : '使用模拟数据'}
                    {log.duration && ` | 耗时: ${log.duration}ms`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-apple-gray-500">
                {isExpanded ? '收起' : '展开'}
              </span>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-4">
                {/* 请求信息 */}
                <div>
                  <h5 className="text-xs font-semibold text-apple-gray-700 mb-2">
                    📤 请求信息 (Request)
                  </h5>
                  <div className="bg-white rounded p-3 border border-apple-gray-200">
                    <div className="mb-2">
                      <span className="text-xs font-mono text-apple-gray-600">
                        {log.request.method} {log.request.url}
                      </span>
                    </div>
                    <JSONViewer data={log.request.body} collapsed={false} />
                  </div>
                </div>

                {/* 响应信息 */}
                <div>
                  <h5 className="text-xs font-semibold text-apple-gray-700 mb-2">
                    📥 响应信息 (Response)
                  </h5>
                  <div className="bg-white rounded p-3 border border-apple-gray-200">
                    {log.response.error ? (
                      <div className="text-sm text-red-600">
                        ❌ 错误: {log.response.error}
                      </div>
                    ) : log.response.body ? (
                      <JSONViewer data={log.response.body} collapsed={false} />
                    ) : (
                      <div className="text-sm text-apple-gray-500">无响应数据</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

