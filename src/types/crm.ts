export interface AgreementItem {
  id: string;
  quotationId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  notes: string | null;
  sortOrder: number;
}

export interface Agreement {
  id: string;
  agreementNumber: string;
  quotationId: string;
  quotationNumber: string | null;
  accountId: string;
  accountName: string;
  organizationName: string;
  eventStartDate: string;
  eventEndDate: string;
  eventCategoryName: string;
  eventCategoryColor: string;
  venueName: string;
  hallName: string;
  customerPhone: string;
  customerEmail: string;
  agreementDate: string;
  status: number;
  statusName: string;
  totalAmount: number;
  specialPrice: number | null;
  paymentStatus: number;
  paymentStatusName: string;
  paidAmount: number;
  remainingAmount: number;
  terms: string;
  notes: string;
  bookingIds: string[];
  bookingCount: number;
  items: AgreementItem[];
  createdByUserName: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface Transaction {
  id: string;
  customerAccountId: string;
  customerAccountName: string | null;
  accountId: string;
  categoryId: string | null;
  direction: number;
  directionName: string;
  taxRate: number;
  paymentStatus: number;
  paymentStatusName: string;
  sourceName: string | null;
  bankAccountId: string;
  bankAccountName: string | null;
  paymentDate: string;
  notes: string | null;
  type: number;
  typeName: string;
  amount: number;
  transactionDate: string;
  description: string;
  paymentMethod: number;
  paymentMethodName: string;
  referenceNumber: string;
  bookingId: string | null;
  agreementId: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

export interface FinancialSummary {
  agreementId: string;
  agreementNumber: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentStatus: number;
  status: number;
  bookingCount: number;
  transactionCount: number;
  transactions: Transaction[];
}

export interface TeamMember {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
  isAvailable: boolean;
  conflictingOrganizationName: string | null;
  conflictStartDate: string | null;
  conflictEndDate: string | null;
}

export interface Equipment {
  id: string;
  name: string;
  model: string;
  category: string;
  quantity: number;
  availableQuantity: number;
  isAvailable: boolean;
  conflictingOrganizationName: string | null;
  conflictStartDate: string | null;
  conflictEndDate: string | null;
}
