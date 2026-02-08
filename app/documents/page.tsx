'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDocuments } from '@/hooks/useDocuments';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  formatDate,
  formatRelativeTime,
} from '@/lib/utils/date';
import {
  getConfidenceColor,
  getConfidenceLabel,
  getDocumentTypeLabel,
  getHospitalLayoutLabel,
  truncateText,
} from '@/lib/utils/formatting';
import { FileText, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

export default function DocumentsPage() {
  const [limit] = useState(50);
  const { data, isLoading, isError, error } = useDocuments(limit);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Documentos Médicos
          </h1>
          <p className="text-slate-600">
            Todos os documentos processados pelo sistema OCR
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600">Carregando documentos...</p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 text-red-800">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Erro ao carregar documentos</p>
                  <p className="text-sm text-red-600">
                    {error?.message || 'Ocorreu um erro desconhecido'}
                  </p>
                  <p className="text-sm text-red-600 mt-2">
                    Verifique se o endpoint da API está configurado em .env.local
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        {data && data.documents && (
          <>
            {/* Stats */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">{data.count}</span> documentos encontrados
              </p>
              {data.documents.length > 0 && (
                <p className="text-sm text-slate-500">
                  Última atualização: {formatRelativeTime(data.documents[0].processedAt)}
                </p>
              )}
            </div>

            {/* Empty State */}
            {data.documents.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Nenhum documento encontrado
                  </h3>
                  <p className="text-slate-600">
                    Os documentos processados aparecerão aqui.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Documents Grid */}
            <div className="grid gap-4">
              {data.documents.map((document) => (
                <Link key={document.id} href={`/documents/${document.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">
                              {getDocumentTypeLabel(document.documentType)}
                            </Badge>
                            {document.detectedUnit && (
                              <Badge variant="secondary">
                                {getHospitalLayoutLabel(document.detectedUnit)}
                              </Badge>
                            )}
                            <Badge className={getConfidenceColor(document.confidence)}>
                              {getConfidenceLabel(document.confidence)} ({document.confidence.toFixed(1)}%)
                            </Badge>
                          </div>

                          <CardTitle className="text-lg mb-2">
                            {document.nomePaciente || 'Paciente não identificado'}
                          </CardTitle>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                            {document.nomeHospital && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Hospital</p>
                                <p className="font-medium text-slate-900">
                                  {truncateText(document.nomeHospital, 30)}
                                </p>
                              </div>
                            )}

                            {document.cirurgiaProposta && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Procedimento</p>
                                <p className="font-medium text-slate-900">
                                  {truncateText(document.cirurgiaProposta, 35)}
                                </p>
                              </div>
                            )}

                            {(document.nomeMedico || document.cirurgiao) && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Médico</p>
                                <p className="font-medium text-slate-900">
                                  {truncateText(document.nomeMedico || document.cirurgiao || '', 25)}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-xs text-slate-500 mb-1">Data de Processamento</p>
                              <p className="font-medium text-slate-900">
                                {formatDate(document.processedAt)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-slate-400 ml-4" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination (if nextToken exists) */}
            {data.nextToken && (
              <div className="mt-6 text-center">
                <Button variant="outline" disabled>
                  Carregar mais documentos
                  <span className="text-xs ml-2">(Em desenvolvimento)</span>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
