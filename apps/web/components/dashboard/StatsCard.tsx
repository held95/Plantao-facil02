'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
  green: { bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
  yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: 'text-yellow-500' },
  red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500' },
  gray: { bg: 'bg-gray-50', text: 'text-gray-700', icon: 'text-gray-500' },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
}: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <Icon className={`h-5 w-5 ${colors.icon}`} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
