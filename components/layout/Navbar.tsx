import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';
import { Calendar } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo and App Name */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              {APP_NAME}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              Início
            </Link>

            <Link
              href="/plantoes"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              Plantões
            </Link>

            <Link
              href="/perfil"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              Perfil
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
