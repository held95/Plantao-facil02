import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { mockPlantoes } from '@/lib/data/mockPlantoes';
import { awsSesService } from '@/lib/email/awsSesService';
import { awsSnsService } from '@/lib/sms/awsSnsService';

// POST /api/plantoes/[id]/inscricao - Register for a plantão
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    // Check authentication
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check role - only doctors can register for plantões
    if (session.user?.role !== 'medico') {
      return NextResponse.json(
        { error: 'Apenas médicos podem se inscrever em plantões' },
        { status: 403 }
      );
    }

    const { id: plantaoId } = await params;

    // Find plantão (in production, fetch from database)
    // For now, check mock data
    const plantao = mockPlantoes.find((p) => p.id === plantaoId);

    if (!plantao) {
      return NextResponse.json(
        { error: 'Plantão não encontrado' },
        { status: 404 }
      );
    }

    // Check availability
    if (plantao.status !== 'disponivel') {
      return NextResponse.json(
        { error: 'Este plantão não está disponível' },
        { status: 400 }
      );
    }

    if (plantao.vagasDisponiveis <= 0) {
      return NextResponse.json(
        { error: 'Não há vagas disponíveis para este plantão' },
        { status: 400 }
      );
    }

    // In production:
    // - Check if doctor already registered
    // - Save inscription to database
    // - Update vagasDisponiveis
    // - Create notification

    // Send notifications (email and SMS) to doctor via AWS
    if (session.user?.email && session.user?.name) {
      // Send email notification via AWS SES
      awsSesService
        .sendInscricaoConfirmadaEmail(
          session.user.email,
          session.user.name,
          plantao
        )
        .then((result) => {
          if (result.success) {
            console.log('✅ Email sent via AWS SES:', result.messageId);
          } else {
            console.error('❌ Failed to send email:', result.error);
          }
        })
        .catch((error) => {
          console.error('❌ Email send error:', error);
        });

      // Send SMS notification via AWS SNS (if phone number is available)
      const medicoPhone = (session.user as any).telefone;
      if (medicoPhone) {
        awsSnsService
          .sendInscricaoConfirmadaSMS(
            medicoPhone,
            session.user.name,
            plantao
          )
          .then((result) => {
            if (result.success) {
              console.log('✅ SMS sent via AWS SNS:', result.messageId);
            } else {
              console.error('❌ Failed to send SMS:', result.error);
            }
          })
          .catch((error) => {
            console.error('❌ SMS send error:', error);
          });
      } else {
        console.warn('⚠️ Doctor phone number not available for SMS');
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Inscrição realizada com sucesso!',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating inscription:', error);
    return NextResponse.json(
      { error: 'Erro ao realizar inscrição' },
      { status: 500 }
    );
  }
}
