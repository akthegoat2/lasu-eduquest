"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/code-editor"
import { ArrowLeft, CheckCircle, Lightbulb, Code, BookOpen, Terminal, Trophy } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { learningService, type Lesson, type Module } from "@/lib/learning-service"

interface LessonViewerProps {
  moduleId: string
  lessonId: string
  onBack: () => void
}

export function LessonViewer({ moduleId, lessonId, onBack }: LessonViewerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState("lesson")
  const [completed, setCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)
  const [startTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const moduleData = learningService.getModule(moduleId)
        const lessonData = learningService.getLesson(moduleId, lessonId)

        setModule(moduleData)
        setLesson(lessonData)

        // Check if lesson is already completed
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: progress } = await supabase
            .from("lesson_progress")
            .select("*")
            .eq("user_id", user.id)
            .eq("module_id", moduleId)
            .eq("lesson_id", lessonId)
            .single()

          if (progress?.completed) {
            setCompleted(true)
          }
        }
      } catch (error) {
        console.error("Error fetching lesson:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()

    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)) // in minutes
    }, 60000)

    return () => clearInterval(interval)
  }, [moduleId, lessonId])

  const handleCompleteLesson = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && lesson) {
        const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000 / 60)

        const success = await learningService.recordLessonProgress(
          user.id,
          moduleId,
          lessonId,
          true,
          finalTimeSpent,
          100, // Full completion score
        )

        if (success) {
          setCompleted(true)

          // Award badges based on progress
          await learningService.awardBadge(user.id, "First Lesson")

          // Check for speed demon badge (completing lesson quickly)
          if (finalTimeSpent <= lesson.estimatedTime / 2) {
            await learningService.awardBadge(user.id, "Speed Demon")
          }
        }
      }
    } catch (error) {
      console.error("Error completing lesson:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            📖
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading lesson...</div>
        </div>
      </div>
    )
  }

  if (!lesson || !module) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h2>
        <Button onClick={onBack}>Back to Modules</Button>
      </div>
    )
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case "theory":
        return <BookOpen className="h-5 w-5 text-blue-500" />
      case "practice":
        return <Code className="h-5 w-5 text-purple-500" />
      case "project":
        return <Terminal className="h-5 w-5 text-green-500" />
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />
    }
  }

  const getStepTypeLabel = (type: string) => {
    switch (type) {
      case "theory":
        return "Theory"
      case "practice":
        return "Practice"
      case "project":
        return "Project"
      default:
        return "Lesson"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Modules
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
            <p className="text-gray-600">{module.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200">
            <span className="mr-1">⭐</span>
            {lesson.xpReward} XP
          </Badge>
          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200">
            {getStepTypeLabel(lesson.type)}
          </Badge>
          <Badge variant="outline">{lesson.estimatedTime} min</Badge>
          {completed && (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-1" />
              Completed
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Lesson Progress</span>
            <span className="text-sm font-semibold text-blue-600">{completed ? "100%" : "In Progress"}</span>
          </div>
          <Progress value={completed ? 100 : 50} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Time spent: {timeSpent} min</span>
            <span>Estimated: {lesson.estimatedTime} min</span>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Panel */}
        <Card className="lg:h-[700px] overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <div className="flex items-center gap-2">
              {getStepIcon(lesson.type)}
              <CardTitle className="text-lg">{lesson.title}</CardTitle>
              <Badge variant="outline" className="ml-auto">
                {getStepTypeLabel(lesson.type)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="prose prose-sm max-w-none">
                {lesson.content.split("\n\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {lesson.codeExample && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-lg">💡</span>
                    Code Example:
                  </h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{lesson.codeExample}</pre>
                  </div>
                </div>
              )}

              {lesson.challenge && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                    <span className="text-lg">🎯</span>
                    Challenge:
                  </h4>
                  <p className="text-orange-700">{lesson.challenge}</p>
                  {lesson.expectedOutput && (
                    <p className="text-sm text-orange-600 mt-2">
                      Expected output: <code className="bg-orange-100 px-2 py-1 rounded">{lesson.expectedOutput}</code>
                    </p>
                  )}
                </div>
              )}

              {lesson.tips && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    Tip:
                  </h4>
                  <p className="text-green-700">{lesson.tips}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Editor Panel */}
        <Card className="lg:h-[700px] overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="lesson">📖 Lesson</TabsTrigger>
                <TabsTrigger value="editor">💻 Code Editor</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0 h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsContent value="lesson" className="p-6 h-full">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Lesson Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <Badge variant="outline">{getStepTypeLabel(lesson.type)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Difficulty:</span>
                      <Badge className="bg-yellow-100 text-yellow-700">{module.difficulty}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Duration:</span>
                      <span className="text-sm text-gray-700">{lesson.estimatedTime} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">XP Reward:</span>
                      <span className="text-sm font-semibold text-yellow-600">{lesson.xpReward} XP</span>
                    </div>
                  </div>

                  {lesson.type === "practice" || lesson.type === "project" ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Ready to Code?</h4>
                      <p className="text-blue-700 text-sm mb-3">
                        Switch to the Code Editor tab to start practicing! The starter code is already loaded for you.
                      </p>
                      <Button onClick={() => setActiveTab("editor")} className="bg-blue-600 hover:bg-blue-700">
                        <Code className="h-4 w-4 mr-2" />
                        Open Code Editor
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Learning Phase</h4>
                      <p className="text-green-700 text-sm">
                        Read through the content and examples. When you're ready, mark the lesson as complete!
                      </p>
                    </div>
                  )}

                  {/* Completion Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleCompleteLesson}
                      disabled={completed}
                      className={`w-full ${
                        completed
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      }`}
                    >
                      {completed ? (
                        <>
                          <Trophy className="h-4 w-4 mr-2" />
                          Lesson Completed!
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Complete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="editor" className="h-full p-0">
                <CodeEditor
                  initialCode={
                    lesson.starterCode || lesson.codeExample || "// Start coding here!\nconsole.log('Hello, World!');"
                  }
                  language="javascript"
                  theme="dark"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">{lesson.description}</p>
            </div>

            <Button
              onClick={handleCompleteLesson}
              disabled={completed}
              className={`flex items-center gap-2 ${
                completed
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              }`}
            >
              {completed ? (
                <>
                  <Trophy className="h-4 w-4" />
                  Completed
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Complete Lesson
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
