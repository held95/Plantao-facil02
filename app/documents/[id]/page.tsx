'use client';

import { use } from 'react';
import Link from 'next/link';
import { useDocumentDetail } from '@/hooks/useDocumentDetail';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatDate,
  formatDateTime,
} from '@/lib/utils/date';
import {
  formatCPF,
  formatCRM,
  formatRG,
  formatCNS,
  formatMedicalRecord,
  formatAge,
  formatGender,
  getConfidenceColor,
  getConfidenceLabel,
  getDocumentTypeLabel,
  getHospitalLayoutLabel,
  cleanProcedureText,
} from '@/lib/utils/formatting';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  User,
  Hospital,
  Stethoscope,
  FileText,
  Calendar,
  Activity,
} from 'lucide-react';

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: document, isLoading, isError, error } = useDocumentDetail(id);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/documents">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Documentos
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600">Carregando documento...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-red-800">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Erro ao carregar documento</p>
                  <p className="text-sm text-red-600">
                    {error?.message || 'Documento não encontrado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Document Detail */}
        {document && (
          <div className="space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge variant="outline" className="text-base">
                        {getDocumentTypeLabel(document.documentType)}
                      </Badge>
                      {document.detectedUnit && (
                        <Badge variant="secondary" className="text-base">
                          {getHospitalLayoutLabel(document.detectedUnit)}
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-2xl mb-2">
                      {document.nomePaciente || 'Paciente não identificado'}
                    </CardTitle>

                    <CardDescription className="text-base">
                      Documento processado em {formatDateTime(document.processedAt)}
                    </CardDescription>
                  </div>

                  <div className="text-right">
                    <Badge className={`${getConfidenceColor(document.confidence)} text-base px-4 py-2`}>
                      Confiança: {getConfidenceLabel(document.confidence)} ({document.confidence.toFixed(1)}%)
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Patient Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <CardTitle>Informações do Paciente</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoField label="Nome do Paciente" value={document.nomePaciente} />
                  <InfoField label="Nome Social" value={document.nomeSocial} />
                  <InfoField label="CPF" value={formatCPF(document.cpf)} />
                  <InfoField label="RG" value={formatRG(document.rg)} />
                  <InfoField label="CNS" value={formatCNS(document.cns)} />
                  <InfoField label="RH / Prontuário" value={formatMedicalRecord(document.rh)} />
                  <InfoField label="Data de Nascimento" value={document.dataNascimento} />
                  <InfoField label="Idade" value={formatAge(document.idade)} />
                  <InfoField label="Sexo" value={formatGender(document.sexo)} />
                  <InfoField label="Estado Civil" value={document.estadoCivil} />
                  <InfoField label="Data de Internação" value={document.dataInternacao} />
                  <InfoField label="Dias de Internação" value={document.diasInternacao} />
                  <InfoField label="Quarto / Leito" value={document.quartoLeito} />
                  <InfoField label="Unidade de Internação" value={document.unidadeInternacao} />
                </div>
              </CardContent>
            </Card>

            {/* Hospital & Professional Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Hospital className="h-5 w-5 text-green-600" />
                  <CardTitle>Informações Hospitalares</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoField label="Hospital" value={document.nomeHospital} />
                  <InfoField label="Especialidade" value={document.especialidade} />
                </div>
              </CardContent>
            </Card>

            {/* Medical Professional Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-purple-600" />
                  <CardTitle>Profissionais de Saúde</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoField label="Médico" value={document.nomeMedico} />
                  <InfoField label="CRM do Médico" value={formatCRM(document.crmDoMedico)} />
                  <InfoField label="Cirurgião" value={document.cirurgiao} />
                  <InfoField label="CRM do Cirurgião" value={formatCRM(document.crmCirurgiao)} />
                  <InfoField label="Assistente" value={document.nomeAssistente} />
                  <InfoField label="CRM do Assistente" value={formatCRM(document.crmAssistente)} />
                </div>

                {document.assistentes && document.assistentes.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Assistentes Adicionais:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {document.assistentes.map((assistente, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-lg">
                          <p className="font-medium text-slate-900">{assistente.nome}</p>
                          <p className="text-sm text-slate-600">{formatCRM(assistente.crm)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  <CardTitle>Dados Clínicos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <InfoField
                      label="Cirurgia / Procedimento Proposto"
                      value={cleanProcedureText(document.cirurgiaProposta)}
                    />
                  </div>
                  <InfoField label="Data do Documento" value={document.dataDocumento} />
                  <InfoField label="Data do Atendimento" value={document.dataAtendimento} />
                  <InfoField label="Data da Cirurgia" value={document.dataCirurgia} />
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <CardTitle>Metadados do Documento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <InfoField label="ID do Documento" value={document.id} />
                  <InfoField label="Nome do Arquivo" value={document.fileName} />
                  <InfoField label="Tipo de Documento" value={getDocumentTypeLabel(document.documentType)} />
                  <InfoField label="Layout Detectado" value={getHospitalLayoutLabel(document.detectedUnit || 'UNKNOWN')} />
                  <InfoField label="Confiança OCR" value={`${document.confidence.toFixed(2)}%`} />
                  <InfoField label="Blocos de Texto" value={document.blocks?.toString()} />
                  <InfoField label="Bucket S3" value={document.bucket} />
                  <InfoField label="Chave S3" value={document.key} />
                  <InfoField label="Processado em" value={formatDateTime(document.processedAt)} />
                  <InfoField label="Criado em" value={formatDateTime(document.createdAt)} />
                </div>
              </CardContent>
            </Card>

            {/* Extracted Text (if available) */}
            {document.extractedText && (
              <Card>
                <CardHeader>
                  <CardTitle>Texto Extraído (OCR)</CardTitle>
                  <CardDescription>Texto completo extraído do documento pelo AWS Textract</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono">
                      {document.extractedText}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for displaying labeled fields
function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-slate-900">
        {value || <span className="text-slate-400 italic">Não informado</span>}
      </p>
    </div>
  );
}
