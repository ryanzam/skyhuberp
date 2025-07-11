import { authOptions } from "@/lib/auth";
import mongoConnect from "@/lib/mongoConnect";
import Stock from "@/models/Stock";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoConnect();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const query: any = {
            company: session.user.company,
            isActive: true
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        const stocks = await Stock.find(query)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Stock.countDocuments(query);

        return NextResponse.json({
            stocks,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Stock fetch error:', error);
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
        const {
            name,
            code,
            category,
            unit,
            quantity = 0,
            unitPrice,
            minStock = 0,
            maxStock = 0,
            valuationMethod = 'FIFO'
        } = body;

        if (!name || !code || !category || !unit || !unitPrice) {
            return NextResponse.json(
                { error: 'Name, code, category, unit, and unit price are required' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const stock = new Stock({
            name,
            code: code.toUpperCase(),
            category,
            unit,
            quantity,
            unitPrice,
            minStock,
            maxStock,
            valuationMethod,
            company: session.user.company
        });

        await stock.save();

        return NextResponse.json(stock, { status: 201 });
    } catch (error: any) {
        console.error('Stock creation error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Stock with this code already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
