import { useState, useEffect } from 'react'
import { Users, Mail, Copy, Check, Loader2, X, UserPlus } from 'lucide-react'
import { createInvitation, getInvitations, getUsers, type User } from '../lib/auth'

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const [tab, setTab] = useState<'users' | 'invite'>('users')
  const [users, setUsers] = useState<User[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('viewer')
  const [inviting, setInviting] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [usersRes, invitesRes] = await Promise.all([
      getUsers(),
      getInvitations(),
    ])
    setUsers(usersRes.data || [])
    setInvitations(invitesRes.data || [])
    setLoading(false)
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)

    const { data, error } = await createInvitation(inviteEmail, inviteRole)

    if (!error && data?.[0]) {
      const link = `${window.location.origin}?invite=${data[0].token}`
      setInviteLink(link)
      setInviteEmail('')
      loadData() // Refresh invitations
    }
    setInviting(false)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">Hallintapaneeli</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('users')}
            className={`flex-1 py-3 text-center font-medium ${tab === 'users' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Käyttäjät ({users.length})
          </button>
          <button
            onClick={() => setTab('invite')}
            className={`flex-1 py-3 text-center font-medium ${tab === 'invite' ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-500'}`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Kutsu käyttäjä
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
            </div>
          ) : tab === 'users' ? (
            <div className="space-y-3">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Liittynyt {new Date(user.created_at).toLocaleDateString('fi-FI')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Invite form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sähköposti</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="kayttaja@email.fi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rooli</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="viewer">Katsoja - voi selata ja lukea</option>
                    <option value="editor">Muokkaaja - voi lisätä muistiinpanoja</option>
                  </select>
                </div>
                <button
                  onClick={handleInvite}
                  disabled={inviting || !inviteEmail.trim()}
                  className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Luo kutsulinkki
                </button>
              </div>

              {/* Generated link */}
              {inviteLink && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2">Kutsulinkki luotu!</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-green-300 rounded text-sm"
                    />
                    <button
                      onClick={copyLink}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-2">Linkki on voimassa 7 päivää.</p>
                </div>
              )}

              {/* Pending invitations */}
              {invitations.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-700 mb-2">Odottavat kutsut</h4>
                  <div className="space-y-2">
                    {invitations.filter(i => !i.used_at).map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>{inv.email}</span>
                        <span className="text-gray-400">
                          {new Date(inv.expires_at) > new Date() ? 'Voimassa' : 'Vanhentunut'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
