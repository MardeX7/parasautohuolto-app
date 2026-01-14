import { X, Star, Phone, Globe, Mail, MapPin, ExternalLink } from 'lucide-react'
import type { Place } from '../lib/supabase'

interface PlaceDetailProps {
  place: Place
  onClose: () => void
}

const luokkaColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-orange-100 text-orange-800 border-orange-300',
  E: 'bg-red-100 text-red-800 border-red-300',
}

export function PlaceDetail({ place, onClose }: PlaceDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{place.title}</h2>
            <p className="text-gray-500">{place.categoryName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Scores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-orange-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{place.score_trust?.toFixed(2) || '-'}</div>
              <div className="text-xs text-gray-500">ParasX Score</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-yellow-500" />
                {place.totalScore?.toFixed(1) || '-'}
              </div>
              <div className="text-xs text-gray-500">Google ({place.reviewsCount})</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold px-3 py-1 rounded ${luokkaColors[place.Luokka]}`}>{place.Luokka}</div>
              <div className="text-xs text-gray-500 mt-1">Luokka</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-700">#{place.rank}</div>
              <div className="text-xs text-gray-500">Sijoitus</div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Pisteiden jakautuminen</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Arvosana (50%)</span>
                <span className="font-medium">{place.score_points?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Arvostelumäärä (35%)</span>
                <span className="font-medium">{place.score_amounts?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tietojen täydellisyys (15%)</span>
                <span className="font-medium">{place.score_perf?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          {place.ai_summary_analyse && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">AI-analyysi arvosteluista</h3>
              <p className="text-gray-700 mb-3">{place.ai_summary_analyse}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-sm ${
                  place.ai_senti_analyse === 'positiivinen' ? 'bg-green-100 text-green-700' :
                  place.ai_senti_analyse === 'negatiivinen' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {place.ai_senti_analyse}
                </span>
                {place.ai_topic_analyse?.map((topic) => (
                  <span key={topic} className="px-2 py-1 bg-white rounded text-sm text-gray-600">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold mb-3">Yhteystiedot</h3>
            <div className="space-y-2">
              {place.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <span>{place.address}</span>
                </div>
              )}
              {place.phone && (
                <a href={`tel:${place.phone}`} className="flex items-center gap-2 text-orange-600 hover:underline">
                  <Phone className="h-5 w-5" />
                  <span>{place.phone}</span>
                </a>
              )}
              {place.email && (
                <a href={`mailto:${place.email}`} className="flex items-center gap-2 text-orange-600 hover:underline">
                  <Mail className="h-5 w-5" />
                  <span>{place.email}</span>
                </a>
              )}
              {place.website && (
                <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:underline">
                  <Globe className="h-5 w-5" />
                  <span>Verkkosivu</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="text-sm text-gray-500">
            <span className="font-medium">{place.maakunta}</span>
            {place.postalCode && <span> • {place.postalCode}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
