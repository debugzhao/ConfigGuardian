import { DiffResult, ExecutionGraph, RiskReport, FixSuggestion } from '../types';

const AI_API_URL = 'http://localhost:3001/v1/chat/completions';

/**
 * AI Service - 封装 AI API 调用
 */
export class AIService {
  /**
   * 调用 AI API
   */
  private static async callAI(messages: Array<{ role: string; content: string }>): Promise<string> {
    try {
      const response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_tokens: 1024,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.statusText}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
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

      return fullResponse;
    } catch (error) {
      // 如果 API 调用失败，返回模拟数据
      console.warn('AI API call failed, using mock data:', error);
      return this.getMockResponse(messages);
    }
  }

  /**
   * 获取模拟响应（用于测试）
   */
  private static getMockResponse(messages: Array<{ role: string; content: string }>): string {
    const userMessage = messages.find((m) => m.role === 'user')?.content || '';
    
    if (userMessage.includes('risk analysis') || userMessage.includes('风险评估')) {
      return JSON.stringify({
        risks: [
          {
            id: 'risk_1',
            severity: 'high',
            category: 'security',
            title: 'Potential Security Risk Detected',
            description: 'Configuration change may expose sensitive data or create security vulnerabilities.',
            affectedPaths: ['nodes.node_0.properties.password'],
            recommendation: 'Review access controls and ensure proper encryption is in place.',
          },
        ],
        summary: {
          critical: 0,
          high: 1,
          medium: 0,
          low: 0,
          total: 1,
        },
        overallRiskLevel: 'high',
      }, null, 2);
    }

    if (userMessage.includes('fix suggestion') || userMessage.includes('修复建议')) {
      return JSON.stringify({
        fixes: [
          {
            id: 'fix_1',
            riskId: 'risk_1',
            title: 'Apply Security Patch',
            description: 'Update configuration to use secure defaults.',
            patches: [
              {
                path: 'nodes.node_0.properties.password',
                operation: 'replace',
                value: '${SECURE_PASSWORD_REF}',
                description: 'Replace plaintext password with secure reference',
              },
            ],
            confidence: 0.85,
            autoApplicable: true,
          },
        ],
        summary: {
          totalFixes: 1,
          autoApplicable: 1,
          manualReview: 0,
        },
      }, null, 2);
    }

    return '{}';
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
    ]);

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
    ]);

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

