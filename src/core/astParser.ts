import { ASTNode, ASTResult } from '../types';
import yaml from 'js-yaml';

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
   * 解析 YAML
   */
  private static parseYAML(yamlString: string): ASTNode {
    try {
      // 使用 js-yaml 库解析 YAML
      const obj = yaml.load(yamlString, {
        schema: yaml.DEFAULT_SCHEMA,
        json: true,
      });
      
      if (obj === null || obj === undefined) {
        throw new Error('YAML parsed to null or undefined');
      }
      
      return this.objectToAST(obj, 'root');
    } catch (error) {
      throw new Error(`YAML parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

