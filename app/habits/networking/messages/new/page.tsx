"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Search, Loader2, Users, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface User {
  id: string
  fullname: string
  profile_photo?: string | null
  email?: string
  phone?: string | null
}

export default function NewChatPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<User[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("No token found. Please login first.")
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`)
        }

        const data = await response.json()
        const currentUserId = localStorage.getItem("user_id") || "current-user-id"
        const filteredUsers = Array.isArray(data) ? data.filter((u: User) => u.id !== currentUserId) : []
        setUsers(filteredUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        setError(`Failed to load users: ${(error as Error).message}`)
        toast({
          title: "Error",
          description: `Failed to load users: ${(error as Error).message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const filteredUsers = users.filter(
    (user) =>
      user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => 
      prev.some(u => u.id === user.id) 
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    )
  }

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId))
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      })
      return
    }

    if (isGroup && !groupName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a group name",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const token = localStorage.getItem("access_token")
      if (!token) throw new Error("No token found. Please login first.")

      const participantIds = selectedUsers.map(user => user.id)
      const payload = {
        participantIds,
        isGroup,
        name: isGroup ? groupName : null,
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create chat: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      toast({
        title: "Success",
        description: isGroup ? "Group chat created" : "Chat created",
      })

      // Redirect to the new chat
      router.push(`/habits/networking/messages/${data.id}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      toast({
        title: "Error",
        description: `Failed to create chat: ${(error as Error).message}`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.push("/habits/networking/messages")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">New Conversation</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Create a new conversation</h2>
            <div className="flex items-center space-x-2">
              <Switch id="group-chat" checked={isGroup} onCheckedChange={setIsGroup} />
              <Label htmlFor="group-chat">Group Chat</Label>
            </div>
          </div>

          {isGroup && (
            <div className="mb-4">
              <Label htmlFor="group-name" className="mb-2 block">
                Group Name
              </Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
          )}

          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <Label className="mb-2 block">Selected Users ({selectedUsers.length})</Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((user) => (
                  <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                    {user.fullname}
                    <button onClick={() => removeUser(user.id)} className="ml-1 rounded-full hover:bg-muted p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email"
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md">
          <div className="p-3 border-b">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <h3 className="font-medium">Users</h3>
            </div>
          </div>

          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="p-3 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full p-4">
                <div className="text-center">
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex items-center justify-center h-full p-4">
                <p className="text-muted-foreground">
                  {searchQuery ? "No users found matching your search" : "No users available"}
                </p>
              </div>
            ) : (
              <div>
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile_photo || "/placeholder.svg"} alt={user.fullname} />
                        <AvatarFallback>{user.fullname.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.fullname}</h4>
                        {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <Checkbox
                      checked={selectedUsers.some(u => u.id === user.id)}
                      onCheckedChange={() => toggleUserSelection(user)}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" className="mr-2" onClick={() => router.push("/habits/networking/messages")}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateChat}
            disabled={selectedUsers.length === 0 || (isGroup && !groupName.trim()) || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Chat"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}