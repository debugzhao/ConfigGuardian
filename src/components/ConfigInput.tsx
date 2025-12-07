import React from 'react';

interface ConfigInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ConfigInput: React.FC<ConfigInputProps> = ({
  value,
  onChange,
  placeholder = '请输入配置内容 (YAML 或 JSON)...',
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-apple-gray-700">配置输入 (Config Input)</h3>
        <p className="text-xs text-apple-gray-500 mt-1">支持 YAML 或 JSON 格式</p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full p-4 border-2 border-apple-gray-200 rounded-lg 
                   font-mono text-sm resize-none focus:outline-none focus:border-blue-400
                   bg-white text-apple-gray-800"
      />
    </div>
  );
};

