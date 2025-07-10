import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import mongoConnect from './mongoConnect';
import User from '@/models/User';
import Company from '@/models/Company';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await mongoConnect();

                    const user = await User.findOne({
                        email: credentials.email,
                        isActive: true
                    })

                    if (!user) {
                        return null;
                    }

                    const isPasswordValid = await user.comparePassword(credentials.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user._id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        company: user.company._id.toString(),
                        //companyName: user.company.name
                    };
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                /* token.role = user.role;
                token.company = user.company;
                token.companyName = user.companyName; */
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                /* session.user.id = token.sub!;
                session.user.role = token.role as string;
                session.user.company = token.company as string;
                session.user.companyName = token.companyName as string; */
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/signin',
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET
};