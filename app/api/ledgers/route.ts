import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Ledger from '@/models/Ledger';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoConnect();

        const ledgers = await Ledger.find({
            company: session.user.company,
            isActive: true
        }).sort({ name: 1 });

        return NextResponse.json(ledgers);
    } catch (error) {
        console.error('Ledgers fetch error:', error);
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
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, type, group, openingBalance = 0 } = body;

        if (!name || !type || !group) {
            return NextResponse.json(
                { error: 'Name, type, and group are required' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const ledger = new Ledger({
            name,
            type,
            group,
            openingBalance,
            currentBalance: openingBalance,
            company: session.user.company
        });

        await ledger.save();

        return NextResponse.json(ledger, { status: 201 });
    } catch (error: any) {
        console.error('Ledger creation error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Ledger with this name already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}