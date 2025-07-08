'use client'

import { SessionProvider } from 'next-auth/react'
import React, { ReactNode } from 'react'

interface AuthProviderProps {
    children: ReactNode
}

const AuthProviders = ({ children }: AuthProviderProps) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    )
}

export default AuthProviders