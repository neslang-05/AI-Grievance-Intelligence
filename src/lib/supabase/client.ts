import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // During build/SSR, we might not have env vars. This is expected.
    // Return a client that will fail gracefully at runtime if actually used.
    console.warn('⚠️ Supabase environment variables not configured')
    
    // Don't create a client with invalid values - this causes errors
    // Instead, throw only if someone actually tries to use it
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: new Error('Supabase not configured') })
      },
      from: () => ({
        select: () => ({ data: [], error: new Error('Supabase not configured') }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ data: null, error: new Error('Supabase not configured') })
      }),
      storage: {
        from: () => ({
          upload: async () => ({ data: null, error: new Error('Supabase not configured') }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      }
    } as any
  }

  return createBrowserClient(url, anonKey)
}
