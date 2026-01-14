import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://dkqbzsphgqorstfcqthx.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_XQo-IYh5h0ZRy46C8Hiwfw_VQtN7T7n'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface Place {
  cid: string
  title: string
  categoryName: string
  address: string
  city: string
  postalCode: string
  phone: string
  website: string
  email: string
  totalScore: number
  reviewsCount: number
  score_trust: number
  score_points: number
  score_amounts: number
  score_perf: number
  Luokka: string
  maakunta: string
  rank: number
  ai_senti_analyse: string
  ai_topic_analyse: string[]
  ai_summary_analyse: string
  ai_sentiment_score: number
}
