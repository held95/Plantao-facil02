import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { requireCoordinator, documentStorage } from '@plantao/backend';
import { awsSesService, twilioSmsService, getIRDocumentoMessage } from '@plantao/notifications';

export const runtime = 'nodejs';
export const maxDuration = 30;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CSVRow {
  nome: string;
  email: string;
  telefone: string;
}

interface MatchedRecipient {
  csvRow: CSVRow;
  pdfBuffer: Buffer;
  pdfName: string;
}

export interface IREnvioResult {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s_\-]+/g, '');
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function parseCSV(text: string): CSVRow[] {
  const clean = text.replace(/^\uFEFF/, ''); // strip BOM
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

function matchRecipients(
  csvRows: CSVRow[],
  pdfFiles: { name: string; buffer: Buffer }[]
): {
  matched: MatchedRecipient[];
  unmatchedPDFs: string[];
  unmatchedRecipients: CSVRow[];
} {
  const matched: MatchedRecipient[] = [];
  const usedCsvIndexes = new Set<number>();
  const unmatchedPDFs: string[] = [];

  for (const pdf of pdfFiles) {
    const pdfBaseName = pdf.name.replace(/\.pdf$/i, '');
    const normalizedPdf = normalizeName(pdfBaseName);

    const csvIdx = csvRows.findIndex(
      (row, i) => !usedCsvIndexes.has(i) && normalizeName(row.nome) === normalizedPdf
    );

    if (csvIdx >= 0) {
      matched.push({ csvRow: csvRows[csvIdx], pdfBuffer: pdf.buffer, pdfName: pdf.name });
      usedCsvIndexes.add(csvIdx);
    } else {
      unmatchedPDFs.push(pdf.name);
    }
  }

  const unmatchedRecipients = csvRows.filter((_, i) => !usedCsvIndexes.has(i));

  return { matched, unmatchedPDFs, unmatchedRecipients };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { error } = await requireCoordinator();
  if (error) return error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Falha ao processar FormData.' }, { status: 400 });
  }

  const csvFile = formData.get('csv') as File | null;
  const pdfFiles = formData.getAll('pdfs') as File[];
  const anoReferenciaRaw = formData.get('anoReferencia');
  const anoReferencia = anoReferenciaRaw ? Number(anoReferenciaRaw) : new Date().getFullYear() - 1;

  // ── Validations ──────────────────────────────────────────────────────────────

  if (!csvFile || csvFile.size === 0) {
    return NextResponse.json({ error: 'Arquivo CSV e obrigatorio.' }, { status: 400 });
  }

  if (pdfFiles.length === 0) {
    return NextResponse.json({ error: 'Ao menos 1 arquivo PDF e obrigatorio.' }, { status: 400 });
  }

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
  for (const pdf of pdfFiles) {
    if (pdf.type !== 'application/pdf') {
      return NextResponse.json(
        { error: `Arquivo "${pdf.name}" nao e um PDF valido.` },
        { status: 400 }
      );
    }
    if (pdf.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo "${pdf.name}" excede o limite de 20MB.` },
        { status: 400 }
      );
    }
  }

  // ── Parse ─────────────────────────────────────────────────────────────────────

  const csvText = await csvFile.text();
  const csvRows = parseCSV(csvText);

  if (csvRows.length === 0) {
    return NextResponse.json(
      { error: 'CSV invalido ou sem linhas de dados. Verifique as colunas nome, email e telefone.' },
      { status: 400 }
    );
  }

  const pdfBuffers = await Promise.all(
    pdfFiles.map(async (f) => ({
      name: f.name,
      buffer: Buffer.from(await f.arrayBuffer()),
    }))
  );

  const { matched, unmatchedPDFs, unmatchedRecipients } = matchRecipients(csvRows, pdfBuffers);

  if (matched.length === 0) {
    return NextResponse.json(
      {
        error: 'Nenhum PDF correspondeu a um destinatario no CSV. Verifique os nomes dos arquivos.',
        unmatchedPDFs,
        unmatchedRecipients,
      },
      { status: 400 }
    );
  }

  // ── Dispatch ──────────────────────────────────────────────────────────────────

  const results = await Promise.all(
    matched.map(async ({ csvRow, pdfBuffer, pdfName }): Promise<IREnvioResult> => {
      const safeFileName = sanitizeFileName(csvRow.nome);
      const s3Key = `ir-documentos/${anoReferencia}/${randomUUID()}-${safeFileName}.pdf`;

      await documentStorage.uploadBuffer(s3Key, pdfBuffer, 'application/pdf');
      const downloadUrl = await documentStorage.getPresignedDownloadUrl(s3Key, 604800);

      const effectiveUrl = downloadUrl ?? '#';

      const [emailSettled, smsSettled] = await Promise.allSettled([
        awsSesService.sendIRDocumentoEmail(
          csvRow.email,
          csvRow.nome,
          effectiveUrl,
          anoReferencia
        ),
        csvRow.telefone
          ? twilioSmsService.sendCustomSMS(
              csvRow.telefone,
              getIRDocumentoMessage({
                recipientNome: csvRow.nome,
                downloadUrl: effectiveUrl,
                anoReferencia,
              }).body
            )
          : Promise.resolve(null),
      ]);

      const emailResult =
        emailSettled.status === 'fulfilled'
          ? emailSettled.value
          : { success: false, error: (emailSettled.reason as Error)?.message ?? 'unknown' };

      const smsResult =
        smsSettled.status === 'fulfilled'
          ? smsSettled.value
          : { success: false, error: (smsSettled.reason as Error)?.message ?? 'unknown' };

      return {
        nome: csvRow.nome,
        email: csvRow.email,
        telefone: csvRow.telefone,
        pdfName,
        s3Key,
        downloadUrl,
        emailResult,
        smsResult,
        overallSuccess: emailResult.success,
      };
    })
  );

  const sent = results.filter((r) => r.overallSuccess).length;
  const failed = results.length - sent;

  return NextResponse.json({
    results,
    summary: { total: results.length, sent, failed },
    unmatchedPDFs,
    unmatchedRecipients,
  });
}
