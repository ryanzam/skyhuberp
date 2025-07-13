import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Company from '@/models/Company';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoConnect();

        const company = await Company.findById(session.user.company);

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Company fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Only admins can update company settings
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, address, phone, email, taxId, currency, financialYear } = body;

        if (!name || !address || !phone || !email || !taxId) {
            return NextResponse.json(
                { error: 'All company fields are required' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const company = await Company.findByIdAndUpdate(
            session.user.company,
            {
                name,
                address,
                phone,
                email,
                taxId,
                currency,
                financialYear: {
                    startDate: new Date(financialYear.startDate),
                    endDate: new Date(financialYear.endDate)
                }
            },
            { new: true }
        );

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(company);
    } catch (error: any) {
        console.error('Company update error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Tax ID already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}