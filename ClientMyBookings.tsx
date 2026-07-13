/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Clock, Car, Trash2, Plus, Smile, ShieldAlert } from 'lucide-react';
import { Booking, SystemConfig } from '../types';

interface ClientMyBookingsProps {
  bookings: Booking[];
  config: SystemConfig;
  onCancelBooking: (id: string) => void;
  onNavigate: (view: string) => void;
}

export default function ClientMyBookings({ bookings, config, onCancelBooking, onNavigate }: ClientMyBookingsProps) {
  // Split bookings into upcoming (confirmed) and past (completed, cancelled)
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
            Confirmado
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
            Concluído
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  // Check if a booking is within the cancellation limit
  const canCancel = (bookingDate: string, bookingTime: string): boolean => {
    try {
      const now = new Date();
      const bDate = new Date(`${bookingDate}T${bookingTime}`);
      const diffMs = bDate.getTime() - now.getTime();
      const diffHrs = diffMs / (1000 * 60 * 60);
      return diffHrs >= config.cancellationPolicyHours;
    } catch {
      return true;
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Meus Agendamentos</h1>
          <p className="text-gray-500 mt-1">Acompanhe seus horários de lavagem e histórico de serviços.</p>
        </div>
        <button 
          onClick={() => onNavigate('schedule')} 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Agendamento
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-12 text-center space-y-6">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Nenhum agendamento ainda</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              Seu carro merece um trato! Agende um horário conosco agora e comprove a qualidade.
            </p>
          </div>
          <button 
            onClick={() => onNavigate('schedule')} 
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            Agendar Primeira Lavagem
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* PRÓXIMOS AGENDAMENTOS */}
          {upcomingBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                Próximos Horários
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {upcomingBookings.map((b) => {
                  const allowedToCancel = canCancel(b.date, b.time);
                  return (
                    <div 
                      key={b.id} 
                      className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">{b.serviceName}</h3>
                          {getStatusBadge(b.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span>{formatDate(b.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span>{b.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-blue-600" />
                            <span className="capitalize">{b.vehicle} {b.plate ? `(${b.plate.toUpperCase()})` : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 md:self-center">
                        <div className="bg-blue-50 px-4 py-2 rounded-xl text-center">
                          <div className="text-xs text-blue-500 font-bold uppercase tracking-wider">Valor do Serviço</div>
                          <div className="text-xl font-extrabold text-blue-600">R$ {b.price}</div>
                        </div>
                        <button 
                          onClick={() => onCancelBooking(b.id)}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTÓRICO DE SERVIÇOS */}
          {pastBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">Histórico de Atendimentos</h2>
              <div className="grid grid-cols-1 gap-4">
                {pastBookings.map((b) => (
                  <div 
                    key={b.id} 
                    className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs opacity-80 hover:opacity-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-800">{b.serviceName}</h3>
                        {getStatusBadge(b.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-2 gap-x-6 text-sm text-gray-400 font-semibold">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(b.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{b.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          <span className="capitalize">{b.vehicle} {b.plate ? `(${b.plate.toUpperCase()})` : ''}</span>
                        </div>
                      </div>
                      {b.internalNotes && (
                        <div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg max-w-md">
                          <span className="font-bold">Nota interna:</span> {b.internalNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col text-right">
                      <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pago</div>
                      <div className="text-lg font-bold text-gray-600">R$ {b.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
