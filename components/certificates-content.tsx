"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CertificateViewer } from "@/components/certificate-viewer"
import { Award, Download, Share2, CheckCircle, Lock, Calendar, User, BookOpen } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { learningService } from "@/lib/learning-service"

interface Certificate {
  id: string
  course_id: string
  course_title: string
  certificate_number: string
  final_score: number
  total_lessons: number
  total_quizzes: number
  study_hours: number
  skills: string[]
  instructor: string
  institution: string
  issued_at: string
  created_at: string
}

interface CertificateRequirement {
  id: string
  title: string
  description: string
  requiredLessons: number
  requiredQuizzes: number
  minimumScore: number
  skills: string[]
  available: boolean
  progress: {
    lessons: number
    quizzes: number
    averageScore: number
  }
}

export function CertificatesContent() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [availableCertificates, setAvailableCertificates] = useState<CertificateRequirement[]>([])
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState({
    totalLessons: 0,
    totalQuizzes: 0,
    averageScore: 0,
    studyHours: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Get user's earned certificates
          const { data: userCertificates } = await supabase
            .from("certificates")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          setCertificates(userCertificates || [])

          // Get user progress
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

          const { data: quizAttempts } = await supabase.from("quiz_attempts").select("*").eq("user_id", user.id)

          if (profile) {
            const averageScore =
              quizAttempts && quizAttempts.length > 0
                ? Math.round(
                    quizAttempts.reduce((sum: number, attempt: any) => sum + attempt.percentage, 0) /
                      quizAttempts.length,
                  )
                : 0

            setUserProgress({
              totalLessons: profile.completed_lessons || 0,
              totalQuizzes: profile.completed_quizzes || 0,
              averageScore,
              studyHours: profile.total_study_hours || 0,
            })

            // Define available certificates with requirements
            const certificateRequirements: CertificateRequirement[] = [
              {
                id: "web-fundamentals",
                title: "Web Development Fundamentals",
                description: "Master the basics of web development, HTML, CSS, and JavaScript",
                requiredLessons: 5,
                requiredQuizzes: 2,
                minimumScore: 70,
                skills: ["HTML5", "CSS3", "JavaScript", "Web Standards"],
                available: true,
                progress: {
                  lessons: profile.completed_lessons || 0,
                  quizzes: profile.completed_quizzes || 0,
                  averageScore,
                },
              },
              {
                id: "javascript-mastery",
                title: "JavaScript Programming",
                description: "Advanced JavaScript concepts, ES6+, and modern development practices",
                requiredLessons: 8,
                requiredQuizzes: 4,
                minimumScore: 75,
                skills: ["JavaScript ES6+", "Async Programming", "DOM Manipulation", "APIs"],
                available: true,
                progress: {
                  lessons: profile.completed_lessons || 0,
                  quizzes: profile.completed_quizzes || 0,
                  averageScore,
                },
              },
              {
                id: "react-developer",
                title: "React Developer",
                description: "Build modern web applications with React and related technologies",
                requiredLessons: 12,
                requiredQuizzes: 6,
                minimumScore: 80,
                skills: ["React", "JSX", "Hooks", "State Management", "Component Architecture"],
                available: profile.completed_lessons >= 5, // Unlock after completing fundamentals
                progress: {
                  lessons: profile.completed_lessons || 0,
                  quizzes: profile.completed_quizzes || 0,
                  averageScore,
                },
              },
              {
                id: "fullstack-developer",
                title: "Full Stack Developer",
                description: "Complete full-stack development with frontend and backend technologies",
                requiredLessons: 20,
                requiredQuizzes: 10,
                minimumScore: 85,
                skills: [
                  "Frontend Development",
                  "Backend Development",
                  "Database Design",
                  "API Development",
                  "Deployment",
                ],
                available: profile.completed_lessons >= 10, // Unlock after significant progress
                progress: {
                  lessons: profile.completed_lessons || 0,
                  quizzes: profile.completed_quizzes || 0,
                  averageScore,
                },
              },
            ]

            setAvailableCertificates(certificateRequirements)
          }
        }
      } catch (error) {
        console.error("Error fetching certificates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handleGenerateCertificate = async (courseId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const success = await learningService.generateCertificate(user.id, courseId)
        if (success) {
          // Refresh certificates
          window.location.reload()
        } else {
          alert("You don't meet the requirements for this certificate yet. Keep learning!")
        }
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
    }
  }

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100)
  }

  const meetsRequirements = (cert: CertificateRequirement) => {
    return (
      cert.progress.lessons >= cert.requiredLessons &&
      cert.progress.quizzes >= cert.requiredQuizzes &&
      cert.progress.averageScore >= cert.minimumScore
    )
  }

  if (selectedCertificate) {
    const certificate = certificates.find((c) => c.id === selectedCertificate)
    if (certificate) {
      return <CertificateViewer certificate={certificate} onBack={() => setSelectedCertificate(null)} />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto animate-pulse">
            🏆
          </div>
          <div className="text-lg font-semibold text-gray-700">Loading certificates...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Certificates & Achievements 🏆
        </h1>
        <p className="text-gray-600 text-lg">Earn official certificates to showcase your skills and knowledge</p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center text-blue-800 flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Your Learning Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-blue-200">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{userProgress.totalLessons}</div>
              <div className="text-sm text-blue-600">Lessons Completed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-purple-200">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{userProgress.totalQuizzes}</div>
              <div className="text-sm text-purple-600">Quizzes Completed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{userProgress.averageScore}%</div>
              <div className="text-sm text-green-600">Average Score</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-orange-200">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{userProgress.studyHours}</div>
              <div className="text-sm text-orange-600">Study Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earned Certificates */}
      {certificates.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            Your Certificates ({certificates.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <CardTitle className="text-lg text-yellow-800">{certificate.course_title}</CardTitle>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800 w-fit">
                    Certificate #{certificate.certificate_number.split("-").pop()}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-gray-700">Final Score</div>
                      <div className="text-yellow-700 font-bold">{certificate.final_score}%</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Study Hours</div>
                      <div className="text-yellow-700 font-bold">{certificate.study_hours}h</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Lessons</div>
                      <div className="text-yellow-700 font-bold">{certificate.total_lessons}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-700">Quizzes</div>
                      <div className="text-yellow-700 font-bold">{certificate.total_quizzes}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 text-sm">Skills Certified:</div>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {certificate.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{certificate.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    Issued: {new Date(certificate.issued_at).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedCertificate(certificate.id)}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      size="sm"
                    >
                      <Award className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Certificates */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="h-6 w-6 text-blue-600" />
          Available Certificates
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {availableCertificates.map((cert) => {
            const earned = certificates.some((c) => c.course_id === cert.id)
            const canEarn = meetsRequirements(cert)

            return (
              <Card
                key={cert.id}
                className={`hover:shadow-lg transition-all duration-200 ${
                  earned
                    ? "bg-green-50 border-green-200"
                    : canEarn
                      ? "bg-blue-50 border-blue-200 hover:scale-105"
                      : cert.available
                        ? "bg-gray-50 border-gray-200"
                        : "bg-gray-100 border-gray-300 opacity-60"
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {earned ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : cert.available ? (
                        <Award className="h-6 w-6 text-blue-600" />
                      ) : (
                        <Lock className="h-6 w-6 text-gray-400" />
                      )}
                      <CardTitle className="text-lg">{cert.title}</CardTitle>
                    </div>
                    {earned && <Badge className="bg-green-100 text-green-800">Earned</Badge>}
                    {!earned && canEarn && <Badge className="bg-blue-100 text-blue-800">Ready to Earn</Badge>}
                    {!cert.available && <Badge className="bg-gray-100 text-gray-600">Locked</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm">{cert.description}</p>

                  {/* Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 text-sm">Requirements:</h4>

                    {/* Lessons Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Lessons Completed</span>
                        <span className="font-semibold">
                          {cert.progress.lessons} / {cert.requiredLessons}
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(cert.progress.lessons, cert.requiredLessons)}
                        className="h-2"
                      />
                    </div>

                    {/* Quizzes Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Quizzes Completed</span>
                        <span className="font-semibold">
                          {cert.progress.quizzes} / {cert.requiredQuizzes}
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(cert.progress.quizzes, cert.requiredQuizzes)}
                        className="h-2"
                      />
                    </div>

                    {/* Score Requirement */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Minimum Average Score</span>
                        <span className="font-semibold">
                          {cert.progress.averageScore}% / {cert.minimumScore}%
                        </span>
                      </div>
                      <Progress
                        value={getProgressPercentage(cert.progress.averageScore, cert.minimumScore)}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="space-y-2">
                    <div className="font-semibold text-gray-700 text-sm">Skills You'll Certify:</div>
                    <div className="flex flex-wrap gap-1">
                      {cert.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    {earned ? (
                      <Button
                        onClick={() => {
                          const earnedCert = certificates.find((c) => c.course_id === cert.id)
                          if (earnedCert) setSelectedCertificate(earnedCert.id)
                        }}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        View Certificate
                      </Button>
                    ) : canEarn && cert.available ? (
                      <Button
                        onClick={() => handleGenerateCertificate(cert.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Award className="h-4 w-4 mr-2" />
                        Generate Certificate
                      </Button>
                    ) : cert.available ? (
                      <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                        <Lock className="h-4 w-4 mr-2" />
                        Complete Requirements
                      </Button>
                    ) : (
                      <Button disabled className="w-full bg-gray-400 cursor-not-allowed">
                        <Lock className="h-4 w-4 mr-2" />
                        Locked - Complete Prerequisites
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Achievement Tips */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Tips for Earning Certificates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-3">Study Strategies:</h4>
              <ul className="space-y-2 text-green-600 text-sm">
                <li>• Complete lessons in order for better understanding</li>
                <li>• Take notes and practice coding examples</li>
                <li>• Review quiz explanations to learn from mistakes</li>
                <li>• Maintain a consistent daily study schedule</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-3">Certificate Benefits:</h4>
              <ul className="space-y-2 text-green-600 text-sm">
                <li>• Official recognition of your skills</li>
                <li>• Shareable on LinkedIn and social media</li>
                <li>• Downloadable PDF for your portfolio</li>
                <li>• Verification through LASU system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
