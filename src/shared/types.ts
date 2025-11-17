export type Role = 'affiliate' | 'company' | 'cashier' | 'admin'

export interface UserProfile {
  id: number
  mocha_user_id: string
  cpf: string
  role: Role
  is_active: boolean
  sponsor_id?: number | null
  company_name?: string | null
  created_at: string
  updated_at: string
}

export interface CashMaisUser {
  id: string
  email: string
  google_sub: string
  profile?: UserProfile | null
  full_name?: string
  cpf?: string
  role?: Role
}