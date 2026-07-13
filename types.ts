/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'cliente' | 'administrador' | 'funcionario' | 'gerente';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password?: string;
  isBlocked?: boolean;
  createdAt: string;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicle: string; // 'Moto' | 'Carro' | 'SUV' | 'Caminhonete'
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  plate?: string;
  price: number;
  status: BookingStatus;
  internalNotes?: string;
  createdAt: string;
}

export interface ServicePrices {
  Moto: number;
  Carro: number;
  SUV: number;
  Caminhonete: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  prices: ServicePrices;
  icon: string; // lucide icon name
  category: string;
  isAvailable: boolean;
}

export interface BusinessHours {
  openDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  openingTime: string; // "08:00"
  closingTime: string; // "18:00"
  lunchStart: string; // "12:00"
  lunchEnd: string; // "13:00"
  holidays: string[]; // ["2026-12-25"]
  blockedDates: {
    date: string; // "YYYY-MM-DD"
    reason: string;
  }[];
  isTemporarilyClosed: boolean;
  temporaryCloseMessage: string;
}

export interface Promotion {
  id: string;
  code: string; // e.g. "LAVAFACIL10"
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // percentage (e.g. 10) or fixed value (e.g. 15)
  maxUses?: number;
  currentUses: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  minPriceRequired?: number;
}

export interface SystemConfig {
  companyName: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  welcomeMessage: string;
  cancellationPolicyHours: number;
  logoIcon: string;
}

export interface InternalNotification {
  id: string;
  type: 'new_booking' | 'cancelled_booking' | 'completed_booking' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
  bookingId?: string;
}
