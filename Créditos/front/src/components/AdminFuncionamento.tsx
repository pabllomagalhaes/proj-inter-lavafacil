/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, Calendar, Check, AlertTriangle, AlertCircle, Plus, Trash2, ShieldCheck, PlayCircle } from 'lucide-react';
import { BusinessHours } from '../types';

interface AdminFuncionamentoProps {
  businessHours: BusinessHours;
  onUpdateHours: (hours: BusinessHours) => void;
}

export default function AdminFuncionamento({ businessHours, onUpdateHours }: AdminFuncionamentoProps) {
  // Local state for easy form management
  const [openingTime, setOpeningTime] = useState(businessHours.openingTime);
  const [closingTime, setClosingTime] = useState(businessHours.closingTime);
  const [lunchStart, setLunchStart] = useState(businessHours.lunchStart);
  const [lunchEnd, setLunchEnd] = useState(businessHours.lunchEnd);
  const [isTemporarilyClosed, setIsTemporarilyClosed] = useState(businessHours.isTemporarilyClosed);
  const [temporaryCloseMessage, setTemporaryCloseMessage] = useState(businessHours.temporaryCloseMessage);
  
  // Custom blocks fields
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [blockFormError, setBlockFormError] = useState('');

  const weekDays = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ];

  const handleDayToggle = (dayValue: number) => {
    let updatedDays = [...businessHours.openDays];
    if (updatedDays.includes(dayValue)) {
      // Don't allow empty operating days
      if (updatedDays.length === 1) return;
      updatedDays = updatedDays.filter(d => d !== dayValue);
    } else {
      updatedDays.push(dayValue);
    }
    onUpdateHours({
      ...businessHours,
      openDays: updatedDays.sort()
    });
  };

  const handleSaveHours = () => {
    onUpdateHours({
      ...businessHours,
      openingTime,
      closingTime,
      lunchStart,
      lunchEnd,
      isTemporarilyClosed,
      temporaryCloseMessage
    });
  };

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setBlockFormError('');
    if (!newBlockDate || !newBlockReason.trim()) return;

    // Check if block date is already added
    if (businessHours.blockedDates.some(b => b.date === newBlockDate)) {
      setBlockFormError('Esta data já possui um bloqueio ativo.');
      return;
    }

    const updatedBlocks = [
      ...businessHours.blockedDates,
      { date: newBlockDate, reason: newBlockReason }
    ].sort((a, b) => a.date.localeCompare(b.date));

    onUpdateHours({
      ...businessHours,
      blockedDates: updatedBlocks
    });

    setNewBlockDate('');
    setNewBlockReason('');
    setBlockFormError('');
  };

  const handleRemoveBlock = (dateToRemove: string) => {
    const updatedBlocks = businessHours.blockedDates.filter(b => b.date !== dateToRemove);
    onUpdateHours({
      ...businessHours,
      blockedDates: updatedBlocks
    });
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Horários de Funcionamento</h1>
          <p className="text-gray-500 mt-1">Defina a escala semanal, intervalos de descanso, bloqueios de feriados e fechamentos de urgência.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COL 1 & 2: HOURS AND DAYS SETUP */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* WEEK DAYS OPERATING */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Dias de Funcionamento
            </h2>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Apenas dias selecionados permitirão agendamentos na agenda do cliente</p>
            
            <div className="flex flex-col gap-2.5">
              {weekDays.map((day) => {
                const isSelected = businessHours.openDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    onClick={() => handleDayToggle(day.value)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50/50 border-blue-200 text-blue-900 font-bold' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm tracking-tight">{day.label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TIME CONFIGURATIONS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Grade de Horários
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* EXPEDIENTE */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Turno de Trabalho</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Abertura</span>
                    <input
                      type="text"
                      placeholder="08:00"
                      value={openingTime}
                      onChange={(e) => setOpeningTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fechamento</span>
                    <input
                      type="text"
                      placeholder="18:00"
                      value={closingTime}
                      onChange={(e) => setClosingTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* ALMOCO */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-150">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Intervalo de Almoço</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Início</span>
                    <input
                      type="text"
                      placeholder="12:00"
                      value={lunchStart}
                      onChange={(e) => setLunchStart(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Término</span>
                    <input
                      type="text"
                      placeholder="13:00"
                      value={lunchEnd}
                      onChange={(e) => setLunchEnd(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSaveHours}
                className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Salvar Configurações de Horário
              </button>
            </div>
          </div>

        </div>

        {/* COL 3: SPECIAL BLOCKINGS & EMERGENCY PAUSE */}
        <div className="space-y-6">
          
          {/* EMERGENCY PAUSE / BUSINESS CLOSE */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Fechamento Temporário
            </h2>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
              Deseja fechar a agenda de reservas temporariamente por motivo de férias, reforma ou manutenção?
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tempClosed"
                  checked={isTemporarilyClosed}
                  onChange={(e) => setIsTemporarilyClosed(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded-sm focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="tempClosed" className="text-sm font-extrabold text-red-600 cursor-pointer">Agenda Pausada</label>
              </div>

              {isTemporarilyClosed && (
                <div className="space-y-2 fade-in">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Mensagem aos Clientes</span>
                  <textarea
                    value={temporaryCloseMessage}
                    onChange={(e) => setTemporaryCloseMessage(e.target.value)}
                    placeholder="Escreva um comunicado simpático explicando o motivo..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl outline-none text-xs font-semibold h-24 focus:ring-2 focus:ring-red-500"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveHours}
                className="w-full justify-center inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Atualizar Status de Pausa
              </button>
            </div>
          </div>

          {/* DATE BLOCKINGS */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Bloquear Datas
            </h2>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">Bloqueie datas avulsas (feriados locais, recesso, etc.) para impedir agendamentos.</p>

            {/* Block add form */}
            <form onSubmit={handleAddBlock} className="space-y-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              {blockFormError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-semibold flex items-center gap-1.5 fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{blockFormError}</span>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Data</span>
                <input
                  type="date"
                  required
                  value={newBlockDate}
                  onChange={(e) => {
                    setNewBlockDate(e.target.value);
                    setBlockFormError('');
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Motivo do bloqueio</span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Feriado municipal"
                  value={newBlockReason}
                  onChange={(e) => {
                    setNewBlockReason(e.target.value);
                    setBlockFormError('');
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-gray-900 hover:bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-wider"
              >
                Bloquear Data
              </button>
            </form>

            {/* Blocks listing */}
            <div className="space-y-2 pt-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Datas Bloqueadas Ativas</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {businessHours.blockedDates.map((b) => {
                  const [y, m, d] = b.date.split('-');
                  return (
                    <div key={b.date} className="flex justify-between items-center text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
                      <div>
                        <span className="font-extrabold text-gray-800 block">{d}/{m}/{y}</span>
                        <span className="text-[10px] text-gray-500 font-semibold">{b.reason}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlock(b.date)}
                        className="text-gray-400 hover:text-red-500 p-1"
                        title="Desbloquear"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
                {businessHours.blockedDates.length === 0 && (
                  <p className="text-gray-400 text-[11px] font-semibold text-center py-2">Nenhuma data bloqueada cadastrada.</p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
