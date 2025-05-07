"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, StopCircle, Trash, Send } from 'lucide-react'

interface VoiceRecorderProps {
  onRecordingComplete: (audioUrl: string, duration: number) => void
  onCancel: () => void
}

export default function VoiceRecorder({ onRecordingComplete, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

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
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setIsRecording(false)
        
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        
        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    
    onCancel()
  }

  const sendRecording = () => {
    if (audioUrl) {
      onRecordingComplete(audioUrl, recordingTime)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="p-4 bg-muted/20 rounded-lg border">
      {isRecording ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-lg font-medium">Enregistrement en cours</span>
          </div>
          
          <div className="text-3xl font-mono">{formatTime(recordingTime)}</div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-red-300 text-red-500 hover:bg-red-50"
              onClick={cancelRecording}
            >
              <Trash className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
              onClick={stopRecording}
            >
              <StopCircle className="h-8 w-8" />
            </Button>
          </div>
        </div>
      ) : audioUrl ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">Enregistrement terminé</span>
          </div>
          
          <audio src={audioUrl} controls className="w-full"></audio>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-red-300 text-red-500 hover:bg-red-50"
              onClick={cancelRecording}
            >
              <Trash className="h-6 w-6" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={sendRecording}
            >
              <Send className="h-6 w-6" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">Enregistrer un message vocal</span>
          </div>
          
          <Button
            variant="default"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={startRecording}
          >
            <Mic className="h-8 w-8" />
          </Button>
          
          <p className="text-sm text-muted-foreground">
            Appuyez pour commencer l'enregistrement
          </p>
        </div>
      )}
    </div>
  )
}
