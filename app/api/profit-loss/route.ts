import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Ledger from '@/models/Ledger';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        await mongoConnect();

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString();
        const endDate = searchParams.get('endDate') || new Date().toISOString();

        // Get income and expense ledgers
        const incomeLedgers = await Ledger.find({
            company: session.user.company,
            type: 'income',
            isActive: true
        }).sort({ name: 1 });

        const expenseLedgers = await Ledger.find({
            company: session.user.company,
            type: 'expense',
            isActive: true
        }).sort({ name: 1 });

        // Get transactions within date range
        const transactions = await Transaction.find({
            company: session.user.company,
            isActive: true,
            date: {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            }
        }).populate('entries.ledger', 'name type');

        // Calculate income and expenses from transactions
        const incomeData: { [key: string]: number } = {};
        const expenseData: { [key: string]: number } = {};

        transactions.forEach(transaction => {
            transaction.entries.forEach(entry => {
                const ledger = entry.ledger as any;
                if (ledger.type === 'income') {
                    incomeData[ledger.name] = (incomeData[ledger.name] || 0) + entry.credit;
                } else if (ledger.type === 'expense') {
                    expenseData[ledger.name] = (expenseData[ledger.name] || 0) + entry.debit;
                }
            });
        });

        // Prepare income items
        const incomeItems = incomeLedgers.map(ledger => ({
            name: ledger.name,
            group: ledger.group,
            amount: incomeData[ledger.name] || 0
        }));

        // Prepare expense items
        const expenseItems = expenseLedgers.map(ledger => ({
            name: ledger.name,
            group: ledger.group,
            amount: expenseData[ledger.name] || 0
        }));

        const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0);
        const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0);
        const netProfit = totalIncome - totalExpenses;

        const profitLoss = {
            period: {
                startDate,
                endDate
            },
            income: {
                items: incomeItems,
                total: totalIncome
            },
            expenses: {
                items: expenseItems,
                total: totalExpenses
            },
            netProfit,
            profitMargin: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0
        };

        return NextResponse.json(profitLoss);
    } catch (error) {
        console.error('Profit & Loss error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}