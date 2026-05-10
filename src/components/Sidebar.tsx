'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  AlertTriangle,
  ChefHat,
  Factory,
  Receipt,
  BarChart3,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  criticalStockCount?: number;
}

export default function Sidebar({ isOpen, onClose, criticalStockCount = 0 }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      key: 'nav-dashboard',
      label: 'Ana Sayfa',
      href: '/',
      icon: <LayoutDashboard size={20} />,
    },
    {
      key: 'nav-malzemeler',
      label: 'Malzemeler',
      href: '/stok-y-netimi',
      icon: <Package size={20} />,
    },
    {
      key: 'nav-recete',
      label: 'Tarif & Formülasyon',
      href: '/recete-maliyet',
      icon: <ChefHat size={20} />,
    },
    {
      key: 'nav-uretim',
      label: 'Üretim',
      href: '/uretim',
      icon: <Factory size={20} />,
    },
    {
      key: 'nav-giderler',
      label: 'Giderler',
      href: '/giderler',
      icon: <Receipt size={20} />,
    },
    {
      key: 'nav-kar-paneli',
      label: 'Kâr Paneli',
      href: '/kar-paneli',
      icon: <BarChart3 size={20} />,
    },
    {
      key: 'nav-gelir-gider',
      label: 'Gelir & Gider',
      href: '/gelir-gider-takibi',
      icon: <ArrowLeftRight size={20} />,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/40 z-40 lg:hidden modal-backdrop"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          'fixed top-0 left-0 h-full z-50 flex flex-col bg-card border-r border-border sidebar-transition',
          'shadow-lg',
          // Mobile: slide in/out
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Desktop: collapsed/expanded
          collapsed ? 'lg:w-16' : 'lg:w-60',
          'w-60',
        ].join(' ')}
      >
        {/* Header */}
        <div className={[
          'flex items-center border-b border-border py-4 shrink-0',
          collapsed ? 'lg:justify-center lg:px-0 px-4' : 'px-4',
        ].join(' ')}>
          <div className={['flex items-center gap-2', collapsed ? 'lg:justify-center' : ''].join(' ')}>
            <AppLogo size={36} />
            <span className={[
              'font-bold text-base text-foreground leading-tight sidebar-transition overflow-hidden whitespace-nowrap',
              collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100',
            ].join(' ')}>
              Antalya Fırın
            </span>
          </div>
          {/* Mobile close */}
          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150 lg:hidden"
            aria-label="Menüyü kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
          <div className="mb-1">
            {!collapsed && (
              <p className="px-3 mb-2 text-xs font-600 uppercase tracking-widest text-muted-foreground">
                Menü
              </p>
            )}
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={[
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative group',
                      isActive(item.href)
                        ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    ].join(' ')}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className={[
                      'sidebar-transition overflow-hidden whitespace-nowrap',
                      collapsed ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100',
                    ].join(' ')}>
                      {item.label}
                    </span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={[
                        'ml-auto shrink-0 flex items-center justify-center rounded-full text-xs font-700 bg-critical text-white min-w-[20px] h-5 px-1',
                        collapsed ? 'lg:absolute lg:-top-1 lg:-right-1 lg:ml-0' : '',
                      ].join(' ')}>
                        {item.badge}
                      </span>
                    )}
                    {/* Tooltip on collapsed */}
                    {collapsed && (
                      <span className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats summary */}
          {!collapsed && (
            <div className="mt-6 mx-1 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs font-600 text-primary">Bugün</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Günlük kâr takibi için Ana Sayfa&apos;yı ziyaret edin.
              </p>
            </div>
          )}

          {criticalStockCount > 0 && !collapsed && (
            <div className="mt-3 mx-1 p-3 rounded-xl bg-critical-subtle border border-critical/20">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-critical" />
                <span className="text-xs font-600 text-critical">{criticalStockCount} kritik stok</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Stok Yönetimi&apos;nde kontrol edin.
              </p>
            </div>
          )}
        </nav>

        {/* Footer — collapse toggle (desktop only) */}
        <div className="hidden lg:flex border-t border-border p-2 shrink-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-150 text-sm"
            aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
          >
            {collapsed ? <ChevronRight size={16} /> : (
              <>
                <ChevronLeft size={16} />
                <span className="text-xs font-500">Daralt</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div className={[
        'hidden lg:block shrink-0 sidebar-transition',
        collapsed ? 'w-16' : 'w-60',
      ].join(' ')} />
    </>
  );
}