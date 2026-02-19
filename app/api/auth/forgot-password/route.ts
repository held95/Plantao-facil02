import { NextRequest, NextResponse } from 'next/server';
import { authUserRepository } from '@/lib/aws/dynamo/authRepository';
import { awsSesService } from '@/lib/email/awsSesService';

const GENERIC_MESSAGE =
  'Se a conta existir e estiver aprovada, enviaremos um email para redefinir a senha.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const user = await authUserRepository.findByEmail(email);
    if (!user || user.status !== 'aprovado') {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const ttlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || '60');
    const token = await authUserRepository.createPasswordResetToken({
      userId: user.id,
      ttlMinutes: Number.isFinite(ttlMinutes) ? ttlMinutes : 60,
    });

    const baseUrl =
      process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

    const emailResult = await awsSesService.sendResetSenhaEmail(email, resetUrl);
    if (!emailResult.success) {
      console.warn('[forgot-password] Could not send reset email:', emailResult.error);
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Erro em forgot-password:', error);
    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  }
}

