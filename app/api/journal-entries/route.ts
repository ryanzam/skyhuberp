import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Transaction from '@/models/Transaction';
import Ledger from '@/models/Ledger';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        await mongoConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const date = searchParams.get('date');
        const skip = (page - 1) * limit;

        const query: any = {
            company: session.user.company,
            isActive: true
        };

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = {
                $gte: startDate,
                $lt: endDate
            };
        }

        const journalEntries = await Transaction.find(query)
            .populate('entries.ledger', 'name type')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments(query);

        return NextResponse.json({
            journalEntries,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Journal entries fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        const body = await request.json();
        const { date, reference, description, entries } = body;

        if (!date || !reference || !description || !entries || entries.length < 2) {
            return NextResponse.json(
                { error: 'Date, reference, description, and at least 2 entries are required' },
                { status: 400 }
            );
        }

        // Validate entries balance
        const totalDebit = entries.reduce((sum: number, entry: any) => sum + (entry.debit || 0), 0);
        const totalCredit = entries.reduce((sum: number, entry: any) => sum + (entry.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            return NextResponse.json(
                { error: 'Total debits must equal total credits' },
                { status: 400 }
            );
        }

        await mongoConnect();

        // Start a session for transaction
        const mongoSession = await mongoose.startSession();

        try {
            await mongoSession.withTransaction(async () => {
                // Create journal entry (transaction)
                const journalEntry = new Transaction({
                    date: new Date(date),
                    reference,
                    description,
                    entries: entries.map((entry: any) => ({
                        ledger: entry.ledger,
                        debit: entry.debit || 0,
                        credit: entry.credit || 0
                    })),
                    totalAmount: Math.max(totalDebit, totalCredit),
                    company: session.user.company,
                    createdBy: session.user.id
                });

                await journalEntry.save({ session: mongoSession });

                // Update ledger balances
                for (const entry of entries) {
                    const ledger = await Ledger.findById(entry.ledger).session(mongoSession);
                    if (!ledger) {
                        throw new Error(`Ledger not found: ${entry.ledger}`);
                    }

                    const debitAmount = entry.debit || 0;
                    const creditAmount = entry.credit || 0;

                    // Update balance based on ledger type
                    if (['asset', 'expense'].includes(ledger.type)) {
                        ledger.currentBalance += debitAmount - creditAmount;
                    } else {
                        ledger.currentBalance += creditAmount - debitAmount;
                    }

                    await ledger.save({ session: mongoSession });
                }
            });

            return NextResponse.json({ message: 'Journal entry created successfully' }, { status: 201 });
        } finally {
            await mongoSession.endSession();
        }
    } catch (error: any) {
        console.error('Journal entry creation error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}