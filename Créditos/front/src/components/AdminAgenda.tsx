/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, User, Phone, Car, HelpCircle, Search, 
  CheckCircle, XCircle, Edit, Save, Trash2, Filter, AlertCircle 
} from 'lucide-react';
import { Booking, BookingStatus } from '../types';

interface AdminAgendaProps {
  bookings: Booking[];
  onUpdateBooking: (booking: Booking) => void;
}

export default function AdminAgenda({ bookings, onUpdateBooking }: AdminAgendaProps) {
  const TODAY_STR = '2026-07-08'; // System reference date

  // Filters
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'all'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    customerName: string;
    customerPhone: string;
    vehicle: string;
    plate: string;
    serviceName: string;
    date: string;
    time: string;
    price: number;
    status: BookingStatus;
    internalNotes: string;
  } | null>(null);

  // Filter bookings based on selected Time filter, Search query, and Status filter
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // 1. Time filtering
      if (timeFilter === 'day') {
        if (b.date !== TODAY_STR) return false;
      } else if (timeFilter === 'week') {
        const d = new Date(b.date);
        const start = new Date('2026-07-02');
        const end = new Date('2026-07-08');
        if (d < start || d > end) return false;
      } else if (timeFilter === 'month') {
        if (!b.date.startsWith('2026-07')) return false;
      }

      // 2. Status filtering
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;

      // 3. Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = b.customerName.toLowerCase().includes(q);
        const matchPlate = b.plate?.toLowerCase().includes(q);
        const matchService = b.serviceName.toLowerCase().includes(q);
        const matchPhone = b.customerPhone.includes(q);
        if (!matchName && !matchPlate && !matchService && !matchPhone) return false;
      }

      return true;
    });
  }, [bookings, timeFilter, statusFilter, searchQuery]);

  // Sort bookings: confirmed first, ordered by date and time
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      if (a.status === 'confirmed' && b.status !== 'confirmed') return -1;
      if (a.status !== 'confirmed' && b.status === 'confirmed') return 1;
      
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      
      return a.time.localeCompare(b.time);
    });
  }, [filteredBookings]);

  const handleStartEdit = (b: Booking) => {
    setEditingId(b.id);
    setEditForm({
      customerName: b.customerName,
      customerPhone: b.customerPhone,
      vehicle: b.vehicle,
      plate: b.plate || '',
      serviceName: b.serviceName,
      date: b.date,
      time: b.time,
      price: b.price,
      status: b.status,
      internalNotes: b.internalNotes || ''
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm) return;
    const oldBooking = bookings.find(b => b.id === id);
    if (oldBooking) {
      onUpdateBooking({
        ...oldBooking,
        customerName: editForm.customerName,
        customerPhone: editForm.customerPhone,
        vehicle: editForm.vehicle,
        plate: editForm.plate || undefined,
        serviceName: editForm.serviceName,
        date: editForm.date,
        time: editForm.time,
        price: Number(editForm.price),
        status: editForm.status,
        internalNotes: editForm.internalNotes || undefined
      });
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleQuickStatusChange = (b: Booking, newStatus: BookingStatus) => {
    onUpdateBooking({
      ...b,
      status: newStatus
    });
  };

  const getStatusStyle = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'cancelled':
        return 'bg-gray-100 text-gray-500 border-gray-200';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel de Agendamentos</h1>
          <p className="text-gray-500 mt-1">Monitore e gerencie todos os horários e fluxos da estética automotiva.</p>
        </div>
      </div>

      {/* FILTER BUTTONS & SEARCH BAR */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          
          {/* Time range switcher */}
          <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200/50 self-start">
            {[
              { id: 'day' as const, label: 'Hoje' },
              { id: 'week' as const, label: 'Semana' },
              { id: 'month' as const, label: 'Mês' },
              { id: 'all' as const, label: 'Tudo' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeFilter(t.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  timeFilter === t.id 
                    ? 'bg-white text-blue-600 shadow-xs' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Status switcher */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg outline-none text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Concluídos</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>

        </div>

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por cliente, telefone, placa de veículo ou serviço..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl outline-none text-sm font-semibold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* AGENDA BOARD/LISTING */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        
        {sortedBookings.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Nenhum agendamento encontrado</p>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Modifique seus critérios de filtros ou faça uma pesquisa diferente.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="py-4 px-6">Horário / Data</th>
                  <th className="py-4 px-6">Cliente</th>
                  <th className="py-4 px-6">Veículo / Placa</th>
                  <th className="py-4 px-6">Serviço contratado</th>
                  <th className="py-4 px-6">Valor pago</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Ações administrativas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedBookings.map((b) => {
                  const isEditing = editingId === b.id;
                  const [y, m, d] = b.date.split('-');
                  const formattedDate = `${d}/${m}/${y}`;

                  return (
                    <tr key={b.id} className="hover:bg-gray-50/40 transition-colors">
                      
                      {/* DATE & TIME */}
                      <td className="py-4 px-6">
                        {isEditing && editForm ? (
                          <div className="space-y-1">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="px-2 py-1 text-xs border rounded-md"
                            />
                            <input
                              type="text"
                              value={editForm.time}
                              placeholder="08:00"
                              onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                              className="px-2 py-1 text-xs border rounded-md w-16"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-gray-900 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              {b.time}
                            </span>
                            <span className="text-[11px] text-gray-400 font-bold block">{formattedDate}</span>
                          </div>
                        )}
                      </td>

                      {/* CUSTOMER CONTACT */}
                      <td className="py-4 px-6">
                        {isEditing && editForm ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.customerName}
                              onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                              className="px-2 py-1 text-xs border rounded-md w-full"
                            />
                            <input
                              type="text"
                              value={editForm.customerPhone}
                              onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
                              className="px-2 py-1 text-xs border rounded-md w-full"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-bold text-gray-900 block">{b.customerName}</span>
                            <span className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {b.customerPhone}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* VEHICLE & PLATE */}
                      <td className="py-4 px-6">
                        {isEditing && editForm ? (
                          <div className="space-y-1">
                            <select
                              value={editForm.vehicle}
                              onChange={(e) => setEditForm({ ...editForm, vehicle: e.target.value })}
                              className="px-2 py-1 text-xs border rounded-md"
                            >
                              <option value="Moto">Moto</option>
                              <option value="Carro">Carro</option>
                              <option value="SUV">SUV</option>
                              <option value="Caminhonete">Caminhonete</option>
                            </select>
                            <input
                              type="text"
                              value={editForm.plate}
                              onChange={(e) => setEditForm({ ...editForm, plate: e.target.value.toUpperCase() })}
                              className="px-2 py-1 text-xs border rounded-md w-20 uppercase"
                              placeholder="ABC-1234"
                            />
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="font-semibold text-gray-800 capitalize flex items-center gap-1">
                              <Car className="w-3.5 h-3.5 text-gray-400" />
                              {b.vehicle}
                            </span>
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block">
                              {b.plate || 'Sem Placa'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* SERVICE & NOTES */}
                      <td className="py-4 px-6">
                        {isEditing && editForm ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editForm.serviceName}
                              onChange={(e) => setEditForm({ ...editForm, serviceName: e.target.value })}
                              className="px-2 py-1 text-xs border rounded-md w-full"
                            />
                            <textarea
                              value={editForm.internalNotes}
                              onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
                              placeholder="Observações internas..."
                              className="px-2 py-1 text-xs border rounded-md w-full h-10"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1 max-w-xs">
                            <span className="font-bold text-gray-900 text-xs block">{b.serviceName}</span>
                            {b.internalNotes && (
                              <p className="text-[10px] text-gray-500 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                                <span className="font-bold text-amber-700">Interno:</span> {b.internalNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* PRICE */}
                      <td className="py-4 px-6">
                        {isEditing && editForm ? (
                          <input
                            type="number"
                            value={editForm.price}
                            onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                            className="px-2 py-1 text-xs border rounded-md w-16"
                          />
                        ) : (
                          <span className="font-black text-blue-600">R$ {b.price}</span>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="py-4 px-6 text-center">
                        {isEditing && editForm ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as BookingStatus })}
                            className="px-2 py-1 text-xs border rounded-md"
                          >
                            <option value="confirmed">Confirmado</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyle(b.status)}`}>
                            {b.status === 'confirmed' ? 'Pendente' : b.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="py-4 px-6 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(b.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                              title="Salvar"
                            >
                              <Save className="w-4 h-4 stroke-[2.5]" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Cancelar"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            {b.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleQuickStatusChange(b, 'completed')}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  title="Concluir Serviço"
                                >
                                  <CheckCircle className="w-4 h-4 stroke-[2.5]" />
                                </button>
                                <button
                                  onClick={() => handleQuickStatusChange(b, 'cancelled')}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Cancelar"
                                >
                                  <XCircle className="w-4 h-4 stroke-[2.5]" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleStartEdit(b)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar Detalhes"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
