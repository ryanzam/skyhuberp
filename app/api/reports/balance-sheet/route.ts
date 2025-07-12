import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Ledger from '@/models/Ledger';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        await mongoConnect();

        const { searchParams } = new URL(request.url);
        const asOfDate = searchParams.get('asOfDate') || new Date().toISOString();

        // Get all ledgers for the company
        const ledgers = await Ledger.find({
            company: session.user.company,
            isActive: true
        }).sort({ type: 1, name: 1 });

        // Group ledgers by type
        const assets = ledgers.filter(l => l.type === 'asset');
        const liabilities = ledgers.filter(l => l.type === 'liability');
        const equity = ledgers.filter(l => l.type === 'equity');

        // Calculate totals
        const totalAssets = assets.reduce((sum, ledger) => sum + ledger.currentBalance, 0);
        const totalLiabilities = liabilities.reduce((sum, ledger) => sum + ledger.currentBalance, 0);
        const totalEquity = equity.reduce((sum, ledger) => sum + ledger.currentBalance, 0);

        const balanceSheet = {
            asOfDate,
            assets: {
                items: assets.map(ledger => ({
                    name: ledger.name,
                    group: ledger.group,
                    balance: ledger.currentBalance
                })),
                total: totalAssets
            },
            liabilities: {
                items: liabilities.map(ledger => ({
                    name: ledger.name,
                    group: ledger.group,
                    balance: ledger.currentBalance
                })),
                total: totalLiabilities
            },
            equity: {
                items: equity.map(ledger => ({
                    name: ledger.name,
                    group: ledger.group,
                    balance: ledger.currentBalance
                })),
                total: totalEquity
            },
            totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
            isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
        };

        return NextResponse.json(balanceSheet);
    } catch (error) {
        console.error('Balance sheet error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}