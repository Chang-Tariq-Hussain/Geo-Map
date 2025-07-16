import React from "react";


export interface SelectProps{
    value: string,
    label: string
}

interface SelectComponentProps {
    options: SelectProps[];
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    label?: string;
    className?: string;
  }
export default function ThemeSelect({ options, value, onChange, label, className }: SelectComponentProps) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor="select" className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          {label}
        </label>
      )}
      <select
        id="select"
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className || ''}`}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
