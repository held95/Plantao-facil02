import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { FileText, Home, BarChart3 } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Name */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-slate-900">
              {APP_NAME}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Início</span>
            </Link>

            <Link
              href="/documents"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Documentos</span>
            </Link>

            <Link
              href="/analytics"
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Analytics</span>
            </Link>
          </div>

          {/* User Section (Phase 3 - Authentication) */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-slate-600">
              <span className="hidden md:inline">Bem-vindo</span>
            </div>
            {/* Login button will be added in Phase 3 */}
          </div>
        </div>
      </div>
    </nav>
  );
}
