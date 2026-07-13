/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Percent, Calendar, Trash2, Edit, Save, X, ToggleLeft, ToggleRight, Sparkles, AlertCircle, Check } from 'lucide-react';
import { Promotion } from '../types';

interface AdminPromocoesProps {
  promotions: Promotion[];
  onAddPromotion: (promo: Promotion) => void;
  onUpdatePromotion: (promo: Promotion) => void;
  onDeletePromotion: (id: string) => void;
}

export default function AdminPromocoes({ promotions, onAddPromotion, onUpdatePromotion, onDeletePromotion }: AdminPromocoesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [promoToDelete, setPromoToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState<Promotion>({
    id: '',
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    maxUses: undefined,
    currentUses: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    minPriceRequired: undefined
  });

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      id: 'promo-' + Date.now(),
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: 10,
      maxUses: 100,
      currentUses: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().split('T')[0];
      })(),
      isActive: true,
      minPriceRequired: 50
    });
  };

  const handleStartEdit = (p: Promotion) => {
    setEditingId(p.id);
    setIsAdding(false);
    setFormData({ ...p });
  };

  const handleToggleActive = (p: Promotion) => {
    onUpdatePromotion({
      ...p,
      isActive: !p.isActive
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.description.trim()) return;

    // Standardize coupon code to UPPERCASE
    const cleanPromo = {
      ...formData,
      code: formData.code.trim().toUpperCase()
    };

    if (isAdding) {
      onAddPromotion(cleanPromo);
      setIsAdding(false);
    } else if (editingId) {
      onUpdatePromotion(cleanPromo);
      setEditingId(null);
    }
  };

  const handleDelete = (id: string) => {
    setPromoToDelete(id);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Campanhas & Cupons</h1>
          <p className="text-gray-500 mt-1">Estimule as vendas criando códigos de cupom promocionais e descontos percentuais ou fixos.</p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdd}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Adicionar Promoção
          </button>
        )}
      </div>

      {/* FORM COMPONENT */}
      {(isAdding || editingId) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 max-w-2xl fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isAdding ? 'Nova Promoção / Cupom' : 'Editar Promoção'}
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Código do Cupom</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: QUARTAOFF, VERDAO20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-bold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Descrição comercial</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 10% de desconto na primeira lavagem"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo de Desconto</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Valor do Desconto</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço Mínimo Requerido (R$)</label>
                <input
                  type="number"
                  placeholder="Sem mínimo"
                  value={formData.minPriceRequired || ''}
                  onChange={(e) => setFormData({ ...formData, minPriceRequired: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Início da Validade</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fim da Validade</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Limite de Usos (Max)</label>
                <input
                  type="number"
                  placeholder="Ilimitado"
                  value={formData.maxUses || ''}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPromoActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isPromoActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Cupom Ativo e pronto para uso</label>
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
                Salvar Campanha
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PROMOTIONS LISTING */}
      {!isAdding && !editingId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((p) => {
            const hasLimit = typeof p.maxUses === 'number';
            const progress = hasLimit ? (p.currentUses / (p.maxUses || 1)) * 100 : 0;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border shadow-xs p-6 flex flex-col justify-between space-y-6 ${
                  p.isActive ? 'border-gray-100' : 'border-gray-200 bg-gray-50/50 opacity-70'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-xl tracking-wider uppercase font-mono border border-blue-200/50">
                          {p.code}
                        </span>
                        {p.isActive ? (
                          <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">Campanha Ativa</span>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full border border-gray-200">Inativo</span>
                        )}
                      </div>
                      <h3 className="font-extrabold text-gray-900 text-md mt-2">{p.description}</h3>
                    </div>
                  </div>

                  {/* Promotion stats */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 border border-gray-150 p-3 rounded-xl font-semibold">
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Desconto</span>
                      <span className="text-gray-800 font-black text-sm">
                        {p.discountType === 'percentage' ? `${p.discountValue}% Off` : `R$ ${p.discountValue} Off`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Requisito</span>
                      <span className="text-gray-800 font-black text-sm">
                        {p.minPriceRequired ? `Gasto mín. R$ ${p.minPriceRequired}` : 'Sem valor mínimo'}
                      </span>
                    </div>
                  </div>

                  {/* Usage tracker */}
                  {hasLimit && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold text-gray-500">
                        <span>Resgates Efetuados</span>
                        <span>{p.currentUses} / {p.maxUses}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, progress)}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Dates validities */}
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Período: {formatDate(p.startDate)} até {formatDate(p.endDate)}</span>
                  </div>
                </div>

                {/* Operations */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(p)}
                    className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 cursor-pointer"
                  >
                    {p.isActive ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-blue-600 stroke-[2]" />
                        <span>Desativar Cupom</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-gray-400 stroke-[2]" />
                        <span>Ativar Cupom</span>
                      </>
                    )}
                  </button>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleStartEdit(p)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                      title="Editar Promoção"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Excluir Cupom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CUSTOM COUPON DELETION MODAL */}
      {promoToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 space-y-6 scale-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl flex-shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1 text-left">
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Excluir Cupom</h3>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">
                  Tem certeza que deseja remover esta promoção permanentemente? Cupons ativos não poderão mais ser aplicados por clientes.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onDeletePromotion(promoToDelete);
                  setPromoToDelete(null);
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                Excluir Cupom
              </button>
              <button
                type="button"
                onClick={() => setPromoToDelete(null)}
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
