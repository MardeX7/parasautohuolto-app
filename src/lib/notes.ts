import { supabase } from './supabase'

export interface Note {
  id: string
  cid: string
  user_id: string
  content: string
  note_type: 'general' | 'contact_attempt' | 'issue' | 'follow_up' | 'closed'
  is_pinned: boolean
  created_at: string
  updated_at: string
  user_email?: string
}

// Get notes for a place
export async function getNotesForPlace(cid: string) {
  const { data, error } = await supabase
    .from('place_notes')
    .select(`
      *,
      app_users!inner(email)
    `)
    .eq('cid', cid)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return { data: null, error }

  // Map user email
  const notes = data?.map(note => ({
    ...note,
    user_email: note.app_users?.email,
  }))

  return { data: notes, error: null }
}

// Get note count for a place
export async function getNoteCountForPlace(cid: string) {
  const { count, error } = await supabase
    .from('place_notes')
    .select('*', { count: 'exact', head: true })
    .eq('cid', cid)

  return { count, error }
}

// Add a note
export async function addNote(
  cid: string,
  content: string,
  noteType: Note['note_type'] = 'general'
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: new Error('Not authenticated') }

  const { data, error } = await supabase
    .from('place_notes')
    .insert({
      cid,
      user_id: user.id,
      content,
      note_type: noteType,
    })
    .select()
    .single()

  return { data, error }
}

// Update a note
export async function updateNote(id: string, content: string, noteType?: Note['note_type']) {
  const update: Record<string, unknown> = { content }
  if (noteType) update.note_type = noteType

  const { data, error } = await supabase
    .from('place_notes')
    .update(update)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Delete a note
export async function deleteNote(id: string) {
  const { error } = await supabase
    .from('place_notes')
    .delete()
    .eq('id', id)

  return { error }
}

// Toggle pin status
export async function togglePinNote(id: string, isPinned: boolean) {
  const { data, error } = await supabase
    .from('place_notes')
    .update({ is_pinned: !isPinned })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Get places with notes (for filtering)
export async function getPlacesWithNotes() {
  const { data, error } = await supabase
    .from('place_notes')
    .select('cid')

  if (error) return { cids: [], error }

  const uniqueCids = [...new Set(data.map(n => n.cid))]
  return { cids: uniqueCids, error: null }
}
