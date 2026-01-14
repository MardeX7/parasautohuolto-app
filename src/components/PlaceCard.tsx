import { Star, Phone, Globe, Mail, MapPin } from 'lucide-react'
import type { Place } from '../lib/supabase'

interface PlaceCardProps {
  place: Place
  onClick: () => void
}

const luokkaColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  E: 'bg-red-100 text-red-800 border-red-300',
}

const sentimentColors: Record<string, string> = {
  positiivinen: 'text-green-600',
  negatiivinen: 'text-red-600',
  neutraali: 'text-gray-600',
  sekoitus: 'text-yellow-600',
}

export function PlaceCard({ place, onClick }: PlaceCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{place.title}</h3>
          <p className="text-sm text-gray-500">{place.categoryName}</p>
        </div>
        <span className={`px-2 py-1 rounded border text-sm font-bold ${luokkaColors[place.Luokka] || 'bg-gray-100'}`}>
          {place.Luokka}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span className="font-medium">{place.totalScore?.toFixed(1) || '-'}</span>
          <span className="text-gray-400">({place.reviewsCount || 0})</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span>{place.city || place.maakunta}</span>
        </div>
      </div>

      {/* AI Summary */}
      {place.ai_summary_analyse && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
          <span className={`font-medium ${sentimentColors[place.ai_senti_analyse] || ''}`}>
            {place.ai_senti_analyse}
          </span>
          <span className="text-gray-400 mx-1">•</span>
          <span className="text-gray-600">{place.ai_summary_analyse}</span>
        </div>
      )}

      {/* Contact Info */}
      <div className="flex flex-wrap gap-3 text-sm">
        {place.phone && (
          <a href={`tel:${place.phone}`} className="flex items-center gap-1 text-gray-600 hover:text-orange-600" onClick={(e) => e.stopPropagation()}>
            <Phone className="h-4 w-4" />
            <span>{place.phone}</span>
          </a>
        )}
        {place.email && (
          <a href={`mailto:${place.email}`} className="flex items-center gap-1 text-gray-600 hover:text-orange-600" onClick={(e) => e.stopPropagation()}>
            <Mail className="h-4 w-4" />
            <span>Sähköposti</span>
          </a>
        )}
        {place.website && (
          <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-gray-600 hover:text-orange-600" onClick={(e) => e.stopPropagation()}>
            <Globe className="h-4 w-4" />
            <span>Verkkosivu</span>
          </a>
        )}
      </div>

      {/* Score */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
        <span className="text-gray-500">ParasX Score</span>
        <span className="font-bold text-orange-600">{place.score_trust?.toFixed(2) || '-'}</span>
      </div>
    </div>
  )
}
