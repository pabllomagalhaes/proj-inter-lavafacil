/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, Search, ShieldAlert, ShoppingBag, DollarSign, Calendar, 
  ChevronDown, ChevronUp, Check, XCircle, Phone, Mail, Edit, Save 
} from 'lucide-react';
import { User, Booking } from '../types';

interface AdminClientesProps {
  users: User[];
  bookings: Booking[];
  onUpdateUser: (user: User) => void;
}

export default function AdminClientes({ users, bookings, onUpdateUser }: AdminClientesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [clientToToggle, setClientToToggle] = useState<User | null>(null);

  // Filter out non-customers (Administrators)
  const customers = users.filter(u => u.role === 'cliente');

  // Search filter
  const filteredCustomers = customers.filter(c => {
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  // Calculate client statistics: completed count and total spend
  const getClientStats = (customerId: string) => {
    const clientBookings = bookings.filter(b => b.customerId === customerId);
    const completed = clientBookings.filter(b => b.status === 'completed');
    const totalSpent = completed.reduce((sum, b) => sum + b.price, 0);
    const frequency = completed.length; // Loyalty metric: higher completed, more loyal

    return {
      totalBookings: clientBookings.length,
      completedCount: frequency,
      totalSpent,
      bookingsList: clientBookings.sort((a, b) => b.date.localeCompare(a.date))
    };
  };

  const toggleExpandClient = (clientId: string) => {
    setExpandedClientId(expandedClientId === clientId ? null : clientId);
  };

  const handleToggleBlock = (client: User) => {
    setClientToToggle(client);
  };

  const getLoyaltyBadge = (completedCount: number) => {
    if (completedCount >= 5) {
      return <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">Diamante (Frequente)</span>;
    } else if (completedCount >= 2) {
      return <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full uppercase">Bronze (Fiel)</span>;
    } else {
      return <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">Comum</span>;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Diretório de Clientes</h1>
          <p className="text-gray-500 mt-1">Gerencie a carteira de clientes, bloqueios de segurança e acompanhe o histórico de faturamento individual.</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar cliente por nome completo, e-mail ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none text-sm font-semibold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* CUSTOMERS LIST BOARD */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Nenhum cliente correspondente</p>
              <p className="text-gray-500 text-sm">Tente reescrever o nome ou pesquise por DDD/Telefone completo.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredCustomers.map((c) => {
              const stats = getClientStats(c.id);
              const isExpanded = expandedClientId === c.id;

              return (
                <div key={c.id} className="transition-all hover:bg-gray-50/20">
                  
                  {/* CLIENT row CARD */}
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-extrabold text-gray-900 text-base">{c.name}</span>
                        {getLoyaltyBadge(stats.completedCount)}
                        {c.isBlocked && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Bloqueado
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{c.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{c.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* STATS CAPSULES */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-gray-50 border border-gray-150 px-4 py-2 rounded-xl text-center min-w-[80px]">
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Serviços</span>
                        <span className="text-sm font-black text-gray-900">{stats.completedCount} concluintes</span>
                      </div>
                      <div className="bg-blue-50/50 border border-blue-100 px-4 py-2 rounded-xl text-center min-w-[80px]">
                        <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider block">Total Gasto</span>
                        <span className="text-sm font-black text-blue-600">R$ {stats.totalSpent}</span>
                      </div>
                      
                      <div className="flex gap-2.5 pl-3">
                        <button
                          onClick={() => toggleExpandClient(c.id)}
                          className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl transition-all text-gray-500 cursor-pointer"
                          title="Histórico de Agendamentos"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleToggleBlock(c)}
                          className={`px-3 py-2 border font-bold text-xs rounded-xl tracking-wider uppercase transition-all cursor-pointer ${
                            c.isBlocked 
                              ? 'border-green-200 text-green-700 hover:bg-green-50' 
                              : 'border-red-200 text-red-600 hover:bg-red-50'
                          }`}
                        >
                          {c.isBlocked ? 'Desbloquear' : 'Bloquear'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED ACTIVITY HISTORY TIMELINE */}
                  {isExpanded && (
                    <div className="bg-gray-50/50 border-t border-b border-gray-100/80 px-6 py-5 space-y-4 fade-in">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Histórico Cronológico de Atendimentos</h4>
                      
                      {stats.bookingsList.length === 0 ? (
                        <p className="text-gray-400 text-xs py-2">Este cliente ainda não efetuou nenhuma reserva no sistema.</p>
                      ) : (
                        <div className="space-y-2.5">
                          {stats.bookingsList.map((b) => {
                            const [y, m, d] = b.date.split('-');
                            return (
                              <div key={b.id} className="bg-white border border-gray-150 p-4 rounded-xl flex justify-between items-center text-xs">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-gray-900">{b.serviceName}</span>
                                    <span className="text-[10px] text-gray-400">({b.vehicle})</span>
                                  </div>
                                  <div className="text-gray-500 font-semibold">
                                    Agendado para {d}/{m}/{y} às {b.time} {b.plate ? `• Placa: ${b.plate}` : ''}
                                  </div>
                                </div>
                                <div className="text-right space-y-1">
                                  <span className="font-black text-gray-900 block">R$ {b.price}</span>
                                  <span className={`inline-block text-[9px] font-bold uppercase ${
                                    b.status === 'completed' 
                                      ? 'text-blue-600' 
                                      : b.status === 'cancelled' 
                                        ? 'text-red-500' 
                                        : 'text-green-600'
                                  }`}>
                                    {b.status === 'completed' ? 'Concluído' : b.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CUSTOM CUSTOMER BLOCK/UNBLOCK MODAL */}
      {clientToToggle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 space-y-6 scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">
                  {clientToToggle.isBlocked ? 'Desbloquear Cliente' : 'Bloquear Cliente'}
                </h3>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                  Deseja realmente {clientToToggle.isBlocked ? 'desbloquear' : 'bloquear'} o cliente "{clientToToggle.name}"? 
                  {clientToToggle.isBlocked 
                    ? ' Ele voltará a ter permissão para realizar novos agendamentos no sistema.' 
                    : ' Clientes bloqueados são impedidos de realizar novos agendamentos.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onUpdateUser({
                    ...clientToToggle,
                    isBlocked: !clientToToggle.isBlocked
                  });
                  setClientToToggle(null);
                }}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer ${
                  clientToToggle.isBlocked 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {clientToToggle.isBlocked ? 'Confirmar Desbloqueio' : 'Confirmar Bloqueio'}
              </button>
              <button
                type="button"
                onClick={() => setClientToToggle(null)}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
