"use client"

import { Home, BookOpen, Trophy, Zap, Target, Award } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { ProfileSettings } from "@/components/profile-settings"
import type { User } from "@supabase/supabase-js"
// Remove this incorrect import:
// import { profileService } from "@/services/profileService"

// Replace with the correct import:
import { profileService, type UserProfile } from "@/lib/profile-service"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface AppSidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  {
    title: "Dashboard",
    icon: Home,
    id: "dashboard",
    emoji: "🏠",
  },
  {
    title: "Modules",
    icon: BookOpen,
    id: "modules",
    emoji: "📚",
  },
  {
    title: "Quizzes",
    icon: Target,
    id: "quizzes",
    emoji: "❓",
  },
  {
    title: "Certificates",
    icon: Award,
    id: "certificates",
    emoji: "🏆",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    id: "leaderboard",
    emoji: "🏆",
  },
]

export function AppSidebar({ activeView, onViewChange }: AppSidebarProps) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Fetch full profile data
        const userProfile = await profileService.getProfile(user.id)
        if (userProfile) {
          setProfile(userProfile)
        }
      }
    }
    fetchUserData()
  }, [])

  return (
    <Sidebar className="border-r-0 bg-white/80 backdrop-blur-sm">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold text-lg">
            🦅
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              LASU Learn
            </h2>
            <p className="text-xs text-muted-foreground">Computer Science Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start gap-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-100 data-[active=true]:to-purple-100 data-[active=true]:text-blue-700"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-4">
          {/* User Profile */}
          <div
            onClick={() => setShowProfileSettings(true)}
            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border border-green-100 cursor-pointer hover:from-green-100 hover:to-blue-100 transition-colors"
          >
            <Avatar className="h-10 w-10 ring-2 ring-green-200">
              <AvatarImage src={user?.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold">
                {user?.user_metadata?.full_name
                  ? user.user_metadata.full_name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{user?.user_metadata?.full_name || "User"}</p>
              <p className="text-xs text-gray-600">Computer Science - Year 1</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-700">Level {profile?.level || 1}</span>
              </div>
              <span className="text-sm font-bold text-orange-600">
                {profile?.xp || 0} / {(profile?.level || 1) * 1000} XP
              </span>
            </div>
            <Progress value={((profile?.xp || 0) % 1000) / 10} className="h-2 bg-yellow-100" />
            <p className="text-xs text-gray-600">
              {1000 - ((profile?.xp || 0) % 1000)} XP to level {(profile?.level || 1) + 1}! 🚀
            </p>
          </div>

          {/* Current Streak */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-semibold text-gray-700">Streak</span>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700 font-bold">
              {profile?.streak || 0} days
            </Badge>
          </div>
        </div>
      </SidebarFooter>

      {/* Profile Settings Modal */}
      {showProfileSettings && user && <ProfileSettings user={user} onClose={() => setShowProfileSettings(false)} />}
    </Sidebar>
  )
}
