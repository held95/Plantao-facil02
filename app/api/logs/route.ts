import { NextRequest, NextResponse } from 'next/server';
import { requireCoordinator } from '@/lib/api/routeGuards';
import { mockActivityLogs, mockActivityStats } from '@/lib/data/mockLogs';

/**
 * GET /api/logs - Get activity logs
 *
 * Protected endpoint - Only coordinators and admins can access
 * Returns activity logs with optional filtering
 *
 * Query parameters:
 * - tipo: Filter by activity type (usuario_login, plantao_criado, etc.)
 * - usuarioId: Filter by user ID
 * - limit: Limit number of results (default: 50)
 * - offset: Pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    // Check authorization - only coordinators and admins
    const { session, error } = await requireCoordinator();
    if (error) return error;

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get('tipo');
    const usuarioId = searchParams.get('usuarioId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter logs based on query parameters
    let filteredLogs = [...mockActivityLogs];

    if (tipo && tipo !== 'todos') {
      filteredLogs = filteredLogs.filter(log => log.tipo === tipo);
    }

    if (usuarioId) {
      filteredLogs = filteredLogs.filter(log => log.usuarioId === usuarioId);
    }

    // Apply pagination
    const paginatedLogs = filteredLogs.slice(offset, offset + limit);

    // Return logs with metadata
    return NextResponse.json({
      logs: paginatedLogs,
      stats: mockActivityStats,
      pagination: {
        total: filteredLogs.length,
        limit,
        offset,
        hasMore: offset + limit < filteredLogs.length,
      },
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar logs de atividade' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/logs - Create new activity log
 *
 * Protected endpoint - Coordinators and admins only
 * Used to manually log important system events
 *
 * In a production environment, most logs would be created
 * automatically by the system, but this endpoint allows
 * manual logging when needed.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const { session, error } = await requireCoordinator();
    if (error) return error;

    const body = await request.json();

    // Validate required fields
    if (!body.tipo || !body.descricao) {
      return NextResponse.json(
        { error: 'Tipo e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // In production, this would save to database
    // For now, just return success
    const newLog = {
      id: `log-${Date.now()}`,
      tipo: body.tipo,
      usuarioId: session.user.id,
      usuarioNome: session.user.name,
      usuarioEmail: session.user.email,
      descricao: body.descricao,
      timestamp: new Date().toISOString(),
      pagina: body.pagina || 'Unknown',
      ...body,
    };

    console.log('📝 New log created:', newLog);

    return NextResponse.json(
      {
        success: true,
        log: newLog,
        message: 'Log criado com sucesso',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { error: 'Erro ao criar log' },
      { status: 500 }
    );
  }
}
