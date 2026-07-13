/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Booking, Service, BusinessHours, Promotion, SystemConfig, InternalNotification } from './types';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, sanitizeForFirestore } from './firebase';

// Pre-defined services matching the exact prices and specs of the user template
const DEFAULT_SERVICES: Service[] = [
  {
    id: 'simples',
    name: 'Lavação Simples',
    description: 'Limpeza externa completa com cera líquida e secagem manual.',
    durationMin: 45,
    prices: { Moto: 30, Carro: 50, SUV: 70, Caminhonete: 80 },
    icon: 'Droplet',
    category: 'Lavação',
    isAvailable: true
  },
  {
    id: 'completa',
    name: 'Lavação Completa',
    description: 'Limpeza externa detalhada + aspiração interna completa, limpeza de painel e vidros.',
    durationMin: 90,
    prices: { Moto: 60, Carro: 90, SUV: 120, Caminhonete: 140 },
    icon: 'Sparkles',
    category: 'Lavação',
    isAvailable: true
  },
  {
    id: 'polimento',
    name: 'Polimento',
    description: 'Polimento técnico profissional de pintura + remoção de micro-riscos + aplicação de cera protetora premium.',
    durationMin: 180,
    prices: { Moto: 100, Carro: 150, SUV: 200, Caminhonete: 220 },
    icon: 'Shield',
    category: 'Estética',
    isAvailable: true
  },
  {
    id: 'higienizacao',
    name: 'Higienização Interna',
    description: 'Limpeza profunda e higienização antibacteriana de todos os bancos, teto, carpetes e painéis.',
    durationMin: 120,
    prices: { Moto: 80, Carro: 120, SUV: 160, Caminhonete: 180 },
    icon: 'Car',
    category: 'Estética',
    isAvailable: true
  }
];

const DEFAULT_USERS: (User & { password?: string })[] = [
  {
    id: 'usr-admin',
    name: 'Ricardo Administrador',
    email: 'admin@lavafacil.com',
    phone: '(47) 98888-1111',
    role: 'administrador',
    createdAt: '2026-01-10T10:00:00Z',
    password: 'admin123'
  },
  {
    id: 'usr-client1',
    name: 'Ana Silva',
    email: 'ana.silva@gmail.com',
    phone: '(47) 99999-1234',
    role: 'cliente',
    createdAt: '2026-02-15T14:30:00Z',
    password: 'user123'
  },
  {
    id: 'usr-client2',
    name: 'Marcos Oliveira',
    email: 'marcos@hotmail.com',
    phone: '(47) 99777-5678',
    role: 'cliente',
    createdAt: '2026-03-20T09:15:00Z',
    password: 'user123'
  },
  {
    id: 'usr-client3',
    name: 'Beatriz Costa',
    email: 'beatriz.c@gmail.com',
    phone: '(47) 99666-8888',
    role: 'cliente',
    createdAt: '2026-05-12T11:45:00Z',
    password: 'user123'
  }
];

// Helper to generate absolute date strings relative to 2026-07-08
const relativeDate = (daysOffset: number): string => {
  const baseDate = new Date('2026-07-08');
  baseDate.setDate(baseDate.getDate() + daysOffset);
  return baseDate.toISOString().split('T')[0];
};

const DEFAULT_BOOKINGS: Booking[] = [];

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  openDays: [1, 2, 3, 4, 5, 6], // Segunda a Sábado
  openingTime: '08:00',
  closingTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
  holidays: ['2026-12-25', '2026-01-01', '2026-09-07'],
  blockedDates: [],
  isTemporarilyClosed: false,
  temporaryCloseMessage: 'Nossa agenda de atendimentos está temporariamente fechada para manutenção interna. Retornamos em breve!'
};

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'p-1',
    code: 'BENVINDO10',
    description: '10% de desconto na sua primeira lavação com o Lava Fácil.',
    discountType: 'percentage',
    discountValue: 10,
    maxUses: 100,
    currentUses: 45,
    startDate: relativeDate(-10),
    endDate: relativeDate(30),
    isActive: true
  },
  {
    id: 'p-2',
    code: 'QUARTAOFF',
    description: 'R$ 15,00 de desconto especial de meio de semana!',
    discountType: 'fixed',
    discountValue: 15,
    maxUses: 50,
    currentUses: 12,
    startDate: relativeDate(-5),
    endDate: relativeDate(20),
    isActive: true,
    minPriceRequired: 80
  }
];

const DEFAULT_CONFIG: SystemConfig = {
  companyName: 'Lava Fácil Estética Automotiva',
  phone: '(47) 99999-9999',
  whatsapp: '(47) 99999-9999',
  address: 'Av. Central, 1200 - Centro, Balneário Camboriú - SC',
  instagram: '@lavafacil_estetica',
  facebook: 'lavafaciloficial',
  welcomeMessage: 'Olá! Seja bem-vindo ao sistema Lava Fácil. Agende sua estética automotiva em poucos cliques com total comodidade!',
  cancellationPolicyHours: 2,
  logoIcon: 'Car'
};

const DEFAULT_NOTIFICATIONS: InternalNotification[] = [];

// INITIALIZATION & REAL-TIME FIRESTORE SYNC
let changeListeners: (() => void)[] = [];

export const dataStore = {
  // SUBSCRIBABLE CHANGE LISTENER FOR REAL-TIME REACT UPDATES
  onChange: (callback: () => void) => {
    changeListeners.push(callback);
    return () => {
      changeListeners = changeListeners.filter(l => l !== callback);
    };
  },
  triggerChange: () => {
    changeListeners.forEach(l => {
      try {
        l();
      } catch (err) {
        console.error('Error triggering dataStore change listener:', err);
      }
    });
  },

  // SERVICES
  getServices: (): Service[] => JSON.parse(localStorage.getItem('lf_services') || '[]'),
  saveServices: (services: Service[]) => {
    localStorage.setItem('lf_services', JSON.stringify(services));
    dataStore.triggerChange();
  },
  addService: (service: Service) => {
    const services = dataStore.getServices();
    services.push(service);
    dataStore.saveServices(services);
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'services', service.id), sanitizeForFirestore(service)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `services/${service.id}`)
    );
  },
  updateService: (updated: Service) => {
    const services = dataStore.getServices();
    const index = services.findIndex(s => s.id === updated.id);
    if (index > -1) {
      services[index] = updated;
      dataStore.saveServices(services);
    }
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'services', updated.id), sanitizeForFirestore(updated)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `services/${updated.id}`)
    );
  },
  deleteService: (id: string) => {
    const services = dataStore.getServices();
    const filtered = services.filter(s => s.id !== id);
    dataStore.saveServices(filtered);
    
    // Delete from Firestore asynchronously
    deleteDoc(doc(db, 'services', id)).catch(e => 
      handleFirestoreError(e, OperationType.DELETE, `services/${id}`)
    );
  },

  // USERS
  getUsers: (): User[] => JSON.parse(localStorage.getItem('lf_users') || '[]'),
  saveUsers: (users: User[]) => {
    localStorage.setItem('lf_users', JSON.stringify(users));
    dataStore.triggerChange();
  },
  addUser: (user: User) => {
    const users = dataStore.getUsers();
    users.push(user);
    dataStore.saveUsers(users);
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'users', user.id), sanitizeForFirestore(user)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `users/${user.id}`)
    );
  },
  updateUser: (updated: User) => {
    const users = dataStore.getUsers();
    const index = users.findIndex(u => u.id === updated.id);
    if (index > -1) {
      users[index] = updated;
      dataStore.saveUsers(users);
    }
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'users', updated.id), sanitizeForFirestore(updated)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `users/${updated.id}`)
    );
  },

  // BOOKINGS
  getBookings: (): Booking[] => JSON.parse(localStorage.getItem('lf_bookings') || '[]'),
  saveBookings: (bookings: Booking[]) => {
    localStorage.setItem('lf_bookings', JSON.stringify(bookings));
    dataStore.triggerChange();
  },
  addBooking: (booking: Booking) => {
    const bookings = dataStore.getBookings();
    bookings.unshift(booking);
    dataStore.saveBookings(bookings);
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'bookings', booking.id), sanitizeForFirestore(booking)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `bookings/${booking.id}`)
    );
    
    // Auto-generate a notification for the administrator panel
    dataStore.addNotification({
      id: 'notif-' + Date.now(),
      type: 'new_booking',
      message: `Novo agendamento: ${booking.customerName} agendou ${booking.serviceName} para o dia ${booking.date.split('-').reverse().join('/')} às ${booking.time}.`,
      timestamp: new Date().toISOString(),
      read: false,
      bookingId: booking.id
    });
  },
  updateBooking: (updated: Booking) => {
    const bookings = dataStore.getBookings();
    const index = bookings.findIndex(b => b.id === updated.id);
    if (index > -1) {
      const old = bookings[index];
      bookings[index] = updated;
      dataStore.saveBookings(bookings);

      // Write to Firestore asynchronously
      setDoc(doc(db, 'bookings', updated.id), sanitizeForFirestore(updated)).catch(e => 
        handleFirestoreError(e, OperationType.WRITE, `bookings/${updated.id}`)
      );

      // Check status transition to log notification
      if (old.status !== updated.status) {
        let type: 'cancelled_booking' | 'completed_booking' | 'system' = 'system';
        let msg = '';
        if (updated.status === 'cancelled') {
          type = 'cancelled_booking';
          msg = `Agendamento cancelado: ${updated.customerName} cancelou o serviço de ${updated.serviceName} (${updated.date.split('-').reverse().join('/')}).`;
        } else if (updated.status === 'completed') {
          type = 'completed_booking';
          msg = `Serviço concluído: ${updated.customerName} realizou ${updated.serviceName} com sucesso!`;
        }
        
        if (msg) {
          dataStore.addNotification({
            id: 'notif-' + Date.now(),
            type,
            message: msg,
            timestamp: new Date().toISOString(),
            read: false,
            bookingId: updated.id
          });
        }
      }
    }
  },

  // BUSINESS HOURS
  getBusinessHours: (): BusinessHours => JSON.parse(localStorage.getItem('lf_business_hours') || '{}'),
  saveBusinessHours: (hours: BusinessHours) => {
    localStorage.setItem('lf_business_hours', JSON.stringify(hours));
    dataStore.triggerChange();
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'business_hours', 'current'), sanitizeForFirestore(hours)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, 'business_hours/current')
    );
  },

  // PROMOTIONS
  getPromotions: (): Promotion[] => JSON.parse(localStorage.getItem('lf_promotions') || '[]'),
  savePromotions: (promos: Promotion[]) => {
    localStorage.setItem('lf_promotions', JSON.stringify(promos));
    dataStore.triggerChange();
  },
  addPromotion: (promo: Promotion) => {
    const promos = dataStore.getPromotions();
    promos.push(promo);
    dataStore.savePromotions(promos);
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'promotions', promo.id), sanitizeForFirestore(promo)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `promotions/${promo.id}`)
    );
  },
  updatePromotion: (updated: Promotion) => {
    const promos = dataStore.getPromotions();
    const index = promos.findIndex(p => p.id === updated.id);
    if (index > -1) {
      promos[index] = updated;
      dataStore.savePromotions(promos);
    }
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'promotions', updated.id), sanitizeForFirestore(updated)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `promotions/${updated.id}`)
    );
  },
  deletePromotion: (id: string) => {
    const promos = dataStore.getPromotions();
    const filtered = promos.filter(p => p.id !== id);
    dataStore.savePromotions(filtered);
    
    // Delete from Firestore asynchronously
    deleteDoc(doc(db, 'promotions', id)).catch(e => 
      handleFirestoreError(e, OperationType.DELETE, `promotions/${id}`)
    );
  },

  // SYSTEM CONFIG
  getConfig: (): SystemConfig => JSON.parse(localStorage.getItem('lf_config') || '{}'),
  saveConfig: (config: SystemConfig) => {
    localStorage.setItem('lf_config', JSON.stringify(config));
    dataStore.triggerChange();
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'system_config', 'current'), sanitizeForFirestore(config)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, 'system_config/current')
    );
  },

  // NOTIFICATIONS
  getNotifications: (): InternalNotification[] => JSON.parse(localStorage.getItem('lf_notifications') || '[]'),
  saveNotifications: (notifs: InternalNotification[]) => {
    localStorage.setItem('lf_notifications', JSON.stringify(notifs));
    dataStore.triggerChange();
  },
  addNotification: (notif: InternalNotification) => {
    const notifs = dataStore.getNotifications();
    notifs.unshift(notif);
    dataStore.saveNotifications(notifs);
    
    // Write to Firestore asynchronously
    setDoc(doc(db, 'notifications', notif.id), sanitizeForFirestore(notif)).catch(e => 
      handleFirestoreError(e, OperationType.WRITE, `notifications/${notif.id}`)
    );
  },
  markAllNotificationsRead: () => {
    const notifs = dataStore.getNotifications().map(n => ({ ...n, read: true }));
    dataStore.saveNotifications(notifs);
    
    // Write to Firestore in an atomic batch
    try {
      const batch = writeBatch(db);
      notifs.forEach(n => {
        batch.set(doc(db, 'notifications', n.id), sanitizeForFirestore(n));
      });
      batch.commit().catch(e => 
        handleFirestoreError(e, OperationType.WRITE, 'notifications-mark-read-batch')
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'notifications-mark-read-batch');
    }
  },
  clearNotifications: () => {
    const currentNotifs = dataStore.getNotifications();
    dataStore.saveNotifications([]);
    
    // Delete from Firestore in an atomic batch
    try {
      const batch = writeBatch(db);
      currentNotifs.forEach(n => {
        batch.delete(doc(db, 'notifications', n.id));
      });
      batch.commit().catch(e => 
        handleFirestoreError(e, OperationType.DELETE, 'notifications-clear-batch')
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'notifications-clear-batch');
    }
  }
};

// INITIALIZATION WITH REAL-TIME SYNC & AUTO-SEEDING
export const initFirebaseSync = () => {
  // Clear obsolete mock data if exists
  const storedBookings = localStorage.getItem('lf_bookings');
  if (storedBookings && storedBookings.includes('usr-client1')) {
    localStorage.removeItem('lf_bookings');
  }
  const storedNotifs = localStorage.getItem('lf_notifications');
  if (storedNotifs && storedNotifs.includes('Marcos Oliveira')) {
    localStorage.removeItem('lf_notifications');
  }

  // 1. SERVICES SYNC
  onSnapshot(collection(db, 'services'), (snapshot) => {
    if (snapshot.empty) {
      // Seed Firestore if empty
      DEFAULT_SERVICES.forEach(s => {
        setDoc(doc(db, 'services', s.id), sanitizeForFirestore(s)).catch(e => 
          handleFirestoreError(e, OperationType.WRITE, `services/${s.id}`)
        );
      });
    } else {
      const services: Service[] = [];
      snapshot.forEach(docSnap => {
        services.push(docSnap.data() as Service);
      });
      localStorage.setItem('lf_services', JSON.stringify(services));
      dataStore.triggerChange();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'services');
  });

  // 2. USERS SYNC
  onSnapshot(collection(db, 'users'), (snapshot) => {
    if (snapshot.empty) {
      // Seed Firestore if empty
      DEFAULT_USERS.forEach(u => {
        setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u)).catch(e => 
          handleFirestoreError(e, OperationType.WRITE, `users/${u.id}`)
        );
      });
    } else {
      const users: User[] = [];
      snapshot.forEach(docSnap => {
        users.push(docSnap.data() as User);
      });
      localStorage.setItem('lf_users', JSON.stringify(users));
      dataStore.triggerChange();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'users');
  });

  // 3. BOOKINGS SYNC
  onSnapshot(collection(db, 'bookings'), (snapshot) => {
    const bookings: Booking[] = [];
    snapshot.forEach(docSnap => {
      bookings.push(docSnap.data() as Booking);
    });
    // Sort bookings: newly created first (by createdAt desc)
    bookings.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    localStorage.setItem('lf_bookings', JSON.stringify(bookings));
    dataStore.triggerChange();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'bookings');
  });

  // 4. BUSINESS HOURS SYNC
  onSnapshot(doc(db, 'business_hours', 'current'), (snapshot) => {
    if (!snapshot.exists()) {
      setDoc(doc(db, 'business_hours', 'current'), sanitizeForFirestore(DEFAULT_BUSINESS_HOURS)).catch(e => 
        handleFirestoreError(e, OperationType.WRITE, 'business_hours/current')
      );
    } else {
      localStorage.setItem('lf_business_hours', JSON.stringify(snapshot.data()));
      dataStore.triggerChange();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'business_hours/current');
  });

  // 5. PROMOTIONS SYNC
  onSnapshot(collection(db, 'promotions'), (snapshot) => {
    if (snapshot.empty) {
      DEFAULT_PROMOTIONS.forEach(p => {
        setDoc(doc(db, 'promotions', p.id), sanitizeForFirestore(p)).catch(e => 
          handleFirestoreError(e, OperationType.WRITE, `promotions/${p.id}`)
        );
      });
    } else {
      const promos: Promotion[] = [];
      snapshot.forEach(docSnap => {
        promos.push(docSnap.data() as Promotion);
      });
      localStorage.setItem('lf_promotions', JSON.stringify(promos));
      dataStore.triggerChange();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'promotions');
  });

  // 6. SYSTEM CONFIG SYNC
  onSnapshot(doc(db, 'system_config', 'current'), (snapshot) => {
    if (!snapshot.exists()) {
      setDoc(doc(db, 'system_config', 'current'), sanitizeForFirestore(DEFAULT_CONFIG)).catch(e => 
        handleFirestoreError(e, OperationType.WRITE, 'system_config/current')
      );
    } else {
      localStorage.setItem('lf_config', JSON.stringify(snapshot.data()));
      dataStore.triggerChange();
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'system_config/current');
  });

  // 7. NOTIFICATIONS SYNC
  onSnapshot(collection(db, 'notifications'), (snapshot) => {
    const notifications: InternalNotification[] = [];
    snapshot.forEach(docSnap => {
      notifications.push(docSnap.data() as InternalNotification);
    });
    // Sort notifications: newly created first
    notifications.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    localStorage.setItem('lf_notifications', JSON.stringify(notifications));
    dataStore.triggerChange();
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'notifications');
  });
};

initFirebaseSync();
