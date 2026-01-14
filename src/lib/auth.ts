import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

// Sign in with magic link
export async function signInWithEmail(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  })
  return { error }
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current session
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Get current user with role
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: appUser } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!appUser) {
    // First time user - check if first user (becomes admin)
    const { count } = await supabase
      .from('app_users')
      .select('*', { count: 'exact', head: true })

    const role = count === 0 ? 'admin' : 'viewer'

    // Create app_user record
    await supabase.from('app_users').insert({
      id: user.id,
      email: user.email,
      role,
    })

    return {
      id: user.id,
      email: user.email || '',
      role,
    }
  }

  return {
    id: appUser.id,
    email: appUser.email,
    role: appUser.role,
  }
}

// Create invitation (admin only)
export async function createInvitation(email: string, role: 'editor' | 'viewer' = 'viewer') {
  const { data, error } = await supabase.rpc('create_invitation', {
    p_email: email,
    p_role: role,
  })
  return { data, error }
}

// Get all invitations (admin only)
export async function getInvitations() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

// Get all users (admin only)
export async function getUsers() {
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}
