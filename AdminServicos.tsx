/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Sparkles, HelpCircle, Check, ShieldAlert, Shield, Droplet, Car, Bike, Truck } from 'lucide-react';
import { Service, ServicePrices } from '../types';

interface AdminServicosProps {
  services: Service[];
  onAddService: (service: Service) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (id: string) => void;
}

export default function AdminServicos({ services, onAddService, onUpdateService, onDeleteService }: AdminServicosProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Service>({
    id: '',
    name: '',
    description: '',
    durationMin: 60,
    prices: { Moto: 0, Carro: 0, SUV: 0, Caminhonete: 0 },
    icon: 'Sparkles',
    category: 'Lavação',
    isAvailable: true
  });

  const iconOptions = ['Droplet', 'Sparkles', 'Shield', 'Car'];

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: 'srv-' + Date.now(),
      name: '',
      description: '',
      durationMin: 45,
      prices: { Moto: 30, Carro: 50, SUV: 70, Caminhonete: 80 },
      icon: 'Droplet',
      category: 'Lavação',
      isAvailable: true
    });
  };

  const handleStartEdit = (s: Service) => {
    setEditingId(s.id);
    setIsAdding(false);
    setFormData({ ...s });
  };

  const handlePriceChange = (category: keyof ServicePrices, value: string) => {
    const val = Number(value);
    setFormData(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [category]: val
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    if (isAdding) {
      onAddService(formData);
      setIsAdding(false);
    } else if (editingId) {
      onUpdateService(formData);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setServiceToDelete(id);
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'droplet':
        return <Droplet className="w-5 h-5 text-blue-600" />;
      case 'sparkles':
        return <Sparkles className="w-5 h-5 text-blue-600" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'car':
      default:
        return <Car className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Catálogo de Serviços</h1>
          <p className="text-gray-500 mt-1">Configure o portfólio, tempos de execução e tabela de preços por veículo.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Adicionar Serviço
          </button>
        )}
      </div>

      {/* SERVICE FORM (CREATE/EDIT) */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 max-w-2xl fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isAdding ? 'Novo Serviço' : 'Editar Serviço'}
            </h2>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Serviço</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Lavação Técnica Completa"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Lavação">Lavação</option>
                  <option value="Estética">Estética</option>
                  <option value="Proteção">Proteção</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição detalhada</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o que o serviço engloba para o cliente final..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold h-20 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Duração Média (min)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.durationMin}
                  onChange={(e) => setFormData({ ...formData, durationMin: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ícone representativo</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Droplet">Gota (Limpeza)</option>
                  <option value="Sparkles">Estrelas (Estética)</option>
                  <option value="Shield">Escudo (Polimento)</option>
                  <option value="Car">Carro (Geral)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Disponibilidade</label>
                <div className="flex items-center h-10 gap-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700 cursor-pointer">Disponível para agenda</label>
                </div>
              </div>
            </div>

            {/* PRICES GRID BY VEHICLE TYPE */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-150">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tabela de Preços por Veículo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'Moto' as const, label: 'Moto', icon: Bike },
                  { id: 'Carro' as const, label: 'Carro', icon: Car },
                  { id: 'SUV' as const, label: 'SUV', icon: Car },
                  { id: 'Caminhonete' as const, label: 'Caminhonete', icon: Truck }
                ].map((v) => {
                  const Icon = v.icon;
                  return (
                    <div key={v.id} className="bg-white p-3 rounded-xl border border-gray-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{v.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 font-bold">R$</span>
                        <input
                          type="number"
                          required
                          min={0}
                          value={formData.prices[v.id]}
                          onChange={(e) => handlePriceChange(v.id, e.target.value)}
                          className="w-full text-xs font-bold outline-none text-gray-900 border-b border-transparent focus:border-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="px-5 py-2 border-2 border-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                Salvar Serviço
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SERVICES LISTING */}
      {!isAdding && !editingId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between space-y-6 ${
                s.isAvailable ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-70'
              }`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-3 rounded-xl">
                      {getServiceIcon(s.icon)}
                    </div>
                    <div>
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{s.category}</span>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-tight mt-0.5">{s.name}</h3>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${
                    s.isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {s.isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>

                <p className="text-xs text-gray-500 font-medium leading-relaxed">{s.description}</p>

                <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Tempo estimado: <span className="text-gray-700 font-black">{s.durationMin} minutos</span>
                </div>
              </div>

              {/* Tabela de Preços no card */}
              <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Moto</span>
                    <span className="font-extrabold text-gray-900">R$ {s.prices.Moto}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Carro</span>
                    <span className="font-extrabold text-gray-900">R$ {s.prices.Carro}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">SUV</span>
                    <span className="font-extrabold text-gray-900">R$ {s.prices.SUV}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase block">Cami.</span>
                    <span className="font-extrabold text-gray-900">R$ {s.prices.Caminhonete}</span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    onClick={() => handleStartEdit(s)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                    title="Editar Serviço"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                    title="Excluir Serviço"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CUSTOM SERVICE DELETION MODAL */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 space-y-6 scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl flex-shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Excluir Serviço</h3>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                  Tem certeza que deseja excluir permanentemente este serviço? Todos os novos agendamentos deste serviço serão desabilitados.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeleteService(serviceToDelete);
                  setServiceToDelete(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Excluir Serviço
              </button>
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
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
