"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatTimeAgo } from "@/lib/utils"
import { MessageCircle, MoreHorizontal, Pencil, Trash2, X, Check, Loader2, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Comment, UpdateCommentDTO } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
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
import { CommentForm } from "./comment-form"

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  userAvatar: string
  userName: string
  onCommentUpdated: (comment: Comment) => void
  onCommentDeleted: (commentId: string) => void
  isReply?: boolean
  isHighlighted?: boolean
}

// Define the reaction types to match the backend enum
type ReactionType = "Like" | "Love" | "Haha" | "Wow" | "Sad" | "Angry"

export function CommentItem({
  comment,
  currentUserId,
  userAvatar,
  userName,
  onCommentUpdated,
  onCommentDeleted,
  isReply = false,
  isHighlighted = false,
}: CommentItemProps) {
  // Provide default values for comment.author
  const author = comment.author || {
    id: comment.userId || "unknown",
    fullname: "Unknown User",
    profile_photo: "/placeholder.svg",
  }

  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const [totalReactionCount, setTotalReactionCount] = useState(
    typeof comment.reactionCount === "number" ? comment.reactionCount : 0,
  )
  const { toast } = useToast()

  // Local state for reactions
  const [currentUserReaction, setCurrentUserReaction] = useState<ReactionType | undefined>(
    comment.userReaction as ReactionType,
  )

  const isCommentOwner = currentUserId === comment.userId

  // Initialize reaction state from localStorage or props
  useEffect(() => {
    // Try to get from localStorage as fallback
    const savedReaction = localStorage.getItem(`comment_reaction_${comment.id}`)
    if (savedReaction && !currentUserReaction) {
      setCurrentUserReaction(savedReaction as ReactionType)
    }
  }, [comment.id, currentUserReaction])

  const handleEditSubmit = async () => {
    if (!editedContent.trim() || editedContent === comment.content) {
      setIsEditing(false)
      setEditedContent(comment.content)
      return
    }

    try {
      setIsSubmitting(true)
      // Get the JWT token
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      const updateData: UpdateCommentDTO = {
        content: editedContent.trim(),
      }

      // Make direct API call to the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${comment.postId}/comments/${comment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update comment")
      }

      const updatedComment = await response.json()
      onCommentUpdated(updatedComment)
      setIsEditing(false)

      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your comment. Please try again.",
        variant: "destructive",
      })
      setEditedContent(comment.content)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(comment.content)
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      // Get the JWT token
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      // Make direct API call to the backend
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${comment.postId}/comments/${comment.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete comment")
      }

      onCommentDeleted(comment.id)

      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleReplyAdded = (newReply: Comment) => {
    // Add the new reply to the replies array
    setReplies((prev) => [newReply, ...prev])

    // Update the reply count in the parent comment
    onCommentUpdated({
      ...comment,
      replyCount: comment.replyCount + 1,
    })

    // Auto-expand replies when a new reply is added
    setShowReplies(true)
    setShowReplyForm(false)
  }

  const handleLoadReplies = async () => {
    if (!showReplies) {
      try {
        setLoadingReplies(true)

        // Get the JWT token
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("No token found. Please login first.")
        }

        // Make direct API call to the backend
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${comment.postId}/comments/${comment.id}/replies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to load replies")
        }

        const data = await response.json()
        setReplies(data)
        setShowReplies(true)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load replies. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoadingReplies(false)
      }
    } else {
      setShowReplies(false)
    }
  }

  // Reaction emoji mapping - using capitalized keys to match backend enum
  const reactionEmojis: Record<ReactionType, string> = {
    Like: "👍",
    Love: "❤️",
    Haha: "😂",
    Wow: "😮",
    Sad: "😢",
    Angry: "😡",
  }

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
      const previousCount = totalReactionCount

      // Optimistically update UI based on backend logic:
      // 1. If same reaction type, remove it
      // 2. If different reaction type, update it
      // 3. If no previous reaction, add it
      if (currentUserReaction === type) {
        // If clicking the same reaction type, remove it
        setTotalReactionCount(Math.max(0, totalReactionCount - 1))
        setCurrentUserReaction(undefined)
        localStorage.removeItem(`comment_reaction_${comment.id}`)
      } else {
        // If changing reaction type or adding new reaction
        if (!currentUserReaction) {
          // Adding new reaction, increment count
          setTotalReactionCount(totalReactionCount + 1)
        }
        // Set the new reaction type
        setCurrentUserReaction(type)
        localStorage.setItem(`comment_reaction_${comment.id}`, type)
      }

      // Close the popover immediately for better UX
      setIsReactionPopoverOpen(false)

      // Make the API request
      const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/reactions/comment/${comment.id}`
      const method = "POST"
      const body = JSON.stringify({ type, userId: currentUserId })

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
        setTotalReactionCount(previousCount)
        if (previousReaction) {
          localStorage.setItem(`comment_reaction_${comment.id}`, previousReaction)
        } else {
          localStorage.removeItem(`comment_reaction_${comment.id}`)
        }

        throw new Error(`Failed to update reaction: ${response.status}`)
      }

      // Parse the response
      const data = await response.json()
      console.log("Comment reaction update response:", data)

      // Check if the reaction was removed
      const wasRemoved = data && data.message === "Reaction removed."

      // Update state with the response data if available
      if (data && data.comments && Array.isArray(data.comments)) {
        // Find this comment in the response
        const updatedComment = data.comments.find((c: { id: string }) => c.id === comment.id)
        if (updatedComment && typeof updatedComment.reactionCount === "number") {
          setTotalReactionCount(updatedComment.reactionCount)
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

  return (
    <div className={`flex gap-3 mb-4 ${isReply ? "mt-2" : ""} ${isHighlighted ? "bg-primary/5 p-2 rounded-lg" : ""}`}>
      <div className="relative">
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={author.profile_photo ?? "/placeholder.svg"} alt={author.fullname} />
          <AvatarFallback>{author.fullname.charAt(0)}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        {isEditing ? (
          <div className="bg-muted p-3 rounded-lg">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[80px] resize-none mb-2"
              disabled={isSubmitting}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSubmitting}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditSubmit}
                disabled={!editedContent.trim() || editedContent === comment.content || isSubmitting}
              >
                {isSubmitting ? (
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
        ) : (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  {typeof author.fullname === "string" ? author.fullname : "Unknown User"}
                </span>
                <span className="text-sm text-muted-foreground">
                  @{typeof author.fullname === "string" ? author.fullname.toLowerCase().replace(/\s+/g, "") : "unknown"}
                </span>
              </div>
              {isCommentOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setShowDeleteDialog(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <div className="mt-1">{typeof comment.content === "string" ? comment.content : "No content"}</div>
          </div>
        )}

        <div className="flex items-center gap-4 mt-1 text-sm">
          <span className="text-muted-foreground">
            {formatTimeAgo(typeof comment.createdAt === "string" ? comment.createdAt : new Date().toISOString())}
          </span>

          {/* Reaction button with popover */}
          <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 ${currentUserReaction ? "text-primary" : ""} hover:bg-muted/50`}
                disabled={isReacting}
              >
                {isReacting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : currentUserReaction ? (
                  <>
                    <span className="mr-1 text-lg">{reactionEmojis[currentUserReaction] || "👍"}</span>
                    <span className="font-medium">{totalReactionCount > 0 ? totalReactionCount : ""}</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="font-medium">{totalReactionCount > 0 ? totalReactionCount : ""}</span>
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
            className="h-6 px-2"
            onClick={() => {
              setShowReplyForm(!showReplyForm)
              if (!showReplyForm && !showReplies && comment.replyCount > 0) {
                handleLoadReplies()
              }
            }}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Reply
          </Button>

          {comment.replyCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={handleLoadReplies}
              disabled={loadingReplies}
            >
              {loadingReplies ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {showReplies ? "Hide" : "Show"} {comment.replyCount} {comment.replyCount === 1 ? "reply" : "replies"}
                </>
              )}
            </Button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-2 ml-4">
            <CommentForm
              postId={comment.postId}
              userId={currentUserId}
              userAvatar={userAvatar}
              userName={userName}
              parentId={comment.id}
              onCommentAdded={handleReplyAdded}
              placeholder="Write a reply..."
            />
          </div>
        )}

        {showReplies && replies.length > 0 && (
          <div className="mt-2 ml-4 border-l-2 border-muted pl-4">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                currentUserId={currentUserId}
                userAvatar={userAvatar}
                userName={userName}
                onCommentUpdated={(updatedReply) => {
                  setReplies((prev) => prev.map((r) => (r.id === updatedReply.id ? updatedReply : r)))
                }}
                onCommentDeleted={(replyId) => {
                  setReplies((prev) => prev.filter((r) => r.id !== replyId))
                  // Update the reply count in the parent comment
                  onCommentUpdated({
                    ...comment,
                    replyCount: comment.replyCount - 1,
                  })
                }}
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment
              {comment.replyCount > 0 ? " and all its replies" : ""}.
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
    </div>
  )
}

