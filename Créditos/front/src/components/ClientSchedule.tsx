/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, Bike, Truck, Droplet, Sparkles, Shield, Clock, Calendar, 
  Check, ChevronLeft, ChevronRight, Percent, Info, AlertTriangle 
} from 'lucide-react';
import { Service, BusinessHours, Promotion, Booking } from '../types';

interface ClientScheduleProps {
  services: Service[];
  businessHours: BusinessHours;
  promotions: Promotion[];
  existingBookings: Booking[];
  onSubmitBooking: (bookingData: {
    vehicle: string;
    serviceId: string;
    serviceName: string;
    date: string;
    time: string;
    plate?: string;
    price: number;
  }) => void;
  onNavigate: (view: string) => void;
}

export default function ClientSchedule({
  services,
  businessHours,
  promotions,
  existingBookings,
  onSubmitBooking,
  onNavigate
}: ClientScheduleProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [plate, setPlate] = useState<string>('');

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [couponSuccess, setCouponSuccess] = useState<string>('');
  const [finalPrice, setFinalPrice] = useState<number>(0);

  // Recalculate price when service, vehicle or promotion changes
  useEffect(() => {
    if (selectedService && selectedVehicle) {
      const basePrice = selectedService.prices[selectedVehicle as keyof typeof selectedService.prices] || 0;
      if (appliedPromotion) {
        if (appliedPromotion.discountType === 'percentage') {
          const discount = (basePrice * appliedPromotion.discountValue) / 100;
          setFinalPrice(Math.max(0, Math.round(basePrice - discount)));
        } else {
          setFinalPrice(Math.max(0, basePrice - appliedPromotion.discountValue));
        }
      } else {
        setFinalPrice(basePrice);
      }
    }
  }, [selectedService, selectedVehicle, appliedPromotion]);

  // If Agenda is closed by Administrator
  if (businessHours.isTemporarilyClosed) {
    return (
      <div className="fade-in max-w-xl mx-auto py-16 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-6 shadow-xs">
          <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Agenda Indisponível</h2>
            <p className="text-gray-600 leading-relaxed font-medium">
              {businessHours.temporaryCloseMessage || 'Estamos temporariamente sem horários disponíveis.'}
            </p>
          </div>
          <button 
            onClick={() => onNavigate('home')} 
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  // GENERATE DATES (Next 14 business days, skipping closed days, holidays & custom blocks)
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    let daysAdded = 0;
    let iterations = 0;

    // Scan the next 30 calendar days to find 14 valid business days
    while (daysAdded < 14 && iterations < 30) {
      iterations++;
      const current = new Date();
      current.setDate(today.getDate() + iterations);
      
      const dateStr = current.toISOString().split('T')[0];
      const weekday = current.getDay(); // 0 is Sunday, etc.

      // Check if open on this weekday
      if (!businessHours.openDays.includes(weekday)) continue;

      // Check if it's a holiday
      if (businessHours.holidays.includes(dateStr)) continue;

      // Check if it's a blocked date
      const isBlocked = businessHours.blockedDates.some(b => b.date === dateStr);
      if (isBlocked) continue;

      dates.push(current);
      daysAdded++;
    }
    return dates;
  }, [businessHours]);

  // GENERATE TIME SLOTS (Respects openingTime, closingTime, lunchStart, lunchEnd, and dynamic service duration)
  const allTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return [];

    const slots: string[] = [];
    
    // Parse times into minutes from start of day
    const parseToMinutes = (timeStr: string): number => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + (m || 0);
    };

    const formatFromMinutes = (mins: number): string => {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    const openMin = parseToMinutes(businessHours.openingTime);
    const closeMin = parseToMinutes(businessHours.closingTime);
    const lunchStartMin = parseToMinutes(businessHours.lunchStart);
    const lunchEndMin = parseToMinutes(businessHours.lunchEnd);

    // Selected service duration
    const serviceDuration = selectedService.durationMin;

    // Grid interval for starting times remains 30 minutes
    const startInterval = 30;

    // Get all busy intervals on selectedDate
    const busyIntervals = existingBookings
      .filter(b => b.date === selectedDate && b.status === 'confirmed')
      .map(b => {
        const start = parseToMinutes(b.time);
        // Find service duration
        const s = services.find(x => x.id === b.serviceId);
        const duration = s ? s.durationMin : 30; // fallback to 30 mins
        return { start, end: start + duration };
      });

    for (let current = openMin; current < closeMin; current += startInterval) {
      const slotStart = current;
      const slotEnd = current + serviceDuration;

      // 1. Ensure the slot doesn't overrun the closing time
      if (slotEnd > closeMin) {
        continue;
      }

      // 2. Check if proposed slot overlaps with lunch break
      const overlapsLunch = Math.max(slotStart, lunchStartMin) < Math.min(slotEnd, lunchEndMin);
      if (overlapsLunch) {
        continue;
      }

      // 3. Check if proposed slot overlaps with any existing booking
      const hasConflict = busyIntervals.some(busy => {
        return Math.max(slotStart, busy.start) < Math.min(slotEnd, busy.end);
      });
      if (hasConflict) {
        continue;
      }

      // Format slot to HH:MM
      const slotTimeStr = formatFromMinutes(slotStart);
      
      // 4. Filter out slots that are in the past if selectedDate is today (using local/browser timezone comparison)
      const todayStr = new Date().toISOString().split('T')[0];
      if (selectedDate === todayStr) {
        const now = new Date();
        const [sh, sm] = slotTimeStr.split(':').map(Number);
        const slotDateTime = new Date();
        slotDateTime.setHours(sh, sm, 0, 0);
        if (slotDateTime <= now) {
          continue;
        }
      }

      slots.push(slotTimeStr);
    }
    return slots;
  }, [selectedDate, selectedService, businessHours, existingBookings, services]);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const promo = promotions.find(p => p.code.toUpperCase() === couponCode.trim().toUpperCase());
    
    if (!promo) {
      setCouponError('Cupom inválido ou não encontrado.');
      setAppliedPromotion(null);
      return;
    }

    if (!promo.isActive) {
      setCouponError('Este cupom de desconto expirou.');
      setAppliedPromotion(null);
      return;
    }

    if (promo.maxUses && promo.currentUses >= promo.maxUses) {
      setCouponError('Este cupom já atingiu o limite de utilizações.');
      setAppliedPromotion(null);
      return;
    }

    if (selectedService && selectedVehicle) {
      const basePrice = selectedService.prices[selectedVehicle as keyof typeof selectedService.prices] || 0;
      if (promo.minPriceRequired && basePrice < promo.minPriceRequired) {
        setCouponError(`Este cupom só é válido para serviços acima de R$ ${promo.minPriceRequired}.`);
        setAppliedPromotion(null);
        return;
      }
    }

    // Success
    setAppliedPromotion(promo);
    setCouponSuccess(`Cupom "${promo.code.toUpperCase()}" aplicado com sucesso!`);
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit Booking
      if (selectedService && selectedVehicle && selectedDate && selectedTime) {
        onSubmitBooking({
          vehicle: selectedVehicle,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          date: selectedDate,
          time: selectedTime,
          plate: plate || undefined,
          price: finalPrice
        });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!selectedVehicle;
      case 2:
        return !!selectedService;
      case 3:
        return !!selectedDate;
      case 4:
        return !!selectedTime;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="fade-in max-w-3xl mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6 md:p-8">
        
        {/* PROGRESS BAR */}
        <div className="flex items-center justify-between mb-10 overflow-x-auto no-scrollbar pb-2">
          {[1, 2, 3, 4, 5].map((step) => {
            const labels = ['Veículo', 'Serviço', 'Data', 'Horário', 'Confirmar'];
            const isPassed = step < currentStep;
            const isCurrent = step === currentStep;
            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    isPassed 
                      ? 'bg-green-500 text-white' 
                      : isCurrent 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    {isPassed ? <Check className="w-5 h-5 stroke-[2.5]" /> : step}
                  </div>
                  <span className={`text-[11px] font-bold mt-1 tracking-tight ${isCurrent ? 'text-blue-600' : 'text-gray-400'}`}>
                    {labels[step - 1]}
                  </span>
                </div>
                {step < 5 && (
                  <div className={`w-8 sm:w-16 h-0.5 mx-1 mb-4 ${isPassed ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* STEP 1: VEHICLE */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tipo de Veículo</h2>
              <p className="text-gray-500 text-sm">Selecione a categoria do seu veículo para exibir os preços corretos.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { id: 'Moto', label: 'Moto', icon: Bike },
                { id: 'Carro', label: 'Carro', icon: Car },
                { id: 'SUV', label: 'SUV', icon: Car },
                { id: 'Caminhonete', label: 'Caminhonete', icon: Truck }
              ].map((v) => {
                const IconComponent = v.icon;
                const isSelected = selectedVehicle === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVehicle(v.id);
                      setSelectedService(null); // Reset service when vehicle changes
                    }}
                    className={`flex flex-col items-center gap-3 p-6 border-2 rounded-xl transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/70 text-blue-600 font-bold' 
                        : 'border-gray-200 hover:border-blue-200 bg-white text-gray-600 hover:text-blue-500'
                    }`}
                  >
                    <div className={`p-4 rounded-xl ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">{v.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: SERVICE */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Serviço Desejado</h2>
              <p className="text-gray-500 text-sm">Escolha a estética ou limpeza ideal para o seu veículo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.filter(s => s.isAvailable).map((s) => {
                const isSelected = selectedService?.id === s.id;
                const price = s.prices[selectedVehicle as keyof typeof s.prices] || 0;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`p-5 border-2 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/60' 
                        : 'border-gray-100 hover:border-blue-200 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex gap-4 items-start">
                      <div className="bg-blue-100 p-3 rounded-xl mt-1">
                        <Sparkles className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 leading-tight">{s.name}</h3>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{s.description}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-3 border-t border-gray-100/80 w-full">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{s.durationMin} min</span>
                      <span className="text-xl font-extrabold text-blue-600">R$ {price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: DATE */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Data do Agendamento</h2>
              <p className="text-gray-500 text-sm">Mostrando apenas dias em que a empresa funciona, excluindo feriados ou bloqueios.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableDates.map((d) => {
                const dateStr = d.toISOString().split('T')[0];
                const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' });
                const dayNum = d.getDate();
                const month = d.toLocaleDateString('pt-BR', { month: 'short' });
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setSelectedTime(''); // reset time slot
                    }}
                    className={`p-4 border-2 rounded-xl transition-all text-center cursor-pointer ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 font-bold' 
                        : 'border-gray-200 hover:border-blue-200 bg-white text-gray-600'
                    }`}
                  >
                    <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-75">{weekday}</div>
                    <div className="text-2xl font-black tracking-tight">{dayNum}</div>
                    <div className="text-xs font-bold uppercase tracking-wider mt-1 opacity-75">{month}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: TIME */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Horário Disponível</h2>
              <p className="text-gray-500 text-sm">Disponibilidade filtrada para o dia selecionado (excluindo almoço e agendamentos ocupados).</p>
            </div>

            {allTimeSlots.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-xl">
                <p className="text-gray-500 font-semibold">Sem horários de funcionamento disponíveis para este dia.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {allTimeSlots.map((time) => {
                  // Check if slot is already occupied
                  const isOccupied = existingBookings.some(
                    b => b.date === selectedDate && b.time === time && b.status === 'confirmed'
                  );
                  const isSelected = selectedTime === time;

                  return (
                    <button
                      key={time}
                      disabled={isOccupied}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3.5 border-2 rounded-xl text-center font-bold tracking-tight transition-all cursor-pointer ${
                        isOccupied 
                          ? 'border-gray-150 bg-gray-50 text-gray-300 cursor-not-allowed line-through' 
                          : isSelected 
                            ? 'border-blue-600 bg-blue-50 text-blue-600' 
                            : 'border-gray-200 hover:border-blue-200 bg-white text-gray-700'
                      }`}
                    >
                      {time}
                      {isOccupied && <span className="block text-[9px] font-bold uppercase tracking-wider mt-0.5">Ocupado</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 5: CONFIRMATION */}
        {currentStep === 5 && selectedService && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Confirmar e Finalizar</h2>
              <p className="text-gray-500 text-sm">Revise as informações e adicione cupons antes de confirmar.</p>
            </div>

            <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                <span className="text-gray-500 font-semibold">Veículo</span>
                <span className="font-extrabold text-gray-900">{selectedVehicle}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                <span className="text-gray-500 font-semibold">Serviço</span>
                <span className="font-extrabold text-gray-900">{selectedService.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                <span className="text-gray-500 font-semibold">Data e Horário</span>
                <span className="font-extrabold text-gray-900">{formatDateLabel(selectedDate)} às {selectedTime}</span>
              </div>

              {/* Promo code application block */}
              <div className="py-4 border-b border-gray-200/50 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Cupom de Desconto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="DIGITEOCUPOM"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl uppercase font-bold outline-none text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
                {couponError && <p className="text-xs font-bold text-red-600">{couponError}</p>}
                {couponSuccess && <p className="text-xs font-bold text-green-600">{couponSuccess}</p>}
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 font-bold">Total a pagar</span>
                <div className="text-right">
                  {appliedPromotion && (
                    <span className="text-xs text-gray-400 font-bold line-through block">
                      R$ {selectedService.prices[selectedVehicle as keyof typeof selectedService.prices]}
                    </span>
                  )}
                  <span className="text-2xl font-black text-blue-600">R$ {finalPrice},00</span>
                </div>
              </div>
            </div>

            {/* Optional plate */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Placa do Veículo (Opcional)</label>
              <input
                type="text"
                value={plate}
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                maxLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none uppercase font-bold tracking-wide focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex gap-4 mt-10 pt-4 border-t border-gray-100">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer ${
              currentStep === 1 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            Voltar
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3.5 text-white font-extrabold tracking-wide rounded-xl transition-all cursor-pointer ${
              isStepValid() 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-md' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === 5 ? 'Confirmar Agendamento' : 'Avançar'}
            {currentStep < 5 && <ChevronRight className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </div>

      </div>
    </div>
  );
}
