import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import Category from '@/models/Category';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        const category = await Category.findOneAndUpdate(
            { _id: params.id, company: session.user.company },
            {
                name,
                description,
                parentCategory: parentCategory || null
            },
            { new: true }
        ).populate('parentCategory', 'name');

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error: any) {
        console.error('Category update error:', error);

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await mongoConnect();

        // Check if category has child categories
        const childCategories = await Category.countDocuments({
            parentCategory: params.id,
            company: session.user.company,
            isActive: true
        });

        if (childCategories > 0) {
            return NextResponse.json(
                { error: 'Cannot delete category with child categories' },
                { status: 400 }
            );
        }

        const category = await Category.findOneAndUpdate(
            { _id: params.id, company: session.user.company },
            { isActive: false },
            { new: true }
        );

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Category deletion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}