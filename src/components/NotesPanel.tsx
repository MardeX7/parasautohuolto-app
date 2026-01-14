import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Pin, Trash2, Edit2, X, Check, Loader2 } from 'lucide-react'
import { getNotesForPlace, addNote, updateNote, deleteNote, togglePinNote, type Note } from '../lib/notes'
import type { User } from '../lib/auth'

interface NotesPanelProps {
  cid: string
  user: User | null
}

const noteTypeColors: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700',
  contact_attempt: 'bg-blue-100 text-blue-700',
  issue: 'bg-red-100 text-red-700',
  follow_up: 'bg-yellow-100 text-yellow-700',
  closed: 'bg-green-100 text-green-700',
}

const noteTypeLabels: Record<string, string> = {
  general: 'Yleinen',
  contact_attempt: 'Yhteydenotto',
  issue: 'Ongelma',
  follow_up: 'Seuranta',
  closed: 'Suljettu',
}

export function NotesPanel({ cid, user }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState<Note['note_type']>('general')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    loadNotes()
  }, [cid])

  const loadNotes = async () => {
    setLoading(true)
    const { data } = await getNotesForPlace(cid)
    setNotes(data || [])
    setLoading(false)
  }

  const handleAddNote = async () => {
    if (!newContent.trim()) return
    setSaving(true)

    const { data, error } = await addNote(cid, newContent, newType)

    if (!error && data) {
      setNotes([{ ...data, user_email: user?.email }, ...notes])
      setNewContent('')
      setNewType('general')
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleUpdateNote = async (id: string) => {
    if (!editContent.trim()) return
    setSaving(true)

    const { error } = await updateNote(id, editContent)

    if (!error) {
      setNotes(notes.map(n => n.id === id ? { ...n, content: editContent } : n))
      setEditingId(null)
    }
    setSaving(false)
  }

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Poistetaanko muistiinpano?')) return

    const { error } = await deleteNote(id)
    if (!error) {
      setNotes(notes.filter(n => n.id !== id))
    }
  }

  const handleTogglePin = async (note: Note) => {
    const { error } = await togglePinNote(note.id, note.is_pinned)
    if (!error) {
      const updated = notes.map(n => n.id === note.id ? { ...n, is_pinned: !n.is_pinned } : n)
      // Re-sort: pinned first
      updated.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0))
      setNotes(updated)
    }
  }

  if (!user) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        Kirjaudu sisään nähdäksesi ja lisätäksesi muistiinpanoja
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Muistiinpanot ({notes.length})
        </h4>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Lisää
          </button>
        )}
      </div>

      {/* Add note form */}
      {showForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Kirjoita muistiinpano..."
            className="w-full p-2 border border-gray-300 rounded-lg text-sm resize-none"
            rows={3}
          />
          <div className="flex items-center justify-between mt-2">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as Note['note_type'])}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              {Object.entries(noteTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Peruuta
              </button>
              <button
                onClick={handleAddNote}
                disabled={saving || !newContent.trim()}
                className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50 flex items-center gap-1"
              >
                {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                Tallenna
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes list */}
      {loading ? (
        <div className="text-center py-4 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
        </div>
      ) : notes.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Ei muistiinpanoja. Lisää ensimmäinen!
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-lg border ${note.is_pinned ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}`}
            >
              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={saving}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-700 flex-1">{note.content}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleTogglePin(note)}
                        className={`p-1 ${note.is_pinned ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
                        title={note.is_pinned ? 'Poista kiinnitys' : 'Kiinnitä'}
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      {(note.user_id === user.id || user.role === 'admin') && (
                        <>
                          <button
                            onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className={`px-2 py-0.5 rounded ${noteTypeColors[note.note_type]}`}>
                      {noteTypeLabels[note.note_type]}
                    </span>
                    <span className="text-gray-400">
                      {note.user_email} • {new Date(note.created_at).toLocaleDateString('fi-FI')}
                    </span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
