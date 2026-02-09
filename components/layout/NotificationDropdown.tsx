'use client';

import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CheckCheck, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function NotificationDropdown() {
  const { isDropdownOpen, toggleDropdown, closeDropdown } =
    useNotificationStore();
  const { notifications, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDropdown();
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isDropdownOpen, closeDropdown]);

  if (!isDropdownOpen) return null;

  const unreadNotifications = notifications.filter((n) => !n.lida);

  return (
    <>
      {/* Backdrop para fechar ao clicar fora */}
      <div className="fixed inset-0 z-40" onClick={toggleDropdown} />

      {/* Dropdown */}
      <div className="fixed lg:absolute bottom-0 lg:bottom-auto lg:top-12 left-0 lg:left-auto lg:right-0 w-full lg:w-96 z-50 max-h-[80vh] overflow-hidden rounded-t-2xl lg:rounded-xl">
        <Card className="shadow-2xl border-gray-200">
          <CardContent className="p-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Notificações
                {unreadNotifications.length > 0 && (
                  <Badge variant="default" className="bg-blue-600">
                    {unreadNotifications.length}
                  </Badge>
                )}
              </h3>
              {unreadNotifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="text-sm"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar todas
                </Button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-500 text-sm">Carregando notificações...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      !notification.lida ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-gray-900">
                            {notification.titulo}
                          </h4>
                          {!notification.lida && (
                            <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.mensagem}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                          {notification.link && (
                            <Link
                              href={notification.link}
                              onClick={closeDropdown}
                            >
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs h-auto p-0"
                              >
                                Ver detalhes
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                      {!notification.lida && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="shrink-0 h-8 w-8 p-0"
                          title="Marcar como lida"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                <Link href="/notificacoes" onClick={closeDropdown}>
                  <Button variant="link" className="text-sm">
                    Ver todas as notificações
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
