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