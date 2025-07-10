'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { Loader2, Tally5 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'

const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type SigninForm = z.infer<typeof signInSchema>

const SignInPage = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SigninForm>({
        resolver: zodResolver(signInSchema),
    });

    const onSubmit = () => {

    }

    const handleDemoLogin = async () => {
        setIsLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                email: 'admin@demo.com',
                password: 'admin123',
                redirect: false
            })

            if (res?.error) {
                setError("Demo login failed. Try again.")
            } else {
                router.push('/dashboard')
            }
        } catch (error) {
            setError('Demo login failed. Try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    const createDemoData = async () => {
        try {
            const response = await fetch('/api/seed', { method: "POST" })
            if (response.ok) {
                toast.success('Data created successfully! You can now use the demo login.');
            } else {
                toast.error('Failed to create demo data. Please try again.');
            }
        } catch (error) {
            toast.error('Error creating demo data. Please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <Tally5 className="h-16 w-16 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Welcome to SkyhubERP
                    </CardTitle>
                    <CardDescription>
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleDemoLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Try Demo Login
                        </Button>

                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={createDemoData}
                            disabled={isLoading}
                        >
                            Create Demo Data
                        </Button>
                    </div>

                    <div className="text-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">Demo Credentials:</p>
                        <p className="font-mono text-xs">
                            Email: admin@demo.com<br />
                            Password: admin123
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default SignInPage