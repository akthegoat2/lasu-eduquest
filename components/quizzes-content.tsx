"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { QuizViewer } from "@/components/quiz-viewer"
import { Clock, Trophy, Star, Lock, CheckCircle, Play, Target } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { learningService, type Quiz } from "@/lib/learning-service"

export function QuizzesContent() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalXP: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const quizzesData = await learningService.getQuizzes(user.id)
          setQuizzes(quizzesData)

          // Calculate user stats
          const completed = quizzesData.filter((q) => q.completed)
          const totalScore = completed.reduce((sum, q) => sum + (q.score || 0), 0)
          const averageScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0
          const totalXP = completed.reduce((sum, q) => sum + Math.round(((q.score || 0) / 100) * q.xpReward), 0)

          setUserStats({
            totalQuizzes: quizzesData.length,
            completedQuizzes: completed.length,
            averageScore,
            totalXP,
          })
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700 border-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "javascript":
        return "bg-yellow-100 text-yellow-800"
      case "react":
        return "bg-blue-100 text-blue-800"
      case "css":
        return "bg-purple-100 text-purple-800"
      case "html":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getQuizIcon = (completed: boolean, locked: boolean) => {
    if (locked) return <Lock className="h-5 w-5 text-gray-400" />
    if (completed) return <CheckCircle className="h-5 w-5 text-green-500" />
    return <Play className="h-5 w-5 text-blue-500" />
  }

  if (selectedQuiz) {
    return (
      <QuizViewer
        quizId={selectedQuiz}
        onBack={() => setSelectedQuiz(null)}
        onComplete={() => {
          setSelectedQuiz(null)
          // Refresh quizzes to update completion status
          window.location.reload()
        }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            🧠
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading quizzes...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Knowledge Assessment Center 🧠
        </h1>
        <p className="text-gray-600 text-lg">Test your skills and earn XP through interactive quizzes</p>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{userStats.completedQuizzes}</div>
            <div className="text-sm text-blue-600">Completed Quizzes</div>
            <div className="text-xs text-blue-500 mt-1">of {userStats.totalQuizzes} total</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{userStats.averageScore}%</div>
            <div className="text-sm text-green-600">Average Score</div>
            <div className="text-xs text-green-500 mt-1">across all attempts</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-700">{userStats.totalXP}</div>
            <div className="text-sm text-yellow-600">Quiz XP Earned</div>
            <div className="text-xs text-yellow-500 mt-1">from assessments</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">
              {Math.round((userStats.completedQuizzes / userStats.totalQuizzes) * 100) || 0}%
            </div>
            <div className="text-sm text-purple-600">Completion Rate</div>
            <div className="text-xs text-purple-500 mt-1">overall progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-center text-indigo-800 flex items-center justify-center gap-2">
            <Target className="h-5 w-5" />
            Quiz Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-indigo-700">Overall Progress</span>
              <span className="text-sm font-semibold text-indigo-600">
                {userStats.completedQuizzes} / {userStats.totalQuizzes} completed
              </span>
            </div>
            <Progress
              value={(userStats.completedQuizzes / userStats.totalQuizzes) * 100}
              className="h-3 bg-indigo-100"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-indigo-700">
                  {quizzes.filter((q) => q.difficulty === "Beginner" && q.completed).length}
                </div>
                <div className="text-xs text-indigo-600">Beginner Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-700">
                  {quizzes.filter((q) => q.difficulty === "Intermediate" && q.completed).length}
                </div>
                <div className="text-xs text-indigo-600">Intermediate Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-indigo-700">
                  {quizzes.filter((q) => q.difficulty === "Advanced" && q.completed).length}
                </div>
                <div className="text-xs text-indigo-600">Advanced Completed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quizzes Grid */}
      <div className="space-y-6">
        {/* Beginner Quizzes */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-green-500">🟢</span>
            Beginner Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes
              .filter((quiz) => quiz.difficulty === "Beginner")
              .map((quiz) => (
                <Card
                  key={quiz.id}
                  className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                    quiz.completed ? "ring-2 ring-green-200 bg-green-50" : ""
                  } ${quiz.locked ? "opacity-60" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🧠</span>
                        <div>
                          <CardTitle className="text-base leading-tight">{quiz.title}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                            <Badge className={getCategoryColor(quiz.category)}>{quiz.category}</Badge>
                          </div>
                        </div>
                      </div>
                      {getQuizIcon(quiz.completed, quiz.locked || false)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{quiz.description}</p>

                    {/* Quiz Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-yellow-600">{quiz.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-600">{quiz.questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-purple-500" />
                        <span className="text-purple-600">{quiz.attempts} attempts</span>
                      </div>
                    </div>

                    {/* Score Display */}
                    {quiz.completed && quiz.score !== undefined && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-800">Best Score</span>
                          <span className="text-lg font-bold text-green-700">{quiz.score}%</span>
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          XP Earned: {Math.round((quiz.score / 100) * quiz.xpReward)}
                        </div>
                      </div>
                    )}

                    {/* Locked Message */}
                    {quiz.locked && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Lock className="h-4 w-4" />
                          Complete more lessons to unlock
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => setSelectedQuiz(quiz.id)}
                      disabled={quiz.locked}
                      className={`w-full ${
                        quiz.completed
                          ? "bg-green-500 hover:bg-green-600"
                          : quiz.locked
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                      }`}
                    >
                      {quiz.locked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : quiz.completed ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Retake Quiz
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Intermediate Quizzes */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-yellow-500">🟡</span>
            Intermediate Level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes
              .filter((quiz) => quiz.difficulty === "Intermediate")
              .map((quiz) => (
                <Card
                  key={quiz.id}
                  className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                    quiz.completed ? "ring-2 ring-yellow-200 bg-yellow-50" : ""
                  } ${quiz.locked ? "opacity-60" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <div>
                          <CardTitle className="text-base leading-tight">{quiz.title}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                            <Badge className={getCategoryColor(quiz.category)}>{quiz.category}</Badge>
                          </div>
                        </div>
                      </div>
                      {getQuizIcon(quiz.completed, quiz.locked || false)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{quiz.description}</p>

                    {/* Quiz Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{quiz.timeLimit} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold text-yellow-600">{quiz.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-blue-600">{quiz.questions.length} questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-purple-500" />
                        <span className="text-purple-600">{quiz.attempts} attempts</span>
                      </div>
                    </div>

                    {/* Score Display */}
                    {quiz.completed && quiz.score !== undefined && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-yellow-800">Best Score</span>
                          <span className="text-lg font-bold text-yellow-700">{quiz.score}%</span>
                        </div>
                        <div className="text-xs text-yellow-600 mt-1">
                          XP Earned: {Math.round((quiz.score / 100) * quiz.xpReward)}
                        </div>
                      </div>
                    )}

                    {/* Locked Message */}
                    {quiz.locked && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Lock className="h-4 w-4" />
                          Complete 2+ lessons to unlock
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => setSelectedQuiz(quiz.id)}
                      disabled={quiz.locked}
                      className={`w-full ${
                        quiz.completed
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : quiz.locked
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                      }`}
                    >
                      {quiz.locked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Locked
                        </>
                      ) : quiz.completed ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Retake Quiz
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>

      {/* Achievement Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Trophy className="h-5 w-5" />
            Quiz Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">🏆</div>
              <div className="font-semibold text-purple-700">Quiz Master</div>
              <div className="text-sm text-purple-600">Complete 5 quizzes</div>
              <div className="text-xs text-purple-500 mt-1">Progress: {Math.min(userStats.completedQuizzes, 5)}/5</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">⭐</div>
              <div className="font-semibold text-purple-700">Perfect Score</div>
              <div className="text-sm text-purple-600">Score 100% on any quiz</div>
              <div className="text-xs text-purple-500 mt-1">
                {quizzes.some((q) => q.score === 100) ? "Achieved!" : "Not yet achieved"}
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">🧠</div>
              <div className="font-semibold text-purple-700">Knowledge Seeker</div>
              <div className="text-sm text-purple-600">Average 80%+ across all quizzes</div>
              <div className="text-xs text-purple-500 mt-1">Current: {userStats.averageScore}%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
