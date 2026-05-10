import React from 'react';
import AppLayout from '@/components/AppLayout';
import MalzemeContent from './components/MalzemeContent';

export default function StokPage() {
  return (
    <AppLayout
      pageTitle="Malzemeler"
      pageSubtitle="Toplu alım ve birim envanter yönetimi"
    >
      <MalzemeContent />
    </AppLayout>
  );
}