import { Building2, Star, TrendingUp, Users } from 'lucide-react'

interface StatsProps {
  totalPlaces: number
  avgScore: number
  avgRating: number
  withEmail: number
}

export function Stats({ totalPlaces, avgScore, avgRating, withEmail }: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Building2 className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalPlaces.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Yritystä</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{avgScore.toFixed(2)}</div>
            <div className="text-sm text-gray-500">Keskim. ParasX</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Star className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
            <div className="text-sm text-gray-500">Keskim. arvosana</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{withEmail.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Sähköpostilla</div>
          </div>
        </div>
      </div>
    </div>
  )
}
