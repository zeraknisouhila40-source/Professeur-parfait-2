'use client';
import { useTranslation } from '@/hooks/use-translation';

export function PdfHeader({ id }: { id: string }) {
  const { t } = useTranslation();
  return (
    <div id={id} className="p-4 bg-white text-black">
      <div className="text-center text-sm font-semibold">
        <p>{t('pdf.header.line1')}</p>
        <p>{t('pdf.header.line2')}</p>
      </div>
    </div>
  );
}
