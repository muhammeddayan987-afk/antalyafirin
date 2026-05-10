import React from 'react';
import AppLayout from '@/components/AppLayout';
import KarPanelContent from './components/KarPanelContent';

export default function KarPanelPage() {
  return (
    <AppLayout
      pageTitle="Kâr Gösterge Paneli"
      pageSubtitle="Birim maliyet analizi, başabaş noktası ve aylık kâr/zarar"
    >
      <KarPanelContent />
    </AppLayout>
  );
}
