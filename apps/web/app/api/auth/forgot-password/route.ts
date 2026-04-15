import { NextRequest, NextResponse } from 'next/server';
import { authUserRepository } from '@plantao/backend';
import { awsSesService } from '@plantao/notifications';
import { forgotPasswordLimiter } from '@/lib/rateLimit';

const GENERIC_MESSAGE =
  'Se a conta existir e estiver aprovada, enviaremos um email para redefinir a senha.';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body?.email || '').trim().toLowerCase();

    try {
      const { success } = await forgotPasswordLimiter.limit(email || 'unknown');
      if (!success) {
        // Retorna mensagem genérica — não revela que limite foi atingido
        return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
      }
    } catch (rateLimitError) {
      // Redis pode não estar configurado — continua sem rate limiting
      console.warn('[forgot-password] Rate limit check failed (Redis may not be configured):', rateLimitError instanceof Error ? rateLimitError.message : rateLimitError);
    }

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

    const ttlForEmail = Number.isFinite(ttlMinutes) ? ttlMinutes : 60;
    const emailResult = await awsSesService.sendResetSenhaEmail(email, resetUrl, ttlForEmail);
    if (!emailResult.success) {
      console.warn('[forgot-password] Could not send reset email:', emailResult.error);
      console.warn('[forgot-password] Reset URL (copie para testar manualmente):', resetUrl);
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Erro em forgot-password:', error);
    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  }
}

