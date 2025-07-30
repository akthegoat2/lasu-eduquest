"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Clock, Star, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { learningService, type Module } from "@/lib/learning-service"

interface ModulesContentProps {
  onStartLesson: (moduleId: string, lessonId: string) => void
}

export function ModulesContent({ onStartLesson }: ModulesContentProps) {
  const [modules, setModules] = useState<Module[]>([])
  const [userProgress, setUserProgress] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get modules
        const moduleData = learningService.getModules()
        setModules(moduleData)

        // Get user progress
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const progress = await learningService.getUserProgress(user.id)

          // Create progress lookup
          const progressLookup: any = {}
          progress.lessons.forEach((lesson: any) => {
            const key = `${lesson.module_id}-${lesson.lesson_id}`
            progressLookup[key] = lesson
          })

          setUserProgress(progressLookup)
        }
      } catch (error) {
        console.error("Error fetching modules data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "Advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter((lesson) => {
      const key = `${module.id}-${lesson.id}`
      return userProgress[key]?.completed
    }).length

    return {
      completed: completedLessons,
      total: module.lessons.length,
      percentage: module.lessons.length > 0 ? (completedLessons / module.lessons.length) * 100 : 0,
    }
  }

  const getLessonStatus = (moduleId: string, lessonId: string) => {
    const key = `${moduleId}-${lessonId}`
    const progress = userProgress[key]

    if (progress?.completed) return "completed"
    if (progress) return "in-progress"
    return "not-started"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in-progress":
        return <Play className="h-5 w-5 text-blue-500" />
      case "not-started":
        return <Clock className="h-5 w-5 text-gray-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            📚
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading modules...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Full Stack Development Bootcamp 💻
        </h1>
        <p className="text-gray-600 text-lg">Lagos State University - Computer Science Department</p>
        <div className="flex justify-center gap-4">
          <Badge className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-green-200">
            🎓 32 Week Intensive Program
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-200">
            💼 Industry-Ready Skills
          </Badge>
        </div>
      </div>

      {/* Program Overview */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-center text-green-800 flex items-center justify-center gap-2">
            <span className="text-xl">🦅</span>
            LASU Full Stack Development Bootcamp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-700">32 Weeks</div>
              <div className="text-sm text-green-600">Total Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">{modules.length} Modules</div>
              <div className="text-sm text-blue-600">Comprehensive Curriculum</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {modules.reduce((acc, module) => acc + module.lessons.length, 0)} Lessons
              </div>
              <div className="text-sm text-purple-600">Hands-on Learning</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">Industry Ready</div>
              <div className="text-sm text-orange-600">Job Placement Support</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules */}
      <div className="space-y-6">
        {modules.map((module) => {
          const progress = getModuleProgress(module)

          return (
            <div key={module.id} className="space-y-4">
              {/* Module Header */}
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{module.emoji}</span>
                      <div>
                        <CardTitle className="text-xl text-indigo-800">{module.title}</CardTitle>
                        <p className="text-sm text-indigo-600 mt-1">
                          {module.duration} • {progress.completed} of {progress.total} lessons completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-700">{Math.round(progress.percentage)}%</div>
                      <Progress value={progress.percentage} className="w-24 h-2 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-indigo-700 mb-4">{module.description}</p>

                  {/* Module Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-lg font-bold text-indigo-700">{module.lessons.length}</div>
                      <div className="text-xs text-indigo-600">Lessons</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-lg font-bold text-indigo-700">{module.xpReward}</div>
                      <div className="text-xs text-indigo-600">Total XP</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-lg font-bold text-indigo-700">{module.skills.length}</div>
                      <div className="text-xs text-indigo-600">Skills</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-indigo-200">
                      <div className="text-lg font-bold text-indigo-700">{module.projects.length}</div>
                      <div className="text-xs text-indigo-600">Projects</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {module.lessons.map((lesson) => {
                  const status = getLessonStatus(module.id, lesson.id)
                  const progressKey = `${module.id}-${lesson.id}`
                  const lessonProgress = userProgress[progressKey]

                  return (
                    <Card
                      key={lesson.id}
                      className={`hover:shadow-lg transition-all duration-200 hover:scale-105 ${
                        status === "completed" ? "ring-2 ring-green-200 bg-green-50" : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">📖</span>
                            <div>
                              <CardTitle className="text-base leading-tight">{lesson.title}</CardTitle>
                              <div className="flex gap-2 mt-1">
                                <Badge className={`text-xs ${getDifficultyColor(module.difficulty)}`}>
                                  {lesson.type}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {lesson.estimatedTime}min
                                </Badge>
                              </div>
                            </div>
                          </div>
                          {getStatusIcon(status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed">{lesson.description}</p>

                        {/* Lesson Stats */}
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold text-yellow-600">{lesson.xpReward} XP</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">{lesson.estimatedTime} min</span>
                          </div>
                        </div>

                        {/* Progress Info */}
                        {lessonProgress && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">
                                {status === "completed" ? "Completed" : "In Progress"}
                              </span>
                              {lessonProgress.score > 0 && (
                                <span className="font-semibold text-green-600">Score: {lessonProgress.score}%</span>
                              )}
                            </div>
                            {lessonProgress.time_spent > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Time spent: {lessonProgress.time_spent} minutes
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Button */}
                        <Button
                          onClick={() => onStartLesson(module.id, lesson.id)}
                          className={`w-full ${
                            status === "completed"
                              ? "bg-green-500 hover:bg-green-600"
                              : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                          }`}
                        >
                          {status === "completed" && (
                            <>
                              <Trophy className="h-4 w-4 mr-2" />
                              Review Lesson
                            </>
                          )}
                          {status === "in-progress" && (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Continue Learning
                            </>
                          )}
                          {status === "not-started" && (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Lesson
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Career Outcomes */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <span className="text-xl">🚀</span>
            Career Outcomes & Job Placement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-orange-700 mb-3">Job Roles You'll Be Ready For:</h4>
              <ul className="space-y-2 text-orange-600">
                <li>• Full Stack Developer</li>
                <li>• Frontend Developer</li>
                <li>• Backend Developer</li>
                <li>• React.js Developer</li>
                <li>• Node.js Developer</li>
                <li>• JavaScript Developer</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-3">Program Benefits:</h4>
              <ul className="space-y-2 text-orange-600">
                <li>• Industry-relevant curriculum</li>
                <li>• Hands-on project experience</li>
                <li>• Portfolio development</li>
                <li>• Job placement assistance</li>
                <li>• Industry mentorship</li>
                <li>• Certificate of completion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
