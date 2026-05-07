import React from 'react';
import AppLayout from '@/components/AppLayout';
import StokContent from './components/StokContent';

export default function StokPage() {
  return (
    <AppLayout
      pageTitle="Stok Yönetimi"
      pageSubtitle="Malzeme stok takibi ve otomatik gider kaydı"
    >
      <StokContent />
    </AppLayout>
  );
}