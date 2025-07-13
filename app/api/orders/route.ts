import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Order from '@/models/Order';
import Stock from '@/models/Stock';
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
        const type = searchParams.get('type');
        const skip = (page - 1) * limit;

        const query: any = {
            company: session.user.company,
            isActive: true
        };

        if (type && ['sales', 'purchase'].includes(type)) {
            query.type = type;
        }

        const orders = await Order.find(query)
            .populate('items.stock', 'name code unit')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

        return NextResponse.json({
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Orders fetch error:', error);
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
        const { orderNumber, type, date, customer, items, status = 'pending' } = body;

        if (!orderNumber || !type || !date || !customer || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Order number, type, date, customer, and items are required' },
                { status: 400 }
            );
        }

        if (!['sales', 'purchase'].includes(type)) {
            return NextResponse.json(
                { error: 'Type must be either sales or purchase' },
                { status: 400 }
            );
        }

        await mongoConnect();

        // Calculate total amount
        let totalAmount = 0;
        const processedItems = [];

        for (const item of items) {
            if (!item.stock || !item.quantity || !item.unitPrice) {
                return NextResponse.json(
                    { error: 'Each item must have stock, quantity, and unit price' },
                    { status: 400 }
                );
            }

            const stock = await Stock.findById(item.stock);
            if (!stock) {
                return NextResponse.json(
                    { error: `Stock item not found: ${item.stock}` },
                    { status: 400 }
                );
            }

            const itemTotal = item.quantity * item.unitPrice;
            totalAmount += itemTotal;

            processedItems.push({
                stock: item.stock,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: itemTotal
            });
        }

        const order = new Order({
            orderNumber,
            type,
            date: new Date(date),
            customer,
            items: processedItems,
            totalAmount,
            status,
            company: session.user.company,
            createdBy: session.user.id
        });

        await order.save();

        // Populate the order for response
        await order.populate('items.stock', 'name code unit');

        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        console.error('Order creation error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Order with this number already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}