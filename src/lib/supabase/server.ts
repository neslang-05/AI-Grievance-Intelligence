import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
    const cookieStore = await cookies()
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // During build time, if env vars are missing, we return a mock client 
    // to avoid crashing the build of pages that don't actually need Supabase for static render
    if (!url || !anonKey) {
        return createServerClient(
            url || 'https://placeholder.supabase.co',
            anonKey || 'placeholder',
            {
                cookies: {
                    get(name: string) { return undefined },
                    set(name: string, value: string, options: any) { },
                    remove(name: string, options: any) { },
                },
            }
        )
    }

    return createServerClient(
        url,
        anonKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                    }
                },
                remove(name: string, options: any) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                    }
                },
            },
        }
    )
}
