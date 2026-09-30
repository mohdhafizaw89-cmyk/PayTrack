import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        let bg = 'bg-[#1b2b3f] text-[#d3e4fe] border border-[#334155]';
        let Icon = Info;

        if (toast.type === 'success') {
          bg = 'bg-emerald-800 text-white border border-emerald-600 shadow-lg';
          Icon = CheckCircle2;
        } else if (toast.type === 'urgent') {
          bg = 'bg-amber-800 text-amber-100 border border-amber-500 shadow-lg';
          Icon = AlertTriangle;
        } else if (toast.type === 'warning' || toast.type === 'error') {
          bg = 'bg-[#93000a] text-[#ffdad6] border border-red-500/50 shadow-lg';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-xl font-medium text-xs pointer-events-auto transition-all transform duration-300 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="p-1 hover:opacity-75 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
