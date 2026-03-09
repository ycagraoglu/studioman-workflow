import { Agreement, FinancialSummary, TeamMember, Equipment } from '../types/crm';

// Mock Data based on the provided JSONs
const mockAgreement: Agreement = {
    "id": "019cce94-d409-7a2c-949a-0c7cef4c1207",
    "agreementNumber": "AG-202603-0002",
    "quotationId": "019cce94-d206-75dc-a1dc-9dafb4bcde99",
    "quotationNumber": null,
    "accountId": "019cce94-c949-7575-aaf4-7f94cc1de0ee",
    "accountName": "ABC Teknoloji A.Ş.",
    "organizationName": "ABC Teknoloji A.Ş.",
    "eventStartDate": "2026-03-22T10:00:00Z",
    "eventEndDate": "2026-03-22T17:00:00Z",
    "eventCategoryName": "Kurumsal Etkinlik",
    "eventCategoryColor": "#795548",
    "venueName": "Ana Stüdyo",
    "hallName": "A Salonu",
    "customerPhone": "+90 212 555 6677",
    "customerEmail": "info@abcteknoloji.com",
    "agreementDate": "2026-03-05T17:53:05.990115Z",
    "status": 1,
    "statusName": "",
    "totalAmount": 9600.00,
    "specialPrice": null,
    "paymentStatus": 2,
    "paymentStatusName": "",
    "paidAmount": 0,
    "remainingAmount": 0,
    "terms": "Kurumsal etkinlik çekimi - Kapora %30, kalan etkinlik günü. 200 kişilik etkinlik, 2 fotoğrafçı görevlendirilecektir.",
    "notes": "İletişim: Ahmet Yılmaz - IT Müdürü",
    "bookingIds": [],
    "bookingCount": 0,
    "items": [
        {
            "id": "019cce94-d356-710d-8b82-4c960bf83923",
            "quotationId": "019cce94-d206-75dc-a1dc-9dafb4bcde99",
            "productId": "019cce94-cb26-72e6-ba04-9f53498cff1e",
            "productName": "Kurumsal Etkinlik Çekimi",
            "quantity": 1,
            "unitPrice": 8000.00,
            "discountPercentage": 0.00,
            "discountAmount": 0.00,
            "taxRate": 0.20,
            "taxAmount": 1600.00,
            "lineTotal": 9600.00,
            "notes": null,
            "sortOrder": 1
        }
    ],
    "createdByUserName": "Tayfun Öztürk",
    "createdAt": "2026-03-08T17:53:06.113858Z",
    "updatedAt": null
};

const mockFinancialSummary: FinancialSummary = {
    "agreementId": "019cce94-d409-7a2c-949a-0c7cef4c1207",
    "agreementNumber": "AG-202603-0002",
    "totalAmount": 9600.00,
    "paidAmount": 3000.00,
    "remainingAmount": 6600.00,
    "paymentStatus": 2,
    "status": 1,
    "bookingCount": 1,
    "transactionCount": 1,
    "transactions": [
        {
            "id": "019cce94-d541-7fc8-92f0-e74152d432d6",
            "customerAccountId": "019cce94-c949-7575-aaf4-7f94cc1de0ee",
            "customerAccountName": null,
            "accountId": "019cce94-c949-7575-aaf4-7f94cc1de0ee",
            "categoryId": null,
            "direction": 1,
            "directionName": "Credit",
            "taxRate": 0.18,
            "paymentStatus": 3,
            "paymentStatusName": "Paid",
            "sourceName": null,
            "bankAccountId": "019cce94-d04a-781a-b8e1-0c21ebda2794",
            "bankAccountName": null,
            "paymentDate": "2026-03-06T17:53:06.262742Z",
            "notes": null,
            "type": 1,
            "typeName": "Income",
            "amount": 3000.00,
            "transactionDate": "2026-03-06T17:53:06.262741Z",
            "description": "Kurumsal Etkinlik Çekimi - Kapora (EFT)",
            "paymentMethod": 3,
            "paymentMethodName": "BankTransfer",
            "referenceNumber": "EFT-2026-00187",
            "bookingId": null,
            "agreementId": "019cce94-d409-7a2c-949a-0c7cef4c1207",
            "createdByUserId": "11111111-1111-1111-1111-111111111111",
            "createdByUserName": "",
            "createdAt": "2026-03-08T17:53:06.4374Z"
        }
    ]
};

const mockTeam: TeamMember[] = [
    {
        "id": "019cce94-cf97-727a-bb2c-56b603d5d01a",
        "name": "Ahmet Yılmaz",
        "specialty": "Düğün & Event Fotoğrafçılığı",
        "imageUrl": "https://i.pravatar.cc/150?u=ahmet",
        "isAvailable": true,
        "conflictingOrganizationName": null,
        "conflictStartDate": null,
        "conflictEndDate": null
    },
    {
        "id": "019cce94-cfc4-75e2-8d13-0bb26d5f69a1",
        "name": "Ayşe Demir",
        "specialty": "Portre & Ürün Fotoğrafçılığı",
        "imageUrl": "https://i.pravatar.cc/150?u=ayse",
        "isAvailable": true,
        "conflictingOrganizationName": null,
        "conflictStartDate": null,
        "conflictEndDate": null
    },
    {
        "id": "019cce94-cfc5-7ea3-86b0-3c4c8a435463",
        "name": "Burak Çelik",
        "specialty": "Ekipman & Organizasyon",
        "imageUrl": "https://i.pravatar.cc/150?u=burak",
        "isAvailable": true,
        "conflictingOrganizationName": null,
        "conflictStartDate": null,
        "conflictEndDate": null
    }
];

const mockEquipment: Equipment[] = [
    {
        "id": "019cce94-cccf-70ef-878b-8b3becf230bd",
        "name": "Canon EOS R5",
        "model": "EOS R5",
        "category": "Kameralar",
        "quantity": 1,
        "availableQuantity": 1,
        "isAvailable": true,
        "conflictingOrganizationName": null,
        "conflictStartDate": null,
        "conflictEndDate": null
    },
    {
        "id": "019cce94-cd18-791d-bccc-df8843b9d950",
        "name": "Canon RF 24-70mm f/2.8",
        "model": "RF 24-70mm f/2.8 L IS USM",
        "category": "Lensler",
        "quantity": 1,
        "availableQuantity": 1,
        "isAvailable": true,
        "conflictingOrganizationName": null,
        "conflictStartDate": null,
        "conflictEndDate": null
    }
];

const mockAgreements: Agreement[] = [
    mockAgreement,
    {
        ...mockAgreement,
        id: "019cce94-d409-7a2c-949a-0c7cef4c1208",
        agreementNumber: "AG-202604-0001",
        accountName: "Ahmet & Ayşe",
        organizationName: "Ahmet & Ayşe Düğün",
        eventStartDate: "2026-04-15T14:00:00Z",
        eventEndDate: "2026-04-15T23:00:00Z",
        eventCategoryName: "Düğün Çekimi",
        eventCategoryColor: "#E91E63",
        venueName: "Çırağan Sarayı",
        hallName: "Balo Salonu",
        totalAmount: 25000.00,
        terms: "Tüm gün dış çekim ve düğün hikayesi.",
        items: [
            {
                id: "019cce94-d356-710d-8b82-4c960bf83924",
                quotationId: "019cce94-d206-75dc-a1dc-9dafb4bcde99",
                productId: "019cce94-cb26-72e6-ba04-9f53498cff1f",
                productName: "Düğün Hikayesi Paketi",
                quantity: 1,
                unitPrice: 25000.00,
                discountPercentage: 0.00,
                discountAmount: 0.00,
                taxRate: 0.20,
                taxAmount: 5000.00,
                lineTotal: 30000.00,
                notes: null,
                sortOrder: 1
            }
        ]
    },
    {
        ...mockAgreement,
        id: "019cce94-d409-7a2c-949a-0c7cef4c1209",
        agreementNumber: "AG-202602-0005",
        accountName: "XYZ Moda",
        organizationName: "İlkbahar Koleksiyonu",
        eventStartDate: "2026-02-10T09:00:00Z", // Past date
        eventEndDate: "2026-02-10T18:00:00Z",
        eventCategoryName: "Moda Çekimi",
        eventCategoryColor: "#9C27B0",
        venueName: "Stüdyo 1",
        hallName: "Ana Sahne",
        totalAmount: 15000.00,
        terms: "Katalog çekimi.",
    }
];

// Mock API Service
export const crmService = {
  getAgreements: async (): Promise<Agreement[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAgreements;
  },

  getAgreement: async (id: string): Promise<Agreement> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAgreements.find(a => a.id === id) || mockAgreement;
  },

  getFinancialSummary: async (agreementId: string): Promise<FinancialSummary> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockFinancialSummary;
  },

  getAvailableTeam: async (agreementId: string): Promise<TeamMember[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTeam;
  },

  getAvailableEquipment: async (agreementId: string): Promise<Equipment[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEquipment;
  }
};
