import { useState, useEffect, useMemo } from 'react'
import { supabase, type Place } from './lib/supabase'
import { getCurrentUser, signOut, type User } from './lib/auth'
import { SearchBar } from './components/SearchBar'
import { Filters } from './components/Filters'
import { PlaceCard } from './components/PlaceCard'
import { PlaceDetail } from './components/PlaceDetail'
import { Stats } from './components/Stats'
import { LoginPage } from './components/LoginPage'
import { AdminPanel } from './components/AdminPanel'
import { Loader2, LogOut, Settings } from 'lucide-react'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [places, setPlaces] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [maakunta, setMaakunta] = useState('')
  const [luokka, setLuokka] = useState('')
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)

  // Get invite token from URL
  const inviteToken = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('invite')
  }, [])

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser()
      setUser(user)
      setAuthLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const user = await getCurrentUser()
        setUser(user)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch all places on mount
  useEffect(() => {
    async function fetchPlaces() {
      setLoading(true)

      const allData: Place[] = []
      let offset = 0
      const limit = 1000

      while (true) {
        const { data, error } = await supabase
          .from('v_parasx_full')
          .select('*')
          .order('score_trust', { ascending: false })
          .range(offset, offset + limit - 1)

        if (error) {
          console.error('Error:', error)
          break
        }

        if (!data || data.length === 0) break
        allData.push(...data)
        if (data.length < limit) break
        offset += limit
      }

      setPlaces(allData)
      setLoading(false)
    }

    fetchPlaces()
  }, [])

  // Get unique maakunnat
  const maakunnat = useMemo(() => {
    const unique = [...new Set(places.map(p => p.maakunta).filter(Boolean))]
    return unique.sort()
  }, [places])

  // Filter places
  const filteredPlaces = useMemo(() => {
    return places.filter(place => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          place.title?.toLowerCase().includes(searchLower) ||
          place.city?.toLowerCase().includes(searchLower) ||
          place.address?.toLowerCase().includes(searchLower) ||
          place.categoryName?.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Maakunta filter
      if (maakunta && place.maakunta !== maakunta) return false

      // Luokka filter
      if (luokka && place.Luokka !== luokka) return false

      return true
    })
  }, [places, search, maakunta, luokka])

  // Calculate stats
  const stats = useMemo(() => {
    const filtered = filteredPlaces
    const totalPlaces = filtered.length
    const avgScore = filtered.reduce((sum, p) => sum + (p.score_trust || 0), 0) / totalPlaces || 0
    const avgRating = filtered.reduce((sum, p) => sum + (p.totalScore || 0), 0) / totalPlaces || 0
    const withEmail = filtered.filter(p => p.email).length
    return { totalPlaces, avgScore, avgRating, withEmail }
  }, [filteredPlaces])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
  }

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage inviteToken={inviteToken} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Ladataan...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-orange-500">Paras</span>autohuolto.fi
              </h1>
              <p className="text-sm text-gray-500">Autokorjaamoiden ParasX-indeksi</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{user.email}</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowAdmin(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="Hallintapaneeli"
                >
                  <Settings className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                title="Kirjaudu ulos"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <SearchBar value={search} onChange={setSearch} />
            <Filters
              maakunta={maakunta}
              setMaakunta={setMaakunta}
              luokka={luokka}
              setLuokka={setLuokka}
              maakunnat={maakunnat}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="mb-6">
          <Stats {...stats} />
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600">
          Näytetään {filteredPlaces.length} yritystä
          {(search || maakunta || luokka) && (
            <button
              onClick={() => { setSearch(''); setMaakunta(''); setLuokka(''); }}
              className="ml-2 text-orange-600 hover:underline"
            >
              Tyhjennä suodattimet
            </button>
          )}
        </div>

        {/* Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.slice(0, 100).map(place => (
            <PlaceCard
              key={place.cid}
              place={place}
              onClick={() => setSelectedPlace(place)}
            />
          ))}
        </div>

        {filteredPlaces.length > 100 && (
          <div className="mt-6 text-center text-gray-500">
            Näytetään ensimmäiset 100 tulosta. Tarkenna hakua nähdäksesi lisää.
          </div>
        )}

        {filteredPlaces.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Ei tuloksia hakuehdoilla.
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedPlace && (
        <PlaceDetail
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
          user={user}
        />
      )}

      {/* Admin Panel */}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  )
}

export default App
