import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const iconSize = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <Loader2 className={`${iconSize} text-blue-600 animate-spin`} />
      {text && <p className="text-xs text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
