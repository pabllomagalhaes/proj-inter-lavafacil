/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, User, Key, Info } from 'lucide-react';

interface QuickAuthBannerProps {
  onQuickLogin: (role: 'administrador' | 'cliente') => void;
}

export default function QuickAuthBanner({ onQuickLogin }: QuickAuthBannerProps) {
  return (
    <div className="bg-blue-50/80 border border-blue-200/50 rounded-2xl p-5 shadow-xs space-y-3.5 max-w-md w-full mb-6 text-sm">
      <div className="flex items-start gap-2 text-blue-800">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <p className="font-extrabold text-blue-900 leading-tight">Painel de Acesso Rápido (Demonstração)</p>
          <p className="text-xs text-blue-700 font-semibold leading-relaxed">
            Clique em um dos botões abaixo para entrar instantaneamente no perfil desejado, sem precisar digitar credenciais:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Admin login */}
        <button
          onClick={() => onQuickLogin('administrador')}
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          Perfil Admin
        </button>

        {/* Client login */}
        <button
          onClick={() => onQuickLogin('cliente')}
          className="flex items-center justify-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <User className="w-4 h-4 text-blue-100" />
          Perfil Cliente
        </button>
      </div>
    </div>
  );
}
