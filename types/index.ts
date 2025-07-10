export type UserRole = {
    userRole: 'admin' | 'accountant' | 'inventory_manager' | 'user';
}

export type DashboardStats = {
    totalRevenue: number;
    totalExpenses: number;
    totalStock: number;
    totalOrders: number;
    recentTransactions: Array<{
        _id: string;
        description: string;
        date: string;
        totalAmount: number;
    }>;
    lowStockItems: Array<{
        _id: string;
        name: string;
        code: string;
        quantity: number;
        unit: string;
        minStock: number;
    }>;
}

export type StatCard = {
    title: string
    value: number
    icon: any
    color: string
    bgColor: string
    prefix?: string
}