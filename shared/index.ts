export interface Ledger {
    _id: string;
    name: string;
    type: string;
    group: string;
    currentBalance: number;
}

export interface Transaction {
    _id: string;
    date: string;
    reference: string;
    description: string;
    entries: Array<{
        ledger: {
            _id: string;
            name: string;
            type: string;
        };
        debit: number;
        credit: number;
    }>;
    totalAmount: number;
    createdAt: string;
}

export interface Stock {
    _id: string;
    name: string;
    code: string;
    category: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    minStock: number;
    maxStock: number;
    valuationMethod: string;
    createdAt: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    type: string;
    date: string;
    customer: string;
    items: Array<{
        stock: {
            _id: string;
            name: string;
            code: string;
            unit: string;
        };
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export interface JournalEntry {
    _id: string;
    date: string;
    reference: string;
    description: string;
    entries: Array<{
        ledger: {
            _id: string;
            name: string;
            type: string;
        };
        debit: number;
        credit: number;
    }>;
    totalAmount: number;
    createdAt: string;
}

export interface Category {
    _id: string;
    name: string;
    description?: string;
    parentCategory?: {
        _id: string;
        name: string;
    };
    itemCount: number;
    createdAt: string;
}

export interface PurchaseOrder {
    _id: string;
    orderNumber: string;
    type: string;
    date: string;
    customer: string;
    items: Array<{
        stock: {
            _id: string;
            name: string;
            code: string;
            unit: string;
        };
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }>;
    totalAmount: number;
    status: string;
    createdAt: string;
}

export interface Company {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId: string;
    currency: string;
    financialYear: {
        startDate: string;
        endDate: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Invoice {
    _id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    customer: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
        total: number;
    }>;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    status: string;
    notes?: string;
    createdAt: string;
}


export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
}