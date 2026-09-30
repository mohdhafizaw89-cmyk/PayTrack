import { Programme, Milestone, PaymentTermKey } from '../types';
import { formatDate, addDays } from './dateUtils';

export const STORAGE_KEY = 'RIGHTSFLOW_PAYMENT_TRACKER_V1';

export const generateMilestones = (totalAmount: number, termKey: PaymentTermKey): Milestone[] => {
  const amt = Math.max(0, Number(totalAmount) || 0);

  switch (termKey) {
    case '30_70':
      return [
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Milestone 1: 30% Contract Signing',
          percentage: 30,
          amount: Math.round(amt * 0.3),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Milestone 2: 70% Material Delivery',
          percentage: 70,
          amount: Math.round(amt * 0.7),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ];

    case '50_50':
      return [
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Milestone 1: 50% Contract Execution',
          percentage: 50,
          amount: Math.round(amt * 0.5),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Milestone 2: 50% Delivery Master Acceptance',
          percentage: 50,
          amount: Math.round(amt * 0.5),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ];

    case '100_delivery':
      return [
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Milestone 1: 100% Full Technical Delivery',
          percentage: 100,
          amount: amt,
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ];

    case '20_40_40':
      return [
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Stage 1: 20% Initial Execution',
          percentage: 20,
          amount: Math.round(amt * 0.2),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Stage 2: 40% QC Passed Masters',
          percentage: 40,
          amount: Math.round(amt * 0.4),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Stage 3: 40% Linear Broadcast Window',
          percentage: 40,
          amount: Math.round(amt * 0.4),
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ];

    default:
      return [
        {
          id: 'm_' + Math.random().toString(36).substring(2, 9),
          title: 'Milestone 1: Full Payment',
          percentage: 100,
          amount: amt,
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ];
  }
};

export const getInitialSampleData = (): Programme[] => {
  const now = new Date();
  const todayStr = formatDate(now);
  
  // Calculate relative dates anchored around today for active realism
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(now.getDate() - 2);
  const sTwoAgo = formatDate(twoDaysAgo);

  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(now.getDate() - 10);
  const sTenAgo = formatDate(tenDaysAgo);

  const sixDaysAgo = new Date();
  sixDaysAgo.setDate(now.getDate() - 6);
  const sSixAgo = formatDate(sixDaysAgo);

  return [
    {
      id: 'prog_sample_1',
      title: 'Drama Series: Midnight Echoes (Season 3)',
      vendor: 'StudioCanal Asia Pacific',
      contractRef: 'SC-2026-ASIA-0914',
      totalAmount: 10000,
      termKey: '30_70',
      termsLabel: '30% Signing / 70% Material Delivery',
      createdAt: '2026-09-10',
      agreementSignDate: '2026-09-10',
      rightsType: 'Linear & SVOD Exclusive',
      currency: 'MYR',
      milestones: [
        {
          id: 'm_s1_1',
          title: 'Milestone 1: 30% Contract Signing',
          percentage: 30,
          amount: 3000,
          materialReceived: true,
          materialDate: sTenAgo,
          invoiceReceived: true,
          invoiceDate: sTenAgo,
          paid: true,
          paidDate: sSixAgo,
          dueDate: addDays(sTenAgo, 7),
        },
        {
          id: 'm_s1_2',
          title: 'Milestone 2: 70% Material Delivery',
          percentage: 70,
          amount: 7000,
          materialReceived: true,
          materialDate: sTwoAgo,
          invoiceReceived: true,
          invoiceDate: sTwoAgo,
          paid: false,
          paidDate: null,
          dueDate: addDays(sTwoAgo, 7), // Due in 5 days
        },
      ],
    },
    {
      id: 'prog_sample_2',
      title: 'Nordic Noir Mini-Series: The Frost Veil',
      vendor: 'Global Content Distribution Ltd',
      contractRef: 'GCD-NN-2026-88',
      totalAmount: 45000,
      termKey: '50_50',
      termsLabel: '50% Signing / 50% Material Delivery',
      createdAt: '2026-09-08',
      agreementSignDate: '2026-09-08',
      rightsType: 'Pan-Territory Pay-TV & OTT',
      currency: 'MYR',
      milestones: [
        {
          id: 'm_s2_1',
          title: 'Milestone 1: 50% Contract Execution',
          percentage: 50,
          amount: 22500,
          materialReceived: true,
          materialDate: sTenAgo,
          invoiceReceived: true,
          invoiceDate: sTenAgo,
          paid: true,
          paidDate: sSixAgo,
          dueDate: addDays(sTenAgo, 7),
        },
        {
          id: 'm_s2_2',
          title: 'Milestone 2: 50% Delivery Master Acceptance',
          percentage: 50,
          amount: 22500,
          materialReceived: true,
          materialDate: todayStr,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ],
    },
    {
      id: 'prog_sample_3',
      title: 'Culinary World Tour 4K (Ep 1-12)',
      vendor: 'Bavaria Media International',
      contractRef: 'BMI-4K-CWT-2026',
      totalAmount: 18000,
      termKey: '30_70',
      termsLabel: '30% Signing / 70% Material Delivery',
      createdAt: '2026-09-15',
      agreementSignDate: '2026-09-15',
      rightsType: '4K Linear Broadcast Non-Exclusive',
      currency: 'MYR',
      milestones: [
        {
          id: 'm_s3_1',
          title: 'Milestone 1: 30% Contract Signing',
          percentage: 30,
          amount: 5400,
          materialReceived: true,
          materialDate: todayStr,
          invoiceReceived: true,
          invoiceDate: todayStr,
          paid: false,
          paidDate: null,
          dueDate: addDays(todayStr, 7), // Due in 7 days
        },
        {
          id: 'm_s3_2',
          title: 'Milestone 2: 70% Material Delivery',
          percentage: 70,
          amount: 12600,
          materialReceived: false,
          materialDate: null,
          invoiceReceived: false,
          invoiceDate: null,
          paid: false,
          paidDate: null,
          dueDate: null,
        },
      ],
    },
  ];
};

export const loadStoredProgrammes = (): Programme[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleData();
      saveStoredProgrammes(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((p) => ({
        ...p,
        agreementSignDate: p.agreementSignDate || p.createdAt || formatDate(new Date()),
      }));
    }
    return getInitialSampleData();
  } catch (err) {
    console.error('Failed to load programmes from localStorage:', err);
    return getInitialSampleData();
  }
};

export const saveStoredProgrammes = (programmes: Programme[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programmes));
  } catch (err) {
    console.error('Failed to save programmes to localStorage:', err);
  }
};
