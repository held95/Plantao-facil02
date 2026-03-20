'use client';

import Link from 'next/link';

export interface ConsentValues {
  emailOptIn: boolean;
  smsOptIn: boolean;
  pushOptIn: boolean;
  privacyAccepted: boolean;
}

interface ConsentCheckboxesProps {
  value: ConsentValues;
  onChange: (value: ConsentValues) => void;
}

export function ConsentCheckboxes({ value, onChange }: ConsentCheckboxesProps) {
  const set = (field: keyof ConsentValues, checked: boolean) => {
    onChange({ ...value, [field]: checked });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700 mb-2">Preferencias de comunicacao</p>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={value.emailOptIn}
          onChange={(e) => set('emailOptIn', e.target.checked)}
        />
        <span className="text-sm text-gray-600">
          Aceito receber notificacoes por <strong>e-mail</strong> sobre novos plantoes e documentos.
        </span>
      </label>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={value.smsOptIn}
          onChange={(e) => set('smsOptIn', e.target.checked)}
        />
        <span className="text-sm text-gray-600">
          Aceito receber notificacoes por <strong>SMS</strong> sobre novos plantoes e lembretes.
        </span>
      </label>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={value.pushOptIn}
          onChange={(e) => set('pushOptIn', e.target.checked)}
        />
        <span className="text-sm text-gray-600">
          Aceito receber <strong>notificacoes push</strong> no dispositivo movel.
        </span>
      </label>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          required
          checked={value.privacyAccepted}
          onChange={(e) => set('privacyAccepted', e.target.checked)}
        />
        <span className="text-sm text-gray-600">
          Li e aceito a{' '}
          <Link href="/privacidade" target="_blank" className="text-blue-600 underline hover:text-blue-800">
            Politica de Privacidade
          </Link>{' '}
          e o tratamento dos meus dados conforme a LGPD.{' '}
          <span className="text-red-500">*</span>
        </span>
      </label>
    </div>
  );
}
