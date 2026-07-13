/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800'
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <CheckCircle className="w-5 h-5 text-blue-500" />, // simple check/info
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm fade-in ${bgColors[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium pr-4 leading-snug">{message}</p>
      <button 
        onClick={onClose} 
        className="ml-auto text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-200/50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
