/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Clock, Check, Car, Droplet, Sparkles, Shield, ChevronRight, Bike, Truck } from 'lucide-react';
import { Service } from '../types';

interface ClientHomeProps {
  services: Service[];
  onNavigate: (view: string) => void;
}

export default function ClientHome({ services, onNavigate }: ClientHomeProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<'Moto' | 'Carro' | 'SUV' | 'Caminhonete'>('Carro');

  const vehicleTypes = [
    { id: 'Moto' as const, label: 'Moto', icon: Bike },
    { id: 'Carro' as const, label: 'Carro', icon: Car },
    { id: 'SUV' as const, label: 'SUV', icon: Car }, // standard Lucide doesn't have SUV, but Car works great!
    { id: 'Caminhonete' as const, label: 'Caminhonete', icon: Truck },
  ];

  // Helper to get service icon dynamically
  const getServiceIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'droplet':
        return <Droplet className="w-6 h-6 text-blue-600" />;
      case 'sparkles':
        return <Sparkles className="w-6 h-6 text-blue-600" />;
      case 'shield':
        return <Shield className="w-6 h-6 text-blue-600" />;
      case 'car':
      default:
        return <Car className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <div className="fade-in w-full">
      {/* HERO SECTION */}
      <section 
        className="relative text-white py-24 px-6 bg-cover bg-center" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')" 
        }}
      >
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md leading-tight">
            Agende sua estética automotiva <br/>
            <span className="text-blue-400">em poucos cliques</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium drop-shadow-sm">
            Rápido, prático, sem filas e com a melhor qualidade de Balneário Camboriú.
          </p>
          <div className="pt-4">
            <button 
              onClick={() => onNavigate('schedule')} 
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Agendar Agora
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-16 pt-8 text-sm md:text-base text-gray-100 font-medium">
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-xs">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Agendamento Rápido</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-xs">
              <Check className="w-5 h-5 text-green-400" />
              <span>Serviço Premium</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-xs">
              <Car className="w-5 h-5 text-blue-400" />
              <span>Sem Filas de Espera</span>
            </div>
          </div>
        </div>
      </section>

      {/* NOSSOS SERVICOS (DYNAMIC PRICES BASED ON VEHICLE TABS) */}
      <section id="servicos" class="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-gray-500 font-medium">
              Selecione o tipo de veículo para visualizar os valores exatos de cada serviço.
            </p>
          </div>

          {/* Seleção de Veículos (Tabs) */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {vehicleTypes.map((v) => {
              const IconComponent = v.icon;
              const isActive = selectedVehicle === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVehicle(v.id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all min-w-[110px] cursor-pointer ${
                    isActive 
                      ? 'border-blue-600 bg-blue-50/70 text-blue-600' 
                      : 'border-gray-200 hover:border-blue-200 bg-white text-gray-600 hover:text-blue-500'
                  }`}
                >
                  <div className={`p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm">{v.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cards de Serviços */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.filter(s => s.isAvailable).map((service) => {
              const price = service.prices[selectedVehicle] || 0;
              return (
                <div 
                  key={service.id} 
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-5">
                      {getServiceIcon(service.icon)}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wider">Valor para {selectedVehicle}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-blue-600">R$</span>
                      <span className="text-3xl font-extrabold text-blue-600">{price}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* POR QUE ESCOLHER */}
      <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Por que escolher o Lava Fácil?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center space-y-4">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Agilidade Extra</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Agende em menos de 2 minutos pelo celular ou computador e receba lembretes automáticos.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center space-y-4">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Garantia de Qualidade</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Utilizamos os melhores produtos biodegradáveis do mercado para brilho e proteção do seu veículo.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center space-y-4">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
                <Car className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Comodidade Total</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Escolha o dia, o serviço e a hora. Entregue seu carro e retire no horário agendado, sem filas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
