'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { updateProfile } from '@/app/actions/profile.actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Camera, Save, User as UserIcon, Building2, Phone, Loader2 } from 'lucide-react'

interface ProfileFormProps {
    user: any
    profile: any
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const [formData, setFormData] = useState({
        fullName: profile?.full_name || '',
        phone: profile?.phone || '',
        department: profile?.department || '',
    })

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const file = e.target.files?.[0]
            if (!file) return

            const fileExt = file.name.split('.').pop()
            const filePath = `${user.id}/${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('profiles')
                .getPublicUrl(filePath)

            setAvatarUrl(publicUrl)
            toast.success('Avatar uploaded successfully!')
        } catch (error: any) {
            toast.error('Error uploading avatar: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await updateProfile({
                ...formData,
                avatarUrl
            })

            if (result.success) {
                toast.success('Profile updated successfully!')
            } else {
                toast.error('Error updating profile: ' + result.error)
            }
        } catch (error: any) {
            toast.error('Something went wrong: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account information and preferences</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="overflow-hidden border-none shadow-xl bg-white/70 backdrop-blur-md">
                    <CardHeader className="bg-gradient-to-r from-[#0F4C81] to-[#0B3C5D] text-white pb-12">
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription className="text-white/70 text-sm">Update your public profile details</CardDescription>
                    </CardHeader>
                    <CardContent className="relative px-8">
                        {/* Avatar Upload Section */}
                        <div className="absolute -top-10 left-8">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-gray-100 flex items-center justify-center">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="/favicon.svg" alt="Default Avatar" className="w-16 h-16" />
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 className="w-8 h-8 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border hover:bg-gray-50 transition-all transform group-hover:scale-110"
                                >
                                    <Camera className="w-5 h-5 text-[#0F4C81]" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div className="pt-28 grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Name</Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="fullName"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                        placeholder="e.g. +1 234 567 890"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department" className="text-sm font-semibold text-gray-700">Department</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:bg-white transition-all"
                                        placeholder="e.g. Sanitation, Roads, etc."
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Email Address</Label>
                                <Input
                                    value={user?.email}
                                    disabled
                                    className="h-11 bg-gray-100 border-gray-200 text-gray-500 italic"
                                />
                                <p className="text-[10px] text-gray-400">Email cannot be changed</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        className="bg-gradient-to-r from-[#0F4C81] to-[#0B3C5D] text-white px-8 py-6 rounded-2xl shadow-xl shadow-[#0F4C81]/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    )
}
