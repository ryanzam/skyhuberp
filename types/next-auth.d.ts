import NextAuth from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: string
            company: string
            companyName: string
        }
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        role: string
        company: string
        companyName: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        company: string
        companyName: string
    }
}