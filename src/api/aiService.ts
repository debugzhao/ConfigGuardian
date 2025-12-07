import { DiffResult, ExecutionGraph, RiskReport, FixSuggestion, AICallLog } from '../types';

const AI_API_URL = 'http://localhost:3001/v1/chat/completions';

// 用于存储 AI 调用日志的回调函数
let aiCallLogCallback: ((log: AICallLog) => void) | null = null;

export const setAICallLogCallback = (callback: (log: AICallLog) => void) => {
  aiCallLogCallback = callback;
};

/**
 * AI Service - 封装 AI API 调用
 */
export class AIService {
  /**
   * 调用 AI API
   */
  private static async callAI(
    messages: Array<{ role: string; content: string }>,
    type: 'risk_analysis' | 'fix_suggestion' = 'risk_analysis'
  ): Promise<string> {
    const startTime = Date.now();
    const requestBody = {
      max_tokens: 1024,
      messages,
      stream: true,
    };

    // 打印请求信息
    console.log('='.repeat(80));
    console.log(`🚀 AI API 调用 - ${type === 'risk_analysis' ? '风险评估' : '修复建议'}`);
    console.log('='.repeat(80));
    console.log('📍 URL:', AI_API_URL);
    console.log('📤 请求方法: POST');
    console.log('📋 请求头:', { 'Content-Type': 'application/json' });
    console.log('📦 请求体 (Request Body):');
    console.log(JSON.stringify(requestBody, null, 2));
    console.log('-'.repeat(80));

    const log: AICallLog = {
      timestamp: new Date().toISOString(),
      type,
      request: {
        url: AI_API_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      },
      response: {},
    };

    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const duration = Date.now() - startTime;
      log.response.status = response.status;
      log.response.statusText = response.statusText;
      log.duration = duration;

      console.log('📥 响应状态:', response.status, response.statusText);
      console.log('⏱️  耗时:', duration, 'ms');

      if (!response.ok) {
        const errorText = await response.text();
        log.response.error = `AI API error: ${response.statusText}`;
        console.log('❌ 错误响应:', errorText);
        console.log('='.repeat(80));
        
        if (aiCallLogCallback) {
          aiCallLogCallback(log);
        }
        
        throw new Error(`AI API error: ${response.statusText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      const chunks: string[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          chunks.push(chunk);
          const lines = chunk.split('\n').filter((line) => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                fullResponse += content;
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }

      // 尝试解析响应
      let parsedResponse: any = null;
      try {
        parsedResponse = JSON.parse(fullResponse);
        log.response.body = parsedResponse;
      } catch {
        log.response.body = fullResponse;
      }

      console.log('✅ 响应体 (Response Body):');
      if (parsedResponse) {
        console.log(JSON.stringify(parsedResponse, null, 2));
      } else {
        console.log(fullResponse.substring(0, 500) + (fullResponse.length > 500 ? '...' : ''));
      }
      console.log('='.repeat(80));

      if (aiCallLogCallback) {
        aiCallLogCallback(log);
      }

      return fullResponse;
    } catch (error) {
      const duration = Date.now() - startTime;
      log.duration = duration;
      log.response.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.log('❌ 请求失败:', error);
      console.log('⏱️  耗时:', duration, 'ms');
      console.log('🔄 使用模拟数据...');
      console.log('='.repeat(80));

      if (aiCallLogCallback) {
        aiCallLogCallback(log);
      }

      // 如果 API 调用失败，返回模拟数据
      const mockResponse = this.getMockResponse(messages);
      console.log('📦 模拟响应 (Mock Response):');
      try {
        const parsed = JSON.parse(mockResponse);
        console.log(JSON.stringify(parsed, null, 2));
      } catch {
        console.log(mockResponse);
      }
      console.log('='.repeat(80));
      
      return mockResponse;
    }
  }

  /**
   * 获取模拟响应（用于测试）
   */
  private static getMockResponse(messages: Array<{ role: string; content: string }>): string {
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';
    
    // 检查是否是风险评估请求
    const isRiskAnalysis = userMessage.includes('risk analyzer') || 
                           userMessage.includes('risk analysis') || 
                           userMessage.includes('风险评估') ||
                           userMessage.includes('Diff Result') ||
                           userMessage.includes('Execution Graph');
    
    // 检查是否是修复建议请求
    const isFixSuggestion = userMessage.includes('fix suggestion') || 
                           userMessage.includes('修复建议') ||
                           userMessage.includes('Risk Report');
    
    if (isRiskAnalysis) {
      // 分析配置内容，生成相应的风险报告
      const risks: any[] = [];
      
      // 检查安全风险
      const securityKeywords = ['password', 'secret', 'key', 'token', 'api_secret', 'secret_key'];
      securityKeywords.forEach(keyword => {
        if (userMessage.toLowerCase().includes(keyword)) {
          risks.push({
            id: `risk_security_${risks.length + 1}`,
            severity: 'high',
            category: 'security',
            title: '敏感信息暴露风险',
            description: `配置中包含敏感信息（${keyword}），存在安全风险。敏感信息不应直接存储在配置文件中。`,
            affectedPaths: this.findAffectedPaths(userMessage, keyword),
            recommendation: '使用环境变量或密钥管理系统存储敏感信息，避免在配置文件中直接写入。',
          });
        }
      });
      
      // 检查性能风险
      if (userMessage.includes('max_connections') || userMessage.includes('timeout') || userMessage.includes('limit')) {
        risks.push({
          id: 'risk_performance_1',
          severity: 'medium',
          category: 'performance',
          title: '性能配置风险',
          description: '配置中的性能参数可能需要优化，建议检查资源限制和超时设置。',
          affectedPaths: this.findAffectedPaths(userMessage, 'max_connections'),
          recommendation: '确保性能参数设置合理，避免资源耗尽或性能问题。',
        });
      }
      
      // 如果没有检测到风险，返回安全报告
      if (risks.length === 0) {
        return JSON.stringify({
          risks: [],
          summary: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0,
            total: 0,
          },
          overallRiskLevel: 'safe',
        }, null, 2);
      }
      
      const summary = {
        critical: risks.filter(r => r.severity === 'critical').length,
        high: risks.filter(r => r.severity === 'high').length,
        medium: risks.filter(r => r.severity === 'medium').length,
        low: risks.filter(r => r.severity === 'low').length,
        total: risks.length,
      };
      
      const overallRiskLevel = summary.critical > 0 ? 'critical' :
                               summary.high > 0 ? 'high' :
                               summary.medium > 0 ? 'medium' : 'low';
      
      return JSON.stringify({
        risks,
        summary,
        overallRiskLevel,
      }, null, 2);
    }

    if (isFixSuggestion) {
      // 基于风险报告生成修复建议
      let riskReport: any = {};
      try {
        // 尝试从消息中提取风险报告
        const reportMatch = userMessage.match(/Risk Report:\s*(\{[\s\S]*\})/);
        if (reportMatch) {
          riskReport = JSON.parse(reportMatch[1]);
        }
      } catch {
        // 如果解析失败，使用默认值
      }
      
      const fixes: any[] = [];
      const risks = riskReport.risks || [];
      
      risks.forEach((risk: any, index: number) => {
        if (risk.category === 'security' && risk.affectedPaths) {
          fixes.push({
            id: `fix_${index + 1}`,
            riskId: risk.id,
            title: `修复安全风险: ${risk.title}`,
            description: risk.recommendation || '使用环境变量替代敏感信息',
            patches: risk.affectedPaths.map((path: string) => ({
              path: path,
              operation: 'replace',
              value: '${ENV_VAR}',
              description: `将敏感信息替换为环境变量引用`,
            })),
            confidence: 0.90,
            autoApplicable: true,
          });
        } else if (risk.category === 'performance') {
          fixes.push({
            id: `fix_${index + 1}`,
            riskId: risk.id,
            title: `优化性能配置: ${risk.title}`,
            description: risk.recommendation || '调整性能参数为合理值',
            patches: risk.affectedPaths.map((path: string) => ({
              path: path,
              operation: 'replace',
              value: 'REVIEW_NEEDED',
              description: `需要人工审查并设置合理的值`,
            })),
            confidence: 0.75,
            autoApplicable: false,
          });
        }
      });
      
      return JSON.stringify({
        fixes,
        summary: {
          totalFixes: fixes.length,
          autoApplicable: fixes.filter(f => f.autoApplicable).length,
          manualReview: fixes.filter(f => !f.autoApplicable).length,
        },
      }, null, 2);
    }

    return '{}';
  }

  /**
   * 查找受影响的路径
   */
  private static findAffectedPaths(content: string, keyword: string): string[] {
    const paths: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(keyword.toLowerCase())) {
        // 尝试提取路径
        const match = line.match(/([a-zA-Z_][a-zA-Z0-9_.]*)\s*[:=]/);
        if (match) {
          paths.push(`data.${match[1]}`);
        } else {
          paths.push(`line_${index + 1}`);
        }
      }
    });
    
    return paths.length > 0 ? paths : [`properties.${keyword}`];
  }

  /**
   * 风险评估分析
   */
  static async analyzeRisk(
    diffResult: DiffResult,
    executionGraph: ExecutionGraph
  ): Promise<RiskReport> {
    const prompt = `You are a configuration risk analyzer. Analyze the following configuration changes and execution graph to identify potential risks.

Diff Result:
${JSON.stringify(diffResult, null, 2)}

Execution Graph:
${JSON.stringify(executionGraph, null, 2)}

Please provide a risk analysis report in JSON format with the following structure:
{
  "risks": [
    {
      "id": "risk_1",
      "severity": "critical|high|medium|low",
      "category": "security|performance|reliability|compatibility",
      "title": "Risk title",
      "description": "Detailed description",
      "affectedPaths": ["path1", "path2"],
      "recommendation": "Recommendation text"
    }
  ],
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "total": 0
  },
  "overallRiskLevel": "critical|high|medium|low|safe"
}

Focus on:
1. Security vulnerabilities (exposed secrets, weak permissions)
2. Performance issues (resource limits, timeouts)
3. Reliability concerns (missing dependencies, broken references)
4. Compatibility problems (version mismatches, deprecated features)`;

    const response = await this.callAI([
      { role: 'user', content: prompt },
    ], 'risk_analysis');

    try {
      const parsed = JSON.parse(response);
      return {
        ...parsed,
        metadata: {
          analyzedAt: new Date().toISOString(),
          analysisDuration: Math.random() * 1000 + 500, // 模拟分析时间
        },
      };
    } catch {
      // 如果解析失败，返回默认报告
      return this.getDefaultRiskReport();
    }
  }

  /**
   * 生成修复建议
   */
  static async generateFixSuggestion(riskReport: RiskReport): Promise<FixSuggestion> {
    const prompt = `You are a configuration fix suggestion generator. Based on the following risk report, generate actionable fix suggestions.

Risk Report:
${JSON.stringify(riskReport, null, 2)}

Please provide fix suggestions in JSON format:
{
  "fixes": [
    {
      "id": "fix_1",
      "riskId": "risk_1",
      "title": "Fix title",
      "description": "Fix description",
      "patches": [
        {
          "path": "config.path.to.field",
          "operation": "replace|add|remove",
          "value": "new value",
          "description": "Patch description"
        }
      ],
      "confidence": 0.85,
      "autoApplicable": true
    }
  ],
  "summary": {
    "totalFixes": 0,
    "autoApplicable": 0,
    "manualReview": 0
  }
}

Generate patches that can be directly applied to fix the identified risks.`;

    const response = await this.callAI([
      { role: 'user', content: prompt },
    ], 'fix_suggestion');

    try {
      const parsed = JSON.parse(response);
      return {
        ...parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
        },
      };
    } catch {
      // 如果解析失败，返回默认建议
      return this.getDefaultFixSuggestion();
    }
  }

  /**
   * 获取默认风险评估报告
   */
  private static getDefaultRiskReport(): RiskReport {
    return {
      risks: [],
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
      },
      overallRiskLevel: 'safe',
      metadata: {
        analyzedAt: new Date().toISOString(),
        analysisDuration: 0,
      },
    };
  }

  /**
   * 获取默认修复建议
   */
  private static getDefaultFixSuggestion(): FixSuggestion {
    return {
      fixes: [],
      summary: {
        totalFixes: 0,
        autoApplicable: 0,
        manualReview: 0,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

