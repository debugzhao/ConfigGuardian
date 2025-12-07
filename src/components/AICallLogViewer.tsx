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
      <div className="p-5 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-sm text-white/70 shadow-lg transition-all duration-300 ease-out">
        暂无 AI 调用记录
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const isExpanded = expandedLog === index;
        const isError = !!log.response.error;
        const typeLabel = log.type === 'risk_analysis' ? '风险评估' : '修复建议';

        return (
          <div
            key={index}
            className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl transition-all duration-300 ease-out ${
              isError
                ? 'bg-red-900/20 border-red-700/30'
                : 'bg-white/15 border-white/25'
            }`}
          >
            <div
              className="flex items-center justify-between cursor-pointer transition-all duration-300 ease-out"
              onClick={() => setExpandedLog(isExpanded ? null : index)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full shadow-lg ${
                  isError ? 'bg-red-500' : 'bg-white/60'
                }`} />
                <div>
                  <h4 className="font-semibold text-sm text-white drop-shadow-md">
                    {typeLabel} - {new Date(log.timestamp).toLocaleTimeString()}
                  </h4>
                  <p className="text-xs text-white/70 mt-1">
                    {log.response.status ? `状态: ${log.response.status}` : '使用模拟数据'}
                    {log.duration && ` | 耗时: ${log.duration}ms`}
                  </p>
                </div>
              </div>
              <span className="text-xs text-white/70 hover:text-white transition-colors">
                {isExpanded ? '收起' : '展开'}
              </span>
            </div>

            {isExpanded && (
              <div className="mt-5 space-y-5">
                {/* 请求信息 */}
                <div>
                  <h5 className="text-xs font-semibold text-white mb-3 drop-shadow-md">
                    📤 请求信息 (Request)
                  </h5>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 ease-out">
                    <div className="mb-3">
                      <span className="text-xs font-mono text-white/80">
                        {log.request.method} {log.request.url}
                      </span>
                    </div>
                    <JSONViewer data={log.request.body} collapsed={false} />
                  </div>
                </div>

                {/* 响应信息 */}
                <div>
                  <h5 className="text-xs font-semibold text-white mb-3 drop-shadow-md">
                    📥 响应信息 (Response)
                  </h5>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-lg transition-all duration-300 ease-out">
                    {log.response.error ? (
                      <div className="text-sm text-red-300">
                        ❌ 错误: {log.response.error}
                      </div>
                    ) : log.response.body ? (
                      <JSONViewer data={log.response.body} collapsed={false} />
                    ) : (
                      <div className="text-sm text-white/60">无响应数据</div>
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

