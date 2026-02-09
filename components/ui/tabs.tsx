'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Tab {
  value: string;
  label: string;
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function Tabs({
  tabs,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
}: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(
    defaultValue || tabs[0]?.value || ''
  );

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleTabChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  const activeTab = tabs.find((tab) => tab.value === value);

  return (
    <div className={cn('w-full', className)}>
      {/* Tabs List */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                'border-b-2 px-1 py-3 text-sm font-medium transition-colors',
                value === tab.value
                  ? 'border-slate-700 text-slate-700'
                  : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab?.content && (
        <div className="mt-4">{activeTab.content}</div>
      )}
    </div>
  );
}
