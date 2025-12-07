import { ASTNode, ASTResult } from '../types';

/**
 * AST Parser - 将配置文本解析为 AST
 */
export class ASTParser {
  /**
   * 解析配置文本为 AST
   */
  static parse(rawConfig: string): ASTResult {
    try {
      // 检测格式
      const format = this.detectFormat(rawConfig);
      
      // 解析为 AST
      const ast = format === 'json' 
        ? this.parseJSON(rawConfig)
        : this.parseYAML(rawConfig);

      return {
        ast,
        metadata: {
          format: format === 'json' ? 'json' : 'yaml',
          parsedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`AST parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 检测配置格式
   */
  private static detectFormat(config: string): 'json' | 'yaml' {
    const trimmed = config.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return 'json';
    }
    return 'yaml';
  }

  /**
   * 解析 JSON
   */
  private static parseJSON(jsonString: string): ASTNode {
    const obj = JSON.parse(jsonString);
    return this.objectToAST(obj, 'root');
  }

  /**
   * 解析 YAML (简化版，实际应该使用 yaml 库)
   */
  private static parseYAML(yamlString: string): ASTNode {
    // 简化实现：将 YAML 转换为对象再解析
    // 实际项目中应使用 js-yaml 等库
    try {
      // 尝试解析为 JSON 格式的 YAML
      const lines = yamlString.split('\n');
      const obj: any = {};
      let currentPath: string[] = [];
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const match = trimmed.match(/^([^:]+):\s*(.+)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          
          // 简单处理嵌套
          if (value.startsWith('{') || value.startsWith('[')) {
            try {
              obj[key] = JSON.parse(value);
            } catch {
              obj[key] = value;
            }
          } else {
            obj[key] = this.parseValue(value);
          }
        }
      }
      
      return this.objectToAST(obj, 'root');
    } catch {
      // 如果解析失败，返回一个基本的 AST
      return {
        type: 'document',
        value: yamlString,
        children: [],
      };
    }
  }

  /**
   * 解析值
   */
  private static parseValue(value: string): any {
    // 布尔值
    if (value === 'true') return true;
    if (value === 'false') return false;
    // 数字
    if (/^-?\d+$/.test(value)) return parseInt(value, 10);
    if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    // 字符串
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  }

  /**
   * 将对象转换为 AST
   */
  private static objectToAST(obj: any, key: string, depth = 0): ASTNode {
    if (obj === null || obj === undefined) {
      return {
        type: 'null',
        key,
        value: null,
        children: [],
      };
    }

    if (Array.isArray(obj)) {
      return {
        type: 'array',
        key,
        children: obj.map((item, index) => 
          this.objectToAST(item, index.toString(), depth + 1)
        ),
      };
    }

    if (typeof obj === 'object') {
      return {
        type: 'object',
        key,
        children: Object.entries(obj).map(([k, v]) => 
          this.objectToAST(v, k, depth + 1)
        ),
      };
    }

    return {
      type: typeof obj,
      key,
      value: obj,
      children: [],
    };
  }
}

