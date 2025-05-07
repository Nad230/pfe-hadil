"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Smile, Paperclip, Mic, X, ImageIcon, StopCircle, Trash } from "lucide-react"
import EmojiPicker from "./emoji-picker"

interface ChatInputProps {
  chatId: string
  onSendMessage: (content: string, type: "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "FILE") => void
  onTyping: (isTyping: boolean) => void
  replyingTo: {
    id: string
    content: string | null
    sender: {
      id: string
      fullname: string
    }
  } | null
  onCancelReply: () => void
  isOffline?: boolean
}

export default function ChatInput({
  chatId,
  onSendMessage,
  onTyping,
  replyingTo,
  onCancelReply,
  isOffline = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [replyingTo])

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const handleTyping = () => {
    onTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 3000)
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), "TEXT")
      setMessage("")

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        onTyping(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setShowEmojiPicker(false)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "VIDEO" | "AUDIO" | "FILE") => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      if (event.target?.result) {
        onSendMessage(event.target.result as string, type)
      }
    }
    reader.readAsDataURL(file)

    // Reset the input
    e.target.value = ""
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        setIsRecording(false)

        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()

      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    setRecordedAudio(null)
    setIsRecording(false)

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
    }
  }

  const sendRecordedAudio = () => {
    if (recordedAudio) {
      onSendMessage(recordedAudio, "AUDIO")
      setRecordedAudio(null)
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="relative">
      {replyingTo && (
        <div className="flex items-center justify-between bg-blue-50 p-2 rounded-t-md border-t border-x border-blue-200">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-blue-700">Répondre à {replyingTo.sender.fullname}</div>
              <div className="text-xs text-blue-600/70 truncate">{replyingTo.content || "Contenu média"}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={onCancelReply}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {isRecording ? (
        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-3">
            <div className="animate-pulse">
              <Mic className="h-5 w-5 text-red-500" />
            </div>
            <div className="text-red-700 font-medium">
              Enregistrement en cours... {formatRecordingTime(recordingTime)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100"
              onClick={cancelRecording}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-red-100 text-red-500 hover:bg-red-200"
              onClick={stopRecording}
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : recordedAudio ? (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-blue-500" />
            <div className="text-blue-700 font-medium">Audio enregistré - {formatRecordingTime(recordingTime)}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-red-500 hover:bg-red-100"
              onClick={() => setRecordedAudio(null)}
            >
              <Trash className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full bg-blue-100 text-blue-500 hover:bg-blue-200"
              onClick={sendRecordedAudio}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              placeholder={isOffline ? "Mode hors ligne - Message sera envoyé plus tard" : "Écrivez votre message..."}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                handleTyping()
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] max-h-[120px] pr-10 resize-none rounded-md border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            />
            <div className="absolute right-2 bottom-2">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-blue-100">
                    <Smile className="h-4 w-4 text-blue-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <EmojiPicker
                    onEmojiSelect={handleEmojiSelect}
                    onClickOutside={() => setShowEmojiPicker(false)}
                    triggerRef={textareaRef}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-blue-100"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Joindre un fichier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => handleFileChange(e, "FILE")} />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-blue-100"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Envoyer une image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "IMAGE")}
            />

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-blue-100"
                    onClick={startRecording}
                  >
                    <Mic className="h-4 w-4 text-blue-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Enregistrer un message vocal</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button
              variant="default"
              size="icon"
              className="h-8 w-8 rounded-full bg-blue-500 hover:bg-blue-600"
              onClick={handleSendMessage}
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
