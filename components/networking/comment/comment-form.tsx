"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Smile, Loader2 } from "lucide-react"
import dynamic from "next/dynamic" // Import dynamic from Next.js
import { useToast } from "@/hooks/use-toast"
import type { Comment, CreateCommentDTO } from "@/lib/api"

// Dynamically import the emoji picker library
const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false, // Disable server-side rendering for this component
  loading: () => <div className="p-4 text-center">Loading emojis...</div>, // Optional: Add a loading state
})

interface CommentFormProps {
  postId: string
  userId: string
  userAvatar: string
  userName: string
  parentId?: string
  onCommentAdded: (comment: Comment) => void
  placeholder?: string
}

export function CommentForm({
  postId,
  userId,
  userAvatar,
  userName,
  parentId,
  onCommentAdded,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false) // State to manage emoji picker visibility
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setIsEmojiPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleAddEmoji = (emojiObject: { emoji: string }) => {
    setContent((prev) => prev + emojiObject.emoji) // Append the selected emoji to the content
    setIsEmojiPickerOpen(false) // Close the emoji picker after selection
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    try {
      setIsSubmitting(true)

      // Create the comment data object
      const commentData: Partial<CreateCommentDTO> = {
        content: content.trim(),
        userId: userId,
        postId: postId,
      }

      // Only add parentId if it exists
      if (parentId) {
        commentData.parentId = parentId
      }

      // Get the JWT token
      const token = localStorage.getItem("access_token")
      if (!token) {
        throw new Error("No token found. Please login first.")
      }

      // Make direct API call to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create comment")
      }

      const newComment = await response.json()

      setContent("")
      onCommentAdded(newComment)

      toast({
        title: parentId ? "Reply added" : "Comment added",
        description: "Your comment has been published successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add your comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2 mb-4">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage src={userAvatar} alt={userName} />
        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 w-full">
          <Textarea
            placeholder={placeholder}
            className="min-h-[40px] resize-none flex-1"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="flex flex-col gap-2">
            <div ref={emojiPickerRef} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                disabled={isSubmitting}
              >
                <Smile className="h-5 w-5" />
              </Button>

              {/* Emoji Picker */}
              {isEmojiPickerOpen && (
                <div className="absolute z-50 right-0 mt-1">
                  <Picker onEmojiClick={handleAddEmoji} />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}

