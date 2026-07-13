/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  DollarSign, Calendar, Users, CheckCircle, TrendingUp, 
  Clock, AlertCircle, Sparkles, ShoppingBag, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Booking, User, Service } from '../types';

interface AdminDashboardProps {
  bookings: Booking[];
  users: User[];
  services: Service[];
  onNavigateTab: (tab: string) => void;
}

export default function AdminDashboard({ bookings, users, services, onNavigateTab }: AdminDashboardProps) {
  const TODAY_STR = '2026-07-08'; // System reference date

  // Filter out cancelled bookings for revenue/load calculations
  const activeBookings = useMemo(() => bookings.filter(b => b.status !== 'cancelled'), [bookings]);
  const completedBookings = useMemo(() => bookings.filter(b => b.status === 'completed'), [bookings]);

  // 1. INDICATORS
  const bookingsToday = useMemo(() => bookings.filter(b => b.date === TODAY_STR), [bookings]);
  const activeBookingsToday = useMemo(() => bookingsToday.filter(b => b.status !== 'cancelled'), [bookingsToday]);
  const cancellationsToday = useMemo(() => bookingsToday.filter(b => b.status === 'cancelled'), [bookingsToday]);

  // Revenue (Faturamento) calculations helper
  const calculateRevenue = (filterFn: (b: Booking) => boolean) => {
    return bookings
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .filter(filterFn)
      .reduce((sum, b) => sum + b.price, 0);
  };

  const revenueToday = useMemo(() => {
    return calculateRevenue(b => b.date === TODAY_STR);
  }, [bookings]);

  // Weekly revenue (last 7 days, e.g. July 2 to July 8, 2026)
  const revenueWeekly = useMemo(() => {
    return calculateRevenue(b => {
      const d = new Date(b.date);
      const start = new Date('2026-07-02');
      const end = new Date('2026-07-08');
      return d >= start && d <= end;
    });
  }, [bookings]);

  // Monthly revenue (July 2026)
  const revenueMonthly = useMemo(() => {
    return calculateRevenue(b => b.date.startsWith('2026-07'));
  }, [bookings]);

  const totalClients = useMemo(() => {
    return users.filter(u => u.role === 'cliente').length;
  }, [users]);

  const totalCompletedCount = useMemo(() => {
    return completedBookings.length;
  }, [completedBookings]);

  // 2. BEST SELLING SERVICES
  const bestSellers = useMemo(() => {
    const serviceSales: Record<string, { count: number; revenue: number }> = {};
    bookings.filter(b => b.status === 'completed').forEach(b => {
      if (!serviceSales[b.serviceName]) {
        serviceSales[b.serviceName] = { count: 0, revenue: 0 };
      }
      serviceSales[b.serviceName].count += 1;
      serviceSales[b.serviceName].revenue += b.price;
    });
    return Object.entries(serviceSales)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [bookings]);

  // 3. PEAK HOURS
  const peakHours = useMemo(() => {
    const hourCounts: Record<string, number> = {};
    bookings.filter(b => b.status !== 'cancelled').forEach(b => {
      hourCounts[b.time] = (hourCounts[b.time] || 0) + 1;
    });
    return Object.entries(hourCounts)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [bookings]);

  // 4. LOYAL CUSTOMERS (Clientes frequentes)
  const loyalCustomers = useMemo(() => {
    const customerFrequencies: Record<string, { count: number; spent: number; phone: string }> = {};
    bookings.forEach(b => {
      if (!customerFrequencies[b.customerName]) {
        customerFrequencies[b.customerName] = { count: 0, spent: 0, phone: b.customerPhone };
      }
      customerFrequencies[b.customerName].count += 1;
      if (b.status === 'completed') {
        customerFrequencies[b.customerName].spent += b.price;
      }
    });
    return Object.entries(customerFrequencies)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [bookings]);

  // 5. RECENT BOOKINGS & CANCELLATIONS
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
  }, [bookings]);

  const recentCancellations = useMemo(() => {
    return bookings
      .filter(b => b.status === 'cancelled')
      .slice(0, 3);
  }, [bookings]);

  // 6. REVENUE CHART DATA (Calculated dynamically for the last 7 days ending on today's simulated date: 2026-07-08)
  const last7Days = useMemo(() => {
    const days = [];
    const baseDate = new Date('2026-07-08');
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      
      const value = bookings
        .filter(b => b.date === dateStr && (b.status === 'completed' || b.status === 'confirmed'))
        .reduce((sum, b) => sum + b.price, 0);
        
      days.push({ day: dayLabel, dateStr, value });
    }
    return days;
  }, [bookings]);

  const maxChartVal = useMemo(() => {
    return Math.max(...last7Days.map(d => d.value), 500);
  }, [last7Days]);

  // Generate exact SVG path line & area data dynamically
  const svgPathData = useMemo(() => {
    if (last7Days.length === 0) return { line: '', area: '' };
    const points = last7Days.map((d, idx) => {
      const x = (idx / 6) * 100;
      const y = 40 - (d.value / maxChartVal) * 35;
      return { x, y };
    });
    const lineStr = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaStr = `${lineStr} L 100,40 L 0,40 Z`;
    return { line: lineStr, area: areaStr };
  }, [last7Days, maxChartVal]);

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Painel Executivo</h1>
          <p className="text-gray-500 mt-1">Indicadores consolidados em tempo real para o dia 08/07/2026.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold border border-slate-250">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Controle de Caixa Real</span>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Agendamentos Hoje</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">{activeBookingsToday.length}</span>
            <span className="text-xs text-gray-400 block mt-1">
              {cancellationsToday.length > 0 ? `${cancellationsToday.length} cancelados` : 'Nenhum cancelamento hoje'}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Faturamento Diário</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">R$ {revenueToday}</span>
            <span className="text-xs text-gray-400 block mt-1">Faturamento real do dia</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-indigo-50 p-2.5 rounded-xl">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Faturamento Semanal</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">R$ {revenueWeekly}</span>
            <span className="text-xs text-indigo-500 font-semibold block mt-1">Acumulado mensal: R$ {revenueMonthly}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Clientes Ativos</span>
            <span className="text-3xl font-black text-gray-900 tracking-tight">{totalClients}</span>
            <span className="text-xs text-gray-400 block mt-1">{totalCompletedCount} serviços realizados</span>
          </div>
        </div>
      </div>

      {/* CHARTS BLOCK (BENTO GRID STYLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Faturamento Semanal SVG */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Curva de Faturamento</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-6">Últimos 7 dias (Julho)</p>
          </div>

          {/* SVG AREA CHART */}
          <div className="relative h-48 w-full mt-4">
            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00"/>
                </linearGradient>
              </defs>
              {/* Gridlines */}
              <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.2" />
              <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.2" />
              <line x1="0" y1="30" x2="100" y2="30" stroke="#f1f5f9" strokeWidth="0.2" />
              
              {/* Plotting points & path */}
              <path
                d={svgPathData.line}
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              {/* Area path */}
              <path
                d={svgPathData.area}
                fill="url(#chartGradient)"
              />
            </svg>
            <div className="absolute inset-0 flex justify-between pointer-events-none text-[10px] font-bold text-gray-400 pt-36">
              {last7Days.map((d, i) => (
                <div key={i} className="text-center w-1/7">
                  <div>{d.day}</div>
                  <div className="text-gray-900 font-extrabold mt-0.5">R${d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATS BREAKDOWN */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Distribuição de Demanda</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Produtos e Clientes Top</p>
          </div>

          <div className="space-y-4">
            {/* Top Product */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Serviços mais vendidos</span>
              <div className="space-y-2">
                {bestSellers.map((s, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl text-xs">
                    <span className="font-bold text-gray-700">{s.name}</span>
                    <span className="bg-blue-100 text-blue-700 font-extrabold px-2 py-0.5 rounded-full">{s.count} lavagens</span>
                  </div>
                ))}
                {bestSellers.length === 0 && <span className="text-gray-400 text-xs">Sem dados históricos.</span>}
              </div>
            </div>

            {/* Peak times */}
            <div>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Horários mais quentes</span>
              <div className="flex gap-2">
                {peakHours.map((h, i) => (
                  <div key={i} className="flex-1 text-center bg-indigo-50/50 border border-indigo-100/50 p-2 rounded-xl text-xs">
                    <span className="font-black text-indigo-700 block text-sm">{h.time}</span>
                    <span className="text-gray-400 font-bold text-[9px] uppercase">{h.count} reservas</span>
                  </div>
                ))}
                {peakHours.length === 0 && <span className="text-gray-400 text-xs">Sem dados.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY & LISTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RECENT BOOKINGS */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Novos Agendamentos</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Últimos registros inseridos no sistema</p>
            </div>
            <button 
              onClick={() => onNavigateTab('agenda')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Ver Agenda
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="py-3 flex justify-between items-center gap-4 text-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{b.customerName}</span>
                    <span className="text-xs text-gray-400">({b.vehicle})</span>
                  </div>
                  <div className="text-xs text-gray-500 font-medium">{b.serviceName} • {b.date.split('-').reverse().join('/')} às {b.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-blue-600">R$ {b.price}</div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
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
            ))}
            {recentBookings.length === 0 && (
              <p className="text-gray-400 text-xs py-4 text-center">Nenhum agendamento recente cadastrado.</p>
            )}
          </div>
        </div>

        {/* CANCELAMENTOS RECENTES & CLIENTES LOYAL */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
          {/* CLIENTES FREQUENTES */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-md">Clientes Premium</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Por recorrência de visitas</p>
            </div>
            <div className="space-y-2.5">
              {loyalCustomers.map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-800 block">{c.name}</span>
                    <span className="text-[10px] text-gray-400">{c.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900 block">{c.count} visitas</span>
                    <span className="text-[10px] text-green-600 font-bold">Investido: R$ {c.spent}</span>
                  </div>
                </div>
              ))}
              {loyalCustomers.length === 0 && <p className="text-gray-400 text-xs">Sem dados.</p>}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* CANCELAMENTOS RECENTES */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 text-md text-red-600">Cancelamentos Recentes</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Atenção à taxa de evasão</p>
            </div>
            <div className="space-y-2.5">
              {recentCancellations.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-xs bg-red-50/50 px-3 py-2 rounded-xl">
                  <div>
                    <span className="font-bold text-red-800 block">{c.customerName}</span>
                    <span className="text-[10px] text-gray-400">{c.serviceName}</span>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 uppercase bg-red-100 px-2 py-0.5 rounded-full">
                    {c.time} • {c.date.split('-').reverse().join('/')}
                  </span>
                </div>
              ))}
              {recentCancellations.length === 0 && (
                <p className="text-gray-400 text-xs py-2">Excelente! Nenhum cancelamento recente registrado.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
