'use client';

import { useEffect } from 'react';
import { useDocumentNotificationStore } from '@/stores/documentNotificationStore';
import { useDocumentosNotificacoes } from '@/hooks/useDocumentosNotificacoes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DocumentNotificationDropdown() {
  const { isDropdownOpen, toggleDropdown, closeDropdown, markAllSeen } =
    useDocumentNotificationStore();
  const { notificacoes, unreadCount, isLoading } = useDocumentosNotificacoes();

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

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={toggleDropdown} />

      <div className="fixed lg:absolute bottom-0 lg:bottom-auto lg:top-12 left-0 lg:left-auto lg:right-0 w-full lg:w-96 z-50 max-h-[80vh] overflow-hidden rounded-t-2xl lg:rounded-xl">
        <Card className="shadow-2xl border-gray-200">
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                Documentos
                {unreadCount > 0 && (
                  <Badge variant="default" className="bg-blue-600">
                    {unreadCount}
                  </Badge>
                )}
              </h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllSeen} className="text-sm">
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Marcar vistas
                </Button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="h-8 w-8 text-gray-400 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-500 text-sm">Carregando...</p>
                </div>
              ) : notificacoes.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Nenhum documento recente</p>
                </div>
              ) : (
                notificacoes.slice(0, 10).map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/plantoes/${notif.plantaoId}?tab=documentos`}
                    onClick={closeDropdown}
                  >
                    <div
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notif.lido ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {notif.titulo}
                            </p>
                            {!notif.lido && (
                              <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>
                              {formatDistanceToNow(new Date(notif.uploadedAt), {
                                addSuffix: true,
                                locale: ptBR,
                              })}
                            </span>
                            {notif.uploadedByNome && <span>· {notif.uploadedByNome}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {notificacoes.length > 0 && (
              <div className="p-3 border-t border-gray-200 text-center bg-gray-50">
                <Link href="/documentos" onClick={closeDropdown}>
                  <Button variant="link" className="text-sm">
                    Ver todos os documentos
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
