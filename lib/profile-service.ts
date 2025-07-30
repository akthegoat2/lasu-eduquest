import { createClient } from "@/lib/supabase"

export interface UserProfile {
  id: string
  full_name: string | null
  course: string | null
  avatar_url: string | null
  xp: number
  level: number
  streak: number
  last_activity: string
  badges: string[]
  completed_lessons: number
  completed_quizzes: number
  total_study_hours: number
  created_at: string
  updated_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  module_id: string
  lesson_id: string
  completed: boolean
  score: number | null
  time_spent: number
  completed_at: string | null
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  max_score: number
  time_taken: number | null
  answers: any
  completed_at: string
  created_at: string
}

class ProfileService {
  private supabase = createClient()

  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return null
    }

    return data
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      console.error("Error updating profile:", error)
      return false
    }

    return true
  }

  async getLessonProgress(userId: string): Promise<LessonProgress[]> {
    const { data, error } = await this.supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching lesson progress:", error)
      return []
    }

    return data || []
  }

  async updateLessonProgress(
    userId: string,
    moduleId: string,
    lessonId: string,
    data: Partial<LessonProgress>,
  ): Promise<boolean> {
    const { error } = await this.supabase.from("lesson_progress").upsert({
      user_id: userId,
      module_id: moduleId,
      lesson_id: lessonId,
      ...data,
    })

    if (error) {
      console.error("Error updating lesson progress:", error)
      return false
    }

    return true
  }

  async getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await this.supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching quiz attempts:", error)
      return []
    }

    return data || []
  }

  async recordQuizAttempt(
    userId: string,
    quizId: string,
    score: number,
    maxScore: number,
    timeTaken: number | null,
    answers: any,
  ): Promise<boolean> {
    const { error } = await this.supabase.from("quiz_attempts").insert({
      user_id: userId,
      quiz_id: quizId,
      score,
      max_score: maxScore,
      time_taken: timeTaken,
      answers,
    })

    if (error) {
      console.error("Error recording quiz attempt:", error)
      return false
    }

    return true
  }

  async awardXP(userId: string, xpAmount: number): Promise<boolean> {
    const profile = await this.getProfile(userId)
    if (!profile) return false

    const newXP = profile.xp + xpAmount
    const newLevel = Math.floor(newXP / 1000) + 1 // Every 1000 XP = 1 level

    return await this.updateProfile(userId, {
      xp: newXP,
      level: newLevel,
    })
  }

  async updateStreak(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId)
    if (!profile) return false

    const today = new Date().toISOString().split("T")[0]
    const lastActivity = new Date(profile.last_activity).toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    let newStreak = profile.streak

    if (lastActivity === yesterday) {
      // Continue streak
      newStreak += 1
    } else if (lastActivity !== today) {
      // Streak broken, reset to 1
      newStreak = 1
    }
    // If lastActivity === today, streak stays the same

    return await this.updateProfile(userId, {
      streak: newStreak,
      last_activity: today,
    })
  }

  async awardBadge(userId: string, badgeName: string): Promise<boolean> {
    const profile = await this.getProfile(userId)
    if (!profile) return false

    if (!profile.badges.includes(badgeName)) {
      const newBadges = [...profile.badges, badgeName]
      return await this.updateProfile(userId, { badges: newBadges })
    }

    return true
  }

  async getLeaderboard(limit = 10): Promise<UserProfile[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .order("xp", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching leaderboard:", error)
      return []
    }

    return data || []
  }
}

export const profileService = new ProfileService()
