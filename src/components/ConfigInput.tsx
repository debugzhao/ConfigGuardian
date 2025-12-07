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
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white mb-1 drop-shadow-md">配置输入 (Config Input)</h3>
        <p className="text-xs text-white/70">支持 YAML 或 JSON 格式</p>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 w-full p-5 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl 
                   font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white/30
                   text-white placeholder-white/50 transition-all duration-300 ease-out shadow-lg"
      />
    </div>
  );
};

