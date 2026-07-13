/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Info, MessageSquare, Phone, Instagram, Facebook, Plus, Edit } from 'lucide-react';
import { SystemConfig, User } from '../types';

interface AdminConfigProps {
  config: SystemConfig;
  onUpdateConfig: (config: SystemConfig) => void;
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
}

export default function AdminConfig({ config, onUpdateConfig, users, onAddUser, onUpdateUser }: AdminConfigProps) {
  // Local state for Global System Config
  const [companyName, setCompanyName] = useState(config.companyName);
  const [phone, setPhone] = useState(config.phone);
  const [whatsapp, setWhatsapp] = useState(config.whatsapp);
  const [address, setAddress] = useState(config.address);
  const [instagram, setInstagram] = useState(config.instagram);
  const [facebook, setFacebook] = useState(config.facebook);
  const [welcomeMessage, setWelcomeMessage] = useState(config.welcomeMessage);
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState(config.cancellationPolicyHours);

  // Local state for Administrator Management
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');

  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPass, setEditPass] = useState('');

  const [adminFormError, setAdminFormError] = useState('');
  const [editFormError, setEditFormError] = useState('');

  const admins = users.filter(u => u.role === 'administrador');

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      companyName,
      phone,
      whatsapp,
      address,
      instagram,
      facebook,
      welcomeMessage,
      cancellationPolicyHours: Number(cancellationPolicyHours),
      logoIcon: config.logoIcon
    });
  };

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormError('');
    if (!newAdminName || !newAdminEmail || !newAdminPhone || !newAdminPass) {
      setAdminFormError('Por favor, preencha todos os campos do novo administrador.');
      return;
    }
    
    // Check email uniqueness
    const emailExists = users.some(u => u.email.toLowerCase() === newAdminEmail.toLowerCase());
    if (emailExists) {
      setAdminFormError('Este endereço de e-mail já está sendo utilizado no sistema.');
      return;
    }

    const newAdmin: User = {
      id: 'usr-' + Date.now(),
      name: newAdminName,
      email: newAdminEmail,
      phone: newAdminPhone,
      role: 'administrador',
      password: newAdminPass,
      createdAt: new Date().toISOString()
    };

    onAddUser(newAdmin);
    
    // Clear registration fields
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPhone('');
    setNewAdminPass('');
    setAdminFormError('');
  };

  const handleSaveAdminEdit = (admin: User) => {
    setEditFormError('');
    if (!editName || !editEmail || !editPhone) {
      setEditFormError('Nome, e-mail e telefone são campos obrigatórios.');
      return;
    }

    onUpdateUser({
      ...admin,
      name: editName,
      email: editEmail,
      phone: editPhone,
      password: editPass || admin.password
    });
    setEditingAdminId(null);
    setEditFormError('');
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Configurações Gerais</h1>
          <p className="text-gray-500 mt-1">Gerencie a identidade visual corporativa, mídias de contato, políticas de reajuste e canais institucionais.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {/* SEC 1: GLOBAL CONFIGURATIONS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <form onSubmit={handleSaveConfig} className="divide-y divide-gray-100">
            
            {/* Branding and Institutional */}
            <div className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                Identidade Corporativa
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome da Empresa / Razão Social</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Endereço Comercial</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>
              </div>
            </div>

            {/* Channels and Social Networks */}
            <div className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                Canais de Contato & Redes Sociais
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone Comercial</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">WhatsApp Corporativo</label>
                  <input
                    type="text"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Instagram className="w-3.5 h-3.5 text-gray-400" />
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Facebook className="w-3.5 h-3.5 text-gray-400" />
                    Facebook Page
                  </label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>
              </div>
            </div>

            {/* Booking Policies */}
            <div className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Políticas de Agendamento
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mensagem de Boas-vindas</label>
                  <input
                    type="text"
                    required
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Limite p/ Cancelamento (Hrs)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={cancellationPolicyHours}
                    onChange={(e) => setCancellationPolicyHours(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-blue-800">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="leading-relaxed font-semibold">
                  O limite para cancelamento estipula com quantas horas de antecedência o cliente ainda poderá remover o agendamento de forma automática pela tela "Meus Agendamentos".
                </p>
              </div>
            </div>

            {/* Save Button for global config */}
            <div className="p-6 flex justify-end bg-gray-50/55">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer font-sans"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                Salvar Alterações Globais
              </button>
            </div>
          </form>
        </div>

        {/* SEC 2: CREDENTIALS AND ACCESS MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            Credenciais & Administradores do Sistema
          </h2>

          {/* List of current admin accounts */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Administradores Cadastrados</label>
            <div className="grid grid-cols-1 gap-3">
              {admins.map((adm) => {
                const isEditing = editingAdminId === adm.id;
                return (
                  <div key={adm.id} className="border border-gray-150 rounded-xl p-4 space-y-3 bg-gray-50/30">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Nome</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">E-mail</label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp / Celular</label>
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Alterar Senha</label>
                            <input
                              type="text"
                              value={editPass}
                              onChange={(e) => setEditPass(e.target.value)}
                              placeholder="Digite uma nova senha"
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                          </div>
                        </div>
                        {editFormError && (
                          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 font-bold">
                            {editFormError}
                          </div>
                        )}
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingAdminId(null)}
                            className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveAdminEdit(adm)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div>
                          <div className="font-bold text-sm text-gray-900">{adm.name}</div>
                          <div className="text-xs text-gray-500 font-semibold mt-0.5">{adm.email} • {adm.phone}</div>
                          <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Senha Atual: <span className="text-blue-600 font-extrabold font-mono">{(adm as any).password || 'admin123'}</span></div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAdminId(adm.id);
                            setEditName(adm.name);
                            setEditEmail(adm.email);
                            setEditPhone(adm.phone);
                            setEditPass(adm.password || 'admin123');
                          }}
                          className="inline-flex items-center gap-1 self-start sm:self-center text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editar Acesso
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Form to create a brand new administrator */}
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                Cadastrar Novo Administrador
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">Qualquer administrador cadastrado poderá acessar o painel executivo utilizando seu e-mail e sua respectiva senha.</p>
            </div>

            {adminFormError && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 font-bold">
                {adminFormError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo de Oliveira"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Ex: carlos@lavafacil.com"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  placeholder="Ex: (47) 98765-4321"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Senha de Entrada</label>
                <input
                  type="password"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Mínimo de 6 dígitos"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-xs font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer font-sans"
              >
                Criar Conta Administrativa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
