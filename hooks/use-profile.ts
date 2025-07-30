"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { profileService, type UserProfile } from "@/lib/profile-service"
import type { User } from "@supabase/supabase-js"

export function useProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) {
          throw userError
        }

        if (user) {
          setUser(user)
          const userProfile = await profileService.getProfile(user.id)
          setProfile(userProfile)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        const userProfile = await profileService.getProfile(session.user.id)
        setProfile(userProfile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return false

    const success = await profileService.updateProfile(user.id, updates)
    if (success && profile) {
      setProfile({ ...profile, ...updates })
    }
    return success
  }

  const awardXP = async (amount: number) => {
    if (!user) return false

    const success = await profileService.awardXP(user.id, amount)
    if (success) {
      // Refetch profile to get updated XP and level
      const updatedProfile = await profileService.getProfile(user.id)
      setProfile(updatedProfile)
    }
    return success
  }

  const updateStreak = async () => {
    if (!user) return false

    const success = await profileService.updateStreak(user.id)
    if (success) {
      const updatedProfile = await profileService.getProfile(user.id)
      setProfile(updatedProfile)
    }
    return success
  }

  return {
    user,
    profile,
    loading,
    error,
    updateProfile,
    awardXP,
    updateStreak,
  }
}
