import * as React from 'react';
import { cn } from '@/lib/utils';

export type Status = 'aberto' | 'futuro' | 'fechado' | 'pendente' | 'confirmado' | 'cancelado';

export interface StatusBadgeProps {
  status: Status;
  children: React.ReactNode;
  className?: string;
}

const statusStyles: Record<Status, string> = {
  aberto: 'bg-green-100 text-green-700 border-green-200',
  futuro: 'bg-blue-100 text-blue-700 border-blue-200',
  fechado: 'bg-gray-100 text-gray-700 border-gray-200',
  pendente: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmado: 'bg-green-100 text-green-700 border-green-200',
  cancelado: 'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {children}
    </span>
  );
}
