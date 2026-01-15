export enum UserRole {
    CITIZEN = 'CITIZEN',
    OFFICER = 'OFFICER',
    ADMIN = 'ADMIN'
}

export interface UserProfile {
    id: string
    email: string
    role: UserRole
    full_name?: string
    phone?: string
    department?: string // For officers only
    created_at: string
    updated_at: string
}

export interface AuthUser {
    id: string
    email: string
    role: UserRole
    profile?: UserProfile
}

export * from './complaint.types'
export * from './database.types'
