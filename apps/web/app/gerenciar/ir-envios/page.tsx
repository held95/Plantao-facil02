'use client';

import { useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Upload,
  Send,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CSVRow {
  nome: string;
  email: string;
  telefone: string;
}

interface PreviewMatch {
  csvRow: CSVRow;
  pdfFile: File;
}

interface PreviewData {
  matched: PreviewMatch[];
  unmatchedPDFs: string[];
  unmatchedRecipients: CSVRow[];
}

interface IREnvioResult {
  nome: string;
  email: string;
  telefone: string;
  pdfName: string;
  s3Key: string;
  downloadUrl: string | null;
  emailResult: { success: boolean; messageId?: string; error?: string };
  smsResult: { success: boolean; messageId?: string; error?: string } | null;
  overallSuccess: boolean;
}

// ─── Helpers (client-side, mirrors server logic) ───────────────────────────────

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_\-]+/g, '');
}

function parseCSVText(text: string): CSVRow[] {
  const clean = text.replace(/^\uFEFF/, '');
  const lines = clean.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ';' : ',';

  const headers = firstLine.split(delimiter).map((h) => normalizeName(h.trim()));
  const nomeIdx = headers.findIndex((h) => h.includes('nome'));
  const emailIdx = headers.findIndex((h) => h.includes('email'));
  const telIdx = headers.findIndex(
    (h) => h.includes('telefone') || h.includes('tel') || h.includes('fone') || h.includes('celular')
  );

  if (nomeIdx < 0 || emailIdx < 0) return [];

  return lines
    .slice(1)
    .map((line) => {
      const cols = line.split(delimiter);
      return {
        nome: cols[nomeIdx]?.trim() || '',
        email: cols[emailIdx]?.trim() || '',
        telefone: telIdx >= 0 ? cols[telIdx]?.trim() || '' : '',
      };
    })
    .filter((r) => r.nome && r.email);
}

async function computePreview(csv: File, pdfs: File[]): Promise<PreviewData> {
  const csvText = await csv.text();
  const csvRows = parseCSVText(csvText);

  const matched: PreviewMatch[] = [];
  const usedCsvIndexes = new Set<number>();
  const unmatchedPDFs: string[] = [];

  for (const pdf of pdfs) {
    const baseName = pdf.name.replace(/\.pdf$/i, '');
    const normalizedPdf = normalizeName(baseName);
    const csvIdx = csvRows.findIndex(
      (row, i) => !usedCsvIndexes.has(i) && normalizeName(row.nome) === normalizedPdf
    );

    if (csvIdx >= 0) {
      matched.push({ csvRow: csvRows[csvIdx], pdfFile: pdf });
      usedCsvIndexes.add(csvIdx);
    } else {
      unmatchedPDFs.push(pdf.name);
    }
  }

  const unmatchedRecipients = csvRows.filter((_, i) => !usedCsvIndexes.has(i));

  return { matched, unmatchedPDFs, unmatchedRecipients };
}

// ─── Component ────────────────────────────────────────────────────────────────

type Phase = 'upload' | 'preview' | 'results';

export default function IREnviosPage() {
  const { data: session, status } = useSession();
  const csvInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [anoReferencia, setAnoReferencia] = useState<number>(new Date().getFullYear() - 1);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [results, setResults] = useState<IREnvioResult[]>([]);
  const [summary, setSummary] = useState<{ total: number; sent: number; failed: number } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const canAccess =
    status === 'loading' ||
    session?.user?.role === 'coordenador' ||
    session?.user?.role === 'admin';

  // ── File handlers ──────────────────────────────────────────────────────────

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCsvFile(file);
  };

  const handlePDFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    setPdfFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...files.filter((f) => !existing.has(f.name))];
    });
  };

  const removePDF = (name: string) => {
    setPdfFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    setPdfFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...files.filter((f) => !existing.has(f.name))];
    });
  }, []);

  // ── Preview ────────────────────────────────────────────────────────────────

  const handlePreview = async () => {
    if (!csvFile || pdfFiles.length === 0) {
      toast.error('Selecione o CSV e ao menos 1 PDF.');
      return;
    }
    const data = await computePreview(csvFile, pdfFiles);
    setPreview(data);
    setPhase('preview');
  };

  // ── Send ───────────────────────────────────────────────────────────────────

  const handleEnviar = async () => {
    if (!csvFile || pdfFiles.length === 0 || !preview) return;

    setIsSending(true);
    try {
      const fd = new FormData();
      fd.append('csv', csvFile);
      fd.append('anoReferencia', String(anoReferencia));
      for (const pdf of pdfFiles) {
        fd.append('pdfs', pdf);
      }

      const res = await fetch('/api/admin/ir-envios', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Erro ao enviar documentos.');
        return;
      }

      setResults(data.results);
      setSummary(data.summary);
      setPhase('results');

      if (data.summary.failed === 0) {
        toast.success(`Todos os ${data.summary.sent} informes enviados com sucesso!`);
      } else {
        toast.warning(
          `${data.summary.sent} enviados, ${data.summary.failed} com falha. Verifique a tabela.`
        );
      }
    } catch (err) {
      console.error('[ir-envios] Erro ao enviar:', err);
      toast.error('Erro de conexao ao enviar os documentos.');
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setCsvFile(null);
    setPdfFiles([]);
    setPreview(null);
    setResults([]);
    setSummary(null);
    setPhase('upload');
    if (csvInputRef.current) csvInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
      </>
    );
  }

  if (!canAccess) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="py-8 text-center">
              <XCircle className="mx-auto mb-3 h-10 w-10 text-destructive" />
              <p className="text-lg font-medium">Acesso restrito</p>
              <p className="text-muted-foreground text-sm mt-1">
                Esta pagina e restrita a coordenadores e administradores.
              </p>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Envio de Informes de Rendimentos (IR)</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Faca upload do CSV de destinatarios e dos PDFs. O sistema cruza pelo nome do arquivo e
            envia por e-mail e SMS.
          </p>
        </div>

        {/* ── FASE UPLOAD ─────────────────────────────────────────────────── */}
        {phase === 'upload' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Selecione os arquivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ano de referência */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium w-36 shrink-0">Ano de referencia</label>
                <input
                  type="number"
                  value={anoReferencia}
                  min={2000}
                  max={new Date().getFullYear()}
                  onChange={(e) => setAnoReferencia(Number(e.target.value))}
                  className="border rounded px-3 py-1.5 text-sm w-28"
                />
              </div>

              {/* CSV */}
              <div>
                <p className="text-sm font-medium mb-2">
                  Arquivo CSV{' '}
                  <span className="text-muted-foreground font-normal">
                    (colunas: nome, email, telefone)
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => csvInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar CSV
                  </Button>
                  {csvFile && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {csvFile.name}
                      <button
                        onClick={() => setCsvFile(null)}
                        className="ml-1 text-destructive hover:underline text-xs"
                      >
                        remover
                      </button>
                    </span>
                  )}
                </div>
                <input
                  ref={csvInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleCSVChange}
                />
              </div>

              {/* PDFs — drag & drop */}
              <div>
                <p className="text-sm font-medium mb-2">
                  PDFs dos informes{' '}
                  <span className="text-muted-foreground font-normal">
                    (nome do arquivo = nome do destinatario no CSV)
                  </span>
                </p>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/30 hover:border-muted-foreground/50'
                  }`}
                >
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste os PDFs aqui ou{' '}
                    <button
                      onClick={() => pdfInputRef.current?.click()}
                      className="underline text-primary hover:text-primary/80"
                    >
                      clique para selecionar
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, max 20MB por arquivo</p>
                </div>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  className="hidden"
                  onChange={handlePDFChange}
                />

                {pdfFiles.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {pdfFiles.map((f) => (
                      <li key={f.name} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate flex-1">{f.name}</span>
                        <button
                          onClick={() => removePDF(f.name)}
                          className="text-destructive hover:underline text-xs shrink-0"
                        >
                          remover
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button
                onClick={handlePreview}
                disabled={!csvFile || pdfFiles.length === 0}
                className="w-full sm:w-auto"
              >
                Verificar Correspondencias
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── FASE PREVIEW ────────────────────────────────────────────────── */}
        {phase === 'preview' && preview && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  2. Confirmacao de envio — {preview.matched.length} correspondencia(s) encontrada(s)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {preview.matched.length > 0 && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground text-left">
                          <th className="pb-2 pr-4 font-medium">Nome</th>
                          <th className="pb-2 pr-4 font-medium">E-mail</th>
                          <th className="pb-2 pr-4 font-medium">Telefone</th>
                          <th className="pb-2 font-medium">PDF</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.matched.map((m, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium">{m.csvRow.nome}</td>
                            <td className="py-2 pr-4 text-muted-foreground">{m.csvRow.email}</td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              {m.csvRow.telefone || '—'}
                            </td>
                            <td className="py-2 text-muted-foreground flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {m.pdfFile.name}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {(preview.unmatchedPDFs.length > 0 || preview.unmatchedRecipients.length > 0) && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mb-4 text-sm space-y-2">
                    <div className="flex items-center gap-2 font-medium text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      Sem correspondencia
                    </div>
                    {preview.unmatchedPDFs.length > 0 && (
                      <p className="text-yellow-700">
                        PDFs sem destinatario:{' '}
                        <span className="font-mono">{preview.unmatchedPDFs.join(', ')}</span>
                      </p>
                    )}
                    {preview.unmatchedRecipients.length > 0 && (
                      <p className="text-yellow-700">
                        Destinatarios sem PDF:{' '}
                        {preview.unmatchedRecipients.map((r) => r.nome).join(', ')}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={handleEnviar}
                    disabled={isSending || preview.matched.length === 0}
                    className="gap-2"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar Tudo ({preview.matched.length})
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={handleReset} disabled={isSending}>
                    Voltar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── FASE RESULTS ────────────────────────────────────────────────── */}
        {phase === 'results' && summary && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="outline" className="gap-1 text-sm py-1 px-3">
                Total: {summary.total}
              </Badge>
              <Badge variant="outline" className="gap-1 text-sm py-1 px-3 text-green-700 border-green-300">
                <CheckCircle2 className="h-4 w-4" />
                Enviados: {summary.sent}
              </Badge>
              {summary.failed > 0 && (
                <Badge variant="outline" className="gap-1 text-sm py-1 px-3 text-red-700 border-red-300">
                  <XCircle className="h-4 w-4" />
                  Falhas: {summary.failed}
                </Badge>
              )}
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground text-left">
                        <th className="pb-2 pr-4 font-medium">Nome</th>
                        <th className="pb-2 pr-4 font-medium">PDF</th>
                        <th className="pb-2 pr-4 font-medium text-center">E-mail</th>
                        <th className="pb-2 pr-4 font-medium text-center">SMS</th>
                        <th className="pb-2 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <p className="font-medium">{r.nome}</p>
                            <p className="text-xs text-muted-foreground">{r.email}</p>
                          </td>
                          <td className="py-2 pr-4 text-muted-foreground text-xs">{r.pdfName}</td>
                          <td className="py-2 pr-4 text-center">
                            {r.emailResult.success ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mx-auto" title={r.emailResult.error} />
                            )}
                          </td>
                          <td className="py-2 pr-4 text-center">
                            {r.smsResult === null ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : r.smsResult.success ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500 mx-auto" title={r.smsResult.error} />
                            )}
                          </td>
                          <td className="py-2 text-center">
                            {r.overallSuccess ? (
                              <Badge variant="outline" className="text-green-700 border-green-300">
                                OK
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-red-700 border-red-300">
                                Falha
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Novo Envio
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
