import React from 'react';

type BadgeVariant = 'gelir' | 'gider' | 'normal' | 'uyari' | 'kritik' | 'tukendi' | 'default';

interface StatusBadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  gelir: 'bg-gelir-subtle text-gelir border-gelir/20',
  gider: 'bg-gider-subtle text-gider border-gider/20',
  normal: 'bg-normal-subtle text-gelir border-gelir/20',
  uyari: 'bg-warning-subtle text-warning border-warning/20',
  kritik: 'bg-critical-subtle text-critical border-critical/20',
  tukendi: 'bg-foreground/10 text-foreground/60 border-foreground/10',
  default: 'bg-muted text-muted-foreground border-border',
};

export default function StatusBadge({ variant, label, size = 'md' }: StatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-600 border rounded-full',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1',
        variantStyles[variant],
      ].join(' ')}
    >
      {label}
    </span>
  );
}