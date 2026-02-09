import { Navbar } from '@/components/layout/Navbar';
import { EmptyState } from '@/components/ui/empty-state';
import { ClipboardList } from 'lucide-react';

export default function GerenciarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Gerenciar Inscrições
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Visualize quem se inscreveu nos seus plantões
          </p>
        </div>

        {/* Empty State */}
        <EmptyState
          icon={ClipboardList}
          title="Nenhuma inscrição ainda"
          description="As inscrições dos profissionais nos plantões aparecerão aqui para você gerenciar."
        />
      </div>
    </div>
  );
}
