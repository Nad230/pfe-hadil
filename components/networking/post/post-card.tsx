"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { formatTimeAgo } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  MessageCircle,
  Share,
  MoreHorizontal,
  Bookmark,
  Heart,
  Pencil,
  Trash2,
  X,
  Check,
  Loader2,
  Flag,
  User,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Post, PostMedia } from "@/lib/api"
import { CommentList } from "../comment/comment-list"

// Define the reaction types to match the backend enum
type ReactionType = "Like" | "Love" | "Haha" | "Wow" | "Sad" | "Angry"

interface PostProps {
  id: string
  user: {
    id: string
    fullname: string
    profile_photo: string | null
  }
  content: string
  media?: PostMedia[]
  likes: number
  comments: number
  shares: number
  createdAt: string
  userReaction?: string
  saved?: boolean
  currentUser?: {
    id: string
    name: string
    avatar: string
  }
  onPostUpdated?: (post: Post) => void
  onPostDeleted?: (postId: string) => void
}

export function PostCard({
  id,
  user,
  content,
  media,
  likes,
  comments: initialCommentCount,
  shares,
  createdAt,
  userReaction,
  saved = false,
  currentUser = {
    id: "current-user",
    name: "Current User",
    avatar: "/default-avatar.png",
  },
  onPostUpdated,
  onPostDeleted,
}: PostProps) {
  const [isSaved, setIsSaved] = useState(saved)
  const [likeCount, setLikeCount] = useState(likes)
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [shareCount, setShareCount] = useState(shares)
  const [currentUserReaction, setCurrentUserReaction] = useState<ReactionType | undefined>(userReaction as ReactionType)
  const [showComments, setShowComments] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false)
  const [postReactions, setPostReactions] = useState(likes || 0)
  const [postComments, setPostComments] = useState(initialCommentCount)
  const [commentsWithReactions, setCommentsWithReactions] = useState([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isReacting, setIsReacting] = useState(false)
  const [mediaPreview, setMediaPreview] = useState<string | null>(media && media.length > 0 ? media[0].url : null)
  const { toast } = useToast()

  // Update the fetchReactionCounts function to handle errors better and add a retry mechanism
  const fetchReactionCounts = async (retryCount = 0) => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        console.warn("No token found. Please login first.")
        return
      }

      // Try the main endpoint first
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reactions/count/details/${id}`
      console.log(`Fetching reaction counts from: ${endpoint}`)

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log(`Reaction counts API response status: ${response.status}`)

      if (!response.ok) {
        // If the main endpoint fails, try the fallback endpoint
        if (retryCount === 0) {
          console.log("Main endpoint failed, trying fallback...")
          // Try a simpler endpoint as fallback
          const fallbackEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${id}`
          const fallbackResponse = await fetch(fallbackEndpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (fallbackResponse.ok) {
            const postData = await fallbackResponse.json()
            console.log("Fallback data:", postData)

            // Update with fallback data
            if (postData) {
              setPostReactions(postData.likeCount || 0)
              setPostComments(postData.commentCount || 0)
              setCurrentUserReaction(postData.userReaction as ReactionType)
            }
            return
          }
        }

        const errorText = await response.text()
        console.error(`API Error: ${response.status} - ${errorText}`)
        return
      }

      const data = await response.json()
      console.log("Reaction counts data:", data)

      // Check if data has the expected structure
      if (data && typeof data.postReactions === "number") {
        setPostReactions(data.postReactions)
        if (typeof data.commentCount === "number") {
          setPostComments(data.commentCount)
        }
        if (Array.isArray(data.comments)) {
          setCommentsWithReactions(data.comments)
        }
        // Update user reaction if available
        if (data.userReaction) {
          setCurrentUserReaction(data.userReaction as ReactionType)
        }
        // Store the reaction in localStorage for persistence
        if (data.userReaction) {
          localStorage.setItem(`post_reaction_${id}`, data.userReaction)
        }
      } else {
        console.error("Unexpected API response format:", data)
        // Try to get reaction from localStorage as fallback
        const savedReaction = localStorage.getItem(`post_reaction_${id}`)
        if (savedReaction) {
          setCurrentUserReaction(savedReaction as ReactionType)
        }
      }
    } catch (error) {
      console.error("Error fetching reaction counts:", error)
      // Try fallback if this is the first attempt
      if (retryCount === 0) {
        console.log("Error in main request, trying fallback...")
        fetchReactionCounts(1)
      }
    }
  }

  // Check if the current user is the post owner
  const isPostOwner = currentUser.id === user.id

  // Reaction emoji mapping - using capitalized keys to match backend enum
  const reactionEmojis: Record<ReactionType, string> = {
    Like: "👍",
    Love: "❤️",
    Haha: "😂",
    Wow: "😮",
    Sad: "😢",
    Angry: "😡",
  }

  // Update the handleReaction function to better match the backend behavior
  // Replace the existing handleReaction function with this improved version:

  const handleReaction = async (type: ReactionType) => {
    try {
      setIsReacting(true)
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      // Log the current state for debugging
      console.log(`Current reaction: ${currentUserReaction}, New reaction: ${type}`)

      // Store previous state to revert if needed
      const previousReaction = currentUserReaction
      const previousCount = postReactions

      // Optimistically update UI based on backend logic:
      // 1. If same reaction type, remove it
      // 2. If different reaction type, update it
      // 3. If no previous reaction, add it
      if (currentUserReaction === type) {
        // If clicking the same reaction type, remove it
        setPostReactions(Math.max(0, postReactions - 1))
        setCurrentUserReaction(undefined)
        localStorage.removeItem(`post_reaction_${id}`)
      } else {
        // If changing reaction type or adding new reaction
        if (currentUserReaction) {
          // Just changing type, count stays the same
          setCurrentUserReaction(type)
        } else {
          // Adding new reaction, increment count
          setPostReactions(postReactions + 1)
          setCurrentUserReaction(type)
        }
        localStorage.setItem(`post_reaction_${id}`, type)
      }

      // Close the popover immediately for better UX
      setIsReactionPopoverOpen(false)

      // Make the API request
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reactions/post/${id}`
      const method = "POST"
      const body = JSON.stringify({ type, userId: currentUser.id })

      console.log(`Making ${method} request to ${endpoint} with body:`, body)

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body,
      })

      // Log the response status for debugging
      console.log(`Reaction API response status: ${response.status}`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error: ${response.status} - ${errorText}`)

        // Revert UI changes on error
        setCurrentUserReaction(previousReaction)
        setPostReactions(previousCount)
        if (previousReaction) {
          localStorage.setItem(`post_reaction_${id}`, previousReaction)
        } else {
          localStorage.removeItem(`post_reaction_${id}`)
        }

        throw new Error(`Failed to update reaction: ${response.status}`)
      }

      // Parse the response
      const data = await response.json()
      console.log("Reaction update response:", data)

      // Check if the reaction was removed
      const wasRemoved = data && data.message === "Reaction removed."

      // Update state with the response data
      if (data) {
        // If reaction was removed, use the counts from the response
        if (wasRemoved && data.counts) {
          setPostReactions(data.counts.postReactions || 0)
          setPostComments(data.counts.commentCount || 0)
          if (Array.isArray(data.counts.comments)) {
            setCommentsWithReactions(data.counts.comments)
          }
        }
        // Otherwise use the direct response data
        else if (typeof data.postReactions === "number") {
          setPostReactions(data.postReactions)
          if (typeof data.commentCount === "number") {
            setPostComments(data.commentCount)
          }
          if (Array.isArray(data.comments)) {
            setCommentsWithReactions(data.comments)
          }
        }
      }

      // Show appropriate success toast
      if (wasRemoved) {
        toast({
          title: "Reaction removed",
          description: "Your reaction has been removed",
        })
      } else {
        toast({
          title: `Reacted with ${type}`,
          description: `You reacted with ${reactionEmojis[type]}`,
        })
      }
    } catch (error) {
      console.error("Error updating reaction:", error)
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReacting(false)
    }
  }

  // Simple direct reaction toggle function that doesn't depend on API response
  const handleSimpleReaction = (type: ReactionType) => {
    // Don't do any optimistic updates here, just call handleReaction
    // which will handle all the UI updates based on the backend logic
    handleReaction(type)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    toast({
      title: isSaved ? "Post unsaved" : "Post saved",
      description: isSaved ? "Post removed from your saved items" : "Post added to your saved items",
    })
  }

  const getMediaType = (url: string): "image" | "video" | "unsupported" => {
    const extension = url.split(".").pop()?.toLowerCase()
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp"]
    const videoTypes = ["mp4", "mov", "avi", "mkv"]

    if (imageTypes.includes(extension || "")) {
      return "image"
    }
    if (videoTypes.includes(extension || "")) {
      return "video"
    }
    return "unsupported"
  }

  const handleShare = async () => {
    try {
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${id}/share`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to share post")
      }

      setShareCount(shareCount + 1)
      toast({
        title: "Post shared",
        description: "Post has been shared successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveMedia = () => {
    setMediaPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleEditSubmit = async () => {
    if (!editedContent.trim() && !mediaPreview) {
      toast({
        title: "Error",
        description: "Post content cannot be empty.",
        variant: "destructive",
      })
      return
    }
    if (editedContent === content && mediaPreview === (media && media.length > 0 ? media[0].url : null)) {
      setIsEditing(false)
      return
    }

    try {
      setIsUpdating(true)

      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const formData = new FormData()
      formData.append("content", editedContent.trim())
      if (fileInputRef.current?.files?.[0]) {
        formData.append("files", fileInputRef.current.files[0])
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update post")
      }

      const updatedPost = await response.json()

      // Call the callback if provided
      if (onPostUpdated) {
        onPostUpdated(updatedPost)
      }

      setIsEditing(false)
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully!",
      })

      // Refresh reaction counts after update
      fetchReactionCounts()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(content)
    setMediaPreview(media && media.length > 0 ? media[0].url : null)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete post")
      }

      // Call the callback if provided
      if (onPostDeleted) {
        onPostDeleted(id)
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle comment added event to update comment count
  const handleCommentAdded = () => {
    fetchReactionCounts() // Refresh all counts when a comment is added
  }

  // Handle comment deleted event to update comment count
  const handleCommentDeleted = () => {
    fetchReactionCounts() // Refresh all counts when a comment is deleted
  }

  // Update the useEffect to fetch reactions when the component mounts and when userReaction changes
  useEffect(() => {
    fetchReactionCounts()

    // Initialize currentUserReaction from props or localStorage
    if (userReaction) {
      setCurrentUserReaction(userReaction as ReactionType)
    } else {
      // Try to get from localStorage as fallback
      const savedReaction = localStorage.getItem(`post_reaction_${id}`)
      if (savedReaction) {
        setCurrentUserReaction(savedReaction as ReactionType)
      }
    }
  }, [id, userReaction])

  return (
    <Card className="mb-4 border-none shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between items-center">
          <Link href={`/profile/${user.id}`} className="flex items-center gap-2 group">
            <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-primary transition-all">
              {user?.profile_photo ? (
                <AvatarImage src={user.profile_photo} alt={user?.fullname || "User"} />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
              <AvatarFallback>{(user?.fullname || "U").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold group-hover:text-primary transition-colors">
                {user?.fullname || "Unknown User"}
              </div>
              <div className="text-sm text-muted-foreground">
                @{(user?.fullname || "unknown").toLowerCase().replace(/\s+/g, "")} · {formatTimeAgo(createdAt)}
              </div>
            </div>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {isPostOwner ? (
                <>
                 
                </>
              ) : (
                <>
                  <DropdownMenuItem className="text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Report post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit post
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="What's on your mind?"
              disabled={isUpdating}
            />

            {mediaPreview && (
              <div className="flex justify-center w-full my-6">
                <div
                  className="relative rounded-lg overflow-hidden shadow-md"
                  style={{ height: "450px", width: "100%", maxWidth: "700px" }}
                >
                  <img
                    src={mediaPreview || "/placeholder.svg"}
                    alt="Media preview"
                    className="w-full h-full object-contain bg-black/5"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={handleRemoveMedia}
                    disabled={isUpdating}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
                disabled={isUpdating}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUpdating}>
                {mediaPreview ? "Change media" : "Add media"}
              </Button>

              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isUpdating}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleEditSubmit}
                  disabled={(!editedContent.trim() && !mediaPreview) || isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="whitespace-pre-wrap mb-3 text-base">{content}</div>
            {media && media.length > 0 ? (
              <div className="flex justify-center w-full my-6">
                <div className="w-full max-w-3xl">
                  {media.length === 1 ? (
                    // Single image layout - fixed height, clear display
                    <div className="flex justify-center">
                      {getMediaType(media[0].url) === "image" ? (
                        <div
                          className="rounded-lg overflow-hidden shadow-md"
                          style={{ height: "450px", width: "100%" }}
                        >
                          <img
                            src={
                              media[0].url.startsWith("http")
                                ? media[0].url
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${media[0].url}`
                            }
                            alt="Post media"
                            className="w-full h-full object-contain bg-black/5"
                          />
                        </div>
                      ) : getMediaType(media[0].url) === "video" ? (
                        <div className="w-full rounded-lg overflow-hidden shadow-md">
                          <video controls className="w-full h-auto max-h-[450px]">
                            <source
                              src={
                                media[0].url.startsWith("http")
                                  ? media[0].url
                                  : `${process.env.NEXT_PUBLIC_BACKEND_URL}${media[0].url}`
                              }
                              type={`video/${media[0].url.split(".").pop()}`}
                            />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-muted rounded-lg shadow-md">
                          <p>Unsupported media type</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Multiple images grid layout with consistent sizing
                    <div className="grid grid-cols-2 gap-3">
                      {media.map((mediaItem, index) => {
                        const mediaUrl = mediaItem.url.startsWith("http")
                          ? mediaItem.url
                          : `${process.env.NEXT_PUBLIC_BACKEND_URL}${mediaItem.url}`
                        const mediaType = getMediaType(mediaItem.url)

                        return (
                          <div
                            key={mediaItem.id || index}
                            className="relative rounded-lg overflow-hidden shadow-md"
                            style={{ height: "280px" }}
                          >
                            {mediaType === "image" ? (
                              <img
                                src={mediaUrl || "/placeholder.svg"}
                                alt={`Post media ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : mediaType === "video" ? (
                              <video controls className="w-full h-full object-cover">
                                <source src={mediaUrl} type={`video/${mediaItem.url.split(".").pop()}`} />
                                Your browser does not support the video tag.
                              </video>
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-muted text-center p-4">
                                <p>Unsupported media type</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col">
        <div className="flex justify-between items-center w-full border-t border-b py-1 my-2">
          <div className="flex items-center gap-4">
            {/* Reaction button with popover */}
            <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-1 ${currentUserReaction ? "text-primary" : ""} hover:bg-muted/50`}
                  disabled={isReacting}
                >
                  {isReacting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : currentUserReaction ? (
                    <>
                      <span className="mr-1 text-lg">{reactionEmojis[currentUserReaction] || "👍"}</span>
                      <span className="font-medium">{postReactions || 0}</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      <span className="font-medium">{postReactions || 0}</span>
                    </>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="flex gap-1">
                  {Object.entries(reactionEmojis).map(([type, emoji]) => (
                    <button
                      key={type}
                      className={`flex flex-col items-center p-2 hover:bg-muted rounded-md transition-transform hover:scale-110 ${
                        currentUserReaction === type ? "bg-primary/10" : ""
                      }`}
                      onClick={() => handleSimpleReaction(type as ReactionType)}
                      title={type}
                      disabled={isReacting}
                    >
                      <span className="text-xl">{emoji}</span>
                      <span className="text-xs mt-1">{type}</span>
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 hover:bg-muted/50"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className={`h-5 w-5 ${postComments > 0 ? "text-blue-500" : ""}`} />
              <span className="font-medium">{postComments > 0 ? postComments : "0"}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 hover:bg-muted/50"
              onClick={handleShare}
            >
              <Share className={`h-5 w-5 ${shareCount > 0 ? "text-green-500" : ""}`} />
              <span className="font-medium">{shareCount > 0 ? shareCount : "0"}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className={`hover:bg-muted/50 ${isSaved ? "text-yellow-500" : ""}`}
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? "fill-yellow-500" : ""}`} />
          </Button>
        </div>

        {showComments && (
          <div className="mt-2 w-full">
            <CommentList
              postId={id}
              userId={currentUser.id}
              userAvatar={currentUser.avatar}
              userName={currentUser.name}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
            />
          </div>
        )}
      </CardFooter>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

