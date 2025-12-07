import { ExecutionGraph, DiffResult, DiffChange } from '../types';

/**
 * Semantic Diff Analyzer - 对新旧 Execution Graph 做语义级 diff
 */
export class DiffAnalyzer {
  /**
   * 执行语义差异分析
   */
  static analyze(
    oldGraph: ExecutionGraph | null,
    newGraph: ExecutionGraph
  ): DiffResult {
    if (!oldGraph) {
      // 如果没有旧图，所有节点都是新增的
      return this.createInitialDiff(newGraph);
    }

    const changes: DiffChange[] = [];
    const oldNodeMap = new Map(oldGraph.nodes.map((n) => [n.id, n]));
    const newNodeMap = new Map(newGraph.nodes.map((n) => [n.id, n]));

    // 检查新增和修改的节点
    for (const newNode of newGraph.nodes) {
      const oldNode = oldNodeMap.get(newNode.id);
      
      if (!oldNode) {
        // 新增节点
        changes.push({
          type: 'added',
          path: this.getNodePath(newNode),
          newValue: newNode,
          semanticImpact: this.assessImpact(newNode, 'added'),
        });
      } else {
        // 检查修改
        const diff = this.compareNodes(oldNode, newNode);
        if (diff.length > 0) {
          diff.forEach((change) => {
            changes.push(change);
          });
        } else {
          changes.push({
            type: 'unchanged',
            path: this.getNodePath(newNode),
            oldValue: oldNode,
            newValue: newNode,
            semanticImpact: 'none',
          });
        }
      }
    }

    // 检查删除的节点
    for (const oldNode of oldGraph.nodes) {
      if (!newNodeMap.has(oldNode.id)) {
        changes.push({
          type: 'removed',
          path: this.getNodePath(oldNode),
          oldValue: oldNode,
          semanticImpact: this.assessImpact(oldNode, 'removed'),
        });
      }
    }

    // 检查边的变化
    const oldEdgeSet = new Set(
      oldGraph.edges.map((e) => `${e.from}->${e.to}`)
    );
    const newEdgeSet = new Set(
      newGraph.edges.map((e) => `${e.from}->${e.to}`)
    );

    for (const edge of newGraph.edges) {
      const edgeKey = `${edge.from}->${edge.to}`;
      if (!oldEdgeSet.has(edgeKey)) {
        changes.push({
          type: 'added',
          path: `edge:${edgeKey}`,
          newValue: edge,
          semanticImpact: 'medium',
        });
      }
    }

    for (const edge of oldGraph.edges) {
      const edgeKey = `${edge.from}->${edge.to}`;
      if (!newEdgeSet.has(edgeKey)) {
        changes.push({
          type: 'removed',
          path: `edge:${edgeKey}`,
          oldValue: edge,
          semanticImpact: 'medium',
        });
      }
    }

    // 生成摘要
    const summary = {
      added: changes.filter((c) => c.type === 'added').length,
      removed: changes.filter((c) => c.type === 'removed').length,
      modified: changes.filter((c) => c.type === 'modified').length,
      unchanged: changes.filter((c) => c.type === 'unchanged').length,
      highImpact: changes.filter((c) => c.semanticImpact === 'high').length,
      mediumImpact: changes.filter((c) => c.semanticImpact === 'medium').length,
      lowImpact: changes.filter((c) => c.semanticImpact === 'low').length,
    };

    return {
      changes,
      summary,
      metadata: {
        comparedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 创建初始差异（没有旧图时）
   */
  private static createInitialDiff(graph: ExecutionGraph): DiffResult {
    const changes: DiffChange[] = graph.nodes.map((node) => ({
      type: 'added',
      path: this.getNodePath(node),
      newValue: node,
      semanticImpact: this.assessImpact(node, 'added'),
    }));

    return {
      changes,
      summary: {
        added: changes.length,
        removed: 0,
        modified: 0,
        unchanged: 0,
        highImpact: changes.filter((c) => c.semanticImpact === 'high').length,
        mediumImpact: changes.filter((c) => c.semanticImpact === 'medium').length,
        lowImpact: changes.filter((c) => c.semanticImpact === 'low').length,
      },
      metadata: {
        comparedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * 比较两个节点
   */
  private static compareNodes(
    oldNode: any,
    newNode: any
  ): DiffChange[] {
    const changes: DiffChange[] = [];
    const path = this.getNodePath(newNode);

    // 比较类型
    if (oldNode.type !== newNode.type) {
      changes.push({
        type: 'modified',
        path: `${path}.type`,
        oldValue: oldNode.type,
        newValue: newNode.type,
        semanticImpact: 'high',
      });
    }

    // 比较属性
    const allKeys = new Set([
      ...Object.keys(oldNode.properties || {}),
      ...Object.keys(newNode.properties || {}),
    ]);

    for (const key of allKeys) {
      const oldVal = oldNode.properties?.[key];
      const newVal = newNode.properties?.[key];

      if (oldVal === undefined && newVal !== undefined) {
        changes.push({
          type: 'added',
          path: `${path}.properties.${key}`,
          newValue: newVal,
          semanticImpact: this.assessPropertyImpact(key, newVal),
        });
      } else if (oldVal !== undefined && newVal === undefined) {
        changes.push({
          type: 'removed',
          path: `${path}.properties.${key}`,
          oldValue: oldVal,
          semanticImpact: this.assessPropertyImpact(key, oldVal),
        });
      } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          type: 'modified',
          path: `${path}.properties.${key}`,
          oldValue: oldVal,
          newValue: newVal,
          semanticImpact: this.assessPropertyImpact(key, newVal),
        });
      }
    }

    // 比较依赖
    const oldDeps = new Set(oldNode.dependencies || []);
    const newDeps = new Set(newNode.dependencies || []);
    
    for (const dep of newDeps) {
      if (!oldDeps.has(dep)) {
        changes.push({
          type: 'added',
          path: `${path}.dependencies`,
          newValue: dep,
          semanticImpact: 'high',
        });
      }
    }

    for (const dep of oldDeps) {
      if (!newDeps.has(dep)) {
        changes.push({
          type: 'removed',
          path: `${path}.dependencies`,
          oldValue: dep,
          semanticImpact: 'high',
        });
      }
    }

    return changes;
  }

  /**
   * 获取节点路径
   */
  private static getNodePath(node: any): string {
    return `nodes.${node.id}`;
  }

  /**
   * 评估影响
   */
  private static assessImpact(
    node: any,
    changeType: 'added' | 'removed' | 'modified'
  ): 'high' | 'medium' | 'low' | 'none' {
    // 安全相关属性
    const securityKeywords = ['password', 'secret', 'key', 'token', 'auth', 'permission', 'access'];
    const nodeStr = JSON.stringify(node).toLowerCase();
    const hasSecurity = securityKeywords.some((kw) => nodeStr.includes(kw));

    if (hasSecurity) {
      return 'high';
    }

    // 关键节点类型
    if (node.type === 'action' || node.type === 'condition') {
      return changeType === 'removed' ? 'high' : 'medium';
    }

    // 有依赖的节点
    if (node.dependencies && node.dependencies.length > 0) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * 评估属性影响
   */
  private static assessPropertyImpact(key: string, value: any): 'high' | 'medium' | 'low' {
    const securityKeys = ['password', 'secret', 'key', 'token', 'auth', 'permission'];
    if (securityKeys.some((sk) => key.toLowerCase().includes(sk))) {
      return 'high';
    }

    const criticalKeys = ['port', 'host', 'url', 'endpoint', 'timeout'];
    if (criticalKeys.some((ck) => key.toLowerCase().includes(ck))) {
      return 'medium';
    }

    return 'low';
  }
}

