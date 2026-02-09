'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Calendar, Plus, FileText, Bell, Users, LogOut, ClipboardList, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { NotificationDropdown } from '@/components/layout/NotificationDropdown';
import { useNotificationStore } from '@/stores/notificationStore';
import { useNotifications } from '@/hooks/useNotifications';

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const { unreadCount, toggleDropdown } = useNotificationStore();

  // Iniciar polling de notificações
  useNotifications();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendario', label: 'Calendário', icon: Calendar },
    { href: '/criar', label: 'Criar Plantão', icon: Plus },
    { href: '/inscricoes', label: 'Minhas Inscrições', icon: FileText },
    { href: '/notificacoes', label: 'Notificações', icon: Bell },
    { href: '/gerenciar', label: 'Gerenciar Inscrições', icon: ClipboardList },
    { href: '/logs', label: 'Logs', icon: Activity },
    { href: '/coordenadores', label: 'Coordenadores', icon: Users },
  ];

  // Filtrar nav items baseado no role do usuário
  const coordinatorOnlyPages = ['/criar', '/logs', '/coordenadores'];
  const filteredNavItems = navItems.filter(item => {
    if (coordinatorOnlyPages.includes(item.href)) {
      return user?.role === 'coordenador' || user?.role === 'admin';
    }
    return true;
  });

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Name */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 block leading-tight">
                Gestão de Plantões
              </span>
              <span className="text-xs text-gray-500">ProTime</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-all px-3 py-2 rounded-md ${
                    isActive
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Bell Icon with Badge and Dropdown */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
                onClick={toggleDropdown}
                aria-label="Notificações"
                aria-describedby="unread-count"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
                <span id="unread-count" className="sr-only">
                  {unreadCount} notificações não lidas
                </span>
              </button>
              <NotificationDropdown />
            </div>
            {status === 'loading' ? (
              <div className="flex items-center space-x-3">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name || 'Usuário'}</div>
                  <div className="text-xs text-gray-500">
                    {user?.role === 'coordenador' ? 'Coordenador' : user?.role === 'admin' ? 'Admin' : 'Médico'}
                  </div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
