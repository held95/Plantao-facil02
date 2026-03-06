import { NextRequest, NextResponse } from 'next/server';
import { awsSesService } from '@plantao/notifications';
import type { Plantao } from '@plantao/shared';

// GET /api/test/send-email - Test email sending (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email parameter is required. Example: ?email=test@example.com' },
      { status: 400 }
    );
  }

  if (!type || !['plantao_criado', 'inscricao'].includes(type)) {
    return NextResponse.json(
      {
        error:
          'Type parameter is required. Must be "plantao_criado" or "inscricao". Example: ?type=plantao_criado&email=test@example.com',
      },
      { status: 400 }
    );
  }

  const mockPlantao: Plantao = {
    id: 'test-plantao-123',
    hospital: 'Hospital São Lucas',
    especialidade: 'Cardiologia',
    data: new Date('2026-02-20T08:00:00').toISOString(),
    horarioInicio: '08:00',
    horarioFim: '18:00',
    valor: 1500.0,
    status: 'disponivel',
    descricao:
      'Plantão de cardiologia no pronto-socorro. Atendimento de emergências cardiovasculares.',
    requisitos: [
      'RQE em Cardiologia',
      'Experiência mínima de 2 anos em emergências',
      'Disponibilidade para plantão de 12 horas',
    ],
    vagasDisponiveis: 2,
    vagasTotal: 3,
    cidade: 'São Paulo',
    estado: 'SP',
  };

  try {
    let result;

    if (type === 'plantao_criado') {
      result = await awsSesService.sendPlantaoCriadoEmail(
        email,
        'Coordenador Teste',
        mockPlantao
      );
    } else {
      result = await awsSesService.sendInscricaoConfirmadaEmail(
        email,
        'Dr. João Silva',
        mockPlantao
      );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${email}`,
        messageId: result.messageId,
        type,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: 'Failed to send test email',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Unexpected error sending test email',
      },
      { status: 500 }
    );
  }
}
