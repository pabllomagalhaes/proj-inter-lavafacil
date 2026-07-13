/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Check, Trash2, X, AlertTriangle, MessageSquare, Info } from 'lucide-react';
import { InternalNotification } from '../types';

interface AdminNotificationsPanelProps {
  notifications: InternalNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function AdminNotificationsPanel({
  notifications,
  onMarkAllRead,
  onClearAll,
  onClose
}: AdminNotificationsPanelProps) {
  
  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
        return (
          <div className="bg-green-100 text-green-700 p-2 rounded-xl">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
        );
      case 'cancelled_booking':
        return (
          <div className="bg-red-100 text-red-700 p-2 rounded-xl">
            <X className="w-4 h-4 stroke-[3]" />
          </div>
        );
      case 'completed_booking':
        return (
          <div className="bg-blue-100 text-blue-700 p-2 rounded-xl">
            <Info className="w-4 h-4" />
          </div>
        );
      case 'system':
      default:
        return (
          <div className="bg-amber-100 text-amber-700 p-2 rounded-xl">
            <AlertTriangle className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-150 rounded-2xl shadow-xl z-50 overflow-hidden fade-in">
      
      {/* HEADER */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-gray-900">
          <Bell className="w-4 h-4 text-blue-600" />
          <span className="font-extrabold text-sm">Notificações Administrativas</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200/50 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* CONTENT LIST */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-semibold">Tudo calmo por aqui!</p>
            <p className="text-[10px] mt-0.5">Novos agendamentos e cancelamentos aparecerão nesta aba.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 flex gap-3 items-start transition-colors ${
                n.read ? 'bg-white opacity-70' : 'bg-blue-50/20'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
              <div className="space-y-1 flex-1">
                <p className="text-xs text-gray-800 font-semibold leading-relaxed">{n.message}</p>
                <div className="text-[9px] text-gray-400 font-bold">{formatDate(n.timestamp)}</div>
              </div>
              {!n.read && (
                <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
              )}
            </div>
          ))
        )}
      </div>

      {/* FOOTER ACTIONS */}
      {notifications.length > 0 && (
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold">
          <button
            onClick={onMarkAllRead}
            className="text-blue-600 hover:text-blue-800 uppercase tracking-wider cursor-pointer"
          >
            Marcar todas como lidas
          </button>
          <button
            onClick={onClearAll}
            className="text-red-500 hover:text-red-700 flex items-center gap-1 uppercase tracking-wider cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar tudo
          </button>
        </div>
      )}

    </div>
  );
}
