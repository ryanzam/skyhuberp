import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import User from '@/models/User';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        // Only admins can update users
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !role) {
            return NextResponse.json(
                { error: 'Name, email, and role are required' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const updateData: any = { name, email, role };

        // Only update password if provided
        if (password) {
            updateData.password = password;
        }

        const user = await User.findOneAndUpdate(
            { _id: params.id, company: session.user.company },
            updateData,
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error('User update error:', error);

        if (error.code === 11000) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
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
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        // Only admins can delete users
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Prevent self-deletion
        if (params.id === session.user.id) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const user = await User.findOneAndUpdate(
            { _id: params.id, company: session.user.company },
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('User deletion error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}