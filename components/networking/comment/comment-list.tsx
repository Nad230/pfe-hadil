"use client"

import { useEffect, useState } from "react"
import { CommentItem } from "./comment-item"
import { CommentForm } from "./comment-form"
import type { Comment } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface CommentListProps {
  postId: string
  userId: string
  userAvatar: string
  userName: string
  highlightCommentId?: string
  onCommentAdded?: () => void
  onCommentDeleted?: () => void
}

export function CommentList({
  postId,
  userId,
  userAvatar,
  userName,
  highlightCommentId,
  onCommentAdded,
  onCommentDeleted,
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true)

        // Get the JWT token
        const token = localStorage.getItem("access_token")
        if (!token) {
          throw new Error("No token found. Please login first.")
        }

        // Make direct API call to the backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/comments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to fetch comments")
        }

        const data = await response.json()

        // Filter out replies (comments with parentId) to only show top-level comments
        const topLevelComments = data.filter((comment: Comment) => !comment.parentId)
        setComments(topLevelComments)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId, toast])

  const handleCommentAdded = (newComment: Comment) => {
    // Only add to the list if it's a top-level comment
    if (!newComment.parentId) {
      setComments((prev) => [newComment, ...prev])
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded()
      }
    }
  }

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) => prev.map((comment) => (comment.id === updatedComment.id ? updatedComment : comment)))
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId))
    // Notify parent component
    if (onCommentDeleted) {
      onCommentDeleted()
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Comments {comments.length > 0 && `(${comments.length})`}</h3>

      <CommentForm
        postId={postId}
        userId={userId}
        userAvatar={userAvatar}
        userName={userName}
        onCommentAdded={handleCommentAdded}
      />

      {loading ? (
        // Loading skeleton
        Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-24 w-full rounded-lg mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-6 w-16 rounded" />
              </div>
            </div>
          </div>
        ))
      ) : comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={userId}
              userAvatar={userAvatar}
              userName={userName}
              onCommentUpdated={handleCommentUpdated}
              onCommentDeleted={handleCommentDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
      )}
    </div>
  )
}

