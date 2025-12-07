import { ASTNode, ExecutionGraph, ExecutionNode } from '../types';

/**
 * Execution Simulator - 基于 AST 生成执行图
 */
export class ExecutionSimulator {
  /**
   * 从 AST 生成执行图
   */
  static simulate(ast: ASTNode): ExecutionGraph {
    const nodes: ExecutionNode[] = [];
    const edges: Array<{ from: string; to: string; type: 'dependency' | 'conditional' | 'sequential' }> = [];
    const nodeMap = new Map<string, ExecutionNode>();
    let executionOrder = 0;

    // 遍历 AST 生成执行节点
    this.traverseAST(ast, (node, path) => {
      const nodeId = `node_${nodes.length}`;
      const executionNode = this.createExecutionNode(node, path, nodeId, executionOrder++);
      nodes.push(executionNode);
      nodeMap.set(path, executionNode);
    });

    // 生成依赖关系
    nodes.forEach((node) => {
      // 查找依赖关系（基于路径和属性引用）
      const dependencies = this.findDependencies(node, nodeMap);
      dependencies.forEach((dep) => {
        edges.push({
          from: dep,
          to: node.id,
          type: 'dependency',
        });
      });

      // 生成顺序关系
      const prevNode = nodes.find((n) => n.executionOrder === node.executionOrder - 1);
      if (prevNode && node.executionOrder > 0) {
        edges.push({
          from: prevNode.id,
          to: node.id,
          type: 'sequential',
        });
      }
    });

    return {
      nodes,
      edges,
      metadata: {
        totalNodes: nodes.length,
        totalEdges: edges.length,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 遍历 AST
   */
  private static traverseAST(
    node: ASTNode,
    callback: (node: ASTNode, path: string) => void,
    path = 'root'
  ): void {
    callback(node, path);
    
    if (node.children) {
      node.children.forEach((child, index) => {
        const childPath = node.key 
          ? `${path}.${child.key || index}`
          : `${path}[${index}]`;
        this.traverseAST(child, callback, childPath);
      });
    }
  }

  /**
   * 创建执行节点
   */
  private static createExecutionNode(
    astNode: ASTNode,
    path: string,
    id: string,
    order: number
  ): ExecutionNode {
    // 根据 AST 节点类型确定执行节点类型
    let nodeType: 'action' | 'condition' | 'resource' | 'dependency' = 'resource';
    
    if (astNode.type === 'object' && astNode.children) {
      // 检查是否是动作节点（包含 action, handler 等关键字）
      const hasAction = astNode.children.some(
        (c) => c.key === 'action' || c.key === 'handler' || c.key === 'type'
      );
      if (hasAction) {
        nodeType = 'action';
      }
      
      // 检查是否是条件节点
      const hasCondition = astNode.children.some(
        (c) => c.key === 'condition' || c.key === 'if' || c.key === 'when'
      );
      if (hasCondition) {
        nodeType = 'condition';
      }
    }

    // 提取属性
    const properties: Record<string, any> = {};
    if (astNode.children) {
      astNode.children.forEach((child) => {
        if (child.key) {
          properties[child.key] = child.value !== undefined 
            ? child.value 
            : this.extractValue(child);
        }
      });
    } else if (astNode.value !== undefined) {
      properties.value = astNode.value;
    }

    return {
      id,
      type: nodeType,
      name: astNode.key || path.split('.').pop() || 'root',
      properties,
      dependencies: [],
      executionOrder: order,
    };
  }

  /**
   * 提取值
   */
  private static extractValue(node: ASTNode): any {
    if (node.value !== undefined) {
      return node.value;
    }
    if (node.children) {
      if (node.type === 'array') {
        return node.children.map((c) => this.extractValue(c));
      }
      const obj: Record<string, any> = {};
      node.children.forEach((c) => {
        if (c.key) {
          obj[c.key] = this.extractValue(c);
        }
      });
      return obj;
    }
    return null;
  }

  /**
   * 查找依赖关系
   */
  private static findDependencies(
    node: ExecutionNode,
    nodeMap: Map<string, ExecutionNode>
  ): string[] {
    const dependencies: string[] = [];
    
    // 检查属性中是否有引用（如 ${ref}, $ref, depends_on 等）
    const checkDependencies = (value: any): void => {
      if (typeof value === 'string') {
        // 检查引用模式
        const refMatch = value.match(/\$\{?([^}]+)\}?/);
        if (refMatch) {
          const refPath = refMatch[1];
          // 查找匹配的节点
          for (const [path, n] of nodeMap.entries()) {
            if (path.includes(refPath) || n.name === refPath) {
              dependencies.push(n.id);
            }
          }
        }
      } else if (Array.isArray(value)) {
        value.forEach(checkDependencies);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(checkDependencies);
      }
    };

    Object.values(node.properties).forEach(checkDependencies);
    
    // 检查 depends_on 属性
    if (node.properties.depends_on) {
      const deps = Array.isArray(node.properties.depends_on)
        ? node.properties.depends_on
        : [node.properties.depends_on];
      deps.forEach((dep: string) => {
        for (const [path, n] of nodeMap.entries()) {
          if (n.name === dep || path.includes(dep)) {
            dependencies.push(n.id);
          }
        }
      });
    }

    return [...new Set(dependencies)];
  }
}

