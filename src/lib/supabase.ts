import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface GSCBlockchainData {
  id: string
  version: number
  chain_data: any
  balances: any
  mempool: any
  difficulty: number
  mining_reward: number
  total_supply: number
  last_updated: string
  created_at: string
}

export interface GSCTransaction {
  id: string
  tx_id: string
  sender: string
  receiver: string
  amount: number
  fee: number
  timestamp: number
  signature: string
  block_index?: number
  created_at: string
}
