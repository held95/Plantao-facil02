import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ActivityLog } from '@/types/log';
import { getActivityTypeLabel, getActivityTypeBadgeVariant } from '@/lib/data/mockLogs';

export interface ActivityEntryProps {
  activity: ActivityLog;
}

export function ActivityEntry({ activity }: ActivityEntryProps) {
  const formattedDate = format(
    new Date(activity.timestamp),
    "dd/MM/yyyy 'às' HH:mm",
    { locale: ptBR }
  );

  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Activity Type Badge */}
      <div className="flex-shrink-0">
        <Badge variant={getActivityTypeBadgeVariant(activity.tipo)}>
          {getActivityTypeLabel(activity.tipo)}
        </Badge>
      </div>

      {/* Activity Details */}
      <div className="flex-1 min-w-0">
        {/* User Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {activity.usuarioNome}
          </span>
          <span className="text-gray-600">
            ({activity.usuarioEmail})
          </span>
        </div>

        {/* Timestamp and Page */}
        <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          {activity.pagina && (
            <span className="flex items-center gap-1">
              <span>📄</span>
              <span>{activity.pagina}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
