"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Clock, CheckCircle, X, Trophy, Star, Target } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { learningService, type Quiz, type QuizQuestion } from "@/lib/learning-service"
import { profileService } from "@/lib/profile-service"

interface QuizViewerProps {
  quizId: string
  onBack: () => void
  onComplete: () => void
}

export function QuizViewer({ quizId, onBack, onComplete }: QuizViewerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())
  const supabase = createClient()

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const quizData = learningService.getQuiz(quizId)
        if (quizData) {
          setQuiz(quizData)
          setTimeLeft(quizData.timeLimit * 60) // Convert minutes to seconds
        }
      } catch (error) {
        console.error("Error fetching quiz:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [quizId])

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitQuiz()
    }
  }, [timeLeft, isSubmitted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleSubmitQuiz = async () => {
    if (!quiz) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000 / 60) // in minutes
        const result = await learningService.submitQuizAttempt(user.id, quizId, answers, timeTaken)

        setResults(result)
        setIsSubmitted(true)

        // Award XP to user profile
        if (result.success && result.xpEarned > 0) {
          await profileService.awardXP(user.id, result.xpEarned)

          // Award badges based on performance
          if (result.percentage === 100) {
            await learningService.awardBadge(user.id, "Perfect Score")
          }
          if (result.percentage >= 80) {
            await learningService.awardBadge(user.id, "Quiz Master")
          }

          // Update streak
          await profileService.updateStreak(user.id)
        }
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    }
  }

  const getQuestionResult = (question: QuizQuestion) => {
    const userAnswer = answers[question.id]
    const isCorrect = userAnswer && userAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase())
    return { userAnswer, isCorrect }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            🧠
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz not found</h2>
        <Button onClick={onBack}>Back to Quizzes</Button>
      </div>
    )
  }

  // Results view
  if (isSubmitted && results) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{quiz.title} - Results</h1>
              <p className="text-gray-600">Quiz completed successfully!</p>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="h-6 w-6" />
              Quiz Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-700">{results.percentage}%</div>
                <div className="text-sm text-green-600">Final Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{results.score}</div>
                <div className="text-sm text-blue-600">Points Earned</div>
                <div className="text-xs text-blue-500">
                  out of {quiz.questions.reduce((sum, q) => sum + q.points, 0)}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-700">{results.xpEarned}</div>
                <div className="text-sm text-yellow-600">XP Earned</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-700">
                  {quiz.questions.filter((q) => getQuestionResult(q).isCorrect).length}
                </div>
                <div className="text-sm text-purple-600">Correct Answers</div>
                <div className="text-xs text-purple-500">out of {quiz.questions.length}</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="mt-6 text-center">
              {results.percentage === 100 && (
                <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                  <div className="text-lg font-bold text-yellow-800 mb-2">🎉 Perfect Score!</div>
                  <p className="text-yellow-700">Outstanding! You've mastered this topic completely.</p>
                </div>
              )}
              {results.percentage >= 80 && results.percentage < 100 && (
                <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                  <div className="text-lg font-bold text-green-800 mb-2">🌟 Excellent Work!</div>
                  <p className="text-green-700">Great job! You have a strong understanding of this material.</p>
                </div>
              )}
              {results.percentage >= 60 && results.percentage < 80 && (
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-800 mb-2">👍 Good Effort!</div>
                  <p className="text-blue-700">Well done! Consider reviewing the topics you missed.</p>
                </div>
              )}
              {results.percentage < 60 && (
                <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
                  <div className="text-lg font-bold text-orange-800 mb-2">📚 Keep Learning!</div>
                  <p className="text-orange-700">Don't give up! Review the material and try again.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz.questions.map((question, index) => {
              const result = getQuestionResult(question)
              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    result.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Question {index + 1}: {question.question}
                      </h4>

                      {question.code && (
                        <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-sm mb-3">
                          <pre>{question.code}</pre>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Your answer: </span>
                          <span className={result.isCorrect ? "text-green-700" : "text-red-700"}>
                            {result.userAnswer || "No answer provided"}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Correct answer: </span>
                          <span className="text-green-700">{question.correctAnswer}</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                          <span className="text-sm font-medium text-blue-800">Explanation: </span>
                          <span className="text-blue-700">{question.explanation}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline">{question.points} pts</Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={onBack} variant="outline">
            Back to Quizzes
          </Button>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Retake Quiz
          </Button>
          <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
            Continue Learning
          </Button>
        </div>
      </div>
    )
  }

  // Quiz taking view
  const currentQ = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-gray-600">{quiz.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(timeLeft)}
          </Badge>
          <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-orange-200">
            <Star className="h-4 w-4 mr-1" />
            {quiz.xpReward} XP
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card className="min-h-[500px]">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Question {currentQuestion + 1}
            <Badge variant="outline" className="ml-auto">
              {currentQ.points} points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">{currentQ.question}</h3>

            {currentQ.code && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <pre>{currentQ.code}</pre>
              </div>
            )}

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQ.type === "multiple-choice" && currentQ.options && (
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                >
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {currentQ.type === "coding" && (
                <div className="space-y-2">
                  <Label htmlFor="code-answer">Your Answer:</Label>
                  <Textarea
                    id="code-answer"
                    placeholder="Type your code here..."
                    value={answers[currentQ.id] || ""}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="font-mono text-sm min-h-[120px]"
                  />
                </div>
              )}

              {currentQ.type === "true-false" && (
                <RadioGroup
                  value={answers[currentQ.id] || ""}
                  onValueChange={(value) => handleAnswerChange(currentQ.id, value)}
                >
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="true" id="true" />
                    <Label htmlFor="true" className="flex-1 cursor-pointer">
                      True
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="false" id="false" />
                    <Label htmlFor="false" className="flex-1 cursor-pointer">
                      False
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < currentQuestion
                      ? "bg-green-500"
                      : index === currentQuestion
                        ? "bg-blue-500"
                        : answers[quiz.questions[index].id]
                          ? "bg-yellow-500"
                          : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                className="bg-green-600 hover:bg-green-700"
                disabled={!answers[currentQ.id]}
              >
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))}
                disabled={!answers[currentQ.id]}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
