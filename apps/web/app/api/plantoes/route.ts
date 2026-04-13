import { NextRequest, NextResponse } from 'next/server';
import { auth, authUserRepository, plantaoRepository } from '@plantao/backend';
import type { Plantao } from '@plantao/shared';
import {
  validatePlantaoForm,
  formatPlantaoForSubmission,
} from '@plantao/shared';
import { dispatchPlantaoCreated } from '@plantao/notifications';
import type { NotificationRecipient } from '@plantao/notifications';

type NotificationChannels = 'sms' | 'email' | 'ambos';

async function geocode(cep: string | undefined, cidade: string, estado: string): Promise<{ latitude?: number; longitude?: number }> {
  const headers = { 'User-Agent': 'PlantaoFacil/1.0 (contato@plantaofacil.com.br)' };

  try {
    const digits = cep?.replace(/\D/g, '') ?? '';

    // Tenta primeiro pelo CEP (postalcode)
    if (digits.length === 8) {
      const cepUrl = `https://nominatim.openstreetmap.org/search?postalcode=${digits}&country=BR&format=json&limit=1`;
      const res = await fetch(cepUrl, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data[0]) {
          return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
        }
      }
    }

    // Fallback: busca por cidade + estado (CEPs brasileiros raramente estão indexados no Nominatim)
    const cityUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${cidade}, ${estado}, Brasil`)}&format=json&limit=1`;
    const fallbackRes = await fetch(cityUrl, { headers });
    if (!fallbackRes.ok) return {};
    const fallbackData = await fallbackRes.json();
    if (fallbackData[0]) {
      return { latitude: parseFloat(fallbackData[0].lat), longitude: parseFloat(fallbackData[0].lon) };
    }
  } catch {
    // silent fail — não bloqueia a criação do plantão
  }
  return {};
}

async function buildRecipients(channel: NotificationChannels): Promise<NotificationRecipient[]> {
  const users = await authUserRepository.listAllActiveUsers();
  return users.map((u) => ({
    userId: u.id,
    nome: u.nome,
    email: u.email,
    phone: u.telefone,
    pushTokens: [],
    smsEnabled: channel === 'sms' || channel === 'ambos',
    emailEnabled: channel === 'email' || channel === 'ambos',
    pushEnabled: false,
  }));
}

// GET /api/plantoes - Get all plantões
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const plantoes = await plantaoRepository.listPlantoes();
    return NextResponse.json({ plantoes });
  } catch (error) {
    console.error('Error fetching plantões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar plantões' },
      { status: 500 }
    );
  }
}

// POST /api/plantoes - Create new plantão
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (session.user?.role !== 'coordenador' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas coordenadores podem criar plantões' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const channel: NotificationChannels = body.notificationChannels ?? 'ambos';

    const errors = validatePlantaoForm(body);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Dados inválidos', validationErrors: errors },
        { status: 400 }
      );
    }

    const plantaoData = formatPlantaoForSubmission(body);
    const coords = await geocode(plantaoData.cep, plantaoData.cidade, plantaoData.estado);

    const newPlantao: Plantao = {
      id: `plantao-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...plantaoData,
      ...coords,
      criadoPor: session.user?.id,
    };

    // Persist to database
    await plantaoRepository.createPlantao(newPlantao);

    // Dispatch notifications via orchestrator (SMS + email + push)
    try {
      const recipients = await buildRecipients(channel);
      const logs = await dispatchPlantaoCreated(newPlantao, recipients);
      const failed = logs.filter((l) => l.status === 'failed');
      if (failed.length > 0) {
        console.warn(`[plantoes/route] ${failed.length} notification(s) failed`);
      }
    } catch (err) {
      console.error('[plantoes/route] Erro ao despachar notificações:', err);
    }

    return NextResponse.json(
      {
        success: true,
        plantao: newPlantao,
        message: 'Plantão criado com sucesso!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating plantão:', error);
    return NextResponse.json(
      { error: 'Erro ao criar plantão' },
      { status: 500 }
    );
  }
}
