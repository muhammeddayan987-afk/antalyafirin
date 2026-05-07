import React from 'react';
import AppLayout from '@/components/AppLayout';
import GelirGiderContent from './components/GelirGiderContent';

export default function GelirGiderPage() {
  return (
    <AppLayout
      pageTitle="Gelir & Gider Takibi"
      pageSubtitle="Tüm gelir ve gider kayıtlarını yönetin"
    >
      <GelirGiderContent />
    </AppLayout>
  );
}