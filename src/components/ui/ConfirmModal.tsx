'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Onayla',
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop"
      style={{ backgroundColor: 'rgba(28, 10, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-md modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={[
              'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
              isDestructive ? 'bg-critical-subtle' : 'bg-warning-subtle',
            ].join(' ')}>
              <AlertTriangle
                size={20}
                className={isDestructive ? 'text-critical' : 'text-warning'}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                id="confirm-modal-title"
                className="text-base font-700 text-foreground mb-1"
              >
                {title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-all duration-150"
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-600 text-muted-foreground hover:bg-muted transition-all duration-150 active:scale-95"
          >
            İptal
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={[
              'px-4 py-2 rounded-lg text-sm font-700 text-white transition-all duration-150 active:scale-95',
              isDestructive
                ? 'bg-critical hover:bg-critical/90' :'bg-primary hover:bg-primary/90',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}