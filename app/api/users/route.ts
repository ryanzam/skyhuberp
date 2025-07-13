import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoConnect from '@/lib/mongoConnect';
import User from '@/models/User';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
        }

        // Only admins can view users
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await mongoConnect();

        const users = await User.find({
            company: session.user.company
        })
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Users fetch error:', error);
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

        // Only admins can create users
        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { error: 'Name, email, password, and role are required' },
                { status: 400 }
            );
        }

        await mongoConnect();

        const user = new User({
            name,
            email,
            password,
            role,
            company: session.user.company
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject() as Omit<typeof user, 'password'> & { password?: string };
        delete userResponse.password;

        return NextResponse.json(userResponse, { status: 201 });
    } catch (error: any) {
        console.error('User creation error:', error);

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