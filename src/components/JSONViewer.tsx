import React from 'react';

interface JSONViewerProps {
  data: any;
  title?: string;
  collapsed?: boolean;
}

export const JSONViewer: React.FC<JSONViewerProps> = ({ data, title, collapsed = false }) => {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const formatJSON = (obj: any, indent = 0): string => {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') return `"${obj}"`;
    if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map((item) => 
        '  '.repeat(indent + 1) + formatJSON(item, indent + 1)
      ).join(',\n');
      return `[\n${items}\n${'  '.repeat(indent)}]`;
    }
    
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      const items = keys.map((key) => {
        const value = formatJSON(obj[key], indent + 1);
        return `  ${'  '.repeat(indent)}"${key}": ${value}`;
      }).join(',\n');
      return `{\n${items}\n${'  '.repeat(indent)}}`;
    }
    
    return String(obj);
  };

  const jsonString = React.useMemo(() => {
    try {
      return formatJSON(data);
    } catch {
      return String(data);
    }
  }, [data]);

  return (
    <div className="w-full">
      {title && (
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer transition-all duration-300 ease-out"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <h3 className="text-sm font-semibold text-white drop-shadow-md">{title}</h3>
          <span className="text-white/70 text-xs hover:text-white transition-colors">
            {isCollapsed ? '展开' : '收起'}
          </span>
        </div>
      )}
      {!isCollapsed && (
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20 shadow-lg transition-all duration-300 ease-out">
          <pre className="text-xs font-mono text-white overflow-x-auto whitespace-pre-wrap break-words">
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  );
};

