"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, UserIcon, Mail, BookOpen, Award, Calendar, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase"
import { profileService, type UserProfile } from "@/lib/profile-service"
import type { User } from "@supabase/supabase-js"

interface ProfileSettingsProps {
  user: User
  onClose: () => void
}

export function ProfileSettings({ user, onClose }: ProfileSettingsProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    course: "",
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userProfile = await profileService.getProfile(user.id)
        if (userProfile) {
          setProfile(userProfile)
          setFormData({
            full_name: userProfile.full_name || "",
            course: userProfile.course || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user.id])

  const handleSave = async () => {
    try {
      const success = await profileService.updateProfile(user.id, formData)
      if (success) {
        setProfile((prev) => (prev ? { ...prev, ...formData } : null))
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onClose()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold">Profile Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <Avatar className="h-16 w-16 ring-4 ring-blue-200">
              <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-xl">
                {(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{profile?.full_name || "User"}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-blue-100 text-blue-800">Level {profile?.level || 1}</Badge>
                <Badge className="bg-green-100 text-green-800">{profile?.xp || 0} XP</Badge>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="h-4 w-4 inline mr-2" />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{profile?.full_name || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </label>
                <p className="p-2 bg-gray-50 rounded-md text-gray-600">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen className="h-4 w-4 inline mr-2" />
                  Course
                </label>
                {isEditing ? (
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData((prev) => ({ ...prev, course: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your course</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                  </select>
                ) : (
                  <p className="p-2 bg-gray-50 rounded-md">{profile?.course || "Not set"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Member Since
                </label>
                <p className="p-2 bg-gray-50 rounded-md">
                  {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Learning Statistics */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800">Learning Statistics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{profile?.xp || 0}</div>
                <div className="text-sm text-blue-600">Total XP</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{profile?.level || 1}</div>
                <div className="text-sm text-green-600">Current Level</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{profile?.completed_lessons || 0}</div>
                <div className="text-sm text-purple-600">Lessons</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{profile?.completed_quizzes || 0}</div>
                <div className="text-sm text-orange-600">Quizzes</div>
              </div>
            </div>
          </div>

          {/* Badges */}
          {profile?.badges && profile.badges.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Earned Badges</h4>
              <div className="flex flex-wrap gap-2">
                {profile.badges.map((badge, index) => (
                  <Badge key={index} className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    <Award className="h-3 w-3 mr-1" />
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Account Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800">Account Actions</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
