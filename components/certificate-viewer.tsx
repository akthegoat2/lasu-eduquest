"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Share2, Award, Calendar, BookOpen } from "lucide-react"

interface Certificate {
  id: string
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
}

interface CertificateViewerProps {
  certificate: Certificate
  onBack: () => void
  onDownload?: () => void
  onShare?: () => void
}

export function CertificateViewer({ certificate, onBack, onDownload, onShare }: CertificateViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      // In a real implementation, this would generate and download a PDF
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulate download
      onDownload?.()
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = () => {
    // In a real implementation, this would open sharing options
    if (navigator.share) {
      navigator.share({
        title: `${certificate.course_title} Certificate`,
        text: `I've earned a certificate in ${certificate.course_title} from ${certificate.institution}!`,
        url: window.location.href,
      })
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href)
      alert("Certificate link copied to clipboard!")
    }
    onShare?.()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Certificates
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleShare} variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <Card className="certificate-border max-w-4xl mx-auto">
        <CardContent className="certificate-content">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-3xl text-white">🦅</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Lagos State University</h1>
            <p className="text-lg text-gray-600">Computer Science Department</p>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4"></div>
          </div>

          {/* Certificate Title */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Certificate of Completion</h2>
            <p className="text-lg text-gray-600">This is to certify that</p>
          </div>

          {/* Student Name */}
          <div className="text-center mb-8">
            <div className="border-b-2 border-gray-300 pb-2 mb-4 max-w-md mx-auto">
              <p className="text-2xl font-bold text-gray-800">Student Name</p>
            </div>
            <p className="text-lg text-gray-600">has successfully completed the course</p>
          </div>

          {/* Course Title */}
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-blue-600 mb-4">{certificate.course_title}</h3>
            <p className="text-lg text-gray-600">
              with a final score of <span className="font-bold text-green-600">{certificate.final_score}%</span>
            </p>
          </div>

          {/* Course Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{certificate.total_lessons}</div>
              <div className="text-sm text-gray-600">Lessons Completed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{certificate.total_quizzes}</div>
              <div className="text-sm text-gray-600">Quizzes Passed</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">{certificate.study_hours}h</div>
              <div className="text-sm text-gray-600">Study Hours</div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Skills Mastered</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {certificate.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mb-2 w-48">
                <p className="font-semibold text-gray-800">{certificate.instructor}</p>
              </div>
              <p className="text-sm text-gray-600">Course Instructor</p>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <Award className="h-12 w-12 text-yellow-500 mx-auto" />
              </div>
              <p className="text-sm text-gray-600">Official Seal</p>
            </div>

            <div className="text-center">
              <div className="border-t-2 border-gray-400 pt-2 mb-2 w-48">
                <p className="font-semibold text-gray-800">{new Date(certificate.issued_at).toLocaleDateString()}</p>
              </div>
              <p className="text-sm text-gray-600">Date of Issue</p>
            </div>
          </div>

          {/* Certificate Number */}
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">Certificate No: {certificate.certificate_number}</p>
            <p className="text-xs text-gray-500 mt-1">Verify at: verify.lasulearn.edu.ng</p>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Info */}
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Certificate Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Institution:</span>
                  <span className="font-medium">{certificate.institution}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">Computer Science</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium">{certificate.course_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Final Score:</span>
                  <span className="font-medium text-green-600">{certificate.final_score}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Verification</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Certificate ID:</span>
                  <span className="font-mono text-xs">{certificate.certificate_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{new Date(certificate.issued_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blockchain:</span>
                  <Badge variant="outline" className="text-xs">
                    Secured
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
