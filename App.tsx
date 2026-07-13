/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Calendar, Sparkles, Clock, Users, Percent, Settings, 
  ShieldCheck, User, LogOut, ArrowRight, Instagram, Facebook, 
  MapPin, Phone, HelpCircle, CheckCircle, Info, LogIn, ShieldAlert
} from 'lucide-react';

import { dataStore } from './dataStore';
import { User as UserType, Booking, Service, BusinessHours, Promotion, SystemConfig, InternalNotification } from './types';

// Component imports
import Navbar from './components/Navbar';
import Toast, { ToastType } from './components/Toast';
import ClientHome from './components/ClientHome';
import ClientMyBookings from './components/ClientMyBookings';
import ClientSchedule from './components/ClientSchedule';
import QuickAuthBanner from './components/QuickAuthBanner';

// Admin view imports
import AdminDashboard from './components/AdminDashboard';
import AdminAgenda from './components/AdminAgenda';
import AdminServicos from './components/AdminServicos';
import AdminFuncionamento from './components/AdminFuncionamento';
import AdminClientes from './components/AdminClientes';
import AdminPromocoes from './components/AdminPromocoes';
import AdminConfig from './components/AdminConfig';

const formatBrazilianPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  const limited = digits.substring(0, 11);
  if (limited.length === 0) return '';
  if (limited.length <= 2) return `(${limited}`;
  if (limited.length <= 3) return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
  if (limited.length <= 7) return `(${limited.slice(0, 2)}) ${limited.slice(2, 3)} ${limited.slice(3)}`;
  return `(${limited.slice(0, 2)}) ${limited.slice(2, 3)} ${limited.slice(3, 7)}-${limited.slice(7, 11)}`;
};

const validateBrazilianPhone = (value: string): boolean => {
  const cleanPhone = value.replace(/\D/g, '');
  if (cleanPhone.length !== 11) return false;
  if (cleanPhone[2] !== '9') return false;
  const ddd = parseInt(cleanPhone.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  return true;
};

export default function App() {
  // 1. STATE ROUTING AND ACCOUNT MANAGEMENTS
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('lf_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentView, setCurrentView] = useState<string>('home');

  // Load state tables from dataStore
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours>(dataStore.getBusinessHours());
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [config, setConfig] = useState<SystemConfig>(dataStore.getConfig());
  const [notifications, setNotifications] = useState<InternalNotification[]>([]);

  // Toast array for stacking notifications
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([]);

  // Auth inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');

  // Just placed booking details for confirmation screen
  const [recentBooking, setRecentBooking] = useState<Booking | null>(null);

  // Custom dialog modal state
  const [customConfirm, setCustomConfirm] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  // Load and refresh state
  const loadAllData = () => {
    setServices(dataStore.getServices());
    setBookings(dataStore.getBookings());
    setUsers(dataStore.getUsers());
    setBusinessHours(dataStore.getBusinessHours());
    setPromotions(dataStore.getPromotions());
    setConfig(dataStore.getConfig());
    setNotifications(dataStore.getNotifications());
  };

  useEffect(() => {
    loadAllData();
    const unsubscribe = dataStore.onChange(() => {
      loadAllData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Sync current user to localStorage
  const handleSetCurrentUser = (user: UserType | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('lf_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('lf_current_user');
    }
  };

  // Toast trigger helper
  const showToast = (message: string, type: ToastType = 'success') => {
    const id = 'toast-' + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 2. DATASTORE STATE MODIFY WRAPPERS
  const handleAddService = (newService: Service) => {
    dataStore.addService(newService);
    loadAllData();
    showToast('Serviço adicionado com sucesso!');
  };

  const handleUpdateService = (updatedService: Service) => {
    dataStore.updateService(updatedService);
    loadAllData();
    showToast('Serviço atualizado com sucesso!');
  };

  const handleDeleteService = (id: string) => {
    dataStore.deleteService(id);
    loadAllData();
    showToast('Serviço removido com sucesso!', 'info');
  };

  const handleUpdateBooking = (updatedBooking: Booking) => {
    dataStore.updateBooking(updatedBooking);
    loadAllData();
    
    // Customize toast based on action
    if (updatedBooking.status === 'completed') {
      showToast(`Atendimento de ${updatedBooking.customerName} concluído com sucesso!`);
    } else if (updatedBooking.status === 'cancelled') {
      showToast(`Atendimento de ${updatedBooking.customerName} cancelado.`, 'warning');
    } else {
      showToast('Informações do agendamento editadas com sucesso!');
    }
  };

  const handleUpdateBusinessHours = (updatedHours: BusinessHours) => {
    dataStore.saveBusinessHours(updatedHours);
    loadAllData();
    showToast('Grade horária e exceções gravadas com sucesso!');
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    dataStore.updateUser(updatedUser);
    loadAllData();
    showToast(`Cadastro de ${updatedUser.name} atualizado.`);
  };

  const handleAddUser = (newUser: UserType) => {
    dataStore.addUser(newUser);
    loadAllData();
    showToast(`Cadastro de ${newUser.name} criado com sucesso!`);
  };

  const handleAddPromotion = (newPromo: Promotion) => {
    dataStore.addPromotion(newPromo);
    loadAllData();
    showToast(`Cupom de desconto "${newPromo.code}" criado com sucesso!`);
  };

  const handleUpdatePromotion = (updatedPromo: Promotion) => {
    dataStore.updatePromotion(updatedPromo);
    loadAllData();
    showToast('Parâmetros da promoção salvos com sucesso!');
  };

  const handleDeletePromotion = (id: string) => {
    dataStore.deletePromotion(id);
    loadAllData();
    showToast('Cupom removido.', 'info');
  };

  const handleUpdateConfig = (newConfig: SystemConfig) => {
    dataStore.saveConfig(newConfig);
    loadAllData();
    showToast('Configurações institucionais atualizadas!');
  };

  // 3. BOOKING CREATION ENGINE (CLIENT FLOW)
  const handlePlaceBooking = (bookingData: {
    vehicle: string;
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    plate?: string;
    price: number;
  }) => {
    try {
      if (!currentUser) {
        showToast('Faça login para realizar o agendamento.', 'error');
        setCurrentView('auth');
        return;
      }

      // Safety: check if user is blocked by admin
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser?.isBlocked) {
        showToast('Seu cadastro está suspenso pela administração. Entre em contato para desbloqueio.', 'error');
        return;
      }

      const newBooking: Booking = {
        id: 'bk-' + Date.now(),
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone || '',
        vehicle: bookingData.vehicle,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        date: bookingData.date,
        time: bookingData.time,
        plate: bookingData.plate,
        price: bookingData.price,
        status: 'confirmed',
        createdAt: new Date().toISOString()
      };

      dataStore.addBooking(newBooking);
      setRecentBooking(newBooking);
      loadAllData();
      setCurrentView('confirmation');
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      showToast('Não foi possível confirmar o agendamento: ' + (error instanceof Error ? error.message : String(error)), 'error');
    }
  };

  // 4. USER AUTHENTICATIONS & REGISTRATIONS
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) {
      showToast('Preencha as credenciais de login.', 'error');
      return;
    }

    // Dynamic database search for any user role (including admin)
    const foundUser = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    
    // Check password matches (fallbacks to standard if missing, e.g., for imported users)
    const storedPassword = foundUser?.password || (foundUser?.role === 'administrador' ? 'admin123' : 'user123');
    
    if (!foundUser || storedPassword !== loginPass) {
      showToast('E-mail ou senha incorretos.', 'error');
      return;
    }

    if (foundUser.isBlocked) {
      showToast('Seu acesso foi suspenso temporariamente pela administração.', 'error');
      return;
    }

    handleSetCurrentUser(foundUser);
    setLoginEmail('');
    setLoginPass('');

    if (foundUser.role === 'administrador') {
      showToast(`Bem-vindo, ${foundUser.name}! Painel administrativo ativado.`);
      setCurrentView('admin-dashboard');
    } else {
      showToast(`Olá, ${foundUser.name}! Bem-vindo de volta.`);
      setCurrentView('schedule');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPass) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (regPass !== regPassConfirm) {
      showToast('As senhas digitadas não coincidem.', 'error');
      return;
    }

    if (regPass.length < 6) {
      showToast('A senha deve possuir ao menos 6 dígitos.', 'error');
      return;
    }

    if (!validateBrazilianPhone(regPhone)) {
      showToast('Por favor, informe um telefone celular válido com DDD e o 9º dígito no padrão (11) 9 9999-9999.', 'error');
      return;
    }

    // Check email uniqueness
    const exists = users.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    if (exists) {
      showToast('Este endereço de e-mail já está cadastrado.', 'error');
      return;
    }

    const newUser: UserType = {
      id: 'usr-' + Date.now(),
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: 'cliente',
      password: regPass,
      createdAt: new Date().toISOString()
    };

    dataStore.addUser(newUser);
    loadAllData();
    handleSetCurrentUser(newUser);
    showToast(`Conta criada com sucesso! Seja bem-vindo, ${regName}.`);
    
    // Clear registration fields
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPass('');
    setRegPassConfirm('');
    setCurrentView('schedule');
  };

  const handleQuickLogin = (role: 'administrador' | 'cliente') => {
    if (role === 'administrador') {
      const adminAcc = users.find(u => u.role === 'administrador') || {
        id: 'usr-admin',
        name: 'Ricardo Administrador',
        email: 'admin@lavafacil.com',
        phone: '(47) 98888-1111',
        role: 'administrador' as const,
        createdAt: new Date().toISOString()
      };
      handleSetCurrentUser(adminAcc);
      showToast('Logado como Ricardo Administrador.');
      setCurrentView('admin-dashboard');
    } else {
      const clientAcc = users.find(u => u.id === 'usr-client1') || {
        id: 'usr-client1',
        name: 'Ana Silva',
        email: 'ana.silva@gmail.com',
        phone: '(47) 99999-1234',
        role: 'cliente' as const,
        createdAt: new Date().toISOString()
      };
      handleSetCurrentUser(clientAcc);
      showToast('Logado como Ana Silva.');
      setCurrentView('schedule');
    }
  };

  const handleLogout = () => {
    handleSetCurrentUser(null);
    showToast('Sessão encerrada com sucesso.', 'info');
    setCurrentView('home');
  };

  // 5. CANCELLATION LIMIT CHECK
  const handleCancelBooking = (bookingId: string, bypassPolicy: boolean = false) => {
    const b = bookings.find(item => item.id === bookingId);
    if (!b) return;

    setCustomConfirm({
      isOpen: true,
      title: 'Cancelar Agendamento',
      description: `Deseja realmente cancelar seu agendamento do serviço "${b.serviceName}" para o dia ${b.date.split('-').reverse().join('/')} às ${b.time}?`,
      confirmLabel: 'Sim, Cancelar',
      cancelLabel: 'Manter Agendamento',
      type: 'danger',
      onConfirm: () => {
        // Check validation hours limit if not bypassed
        if (!bypassPolicy) {
          const now = new Date();
          const bDateTime = new Date(`${b.date}T${b.time}`);
          const diffMs = bDateTime.getTime() - now.getTime();
          const diffHrs = diffMs / (1000 * 60 * 60);

          if (diffHrs < config.cancellationPolicyHours) {
            showToast(
              `Não é possível cancelar. Conforme nossa política, alterações devem ocorrer com no mínimo ${config.cancellationPolicyHours}h de antecedência. Entre em contato por telefone.`,
              'error'
            );
            return;
          }
        }

        dataStore.updateBooking({
          ...b,
          status: 'cancelled'
        });
        loadAllData();
        showToast('Agendamento cancelado com sucesso.', 'warning');
        
        // If it was the recentBooking, clear it and redirect to bookings page
        if (recentBooking && recentBooking.id === b.id) {
          setRecentBooking(null);
          setCurrentView('my-bookings');
        }
      }
    });
  };

  // 6. VIEW ROUTER ROUTING DISPATCH
  const renderViewContent = () => {
    switch (currentView) {
      case 'home':
        return <ClientHome services={services} onNavigate={setCurrentView} />;
      
      case 'auth':
        return (
          <div className="min-h-[calc(100vh-160px)] bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
            <QuickAuthBanner onQuickLogin={handleQuickLogin} />
            <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-xl w-full max-w-md space-y-6 fade-in">
              <div className="text-center space-y-2">
                <div className="bg-blue-600 w-12 h-12 rounded-xl flex items-center justify-center text-white mx-auto shadow-sm">
                  <LogIn className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Entrar</h1>
                <p className="text-gray-500 text-sm font-semibold">Acesse sua conta Lava Fácil para agendar</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Endereço de e-mail</label>
                  <input 
                    type="email" 
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Sua senha</label>
                  <input 
                    type="password" 
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/50 focus:bg-white"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors uppercase tracking-wider">
                  Entrar na Conta
                </button>
              </form>

              <div className="text-center text-xs font-semibold text-gray-500 pt-2">
                Novo por aqui?{' '}
                <button onClick={() => setCurrentView('register')} className="text-blue-600 font-extrabold hover:underline cursor-pointer">
                  Criar conta de cliente
                </button>
              </div>
            </div>
          </div>
        );

      case 'register':
        return (
          <div className="min-h-[calc(100vh-160px)] bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
            <QuickAuthBanner onQuickLogin={handleQuickLogin} />
            <div className="bg-white p-8 rounded-2xl border border-gray-150 shadow-xl w-full max-w-md space-y-5 fade-in">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Criar Cadastro</h1>
                <p className="text-gray-500 text-sm font-semibold">Agende de forma personalizada em poucos cliques</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Ex: Ana Maria Silva"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">E-mail</label>
                  <input 
                    type="email" 
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ana.silva@gmail.com"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Telefone / WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(formatBrazilianPhone(e.target.value))}
                    placeholder="(11) 9 9999-9999"
                    maxLength={15}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/40"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Senha (mín 6 dig.)</label>
                    <input 
                      type="password" 
                      required
                      value={regPass}
                      onChange={(e) => setRegPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confirmar Senha</label>
                    <input 
                      type="password" 
                      required
                      value={regPassConfirm}
                      onChange={(e) => setRegPassConfirm(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm font-semibold focus:ring-2 focus:ring-blue-500 bg-gray-50/40"
                    />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-colors uppercase tracking-wider mt-2">
                  Criar minha conta
                </button>
              </form>

              <div className="text-center text-xs font-semibold text-gray-500 pt-1">
                Já tem cadastro?{' '}
                <button onClick={() => setCurrentView('auth')} className="text-blue-600 font-extrabold hover:underline cursor-pointer">
                  Entrar
                </button>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <ClientSchedule 
            services={services}
            businessHours={businessHours}
            promotions={promotions}
            existingBookings={bookings}
            onSubmitBooking={handlePlaceBooking}
            onNavigate={setCurrentView}
          />
        );

      case 'my-bookings':
        return (
          <ClientMyBookings 
            bookings={bookings.filter(b => b.customerId === currentUser?.id)}
            config={config}
            onCancelBooking={handleCancelBooking}
            onNavigate={setCurrentView}
          />
        );

      case 'confirmation':
        return recentBooking ? (
          <div className="min-h-[calc(100vh-160px)] bg-gradient-to-tr from-green-50/40 to-blue-50/40 flex items-center justify-center px-4 py-12">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-150 shadow-xl max-w-md w-full text-center space-y-6 fade-in">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-xs">
                <CheckCircle className="w-10 h-10 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Agendamento Realizado!</h1>
                <p className="text-gray-500 text-sm font-semibold leading-relaxed">
                  Tudo pronto. Seu horário foi reservado com sucesso no nosso sistema de estética automotiva.
                </p>
              </div>

              <div className="bg-gray-50 rounded-2xl border border-gray-150/85 p-5 text-left text-xs font-semibold space-y-3.5">
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                  <span className="text-gray-400 uppercase tracking-wider">Serviço</span>
                  <span className="text-gray-900 font-bold">{recentBooking.serviceName}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                  <span className="text-gray-400 uppercase tracking-wider">Veículo</span>
                  <span className="text-gray-900 font-bold">{recentBooking.vehicle} {recentBooking.plate ? `(${recentBooking.plate.toUpperCase()})` : ''}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200/50">
                  <span className="text-gray-400 uppercase tracking-wider">Horário</span>
                  <span className="text-gray-900 font-bold">{recentBooking.date.split('-').reverse().join('/')} às {recentBooking.time}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-400 uppercase tracking-wider">Valor total</span>
                  <span className="text-blue-600 font-extrabold text-sm">R$ {recentBooking.price},00</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button 
                  onClick={() => setCurrentView('home')} 
                  className="w-full bg-slate-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  Voltar para Início
                </button>
                <button 
                  onClick={() => setCurrentView('my-bookings')} 
                  className="w-full border-2 border-blue-600 hover:bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer"
                >
                  Ver Meus Agendamentos
                </button>
                <button 
                  onClick={() => {
                    if (recentBooking) {
                      handleCancelBooking(recentBooking.id, true);
                    }
                  }} 
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all border border-red-200 cursor-pointer mt-1"
                >
                  Cancelar este Agendamento
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center">
            <p className="text-gray-500 font-bold">Nenhum agendamento recente localizado.</p>
            <button onClick={() => setCurrentView('home')} className="mt-4 text-blue-600 font-black">Voltar para home</button>
          </div>
        );

      default:
        // Handle Admin pages switching inside a wrapper layout
        if (currentView.startsWith('admin-')) {
          return renderAdminLayout();
        }
        return <ClientHome services={services} onNavigate={setCurrentView} />;
    }
  };

  // 7. ADMIN LAYOUT SIDEBAR AND ROUTINGS
  const renderAdminLayout = () => {
    const adminTabs = [
      { id: 'admin-dashboard', label: 'Painel Geral', icon: TrendingUp },
      { id: 'admin-agenda', label: 'Agenda Comercial', icon: Calendar },
      { id: 'admin-services', label: 'Catálogo Serviços', icon: Sparkles },
      { id: 'admin-hours', label: 'Escala & Pausas', icon: Clock },
      { id: 'admin-clients', label: 'Clientes & Faturamento', icon: Users },
      { id: 'admin-promotions', label: 'Campanhas & Cupons', icon: Percent },
      { id: 'admin-config', label: 'Configurações', icon: Settings },
    ];

    const renderAdminTabContent = () => {
      switch (currentView) {
        case 'admin-dashboard':
          return (
            <AdminDashboard 
              bookings={bookings} 
              users={users} 
              services={services} 
              onNavigateTab={setCurrentView} 
            />
          );
        case 'admin-agenda':
          return (
            <AdminAgenda 
              bookings={bookings} 
              onUpdateBooking={handleUpdateBooking} 
            />
          );
        case 'admin-services':
          return (
            <AdminServicos 
              services={services} 
              onAddService={handleAddService} 
              onUpdateService={handleUpdateService} 
              onDeleteService={handleDeleteService} 
            />
          );
        case 'admin-hours':
          return (
            <AdminFuncionamento 
              businessHours={businessHours} 
              onUpdateHours={handleUpdateBusinessHours} 
            />
          );
        case 'admin-clients':
          return (
            <AdminClientes 
              users={users} 
              bookings={bookings} 
              onUpdateUser={handleUpdateUser} 
            />
          );
        case 'admin-promotions':
          return (
            <AdminPromocoes 
              promotions={promotions} 
              onAddPromotion={handleAddPromotion} 
              onUpdatePromotion={handleUpdatePromotion} 
              onDeletePromotion={handleDeletePromotion} 
            />
          );
        case 'admin-config':
          return (
            <AdminConfig 
              config={config} 
              onUpdateConfig={handleUpdateConfig} 
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
            />
          );
        default:
          return <p className="p-4 text-gray-500 font-bold">Painel sob desenvolvimento.</p>;
      }
    };

    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 border-t border-gray-100">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-150 p-6 flex flex-col gap-6 lg:min-h-[calc(100vh-73px)]">
          <div className="hidden lg:block space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Área Restrita</span>
            <span className="text-sm text-slate-800 font-extrabold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Administração Geral
            </span>
          </div>

          <hr className="hidden lg:block border-gray-100" />

          {/* Nav links */}
          <nav className="flex flex-col gap-1 w-full">
            {adminTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = currentView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentView(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm font-extrabold' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ADMIN WORKSPACE SUB-CONTENT */}
        <main className="flex-1 p-6 md:p-8 lg:p-10 bg-slate-50 max-w-7xl mx-auto w-full">
          {renderAdminTabContent()}
        </main>

      </div>
    );
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col justify-between">
      
      {/* NAVBAR */}
      <Navbar 
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkAllNotificationsRead={dataStore.markAllNotificationsRead}
        onClearNotifications={dataStore.clearNotifications}
      />

      {/* FLOAT PLACED FLOATING TOASTS */}
      {toasts.map((toast) => {
        const ToastComponent = Toast as any;
        return (
          <ToastComponent
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        );
      })}

      {/* CUSTOM CONFIRMATION DIALOG MODAL */}
      {customConfirm && customConfirm.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="bg-white rounded-2xl border border-gray-150 max-w-md w-full shadow-2xl p-6 space-y-6 scale-up">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                customConfirm.type === 'danger' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">{customConfirm.title}</h3>
                <p className="text-sm font-semibold text-gray-500 leading-relaxed">{customConfirm.description}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  customConfirm.onConfirm();
                  setCustomConfirm(null);
                }}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer ${
                  customConfirm.type === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {customConfirm.confirmLabel}
              </button>
              <button
                type="button"
                onClick={() => setCustomConfirm(null)}
                className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer bg-white"
              >
                {customConfirm.cancelLabel || 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN BODY AREA */}
      <div className="flex-grow w-full relative">
        {renderViewContent()}
      </div>

      {/* INSTITUTIONAL DINAMIC FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 md:px-12 border-t border-slate-800 font-medium">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo and company detail */}
          <div className="space-y-4">
            <span className="font-black text-white text-lg tracking-tight select-none">Lava Fácil Estética</span>
            <p className="text-xs leading-relaxed max-w-sm text-slate-400">
              {config.welcomeMessage || 'Sua melhor escolha em embelezamento e cuidados especializados automotivos.'}
            </p>
            <div className="text-[10px] text-slate-500 font-bold">
              © 2026 Lava Fácil S.A. Todos os direitos reservados.
            </div>
          </div>

          {/* Social and contacts */}
          <div className="space-y-4">
            <span className="font-extrabold text-white text-sm uppercase tracking-wider block">Contatos Rápidos</span>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>{config.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{config.address}</span>
              </li>
            </ul>
          </div>

          {/* Social media connections */}
          <div className="space-y-4">
            <span className="font-extrabold text-white text-sm uppercase tracking-wider block">Redes Sociais</span>
            <div className="flex gap-4">
              <a 
                href={`https://instagram.com/${config.instagram?.replace('@', '')}`}
                target="_blank" 
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all cursor-pointer inline-block"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href={`https://facebook.com/${config.facebook}`}
                target="_blank" 
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-xl transition-all cursor-pointer inline-block"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
            <div className="text-[10px] text-slate-500 leading-relaxed font-bold">
              Alterações em agendamentos podem ser efetuadas com no mínimo {config.cancellationPolicyHours} horas de antecedência.
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
