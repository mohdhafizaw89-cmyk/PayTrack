export interface Milestone {
  id: string;
  title: string;
  percentage: number;
  amount: number;
  materialReceived: boolean;
  materialDate: string | null;
  invoiceReceived: boolean;
  invoiceDate: string | null;
  paid: boolean;
  paidDate: string | null;
  dueDate: string | null;
  notes?: string;
}

export type PaymentTermKey = '30_70' | '50_50' | '100_delivery' | '20_40_40' | 'custom';

export interface Programme {
  id: string;
  title: string;
  vendor: string;
  contractRef?: string;
  totalAmount: number;
  termKey: PaymentTermKey;
  termsLabel: string;
  milestones: Milestone[];
  createdAt: string;
  agreementSignDate?: string;
  rightsType?: string;
  currency?: string;
}

export interface UrgentMilestoneItem {
  programmeId: string;
  programmeTitle: string;
  vendor: string;
  milestone: Milestone;
  daysLeft: number;
  dueDate: string;
  status: 'DUE_TODAY' | 'OVERDUE' | 'URGENT' | 'UPCOMING';
}

export type FilterTab = 'all' | 'due7' | 'awaiting' | 'paid';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface EmailNotificationRecord {
  id: string;
  recipientEmail: string;
  programmeTitle: string;
  contractRef: string;
  vendor: string;
  milestoneTitle: string;
  amount: number;
  paidDate: string;
  sentAt: string;
  subject: string;
  body: string;
  status: 'sent' | 'pending';
}
