"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChatList from "@/components/networking/chat/chat-list"
import ChatContainer from "@/components/networking/chat/chat-container"
import { NotificationList } from "@/components/networking/notification/notification-list"
import UserProfile from "@/components/networking/profile/user-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/networking/layout/header"
import RightSidebar from "@/components/networking/layout/right-sidebar"
import { CreatePost } from "@/components/networking/post/create-post"
import { PostCard } from "@/components/networking/post/post-card"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import type { Post } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

const currentUser = {
  id: "current-user",
  name: "Current User",
  avatar: "/placeholder.svg?height=40&width=40",
}

interface Chat {
  id: string
  name: string | null
  isGroup: boolean
  lastMessage: {
    content: string | null
    type: string
    createdAt: string
    sender: ChatUser
  } | null
  users: {
    userId: string
    user: ChatUser
  }[]
  unreadCount: number
}
interface ChatUser {
  id: string
  fullname: string
  profile_photo: string | null
}

export default function NetworkingPage() {
  const router = useRouter()
  const username = "exampleUser"
  const [activeTab, setActiveTab] = useState("home")
  const [chatId, setChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingChats, setLoadingChats] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setLoadingChats(true)

        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("No token found. Please login first.")
        }

        // Fetch posts
        const postsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!postsResponse.ok) {
          const errorData = await postsResponse.json()
          throw new Error(errorData.message || "Failed to fetch posts")
        }

        const postsData = await postsResponse.json()
        setPosts(postsData)

        // Fetch chats
        const chatsResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!chatsResponse.ok) {
          throw new Error("Failed to fetch chats")
        }

        const chatsData = await chatsResponse.json()
        setChats(chatsData)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setLoadingChats(false)
      }
    }

    fetchData()
  }, [toast])

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
  }

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId))
  }

  const handleChatSelect = (selectedChatId: string) => {
    setChatId(selectedChatId)
  }

  const handleNewChat = () => {
    router.push("/habits/networking/messages")
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value !== "messages") {
      setChatId(null)
    }
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <div className="flex min-h-screen flex-col">
        <Header />

        <div className="container flex-1 items-start md:grid md:grid-cols-[1fr_300px] md:gap-6">
          <main className="relative py-6 lg:py-8 w-full">
            <Tabs defaultValue="home" className="w-full " onValueChange={handleTabChange}>
              <TabsList className="flex w-fit space-x-1 p-1 bg-muted rounded-lg">
                <TabsTrigger value="home">Community Feed</TabsTrigger>
                <TabsTrigger value="messages">View Discussions</TabsTrigger>
                <TabsTrigger value="challenge">Challenge</TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="w-full mt-0 pt-00">
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2 mt-11">
                    <h1 className="text-3xl font-bold tracking-tight">Home Feed</h1>
                    <p className="text-muted-foreground">See the latest posts from your network</p>
                  </div>
                  <div></div>
                  <CreatePost
                    userId={currentUser.id}
                    userAvatar={currentUser.avatar}
                    userName={currentUser.name}
                    onPostCreated={handlePostCreated}
                  />

                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="mb-4">
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                      </div>
                    ))
                  ) : posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        id={post.id}
                        user={{
                          id: post.user?.id || "default-id",
                          fullname: post.user?.fullname || "Unknown User",
                          profile_photo: post.user?.profile_photo || "/default-avatar.png",
                        }}
                        content={post.content || ""}
                        media={post.media || []}
                        likes={post.likes || 0}
                        comments={post.comments || 0}
                        shares={post.shares || 0}
                        createdAt={post.createdAt || new Date().toISOString()}
                        userReaction={post.userReaction}
                        currentUser={currentUser}
                        onPostUpdated={handlePostUpdated}
                        onPostDeleted={handlePostDeleted}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No posts yet. Be the first to create a post!
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="messages" className="h-[calc(100vh-8rem)] flex flex-col gap-2 mt-11">
                <div className="flex h-full overflow-hidden rounded-lg border bg-white dark:bg-gray-800">
                  {/* Chat List - Always visible */}
                  <div className="w-full md:w-1/3 border-r bg-white dark:bg-gray-800 overflow-y-auto">
                    {loadingChats ? (
                      <div className="space-y-4 p-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-4 p-3">
                            <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-4 w-1/3" />
                              <Skeleton className="h-3 w-2/3" />
                            </div>
                            <Skeleton className="h-3 w-10" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ChatList chats={chats} activeChatId={chatId} onChatSelect={handleChatSelect} />
                    )}
                  </div>

                  {/* Chat Content Area - Hidden on mobile when no chat is selected */}
                  <div className={`hidden md:block ${chatId ? "w-2/3" : "w-full"} relative`}>
                    {chatId ? (
                      <ChatContainer chatId={chatId} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="text-center max-w-sm w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="h-12 w-12 text-primary" />
                          </div>
                          <h3 className="text-2xl font-semibold mb-4 text-gray-600 dark:text-white">
                            Select a conversation
                          </h3>
                          <p className="text-muted-foreground mb-8 text-lg">
                            Choose a conversation from the list or start a new one
                          </p>
                          <Button onClick={handleNewChat}>Start a new conversation</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="notifications">
                <div className="flex flex-col gap-8">
                  <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                  <p className="text-muted-foreground">Stay updated with your network activity</p>

                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="mentions">Mentions</TabsTrigger>
                      <TabsTrigger value="comments">Comments</TabsTrigger>
                      <TabsTrigger value="likes">Likes</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all">
                      <NotificationList />
                    </TabsContent>
                    <TabsContent value="mentions">
                      <NotificationList type="mention" />
                    </TabsContent>
                    <TabsContent value="comments">
                      <NotificationList type="comment" />
                    </TabsContent>
                    <TabsContent value="likes">
                      <NotificationList type="like" />
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>

              <TabsContent value="profile">
                <UserProfile username={username} />
              </TabsContent>
            </Tabs>
          </main>

          <RightSidebar className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-[320px] shrink-0 md:sticky md:block" />
        </div>

        <Toaster />
      </div>
    </ThemeProvider>
  )
}
