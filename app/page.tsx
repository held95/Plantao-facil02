import Link from 'next/link';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {APP_NAME}
            </h1>
            <p className="text-xl text-gray-600">
              Sistema de Gerenciamento de Documentos Médicos
            </p>
            <p className="text-lg text-gray-500 mt-2">
              Processamento inteligente com OCR e AWS Textract
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-600">Documentos Processados</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">🏥</div>
              <div className="text-2xl font-bold text-gray-900">--</div>
              <div className="text-sm text-gray-600">Hospitais Atendidos</div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-bold text-gray-900">--%</div>
              <div className="text-sm text-gray-600">Confiança Média OCR</div>
            </div>
          </div>

          {/* Main Action Card */}
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acesse os Documentos
            </h2>
            <p className="text-gray-600 mb-6">
              Visualize, pesquise e gerencie todos os documentos médicos processados pelo sistema.
              Relatórios cirúrgicos, prontuários e muito mais.
            </p>

            <Link
              href="/documents"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ver Todos os Documentos →
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Busca Avançada
              </h3>
              <p className="text-gray-600 text-sm">
                Pesquise por paciente, hospital, procedimento ou médico. Filtros poderosos para encontrar documentos rapidamente.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-3">📊</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Analytics
              </h3>
              <p className="text-gray-600 text-sm">
                Visualize estatísticas e relatórios sobre os documentos processados. Gráficos por especialidade, hospital e período.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-3">🤖</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                OCR Inteligente
              </h3>
              <p className="text-gray-600 text-sm">
                Processamento automático com AWS Textract. Extração de dados de múltiplos layouts hospitalares (HMB, HGP, Sorocaba, Guarulhos).
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl mb-3">📥</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Exportação
              </h3>
              <p className="text-gray-600 text-sm">
                Exporte documentos e relatórios em diversos formatos (CSV, PDF). Mantenha seus dados organizados e acessíveis.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>Versão 1.0.0 • Desenvolvido com Next.js, TypeScript e TailwindCSS</p>
            <p className="mt-1">Integrado com AWS Lambda, Textract e DynamoDB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
