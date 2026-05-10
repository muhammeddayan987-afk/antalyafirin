import React from 'react';
import AppLayout from '@/components/AppLayout';
import GiderlerContent from './components/GiderlerContent';

export default function GiderlerPage() {
  return (
    <AppLayout
      pageTitle="Giderler"
      pageSubtitle="Sabit ve değişken maliyet takibi"
    >
      <GiderlerContent />
    </AppLayout>
  );
}
