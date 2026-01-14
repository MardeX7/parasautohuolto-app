import { useState, useEffect } from 'react'
import { signInWithEmail } from '../lib/auth'
import { supabase } from '../lib/supabase'
import { Loader2, Mail, CheckCircle, UserPlus } from 'lucide-react'

interface LoginPageProps {
  inviteToken?: string | null
}

export function LoginPage({ inviteToken }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [inviteEmail, setInviteEmail] = useState<string | null>(null)
  const [inviteValid, setInviteValid] = useState<boolean | null>(null)
  const [checkingInvite, setCheckingInvite] = useState(!!inviteToken)

  // Check invite token validity
  useEffect(() => {
    if (!inviteToken) return

    async function checkInvite() {
      const { data } = await supabase
        .from('invitations')
        .select('email, expires_at, used_at')
        .eq('token', inviteToken)
        .single()

      if (data && !data.used_at && new Date(data.expires_at) > new Date()) {
        setInviteEmail(data.email)
        setEmail(data.email)
        setInviteValid(true)
      } else {
        setInviteValid(false)
      }
      setCheckingInvite(false)
    }

    checkInvite()
  }, [inviteToken])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await signInWithEmail(email)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  // Loading invite check
  if (checkingInvite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Invalid invite
  if (inviteToken && inviteValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">!</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kutsu ei kelpaa</h2>
          <p className="text-gray-600">
            Tämä kutsulinkki on vanhentunut tai jo käytetty.
          </p>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tarkista sähköpostisi</h2>
          <p className="text-gray-600 mb-4">
            Lähetimme kirjautumislinkin osoitteeseen <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500">
            Klikkaa linkkiä sähköpostissa kirjautuaksesi sisään.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            <span className="text-orange-500">Paras</span>autohuolto.fi
          </h1>
          {inviteEmail ? (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <UserPlus className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-green-700 text-sm">Sinut on kutsuttu!</p>
              <p className="text-green-600 text-xs">Kirjaudu osoitteella {inviteEmail}</p>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">Kirjaudu sisään</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Sähköposti
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sinun@email.fi"
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Lähetetään...
              </>
            ) : (
              'Lähetä kirjautumislinkki'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Kirjautuminen tapahtuu sähköpostilinkin kautta. Ei salasanaa tarvita.
        </p>
      </div>
    </div>
  )
}
