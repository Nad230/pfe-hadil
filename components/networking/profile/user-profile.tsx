"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Globe,
  Users,
  MessageSquare,
  Calendar,
  CheckCircle,
  UserIcon,
  Star,
  Award,
  Heart,
  Share2,
  BookOpen,
  Clock,
  ChevronRight,
  Settings,
  Bell,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatDistanceToNow } from "date-fns"
import { Progress } from "@/components/ui/progress"

interface UserProfileProps {
  userId: string
}

interface UserProfile {
  id: string
  id_users: string
  fullname: string
  email: string
  phone?: string
  profile_photo?: string
  bio?: string
  location?: string
  website?: string
  role?: string
  created_at: string
  projects?: Project[]
  posts?: Post[]
  habits?: Habit[]
  following?: UserFollower[]
  followedBy?: UserFollower[]
}

interface Project {
  id: string
  name: string
  description?: string
  tasks?: Task[]
}

interface Task {
  id: string
  title: string
  description?: string
  status: string
  estimatedHours?: number
}

interface Post {
  id: string
  content: string
  createdAt: string
  mediaType?: string
  privacy: string
  shareCount: number
  isEdited?: boolean
  media?: PostMedia[]
  reactions?: PostReaction[]
  comments?: PostComment[]
}

interface PostMedia {
  id: string
  type: string
  url: string
  fileName?: string
  fileSize?: number
  width?: number
  height?: number
  duration?: number
}

interface PostReaction {
  id: string
  type: string
  userId: string
}

interface PostComment {
  id: string
  content: string
  authorId: string
  createdAt: string
}

interface Habit {
  id: string
  name: string
  type: string
  description?: string
  weeklyTarget: number
  status: string
  streak: number
  completions?: HabitCompletion[]
}

interface HabitCompletion {
  id: string
  date: string
  completed: boolean
  notes?: string
}

interface UserFollower {
  followerId: string
  followingId: string
  createdAt: string
}

const ProfileSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1">
        <Card className="overflow-hidden border-none shadow-md">
          <Skeleton className="h-32 w-full" />
          <CardHeader className="text-center relative -mt-16 pb-2">
            <div className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Separator />
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-center">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pb-4">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </CardFooter>
        </Card>
        <Card className="mt-6 border-none shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:col-span-2">
        <Skeleton className="h-12 w-full mb-4" />
        <Card className="border-none shadow-md">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="pt-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
)

export default function UserProfile({ userId }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("projects")
  const router = useRouter()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const token =
          localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("authToken")

        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.status}`)
        }

        const data = await response.json()
        setProfile(data)

        // Check if current user is following this profile
        const currentUserId = getCurrentUserId()
        if (data.followedBy && currentUserId) {
          setIsFollowing(data.followedBy.some((follow: UserFollower) => follow.followerId === currentUserId))
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
        setError(err instanceof Error ? err.message : "Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserProfile()
    }
  }, [userId])

  const getCurrentUserId = () => {
    if (typeof window !== "undefined") {
      try {
        const userStr = localStorage.getItem("user")
        if (userStr) {
          const user = JSON.parse(userStr)
          if (user?.id) return user.id
        }
        return localStorage.getItem("user_id")
      } catch (e) {
        console.error("Error parsing user from localStorage:", e)
      }
    }
    return null
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
  }

  const handleFollow = async () => {
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token") || localStorage.getItem("authToken")

      if (!token) {
        setError("Authentication required")
        return
      }

      // Optimistic update
      setIsFollowing(!isFollowing)

      // In a real implementation, you would make an API call here
      // const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/follow/${userId}`, {
      //   method: isFollowing ? 'DELETE' : 'POST',
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // })
      //
      // if (!response.ok) {
      //   throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`)
      //   setIsFollowing(isFollowing) // Revert on error
      // }
    } catch (err) {
      console.error("Error following/unfollowing user:", err)
      setIsFollowing(isFollowing) // Revert on error
    }
  }

  const handleMessage = () => {
    router.push(`/habits/networking/messages/${userId}`)
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>Profil non trouvé</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  const currentUserId = getCurrentUserId()
  const isOwnProfile = currentUserId === profile.id || currentUserId === profile.id_users

  // Calculate stats
  const completedProjects = profile.projects?.filter(p => p.tasks?.every(t => t.status === "completed")).length || 0
  const totalProjects = profile.projects?.length || 0
  const projectCompletion = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
  
  const activeHabits = profile.habits?.filter(h => h.status === "InProgress").length || 0
  const completedHabits = profile.habits?.filter(h => h.status === "Completed").length || 0
  const totalHabits = profile.habits?.length || 0
  const habitCompletion = totalHabits > 0 ? ((activeHabits + completedHabits) / totalHabits) * 100 : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar with profile info */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow">
            <div className="h-32 bg-gradient-to-r from-primary/30 to-primary/10"></div>
            <CardHeader className="text-center relative -mt-16 pb-2">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4 border-4 border-background shadow-md">
                  <AvatarImage
                    src={profile.profile_photo || "/placeholder.svg?height=96&width=96"}
                    alt={profile.fullname}
                  />
                  <AvatarFallback className="text-2xl">{profile.fullname.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{profile.fullname}</CardTitle>
                <CardDescription className="text-lg">{profile.role || "Utilisateur"}</CardDescription>
                <div className="flex gap-2 mt-4">
                  {!isOwnProfile && (
                    <>
                      <Button variant="outline" size="sm" onClick={handleMessage} className="shadow-sm hover:shadow-md transition-shadow">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        variant={isFollowing ? "secondary" : "default"} 
                        size="sm" 
                        onClick={handleFollow}
                        className="shadow-sm hover:shadow-md transition-shadow"
                      >
                        {isFollowing ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Suivi
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Suivre
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  {isOwnProfile && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push("/profile/edit")}
                      className="shadow-sm hover:shadow-md transition-shadow"
                    >
                      <UserIcon className="h-4 w-4 mr-2" />
                      Modifier le profil
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.bio && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground italic">{profile.bio}</p>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  {profile.email && (
                    <div className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-md transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-md transition-colors">
                      <Phone className="h-4 w-4 text-primary" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-md transition-colors">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-md transition-colors">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Membre depuis {formatDate(profile.created_at)}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  {profile.website && (
                    <div className="flex items-center gap-2 hover:bg-muted/30 p-2 rounded-md transition-colors">
                      <Globe className="h-4 w-4 text-primary" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {profile.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold text-primary">{profile.followedBy?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Abonnés</p>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="text-2xl font-bold text-primary">{profile.following?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Abonnements</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center pb-4">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Star className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          {/* Stats Card */}
          <Card className="mt-6 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Projets complétés</span>
                  <span className="text-sm font-medium">{completedProjects}/{totalProjects}</span>
                </div>
                <Progress value={projectCompletion} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Habitudes actives</span>
                  <span className="text-sm font-medium">{activeHabits + completedHabits}/{totalHabits}</span>
                </div>
                <Progress value={habitCompletion} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Publications</span>
                  <span className="text-sm font-medium">{profile.posts?.length || 0}</span>
                </div>
                <Progress value={profile.posts?.length ? 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:col-span-2">
          <Tabs 
            defaultValue="projects" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4 bg-muted/30 p-1 rounded-lg">
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Projets
              </TabsTrigger>
              <TabsTrigger 
                value="posts" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Publications
              </TabsTrigger>
              <TabsTrigger 
                value="habits" 
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Habitudes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                    Projets
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {profile.projects && profile.projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.projects.map((project) => (
                        <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow border border-muted/50">
                          <CardHeader className="pb-2 bg-muted/20">
                            <CardTitle className="text-lg flex items-center">
                              <Briefcase className="h-4 w-4 mr-2 text-primary" />
                              {project.name}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm">{project.description}</p>
                            {project.tasks && project.tasks.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2 flex items-center">
                                  <CheckCircle className="h-4 w-4 mr-1 text-primary" />
                                  Tâches
                                </h4>
                                <ul className="space-y-1">
                                  {project.tasks.slice(0, 3).map((task) => (
                                    <li key={task.id} className="text-xs flex items-center justify-between bg-muted/20 p-2 rounded-md">
                                      <span>{task.title}</span>
                                      <Badge
                                        variant={
                                          task.status === "completed"
                                            ? "default"
                                            : task.status === "pending"
                                              ? "secondary"
                                              : "outline"
                                        }
                                        className={
                                          task.status === "completed"
                                            ? "bg-green-500"
                                            : task.status === "pending"
                                              ? "bg-yellow-500"
                                              : ""
                                        }
                                      >
                                        {task.status}
                                      </Badge>
                                    </li>
                                  ))}
                                  {project.tasks.length > 3 && (
                                    <li className="text-xs text-muted-foreground flex items-center justify-center p-1 hover:bg-muted/30 rounded-md cursor-pointer">
                                      +{project.tasks.length - 3} autres tâches
                                      <ChevronRight className="h-3 w-3 ml-1" />
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucun projet à afficher</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Les projets que {isOwnProfile ? "vous créez" : "cet utilisateur crée"} apparaîtront ici
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                    Publications
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {profile.posts && profile.posts.length > 0 ? (
                    <div className="space-y-6">
                      {profile.posts.map((post) => (
                        <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow border border-muted/50">
                          {post.media && post.media.length > 0 && post.media[0].type === "Image" && (
                            <div className="aspect-video w-full overflow-hidden">
                              <img
                                src={post.media[0].url || "/placeholder.svg?height=180&width=320"}
                                alt="Post media"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <CardHeader className="pb-2 bg-muted/20">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                <BookOpen className="h-4 w-4 mr-2 text-primary" />
                                Publication
                              </CardTitle>
                              <div className="text-xs text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                                {post.isEdited && <span className="ml-1">(modifié)</span>}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                            <div className="flex items-center gap-4 mt-4">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {post.comments?.length || 0} commentaires
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {post.reactions?.length || 0} réactions
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{post.shareCount} partages</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2 pt-0 pb-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Heart className="h-4 w-4 mr-1" />
                              J'aime
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Commenter
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Share2 className="h-4 w-4 mr-1" />
                              Partager
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucune publication à afficher</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Les publications que {isOwnProfile ? "vous partagez" : "cet utilisateur partage"} apparaîtront ici
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="habits">
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-primary" />
                    Habitudes
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {profile.habits && profile.habits.length > 0 ? (
                    <div className="space-y-4">
                      {profile.habits.map((habit) => (
                        <Card key={habit.id} className="overflow-hidden hover:shadow-md transition-shadow border border-muted/50">
                          <CardHeader className="pb-2 bg-muted/20">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg flex items-center">
                                {habit.type === "GoodHabit" ? (
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4 mr-2 text-red-500"
                                  >
                                    <path d="M18 6 6 18" />
                                    <path d="m6 6 12 12" />
                                  </svg>
                                )}
                                {habit.name}
                              </CardTitle>
                              <Badge
                                variant={
                                  habit.status === "Completed"
                                    ? "default"
                                    : habit.status === "InProgress"
                                      ? "secondary"
                                      : "outline"
                                }
                                className={
                                  habit.status === "Completed"
                                    ? "bg-green-500"
                                    : habit.status === "InProgress"
                                      ? "bg-blue-500"
                                      : ""
                                }
                              >
                                {habit.status === "InProgress"
                                  ? "En cours"
                                  : habit.status === "Completed"
                                    ? "Terminé"
                                    : habit.status === "Paused"
                                      ? "En pause"
                                      : "Non commencé"}
                              </Badge>
                            </div>
                            <CardDescription>
                              {habit.type === "GoodHabit" ? "Bonne habitude" : "Mauvaise habitude"}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {habit.description && <p className="text-sm mb-2">{habit.description}</p>}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Objectif hebdomadaire:</span>
                                <Badge variant="outline">{habit.weeklyTarget}x</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Série actuelle:</span>
                                <Badge variant="outline">{habit.streak} jours</Badge>
                              </div>
                            </div>
                            {habit.completions && habit.completions.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-xs font-medium mb-2">Dernières activités</h4>
                                <div className="flex flex-wrap gap-1">
                                  {habit.completions.slice(0, 7).map((completion) => (
                                    <div
                                      key={completion.id}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        completion.completed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                      }`}
                                      title={`${formatDate(completion.date)} - ${
                                        completion.completed ? "Complété" : "Manqué"
                                      }`}
                                    >
                                      {completion.completed ? "✓" : "✗"}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Aucune habitude à afficher</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Les habitudes que {isOwnProfile ? "vous suivez" : "cet utilisateur suit"} apparaîtront ici
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}