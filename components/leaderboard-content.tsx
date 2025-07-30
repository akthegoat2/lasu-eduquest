"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Zap, Target, TrendingUp, Users, Star } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { learningService } from "@/lib/learning-service"

interface LeaderboardUser {
  id: string
  full_name: string | null
  course: string | null
  avatar_url: string | null
  xp: number
  level: number
  streak: number
  completed_lessons: number
  completed_quizzes: number
  weekly_xp: number
  badges: string[]
  rank: number
  initials: string
}

export function LeaderboardContent() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [currentUser, setCurrentUser] = useState<LeaderboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"all-time" | "weekly">("all-time")
  const [stats, setStats] = useState({
    totalUsers: 0,
    averageXP: 0,
    topStreak: 0,
    totalLessons: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        // Get leaderboard data
        const leaderboardData = await learningService.getLeaderboard(50)
        setLeaderboard(leaderboardData)

        // Find current user in leaderboard
        if (user) {
          const userInLeaderboard = leaderboardData.find((u) => u.id === user.id)
          if (userInLeaderboard) {
            setCurrentUser(userInLeaderboard)
          } else {
            // If user not in top 50, get their data separately
            const { data: userData } = await supabase
              .from("profiles")
              .select(
                "id, full_name, course, avatar_url, xp, level, streak, completed_lessons, completed_quizzes, weekly_xp, badges",
              )
              .eq("id", user.id)
              .single()

            if (userData) {
              // Get user's rank
              const { count } = await supabase
                .from("profiles")
                .select("*", { count: "exact", head: true })
                .gt("xp", userData.xp)

              setCurrentUser({
                ...userData,
                rank: (count || 0) + 1,
                initials: userData.full_name
                  ? userData.full_name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                  : "U",
              })
            }
          }
        }

        // Calculate stats
        if (leaderboardData.length > 0) {
          const totalXP = leaderboardData.reduce((sum, user) => sum + user.xp, 0)
          const maxStreak = Math.max(...leaderboardData.map((user) => user.streak))
          const totalLessonsCompleted = leaderboardData.reduce((sum, user) => sum + user.completed_lessons, 0)

          setStats({
            totalUsers: leaderboardData.length,
            averageXP: Math.round(totalXP / leaderboardData.length),
            topStreak: maxStreak,
            totalLessons: totalLessonsCompleted,
          })
        }
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [timeframe])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getBadgeEmoji = (badgeName: string) => {
    const badgeMap: Record<string, string> = {
      Welcome: "👋",
      "First Lesson": "📚",
      "Quiz Master": "🧠",
      "Perfect Score": "⭐",
      "Speed Demon": "⚡",
      Consistent: "🔥",
      Explorer: "🗺️",
      "Code Warrior": "⚔️",
      Achiever: "🏆",
    }
    return badgeMap[badgeName] || "🏅"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            🏆
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
          Leaderboard 🏆
        </h1>
        <p className="text-gray-600 text-lg">Compete with fellow learners and track your progress</p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
            <div className="text-sm text-blue-600">Active Learners</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{stats.averageXP}</div>
            <div className="text-sm text-green-600">Average XP</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">{stats.topStreak}</div>
            <div className="text-sm text-red-600">Longest Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{stats.totalLessons}</div>
            <div className="text-sm text-purple-600">Lessons Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Current User Position */}
      {currentUser && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Star className="h-5 w-5" />
              Your Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-indigo-200">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-full ${getRankBadgeColor(currentUser.rank)}`}>
                  <span className="font-bold">#{currentUser.rank}</span>
                </div>
                <Avatar className="h-12 w-12 ring-2 ring-indigo-200">
                  <AvatarImage src={currentUser.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold">
                    {currentUser.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">{currentUser.full_name || "You"}</div>
                  <div className="text-sm text-gray-600">{currentUser.course || "Computer Science"}</div>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-indigo-700">{currentUser.xp}</div>
                  <div className="text-xs text-indigo-600">XP</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-700">Level {currentUser.level}</div>
                  <div className="text-xs text-indigo-600">Level</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-700">{currentUser.streak}</div>
                  <div className="text-xs text-indigo-600">Day Streak</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-indigo-700">{currentUser.badges.length}</div>
                  <div className="text-xs text-indigo-600">Badges</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-center text-yellow-800">🏆 Top Performers 🏆</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-end gap-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-gray-300 to-gray-500 w-20 h-16 rounded-t-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-gray-300">
                  <AvatarImage src={leaderboard[1]?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold text-lg">
                    {leaderboard[1]?.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-gray-900">{leaderboard[1]?.full_name || "Anonymous"}</div>
                <div className="text-sm text-gray-600">{leaderboard[1]?.xp} XP</div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 w-24 h-20 rounded-t-lg flex items-center justify-center mb-4">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <Avatar className="h-20 w-20 mx-auto mb-2 ring-4 ring-yellow-400">
                  <AvatarImage src={leaderboard[0]?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-xl">
                    {leaderboard[0]?.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="font-bold text-gray-900 text-lg">{leaderboard[0]?.full_name || "Anonymous"}</div>
                <div className="text-sm text-gray-600">{leaderboard[0]?.xp} XP</div>
                <Badge className="bg-yellow-100 text-yellow-800 mt-1">👑 Champion</Badge>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-amber-400 to-amber-600 w-20 h-12 rounded-t-lg flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-2 ring-4 ring-amber-300">
                  <AvatarImage src={leaderboard[2]?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold text-lg">
                    {leaderboard[2]?.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold text-gray-900">{leaderboard[2]?.full_name || "Anonymous"}</div>
                <div className="text-sm text-gray-600">{leaderboard[2]?.xp} XP</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Full Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                  currentUser?.id === user.id ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" : "border-gray-200"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12">
                  {index < 3 ? getRankIcon(user.rank) : <span className="font-bold text-gray-600">#{user.rank}</span>}
                </div>

                {/* Avatar and Info */}
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-200">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold">
                      {user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {user.full_name || "Anonymous"}
                      {currentUser?.id === user.id && <Badge variant="outline">You</Badge>}
                    </div>
                    <div className="text-sm text-gray-600">{user.course || "Computer Science"}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-700">{user.xp}</div>
                    <div className="text-xs text-blue-600">XP</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-700">L{user.level}</div>
                    <div className="text-xs text-green-600">Level</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-700">{user.streak}</div>
                    <div className="text-xs text-red-600">Streak</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-700">{user.completed_lessons}</div>
                    <div className="text-xs text-purple-600">Lessons</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-700">{user.completed_quizzes}</div>
                    <div className="text-xs text-orange-600">Quizzes</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-1">
                  {user.badges.slice(0, 3).map((badge, badgeIndex) => (
                    <span key={badgeIndex} className="text-lg" title={badge}>
                      {getBadgeEmoji(badge)}
                    </span>
                  ))}
                  {user.badges.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.badges.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Challenge */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Zap className="h-5 w-5" />
            Weekly Challenge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-lg font-semibold text-green-700">
              🎯 Complete 3 quizzes this week to earn the "Weekly Warrior" badge!
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {leaderboard.filter((u) => u.weekly_xp >= 500).length}
                </div>
                <div className="text-sm text-green-600">Users with 500+ weekly XP</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">
                  {Math.max(...leaderboard.map((u) => u.weekly_xp), 0)}
                </div>
                <div className="text-sm text-green-600">Highest weekly XP</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-700">{currentUser?.weekly_xp || 0}</div>
                <div className="text-sm text-green-600">Your weekly XP</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
