import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-[#8B1E1E] font-semibold mb-2 text-sm">
        {label}
      </label>
      <input
        className={`w-full px-4 py-3 bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:bg-white transition-all ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};