"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, BookOpen, Clock, Zap, Star, Award, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { profileService, type UserProfile } from "@/lib/profile-service"
import { learningService } from "@/lib/learning-service"

export function DashboardContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        // Fetch user profile
        const userProfile = await profileService.getProfile(user.id)
        setProfile(userProfile)

        // Fetch user progress
        const userProgress = await learningService.getUserProgress(user.id)
        setProgress(userProgress)

        // Fetch leaderboard
        const leaderboardData = await learningService.getLeaderboard(5)
        setLeaderboard(leaderboardData)

        // Update streak on dashboard visit
        await profileService.updateStreak(user.id)

        // Award welcome badge if it's a new user
        if (userProfile && userProfile.badges.length === 0) {
          await learningService.awardBadge(user.id, "Welcome")
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            🎓
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading your progress...</div>
        </div>
      </div>
    )
  }

  // Calculate progress percentages
  const totalModules = learningService.getModules().length
  const completedModules = progress?.lessons?.filter((l: any) => l.completed).length || 0
  const moduleProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0

  // Badge system
  const badges = [
    {
      name: "Welcome",
      emoji: "👋",
      earned: profile?.badges?.includes("Welcome") || false,
      description: "Joined LASU Learn",
    },
    {
      name: "First Lesson",
      emoji: "📚",
      earned: (profile?.completed_lessons || 0) > 0,
      description: "Complete your first lesson",
    },
    {
      name: "Quiz Master",
      emoji: "🧠",
      earned: (profile?.completed_quizzes || 0) >= 5,
      description: "Complete 5 quizzes",
    },
    {
      name: "Speed Demon",
      emoji: "⚡",
      earned: profile?.badges?.includes("Speed Demon") || false,
      description: "Complete 5 lessons in one day",
    },
    {
      name: "Streak Keeper",
      emoji: "🔥",
      earned: (profile?.streak || 0) >= 7,
      description: "Maintain a 7-day streak",
    },
    {
      name: "Level Up",
      emoji: "🆙",
      earned: (profile?.level || 1) >= 3,
      description: "Reach level 3",
    },
  ]

  // Calculate average quiz score from progress data
  const averageQuizScore =
    progress?.quizzes && progress.quizzes.length > 0
      ? progress.quizzes.reduce((sum: number, quiz: any) => sum + (quiz.percentage || 0), 0) / progress.quizzes.length
      : 0

  // Recent activity from real data
  const recentActivity = [
    ...(progress?.lessons?.slice(0, 3).map((lesson: any) => ({
      title: lesson.lesson_title,
      type: lesson.completed ? "completed" : "in-progress",
      score: lesson.score || 0,
      time: new Date(lesson.last_accessed).toLocaleDateString(),
      emoji: lesson.completed ? "✅" : "📖",
    })) || []),
    ...(progress?.quizzes?.slice(0, 2).map((quiz: any) => ({
      title: quiz.quiz_title,
      type: "quiz",
      score: quiz.percentage,
      time: new Date(quiz.completed_at).toLocaleDateString(),
      emoji: "🧠",
    })) || []),
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {profile?.full_name || "Student"}! 👋
        </h1>
        <p className="text-gray-600 text-lg">Ready to continue your coding journey?</p>
        {profile?.course && (
          <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
            📚 {profile.course}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{profile?.xp?.toLocaleString() || 0}</div>
            <p className="text-xs text-blue-600">Level {profile?.level || 1} 📈</p>
            <div className="mt-2">
              <Progress value={((profile?.xp || 0) % 1000) / 10} className="h-1 bg-blue-200" />
              <p className="text-xs text-blue-500 mt-1">{1000 - ((profile?.xp || 0) % 1000)} XP to next level</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Lessons Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{profile?.completed_lessons || 0}</div>
            <p className="text-xs text-green-600">Keep learning! 🚀</p>
            <div className="mt-2">
              <Progress value={moduleProgress} className="h-1 bg-green-200" />
              <p className="text-xs text-green-500 mt-1">{Math.round(moduleProgress)}% module progress</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Current Streak</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{profile?.streak || 0} days</div>
            <p className="text-xs text-purple-600">
              {(profile?.streak || 0) > 0 ? "Keep it up! 🔥" : "Start your streak today! 💪"}
            </p>
            <div className="mt-2">
              <Progress value={Math.min((profile?.streak || 0) * 10, 100)} className="h-1 bg-purple-200" />
              <p className="text-xs text-purple-500 mt-1">{profile?.streak || 0}/10 days for streak master</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Study Hours</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{profile?.total_study_hours || 0}h</div>
            <p className="text-xs text-orange-600">Time invested! ⭐</p>
            <div className="mt-2">
              <Progress value={Math.min((profile?.total_study_hours || 0) * 2, 100)} className="h-1 bg-orange-200" />
              <p className="text-xs text-orange-500 mt-1">Goal: 50 hours this month</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <span className="text-xl">🚀</span>
            {profile?.completed_lessons === 0 ? "Ready to Start Learning?" : "Continue Your Journey"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile?.completed_lessons === 0 ? (
              <>
                <p className="text-green-700">
                  Welcome to the LASU Full Stack Development Bootcamp! You're about to embark on an exciting 32-week
                  journey to become a professional full-stack developer.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="font-semibold text-green-800">Frontend</div>
                    <div className="text-sm text-green-600">HTML, CSS, JavaScript, React</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl mb-2">🖥️</div>
                    <div className="font-semibold text-green-800">Backend</div>
                    <div className="text-sm text-green-600">Node.js, Express, APIs</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-2xl mb-2">🗄️</div>
                    <div className="font-semibold text-green-800">Database</div>
                    <div className="text-sm text-green-600">MongoDB, Data Modeling</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-green-700">
                  Great progress! You've completed {profile?.completed_lessons || 0} lessons and earned {profile?.xp || 0} XP. Keep
                  up the momentum!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-green-800">This Week</span>
                    </div>
                    <div className="text-2xl font-bold text-green-700">{progress?.weekly_xp ? progress.weekly_xp : 0} XP</div>
                    <div className="text-sm text-green-600">Weekly progress</div>
                    <div className="text-2xl font-bold text-green-700">
                      {Math.round(averageQuizScore)}%
                    </div>
                    <div className="text-sm text-green-600">Quiz performance</div>
                    <span className="font-semibold text-green-800">Average Score</span>
                  </div>
                </div>
              </>
            )}
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
              {profile?.completed_lessons === 0 ? "Start Learning Journey 🎓" : "Continue Learning 📚"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Badges Collection */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Achievement Badges
            <Badge variant="secondary" className="ml-auto">
              {badges.filter((b) => b.earned).length}/{badges.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl text-center transition-all hover:scale-105 ${
                  badge.earned
                    ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 shadow-sm"
                    : "bg-gray-50 border-2 border-gray-200 opacity-60"
                }`}
              >
                <div className="text-2xl mb-1">{badge.emoji}</div>
                <div className="text-xs font-semibold text-gray-700">{badge.name}</div>
                {badge.earned && <div className="text-xs text-green-600 font-medium mt-1">✓ Earned</div>}
                <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{activity.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {activity.type} • {activity.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-bold bg-green-100 text-green-700">
                      {activity.score}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No activity yet. Start learning to see your progress here!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Mini Leaderboard */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user, index) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${
                    user.id === profile?.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {user.full_name}
                      {user.id === profile?.id && <span className="text-blue-600 ml-1">(You)</span>}
                    </p>
                    <p className="text-sm text-gray-600">
                      {user.xp} XP • Level {user.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">{user.completed_lessons}</div>
                    <div className="text-xs text-gray-500">lessons</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
