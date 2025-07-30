"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { ModulesContent } from "@/components/modules-content"
import { LessonViewer } from "@/components/lesson-viewer"
import { LeaderboardContent } from "@/components/leaderboard-content"
import { QuizzesContent } from "@/components/quizzes-content"
import { QuizViewer } from "@/components/quiz-viewer"
import { CertificatesContent } from "@/components/certificates-content"
import { AuthWrapper } from "@/components/auth-wrapper"

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState<{ moduleId: string; lessonId: string } | null>(null)

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardContent />
      case "modules":
        return (
          <ModulesContent
            onStartLesson={(moduleId, lessonId) => {
              setSelectedLesson({ moduleId, lessonId })
              setActiveView("lesson")
            }}
          />
        )
      case "lesson":
        return (
          <LessonViewer
            moduleId={selectedLesson?.moduleId || ""}
            lessonId={selectedLesson?.lessonId || ""}
            onBack={() => setActiveView("modules")}
          />
        )
      case "quizzes":
        return (
          <QuizzesContent
            onStartQuiz={(quiz) => {
              setSelectedQuiz(quiz)
              setActiveView("quiz")
            }}
          />
        )
      case "quiz":
        return <QuizViewer quiz={selectedQuiz} onBack={() => setActiveView("quizzes")} />
      case "leaderboard":
        return <LeaderboardContent />
      case "certificates":
        return <CertificatesContent />
      default:
        return <DashboardContent />
    }
  }

  return (
    <AuthWrapper>
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50">
          <AppSidebar activeView={activeView} onViewChange={setActiveView} />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{renderContent()}</main>
        </div>
      </SidebarProvider>
    </AuthWrapper>
  )
}
