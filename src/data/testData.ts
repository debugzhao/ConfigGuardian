import { ASTResult, ExecutionGraph, DiffResult, RiskReport, FixSuggestion } from '../types';

export interface TestDataSet {
  name: string;
  config: string;
  astResult?: ASTResult;
  executionGraph?: ExecutionGraph;
  diffResult?: DiffResult;
  riskReport?: RiskReport;
  fixSuggestion?: FixSuggestion;
}

export const testDataSets: TestDataSet[] = [
  {
    name: '测试数据 1: 安全风险变更（包含敏感信息）',
    config: JSON.stringify({
      database: {
        host: 'localhost',
        port: 5432,
        username: 'admin',
        password: 'plaintext_password_123',
        ssl: false,
      },
      api: {
        endpoint: 'http://api.example.com',
        timeout: 5000,
        retries: 3,
      },
    }, null, 2),
    astResult: {
      ast: {
        type: 'object',
        key: 'root',
        children: [
          {
            type: 'object',
            key: 'database',
            children: [
              { type: 'string', key: 'host', value: 'localhost' },
              { type: 'number', key: 'port', value: 5432 },
              { type: 'string', key: 'username', value: 'admin' },
              { type: 'string', key: 'password', value: 'plaintext_password_123' },
              { type: 'boolean', key: 'ssl', value: false },
            ],
          },
          {
            type: 'object',
            key: 'api',
            children: [
              { type: 'string', key: 'endpoint', value: 'http://api.example.com' },
              { type: 'number', key: 'timeout', value: 5000 },
              { type: 'number', key: 'retries', value: 3 },
            ],
          },
        ],
      },
      metadata: {
        format: 'json',
        parsedAt: new Date().toISOString(),
      },
    },
    executionGraph: {
      nodes: [
        {
          id: 'node_0',
          type: 'resource',
          name: 'database',
          properties: {
            host: 'localhost',
            port: 5432,
            username: 'admin',
            password: 'plaintext_password_123',
            ssl: false,
          },
          dependencies: [],
          executionOrder: 0,
        },
        {
          id: 'node_1',
          type: 'resource',
          name: 'api',
          properties: {
            endpoint: 'http://api.example.com',
            timeout: 5000,
            retries: 3,
          },
          dependencies: [],
          executionOrder: 1,
        },
      ],
      edges: [
        { from: 'node_0', to: 'node_1', type: 'sequential' },
      ],
      metadata: {
        totalNodes: 2,
        totalEdges: 1,
        generatedAt: new Date().toISOString(),
      },
    },
    diffResult: {
      changes: [
        {
          type: 'added',
          path: 'nodes.node_0',
          newValue: {
            id: 'node_0',
            type: 'resource',
            name: 'database',
            properties: { password: 'plaintext_password_123' },
          },
          semanticImpact: 'high',
        },
      ],
      summary: {
        added: 2,
        removed: 0,
        modified: 0,
        unchanged: 0,
        highImpact: 1,
        mediumImpact: 0,
        lowImpact: 1,
      },
      metadata: {
        comparedAt: new Date().toISOString(),
      },
    },
    riskReport: {
      risks: [
        {
          id: 'risk_1',
          severity: 'high',
          category: 'security',
          title: '明文密码暴露风险',
          description: '配置中包含明文密码，存在严重的安全隐患。密码可能被未授权人员访问。',
          affectedPaths: ['nodes.node_0.properties.password'],
          recommendation: '使用环境变量或密钥管理系统存储敏感信息，避免在配置文件中直接写入密码。',
        },
        {
          id: 'risk_2',
          severity: 'medium',
          category: 'security',
          title: 'SSL 未启用',
          description: '数据库连接未启用 SSL，数据传输可能被窃听。',
          affectedPaths: ['nodes.node_0.properties.ssl'],
          recommendation: '在生产环境中启用 SSL/TLS 加密。',
        },
      ],
      summary: {
        critical: 0,
        high: 1,
        medium: 1,
        low: 0,
        total: 2,
      },
      overallRiskLevel: 'high',
      metadata: {
        analyzedAt: new Date().toISOString(),
        analysisDuration: 850,
      },
    },
    fixSuggestion: {
      fixes: [
        {
          id: 'fix_1',
          riskId: 'risk_1',
          title: '替换明文密码为环境变量引用',
          description: '将明文密码替换为环境变量引用，提高安全性。',
          patches: [
            {
              path: 'nodes.node_0.properties.password',
              operation: 'replace',
              value: '${DB_PASSWORD}',
              description: '使用环境变量 DB_PASSWORD 替代明文密码',
            },
          ],
          confidence: 0.95,
          autoApplicable: true,
        },
        {
          id: 'fix_2',
          riskId: 'risk_2',
          title: '启用 SSL 连接',
          description: '启用数据库 SSL 连接以确保数据传输安全。',
          patches: [
            {
              path: 'nodes.node_0.properties.ssl',
              operation: 'replace',
              value: true,
              description: '将 SSL 设置为 true',
            },
          ],
          confidence: 0.90,
          autoApplicable: true,
        },
      ],
      summary: {
        totalFixes: 2,
        autoApplicable: 2,
        manualReview: 0,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    },
  },
  {
    name: '测试数据 2: 无风险变更（正常配置更新）',
    config: JSON.stringify({
      app: {
        name: 'MyApp',
        version: '1.0.0',
        environment: 'production',
      },
      logging: {
        level: 'info',
        format: 'json',
      },
    }, null, 2),
    astResult: {
      ast: {
        type: 'object',
        key: 'root',
        children: [
          {
            type: 'object',
            key: 'app',
            children: [
              { type: 'string', key: 'name', value: 'MyApp' },
              { type: 'string', key: 'version', value: '1.0.0' },
              { type: 'string', key: 'environment', value: 'production' },
            ],
          },
          {
            type: 'object',
            key: 'logging',
            children: [
              { type: 'string', key: 'level', value: 'info' },
              { type: 'string', key: 'format', value: 'json' },
            ],
          },
        ],
      },
      metadata: {
        format: 'json',
        parsedAt: new Date().toISOString(),
      },
    },
    executionGraph: {
      nodes: [
        {
          id: 'node_0',
          type: 'resource',
          name: 'app',
          properties: {
            name: 'MyApp',
            version: '1.0.0',
            environment: 'production',
          },
          dependencies: [],
          executionOrder: 0,
        },
        {
          id: 'node_1',
          type: 'resource',
          name: 'logging',
          properties: {
            level: 'info',
            format: 'json',
          },
          dependencies: [],
          executionOrder: 1,
        },
      ],
      edges: [
        { from: 'node_0', to: 'node_1', type: 'sequential' },
      ],
      metadata: {
        totalNodes: 2,
        totalEdges: 1,
        generatedAt: new Date().toISOString(),
      },
    },
    diffResult: {
      changes: [
        {
          type: 'added',
          path: 'nodes.node_0',
          newValue: {
            id: 'node_0',
            type: 'resource',
            name: 'app',
          },
          semanticImpact: 'low',
        },
      ],
      summary: {
        added: 2,
        removed: 0,
        modified: 0,
        unchanged: 0,
        highImpact: 0,
        mediumImpact: 0,
        lowImpact: 2,
      },
      metadata: {
        comparedAt: new Date().toISOString(),
      },
    },
    riskReport: {
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
        analysisDuration: 420,
      },
    },
    fixSuggestion: {
      fixes: [],
      summary: {
        totalFixes: 0,
        autoApplicable: 0,
        manualReview: 0,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    },
  },
  {
    name: '测试数据 3: 需要自动修复（性能问题）',
    config: JSON.stringify({
      server: {
        port: 8080,
        timeout: 100,
        maxConnections: 1000000,
      },
      cache: {
        enabled: true,
        ttl: 0,
        maxSize: -1,
      },
    }, null, 2),
    astResult: {
      ast: {
        type: 'object',
        key: 'root',
        children: [
          {
            type: 'object',
            key: 'server',
            children: [
              { type: 'number', key: 'port', value: 8080 },
              { type: 'number', key: 'timeout', value: 100 },
              { type: 'number', key: 'maxConnections', value: 1000000 },
            ],
          },
          {
            type: 'object',
            key: 'cache',
            children: [
              { type: 'boolean', key: 'enabled', value: true },
              { type: 'number', key: 'ttl', value: 0 },
              { type: 'number', key: 'maxSize', value: -1 },
            ],
          },
        ],
      },
      metadata: {
        format: 'json',
        parsedAt: new Date().toISOString(),
      },
    },
    executionGraph: {
      nodes: [
        {
          id: 'node_0',
          type: 'resource',
          name: 'server',
          properties: {
            port: 8080,
            timeout: 100,
            maxConnections: 1000000,
          },
          dependencies: [],
          executionOrder: 0,
        },
        {
          id: 'node_1',
          type: 'resource',
          name: 'cache',
          properties: {
            enabled: true,
            ttl: 0,
            maxSize: -1,
          },
          dependencies: ['node_0'],
          executionOrder: 1,
        },
      ],
      edges: [
        { from: 'node_0', to: 'node_1', type: 'dependency' },
        { from: 'node_0', to: 'node_1', type: 'sequential' },
      ],
      metadata: {
        totalNodes: 2,
        totalEdges: 2,
        generatedAt: new Date().toISOString(),
      },
    },
    diffResult: {
      changes: [
        {
          type: 'added',
          path: 'nodes.node_0.properties.maxConnections',
          newValue: 1000000,
          semanticImpact: 'high',
        },
        {
          type: 'added',
          path: 'nodes.node_1.properties.ttl',
          newValue: 0,
          semanticImpact: 'medium',
        },
        {
          type: 'added',
          path: 'nodes.node_1.properties.maxSize',
          newValue: -1,
          semanticImpact: 'high',
        },
      ],
      summary: {
        added: 5,
        removed: 0,
        modified: 0,
        unchanged: 0,
        highImpact: 2,
        mediumImpact: 1,
        lowImpact: 2,
      },
      metadata: {
        comparedAt: new Date().toISOString(),
      },
    },
    riskReport: {
      risks: [
        {
          id: 'risk_1',
          severity: 'high',
          category: 'performance',
          title: '连接数限制过高',
          description: 'maxConnections 设置为 1000000，可能导致资源耗尽和性能问题。',
          affectedPaths: ['nodes.node_0.properties.maxConnections'],
          recommendation: '将 maxConnections 设置为合理的值（如 1000-10000）。',
        },
        {
          id: 'risk_2',
          severity: 'medium',
          category: 'performance',
          title: '缓存 TTL 为 0',
          description: '缓存 TTL 设置为 0，缓存将立即过期，失去缓存效果。',
          affectedPaths: ['nodes.node_1.properties.ttl'],
          recommendation: '设置合理的 TTL 值（如 3600 秒）。',
        },
        {
          id: 'risk_3',
          severity: 'high',
          category: 'performance',
          title: '缓存大小限制无效',
          description: 'maxSize 设置为 -1（无限制），可能导致内存溢出。',
          affectedPaths: ['nodes.node_1.properties.maxSize'],
          recommendation: '设置合理的缓存大小限制（如 100MB 或 10000 条目）。',
        },
      ],
      summary: {
        critical: 0,
        high: 2,
        medium: 1,
        low: 0,
        total: 3,
      },
      overallRiskLevel: 'high',
      metadata: {
        analyzedAt: new Date().toISOString(),
        analysisDuration: 920,
      },
    },
    fixSuggestion: {
      fixes: [
        {
          id: 'fix_1',
          riskId: 'risk_1',
          title: '调整连接数限制',
          description: '将 maxConnections 设置为合理的值。',
          patches: [
            {
              path: 'nodes.node_0.properties.maxConnections',
              operation: 'replace',
              value: 5000,
              description: '将 maxConnections 从 1000000 调整为 5000',
            },
          ],
          confidence: 0.88,
          autoApplicable: true,
        },
        {
          id: 'fix_2',
          riskId: 'risk_2',
          title: '设置合理的缓存 TTL',
          description: '将缓存 TTL 设置为有效值。',
          patches: [
            {
              path: 'nodes.node_1.properties.ttl',
              operation: 'replace',
              value: 3600,
              description: '将 TTL 从 0 设置为 3600 秒（1小时）',
            },
          ],
          confidence: 0.85,
          autoApplicable: true,
        },
        {
          id: 'fix_3',
          riskId: 'risk_3',
          title: '设置缓存大小限制',
          description: '为缓存设置合理的大小限制。',
          patches: [
            {
              path: 'nodes.node_1.properties.maxSize',
              operation: 'replace',
              value: 10000,
              description: '将 maxSize 从 -1 设置为 10000 条目',
            },
          ],
          confidence: 0.90,
          autoApplicable: true,
        },
      ],
      summary: {
        totalFixes: 3,
        autoApplicable: 3,
        manualReview: 0,
      },
      metadata: {
        generatedAt: new Date().toISOString(),
      },
    },
  },
];

