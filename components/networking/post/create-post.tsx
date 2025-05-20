"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image, Mic, Paperclip, Smile, X, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useToast } from "@/hooks/use-toast";
import type { Post, CreatePostDTO } from "@/lib/api";

const Picker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading emojis...</div>,
});

interface CreatePostProps {
  userId: string;
  userAvatar: string;
  userName: string;
  onPostCreated?: (post: Post) => void;
}

export function CreatePost({ userId, userAvatar, userName, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Store the selected file
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAddEmoji = (emojiObject: { emoji: string }) => {
    setContent((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRecordVoice = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice recording",
        description: "Voice recording started. Click again to stop.",
      });
    } else {
      toast({
        title: "Voice recording stopped",
        description: "Voice recording has been attached to your post.",
      });
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !selectedFile) return;

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("content", content.trim());
      if (selectedFile) {
        formData.append("files", selectedFile);
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No token found. Please login first.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create post");
      }

      const newPost = await response.json();

      setContent("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Post created",
        description: "Your post has been published successfully!",
      });

      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none border-none focus-visible:ring-0 p-0 text-base"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
            />
            {selectedFile && (
              <div className="relative mt-2 rounded-md overflow-hidden">
                <img src={URL.createObjectURL(selectedFile)} alt="Media preview" className="max-h-[300px] w-auto" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  onClick={handleRemoveMedia}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="flex gap-1">
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={isSubmitting}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-500"
            disabled={isSubmitting}
          >
            <Image className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-green-500"
            disabled={isSubmitting}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
         
            
        
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="text-yellow-500"
            disabled={isSubmitting}
          >
            <Smile className="h-5 w-5" />
          </Button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10">
              <Picker onEmojiClick={handleAddEmoji} />
            </div>
          )}
        </div>
        <Button onClick={handleSubmit} disabled={(!content.trim() && !selectedFile) || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            "Post"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}