"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { useWellness } from "@/contexts/wellness-context"
import {
  User,
  Calendar,
  Heart,
  Activity,
  Settings,
  Camera,
  Edit,
  Trophy,
  Target,
  Flame,
  Bell,
  Shield,
  LogOut,
  Download,
  Trash2,
} from "lucide-react"
import { motion } from "framer-motion"

interface UserProfile {
  name: string
  email: string
  age: string
  height: string
  weight: string
  bio: string
  avatar: string
  joinDate: string
  cycleLength: number
  periodLength: number
  lastPeriod: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { getWellnessHistory } = useWellness()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || "Sarah Johnson",
    email: user?.email || "sarah.johnson@example.com",
    age: "28",
    height: "5'6\"",
    weight: "135 lbs",
    bio: "Health enthusiast passionate about wellness and self-care. Love yoga, meditation, and tracking my wellness journey.",
    avatar: "/placeholder-user.jpg",
    joinDate: "January 2024",
    cycleLength: 28,
    periodLength: 5,
    lastPeriod: "2024-01-15",
  })

  const [settings, setSettings] = useState({
    notifications: {
      periodReminders: true,
      wellnessReminders: true,
      newsUpdates: false,
      weeklyReports: true,
    },
    privacy: {
      dataSharing: false,
      analytics: true,
      publicProfile: false,
    },
    theme: "light",
  })

  const wellnessHistory = getWellnessHistory()
  const totalEntries = wellnessHistory.length
  const currentStreak = calculateStreak()
  const monthlyGoal = 20
  const currentMonthEntries = wellnessHistory.filter(
    (entry) => new Date(entry.date).getMonth() === new Date().getMonth(),
  ).length

  const [achievements] = useState<Achievement[]>([
    {
      id: "first-entry",
      title: "First Steps",
      description: "Log your first wellness entry",
      icon: "🌟",
      unlocked: totalEntries > 0,
      progress: Math.min(totalEntries, 1),
      maxProgress: 1,
    },
    {
      id: "week-streak",
      title: "Week Warrior",
      description: "Log wellness data for 7 consecutive days",
      icon: "🔥",
      unlocked: currentStreak >= 7,
      progress: Math.min(currentStreak, 7),
      maxProgress: 7,
    },
    {
      id: "month-goal",
      title: "Monthly Master",
      description: "Reach your monthly wellness goal",
      icon: "🎯",
      unlocked: currentMonthEntries >= monthlyGoal,
      progress: Math.min(currentMonthEntries, monthlyGoal),
      maxProgress: monthlyGoal,
    },
    {
      id: "wellness-guru",
      title: "Wellness Guru",
      description: "Complete 50 wellness entries",
      icon: "🏆",
      unlocked: totalEntries >= 50,
      progress: Math.min(totalEntries, 50),
      maxProgress: 50,
    },
  ])

  function calculateStreak(): number {
    if (wellnessHistory.length === 0) return 0

    const sortedHistory = wellnessHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sortedHistory) {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)

      const diffTime = currentDate.getTime() - entryDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === streak || (streak === 0 && diffDays <= 1)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const handleProfileUpdate = () => {
    setIsEditing(false)
    // Here you would typically save to a backend
    console.log("Profile updated:", profile)
  }

  const handleSettingChange = (category: string, setting: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }))
  }

  const handleDeleteAccount = () => {
    // Handle account deletion
    console.log("Account deletion requested")
    setShowDeleteDialog(false)
  }

  const exportData = () => {
    const data = {
      profile,
      wellnessHistory,
      achievements,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "shecare-data-export.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const motivationalQuotes = [
    "Your wellness journey is unique and beautiful.",
    "Small steps lead to big changes.",
    "Self-care isn't selfish, it's essential.",
    "Progress, not perfection.",
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 pt-16">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-[#40679E] to-[#1B3C73] py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-2xl bg-[#FF407D] text-white">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-[#FF407D] hover:bg-[#e63946]"
                onClick={() => setIsEditing(true)}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center md:text-left text-white"
            >
              <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
              <p className="text-[#FFCAD4] mb-2">Member since {profile.joinDate}</p>
              <p className="text-sm italic opacity-90">"{randomQuote}"</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="period" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Period Data
                </TabsTrigger>
                <TabsTrigger value="wellness" className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Wellness
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                        <User className="h-5 w-5 text-[#FF407D]" />
                        Personal Information
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                        className="border-[#FF407D] text-[#FF407D] hover:bg-[#FF407D] hover:text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? "Cancel" : "Edit"}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profile.name}
                            onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="age">Age</Label>
                          <Input
                            id="age"
                            value={profile.age}
                            onChange={(e) => setProfile((prev) => ({ ...prev, age: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            value={profile.height}
                            onChange={(e) => setProfile((prev) => ({ ...prev, height: e.target.value }))}
                            disabled={!isEditing}
                            className="bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                          disabled={!isEditing}
                          className="bg-white min-h-[100px]"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                      {isEditing && (
                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleProfileUpdate} className="bg-[#FF407D] hover:bg-[#e63946] text-white">
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)} className="border-gray-300">
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Period Data Tab */}
              <TabsContent value="period" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                        <Calendar className="h-5 w-5 text-[#FF407D]" />
                        Cycle Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gradient-to-r from-[#FF407D]/10 to-[#FFCAD4]/10 rounded-lg">
                          <div className="text-2xl font-bold text-[#FF407D] mb-2">{profile.cycleLength}</div>
                          <div className="text-sm text-[#1B3C73]">Average Cycle Length (days)</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-[#40679E]/10 to-[#1B3C73]/10 rounded-lg">
                          <div className="text-2xl font-bold text-[#40679E] mb-2">{profile.periodLength}</div>
                          <div className="text-sm text-[#1B3C73]">Period Length (days)</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600 mb-2">
                            {new Date(profile.lastPeriod).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-sm text-[#1B3C73]">Last Period</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-[#1B3C73]">Recent Period History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { date: "2024-01-15", flow: "Medium", symptoms: ["Cramps", "Mood Swings"] },
                          { date: "2023-12-18", flow: "Heavy", symptoms: ["Headache", "Fatigue"] },
                          { date: "2023-11-20", flow: "Light", symptoms: ["Bloating"] },
                        ].map((period, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100"
                          >
                            <div>
                              <div className="font-medium text-[#1B3C73]">
                                {new Date(period.date).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                              <div className="text-sm text-[#40679E]">Flow: {period.flow}</div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {period.symptoms.map((symptom, i) => (
                                <Badge key={i} variant="secondary" className="text-xs bg-[#FF407D] text-white">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Wellness Tab */}
              <TabsContent value="wellness" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                        <Activity className="h-5 w-5 text-[#FF407D]" />
                        Wellness Activities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          {
                            category: "Mood Tracking",
                            count: wellnessHistory.length,
                            icon: "😊",
                            color: "bg-yellow-100 text-yellow-800",
                          },
                          {
                            category: "Sleep Monitoring",
                            count: wellnessHistory.filter((e) => e.sleep > 0).length,
                            icon: "😴",
                            color: "bg-blue-100 text-blue-800",
                          },
                          {
                            category: "Exercise Logged",
                            count: wellnessHistory.filter((e) => e.exercise && e.exercise !== "none").length,
                            icon: "💪",
                            color: "bg-green-100 text-green-800",
                          },
                          {
                            category: "Symptoms Tracked",
                            count: wellnessHistory.filter((e) => e.symptoms.length > 0).length,
                            icon: "📝",
                            color: "bg-red-100 text-red-800",
                          },
                        ].map((activity, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-[#1B3C73]">{activity.category}</div>
                                <div className="text-2xl font-bold text-[#FF407D]">{activity.count}</div>
                              </div>
                              <div className={`p-3 rounded-full ${activity.color}`}>
                                <span className="text-2xl">{activity.icon}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                        <Bell className="h-5 w-5 text-[#FF407D]" />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(settings.notifications).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[#1B3C73] capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-sm text-[#40679E]">
                              {key === "periodReminders" && "Get notified about upcoming periods"}
                              {key === "wellnessReminders" && "Daily wellness check-in reminders"}
                              {key === "newsUpdates" && "Health news and article notifications"}
                              {key === "weeklyReports" && "Weekly wellness summary reports"}
                            </div>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => handleSettingChange("notifications", key, checked)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                        <Shield className="h-5 w-5 text-[#FF407D]" />
                        Privacy & Security
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(settings.privacy).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-[#1B3C73] capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </div>
                            <div className="text-sm text-[#40679E]">
                              {key === "dataSharing" && "Share anonymized data for research"}
                              {key === "analytics" && "Help improve the app with usage analytics"}
                              {key === "publicProfile" && "Make your profile visible to other users"}
                            </div>
                          </div>
                          <Switch
                            checked={value}
                            onCheckedChange={(checked) => handleSettingChange("privacy", key, checked)}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                        <Settings className="h-5 w-5 text-[#FF407D]" />
                        Account Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={exportData}
                          variant="outline"
                          className="flex items-center gap-2 border-[#40679E] text-[#40679E] hover:bg-[#40679E] hover:text-white bg-transparent"
                        >
                          <Download className="w-4 h-4" />
                          Export Data
                        </Button>
                        <Button
                          onClick={logout}
                          variant="outline"
                          className="flex items-center gap-2 border-[#FF407D] text-[#FF407D] hover:bg-[#FF407D] hover:text-white bg-transparent"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white bg-transparent"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Account
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-[#40679E]">
                                Are you sure you want to delete your account? This action cannot be undone and all your
                                data will be permanently removed.
                              </p>
                              <div className="flex gap-3">
                                <Button
                                  onClick={handleDeleteAccount}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Yes, Delete Account
                                </Button>
                                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Wellness Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Card className="bg-gradient-to-r from-[#FF407D] to-[#FFCAD4] text-white border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <Flame className="w-10 h-10 mx-auto mb-3" />
                  <h3 className="text-xl font-bold mb-2">Current Streak</h3>
                  <p className="text-3xl font-bold mb-1">{currentStreak}</p>
                  <p className="text-sm opacity-90">days in a row</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Goal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                    <Target className="h-5 w-5 text-[#FF407D]" />
                    Monthly Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-bold">
                        {currentMonthEntries}/{monthlyGoal}
                      </span>
                    </div>
                    <Progress value={(currentMonthEntries / monthlyGoal) * 100} className="h-3" />
                    <p className="text-xs text-[#40679E]">
                      {monthlyGoal - currentMonthEntries > 0
                        ? `${monthlyGoal - currentMonthEntries} more entries to reach your goal!`
                        : "🎉 Goal achieved this month!"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1B3C73]">
                    <Trophy className="h-5 w-5 text-[#FF407D]" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`p-3 rounded-lg border ${
                          achievement.unlocked
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className={`font-medium ${achievement.unlocked ? "text-[#1B3C73]" : "text-gray-500"}`}>
                              {achievement.title}
                            </div>
                            <div className="text-xs text-[#40679E] mb-2">{achievement.description}</div>
                            <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
