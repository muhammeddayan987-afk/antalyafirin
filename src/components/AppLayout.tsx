'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Menu, Bell, Search } from 'lucide-react';
import { getStockItems, getStockStatus } from '@/lib/storage';
import { Toaster } from 'sonner';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  pageSubtitle?: string;
}

export default function AppLayout({ children, pageTitle, pageSubtitle }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [criticalCount, setCriticalCount] = useState(0);

  useEffect(() => {
    const items = getStockItems();
    const critical = items.filter(i => {
      const status = getStockStatus(i);
      return status === 'kritik' || status === 'tukendi';
    }).length;
    setCriticalCount(critical);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        criticalStockCount={criticalCount}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 lg:px-6 h-14 flex items-center gap-3 shrink-0 shadow-sm">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 active:scale-95"
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <div className="flex-1 min-w-0">
            {pageTitle && (
              <div>
                <h1 className="text-base font-700 text-foreground truncate">{pageTitle}</h1>
                {pageSubtitle && (
                  <p className="text-xs text-muted-foreground truncate">{pageSubtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 hidden sm:flex"
              aria-label="Ara"
            >
              <Search size={18} />
            </button>
            <button
              className="relative p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
              aria-label="Bildirimler"
            >
              <Bell size={18} />
              {criticalCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-critical rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-6 xl:px-8 2xl:px-10 py-6">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
          },
        }}
      />
    </div>
  );
}