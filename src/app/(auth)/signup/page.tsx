'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const DEPARTMENTS = [
    'PWD',
    'MUNICIPAL',
    'POLICE',
    'ELECTRICITY',
    'WATER',
    'HEALTH',
    'EDUCATION'
]

export default function SignupPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [department, setDepartment] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!department) throw new Error('Please select a department')

            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: 'OFFICER',
                        department: department
                    }
                }
            })

            if (authError) throw authError

            router.push('/login?message=Signup successful. Please check your email for verification.')
        } catch (err: any) {
            setError(err.message || 'Something went wrong during signup')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0B3C5D] to-[#1A5F7A] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl border-none">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-[#0B3C5D]">Officer Registration</CardTitle>
                    <CardDescription>
                        Create an officer account to manage grievances
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSignup}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@manipur.gov.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="focus:border-[#0F4C81] focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department">Department</Label>
                            <Select onValueChange={setDepartment} required>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full bg-[#0F4C81] hover:bg-[#0B3C5D]"
                            disabled={loading}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                        <div className="text-sm text-center text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#0F4C81] hover:underline font-semibold">
                                Login here
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
