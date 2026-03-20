import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

export const metadata = {
  title: 'Politica de Privacidade — Plantao Facil',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-6 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politica de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-8">Ultima atualizacao: Marco de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introducao</h2>
            <p>
              O Plantao Facil ("nos", "nosso") valoriza a privacidade dos seus usuarios e esta comprometido
              com a protecao dos seus dados pessoais em conformidade com a Lei Geral de Protecao de Dados
              Pessoais (LGPD — Lei n° 13.709/2018) e demais normas aplicaveis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Dados Coletados</h2>
            <p>Coletamos os seguintes dados pessoais:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Nome completo e e-mail para identificacao e autenticacao;</li>
              <li>Numero de telefone, para envio de notificacoes por SMS (opcional);</li>
              <li>CRM e especialidade medica, para validacao de credenciais;</li>
              <li>Historico de acesso e logs de uso da plataforma;</li>
              <li>Tokens de notificacao push (dispositivos moveis).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Finalidade do Tratamento</h2>
            <p>Seus dados sao utilizados para:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Criar e gerenciar sua conta na plataforma;</li>
              <li>Enviar notificacoes sobre plantoes e documentos;</li>
              <li>Cumprir obrigacoes legais e regulatorias;</li>
              <li>Melhorar nossos servicos com base em dados anonimizados;</li>
              <li>Prevenção de fraudes e segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Base Legal</h2>
            <p>
              O tratamento de dados e realizado com base no consentimento do titular (Art. 7°, I da LGPD),
              na execucao de contrato (Art. 7°, V) e no cumprimento de obrigacao legal (Art. 7°, II).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Compartilhamento de Dados</h2>
            <p>
              Nao vendemos seus dados pessoais a terceiros. Podemos compartilhar dados com:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provedores de servicos de infraestrutura (AWS), sujeitos a acordos de confidencialidade;</li>
              <li>Autoridades competentes, quando exigido por lei.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Seus Direitos (LGPD)</h2>
            <p>Voce tem direito a:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Confirmar a existencia de tratamento de dados;</li>
              <li>Acessar seus dados pessoais;</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados;</li>
              <li>Solicitar a anonimizacao, bloqueio ou eliminacao dos dados;</li>
              <li>Revogar o consentimento a qualquer momento;</li>
              <li>Solicitar a exclusao da conta e anonimizacao dos dados.</li>
            </ul>
            <p className="mt-2">
              Para exercer seus direitos, entre em contato pelo e-mail:{' '}
              <a href="mailto:privacidade@plantaofacil.com" className="text-blue-600 underline">
                privacidade@plantaofacil.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Retencao de Dados</h2>
            <p>
              Seus dados sao mantidos pelo periodo necessario para prestacao dos servicos e cumprimento
              de obrigacoes legais. Apos a exclusao da conta, os dados serao anonimizados em ate 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Seguranca</h2>
            <p>
              Adotamos medidas tecnicas e administrativas para proteger seus dados, incluindo criptografia
              em transito (TLS), controle de acesso por funcao e registros de auditoria.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Cookies</h2>
            <p>
              Utilizamos cookies de sessao estritamente necessarios para autenticacao. Nao utilizamos
              cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. Alteracoes nesta Politica</h2>
            <p>
              Podemos atualizar esta politica periodicamente. Notificaremos os usuarios sobre mudancas
              relevantes por e-mail ou por aviso na plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Contato</h2>
            <p>
              Encarregado de Protecao de Dados (DPO):{' '}
              <a href="mailto:privacidade@plantaofacil.com" className="text-blue-600 underline">
                privacidade@plantaofacil.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <Link href="/" className="text-blue-600 text-sm hover:underline">
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
