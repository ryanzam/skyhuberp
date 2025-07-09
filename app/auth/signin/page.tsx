import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import { Loader2, Tally5 } from 'lucide-react'
import React from 'react'

const SignInPage = () => {
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
                    <form /* onSubmit={handleSubmit(onSubmit)} */ className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                /* {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                                disabled={isLoading} */
                            />
                            {/* {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )} */}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                               /*  {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                                disabled={isLoading} */
                            />
                            {/* {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )} */}
                        </div>

                        {/* {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
 */}
                        <Button type="submit" className="w-full" /* disabled={isLoading} */>
                            {/* {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )} */}
                            Sign in
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
                            /* onClick={handleDemoLogin}
                            disabled={isLoading} */
                        >
                            {/* {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null} */}
                            Try Demo Login
                        </Button>

                        <Button
                            variant="secondary"
                            className="w-full"
                           /*  onClick={createSampleData}
                            disabled={isLoading} */
                        >
                            Create Sample Data
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