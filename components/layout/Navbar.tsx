'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Plus, FileText, Bell, Users, LogOut, ClipboardList, Activity } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();

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
            {navItems.map((item) => {
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
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">Hélder Corrêa</div>
                <div className="text-xs text-gray-500">Coordenador</div>
              </div>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
