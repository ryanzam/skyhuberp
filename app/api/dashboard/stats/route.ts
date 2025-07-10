import { authOptions } from "@/lib/auth";
import mongoConnect from "@/lib/mongoConnect";
import Ledger from "@/models/Ledger";
import Order from "@/models/Order";
import Stock from "@/models/Stock";
import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoConnect();
        const companyId = session.user.company;

        // Get total revenue (credit entries in income ledgers)
        const incomeLedgers = await Ledger.find({
            company: companyId,
            type: 'income',
            isActive: true
        }).select('_id');

        const transactions = await Transaction.find({
            company: companyId,
            isActive: true,
            'entries.ledger': { $in: incomeLedgers.map(l => l._id) }
        });

        let totalRevenue = 0;
        transactions.forEach(transaction => {
            transaction.entries.forEach(entry => {
                if (incomeLedgers.some(l => String(l._id) === String(entry.ledger))) {
                    totalRevenue += entry.credit;
                }
            });
        });

        // Get total expenses (debit entries in expense ledgers)
        const expenseLedgers = await Ledger.find({
            company: companyId,
            type: 'expense',
            isActive: true
        }).select('_id');

        const expenseTransactions = await Transaction.find({
            company: companyId,
            isActive: true,
            'entries.ledger': { $in: expenseLedgers.map(l => l._id) }
        });

        let totalExpenses = 0;
        expenseTransactions.forEach(transaction => {
            transaction.entries.forEach(entry => {
                if (expenseLedgers.some(l => String(l._id) === String(entry.ledger))) {
                    totalExpenses += entry.debit;
                }
            });
        });

        // Get total stock items
        const totalStock = await Stock.countDocuments({
            company: companyId,
            isActive: true
        });

        // Get total orders
        const totalOrders = await Order.countDocuments({
            company: companyId,
            isActive: true
        });

        // Get recent transactions (last 5)
        const recentTransactions = await Transaction.find({
            company: companyId,
            isActive: true
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('date description totalAmount');

        // Get low stock items
        const lowStockItems = await Stock.find({
            company: companyId,
            isActive: true,
            $expr: { $lte: ['$quantity', '$minStock'] }
        })
            .limit(5)
            .select('name code quantity unit minStock');

        return NextResponse.json({
            totalRevenue: Math.round(totalRevenue),
            totalExpenses: Math.round(totalExpenses),
            totalStock,
            totalOrders,
            recentTransactions,
            lowStockItems
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}