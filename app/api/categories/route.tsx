import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoConnect();

        const categories = await Category.find({
            company: session.user.company,
            isActive: true
        })
            .populate('parentCategory', 'name')
            .sort({ name: 1 });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Categories fetch error:', error);
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
        const { name, description, parentCategory } = body;

        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const category = new Category({
            name,
            description,
            parentCategory: parentCategory || null,
            company: session.user.company
        });

        await category.save();
        await category.populate('parentCategory', 'name');

        return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
        console.error('Category creation error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'Category with this name already exists' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}