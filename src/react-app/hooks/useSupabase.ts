import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { UserProfile } from '../shared/types'

export function useSupabaseProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('mocha_user_id', userId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  return { profile, loading, error }
}

export function useSupabaseTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false })

        if (error) throw error
        setTransactions(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  return { transactions, loading, error }
}

export function useAffiliateBalance(affiliateId: string | null) {
  const [balance, setBalance] = useState<{available_balance: number, total_earned: number}>({available_balance: 0, total_earned: 0})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!affiliateId) {
      setLoading(false)
      return
    }

    const fetchBalance = async () => {
      try {
        setLoading(true)
        const mochaUserId = `affiliate_${affiliateId}`
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('mocha_user_id', mochaUserId)
          .single()

        if (!profile) {
          setBalance({ available_balance: 0, total_earned: 0 })
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('user_settings')
          .select('available_balance, total_earnings')
          .eq('user_id', profile.id)
          .single()

        if (error) throw error
        setBalance({
          available_balance: data?.available_balance || 0,
          total_earned: data?.total_earnings || 0
        })
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchBalance()
  }, [userId])

  return { balance, loading, error }
}

export function useAffiliateTransactions(userCpf: string | null, limit?: number) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userCpf) {
      setLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        let query = supabase
          .from('company_purchases')
          .select('company_id, purchase_value, cashback_generated, purchase_date, purchase_time')
          .eq('customer_coupon', userCpf)
          .order('purchase_date', { ascending: false })
        
        if (limit) {
          query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) throw error
        const mapped = (data || []).map((row: any) => ({
          company_name: '',
          transaction_date: row.purchase_date,
          purchase_value: row.purchase_value,
          cashback_value: row.cashback_generated
        }))
        setTransactions(mapped)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userCpf, limit])

  return { transactions, loading, error }
}

export function useNetworkMembers(affiliateId: string | null) {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!affiliateId) {
      setLoading(false)
      return
    }

    const fetchMembers = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('affiliates')
          .select('id, cpf, email, full_name, created_at')
          .eq('sponsor_id', Number(affiliateId))

        if (error) throw error
        setMembers(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchMembers()
  }, [affiliateId])

  const network = {
    level1: members,
    level2: [],
    level3: []
  }
  return { network, members, loading, error }
}