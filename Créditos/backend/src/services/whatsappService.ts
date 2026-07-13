/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Booking } from '../types';

export const whatsappService = {
  /**
   * Generates a beautifully formatted WhatsApp notification message.
   */
  generateMessage(action: 'creation' | 'cancellation' | 'alteration', booking: Booking): string {
    const actionText = {
      creation: '🆕 NOVO AGENDAMENTO',
      cancellation: '❌ AGENDAMENTO CANCELADO',
      alteration: '🔄 AGENDAMENTO ALTERADO'
    }[action];

    const dateFormatted = booking.date.split('-').reverse().join('/');

    return `*${actionText}*

👤 *Cliente:* ${booking.customerName}
📞 *Celular:* ${booking.customerPhone}
🚗 *Veículo:* ${booking.vehicle}${booking.plate ? ` (${booking.plate.toUpperCase()})` : ''}
🧼 *Serviço:* ${booking.serviceName}
📅 *Data:* ${dateFormatted}
⏰ *Horário:* ${booking.time}
💰 *Valor:* R$ ${booking.price},00

---
_Gerado automaticamente pelo sistema Lava Fácil_`;
  },

  /**
   * Sends or queues the message (decoupled, ready for future Twilio, Meta, or direct WhatsApp API integration).
   */
  sendNotification(action: 'creation' | 'cancellation' | 'alteration', booking: Booking, targetPhone: string) {
    const message = this.generateMessage(action, booking);
    
    // Log clearly to terminal/console for testing & diagnostic verification
    console.group(`[WhatsApp Notification - Decoupled Engine]`);
    console.log(`Action: ${action.toUpperCase()}`);
    console.log(`Target Business Phone: ${targetPhone}`);
    console.log(`Message Content:\n${message}`);
    console.groupEnd();

    // Save logs to localStorage for verification in the admin settings or diagnostics
    try {
      const logs = JSON.parse(localStorage.getItem('lf_whatsapp_logs') || '[]');
      logs.unshift({
        id: 'wa-log-' + Date.now(),
        action,
        bookingId: booking.id,
        phone: targetPhone,
        message,
        timestamp: new Date().toISOString(),
        sent: false
      });
      localStorage.setItem('lf_whatsapp_logs', JSON.stringify(logs));
    } catch (e) {
      console.error('Error saving WhatsApp notification log:', e);
    }
  },

  /**
   * Generates a direct click-to-chat URL for browser manual dispatch or verification
   */
  getDirectUrl(action: 'creation' | 'cancellation' | 'alteration', booking: Booking, targetPhone: string): string {
    const message = this.generateMessage(action, booking);
    const cleanPhone = targetPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }
};
