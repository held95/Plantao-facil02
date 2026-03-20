'use client';

import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DocumentNotificationDropdown } from './DocumentNotificationDropdown';
import { useDocumentNotificationStore } from '@/stores/documentNotificationStore';
import { useDocumentosNotificacoes } from '@/hooks/useDocumentosNotificacoes';

export function DocumentNotificationBadge() {
  const { unreadCount, toggleDropdown } = useDocumentNotificationStore();

  // Inicia o polling enquanto o componente está montado
  useDocumentosNotificacoes();

  return (
    <div className="relative">
      <button
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
        onClick={toggleDropdown}
        aria-label="Documentos"
      >
        <FileText className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>
      <DocumentNotificationDropdown />
    </div>
  );
}
