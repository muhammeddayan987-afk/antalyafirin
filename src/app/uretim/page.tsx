import React from 'react';
import AppLayout from '@/components/AppLayout';
import UretimContent from './components/UretimContent';

export default function UretimPage() {
  return (
    <AppLayout
      pageTitle="Üretim"
      pageSubtitle="Parti üretimi, birim maliyet hesabı ve otomatik gider kaydı"
    >
      <UretimContent />
    </AppLayout>
  );
}
