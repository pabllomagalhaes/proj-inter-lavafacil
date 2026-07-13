/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Car, User, LogOut, ShieldAlert, Bell, LogIn, Menu, X } from 'lucide-react';
import { User as UserType, InternalNotification } from '../types';
import AdminNotificationsPanel from './AdminNotificationsPanel';

interface NavbarProps {
  currentUser: UserType | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  notifications: InternalNotification[];
  onMarkAllNotificationsRead: () => void;
  onClearNotifications: () => void;
}

export default function Navbar({
  currentUser,
  currentView,
  onNavigate,
  onLogout,
  notifications,
  onMarkAllNotificationsRead,
  onClearNotifications
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const isAdmin = currentUser?.role === 'administrador';
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
    setNotifDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-150 py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
      
      {/* BRAND / LOGO */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('home')}>
        <div className="bg-slate-900 text-white p-2.5 rounded-xl flex items-center justify-center shadow-xs">
          <Car className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-slate-900 select-none">Lava Fácil</span>
      </div>

      {/* DESKTOP MENU */}
      <div className="hidden md:flex items-center gap-8 text-sm font-bold">
        <button 
          onClick={() => handleNavClick('home')} 
          className={`cursor-pointer transition-colors ${
            currentView === 'home' ? 'text-blue-600 font-extrabold' : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          Início
        </button>
        <button 
          onClick={() => {
            onNavigate('home');
            setTimeout(() => {
              const el = document.getElementById('servicos');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }} 
          className="text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          Serviços
        </button>
        <button 
          onClick={() => handleNavClick('schedule')} 
          className={`cursor-pointer transition-colors ${
            currentView === 'schedule' ? 'text-blue-600 font-extrabold' : 'text-gray-500 hover:text-blue-600'
          }`}
        >
          Agendar
        </button>
        
        {/* Toggle Admin Area button */}
        {isAdmin && (
          <button 
            onClick={() => handleNavClick(currentView.startsWith('admin') ? 'home' : 'admin-dashboard')} 
            className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer ${
              currentView.startsWith('admin') 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
            }`}
          >
            {currentView.startsWith('admin') ? 'Ir p/ Área Cliente' : 'Painel Admin'}
          </button>
        )}
      </div>

      {/* USER PROFILE MENUS */}
      <div className="hidden md:flex items-center gap-5 text-sm font-bold">
        
        {/* Admin Notifications bell */}
        {isAdmin && (
          <div className="relative">
            <button 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all relative cursor-pointer"
              title="Notificações Internas"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 border-2 border-white text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>
            {notifDropdownOpen && (
              <AdminNotificationsPanel 
                notifications={notifications}
                onMarkAllRead={() => {
                  onMarkAllNotificationsRead();
                  setNotifDropdownOpen(false);
                }}
                onClearAll={() => {
                  onClearNotifications();
                  setNotifDropdownOpen(false);
                }}
                onClose={() => setNotifDropdownOpen(false)}
              />
            )}
          </div>
        )}

        {currentUser ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleNavClick('my-bookings')} 
              className={`cursor-pointer transition-colors ${
                currentView === 'my-bookings' ? 'text-blue-600 font-extrabold' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              Meus Agendamentos
            </button>
            
            <div className="flex items-center gap-2 text-gray-700 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-extrabold text-xs">{currentUser.name}</span>
            </div>
            
            <button 
              onClick={onLogout} 
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-gray-150 cursor-pointer" 
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => handleNavClick('auth')} 
            className="cursor-pointer inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
          >
            <LogIn className="w-4 h-4" />
            Entrar / Cadastrar
          </button>
        )}
      </div>

      {/* MOBILE HAMBURGER BUTTON */}
      <div className="flex items-center gap-3 md:hidden">
        {isAdmin && (
          <div className="relative">
            <button 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-all relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 border border-white rounded-full"></span>
              )}
            </button>
            {notifDropdownOpen && (
              <AdminNotificationsPanel 
                notifications={notifications}
                onMarkAllRead={() => {
                  onMarkAllNotificationsRead();
                  setNotifDropdownOpen(false);
                }}
                onClearAll={() => {
                  onClearNotifications();
                  setNotifDropdownOpen(false);
                }}
                onClose={() => setNotifDropdownOpen(false)}
              />
            )}
          </div>
        )}

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-600 hover:text-blue-600 rounded-xl hover:bg-gray-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="absolute top-[73px] left-0 right-0 bg-white border-b border-gray-150 shadow-xl p-5 flex flex-col gap-4 md:hidden z-40 fade-in text-sm font-bold">
          <button onClick={() => handleNavClick('home')} className="text-left py-2 border-b border-gray-50 text-gray-700">Início</button>
          <button onClick={() => handleNavClick('schedule')} className="text-left py-2 border-b border-gray-50 text-gray-700">Agendar</button>
          
          {isAdmin && (
            <button 
              onClick={() => handleNavClick(currentView.startsWith('admin') ? 'home' : 'admin-dashboard')} 
              className="text-left py-2 border-b border-gray-50 text-blue-600"
            >
              {currentView.startsWith('admin') ? 'Ir para Área Cliente' : 'Painel Administrador'}
            </button>
          )}

          {currentUser ? (
            <>
              <button onClick={() => handleNavClick('my-bookings')} className="text-left py-2 border-b border-gray-50 text-gray-700">Meus Agendamentos</button>
              <div className="py-2 text-gray-400 text-xs">Conectado como <span className="text-gray-800 font-extrabold">{currentUser.name}</span></div>
              <button onClick={onLogout} className="text-left py-2 text-red-600 flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleNavClick('auth')} 
              className="w-full text-center bg-blue-600 text-white py-3 rounded-xl uppercase tracking-wider text-xs"
            >
              Entrar ou Cadastrar
            </button>
          )}
        </div>
      )}

    </nav>
  );
}
