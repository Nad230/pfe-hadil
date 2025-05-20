"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, Video, Mic, MicOff, Camera, CameraOff, PhoneOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSocket } from "@/contexts/socket-context"
import { useSupabaseRealtime } from "@/contexts/supabase-realtime-context"

interface CallInterfaceProps {
  callId: string
  callType: "audio" | "video"
  callerName: string
  callerAvatar: string
  isIncoming?: boolean
  onAccept?: () => void
  onDecline?: () => void
  onEndCall: (duration: number) => void
}

export default function CallInterface({
  callId,
  callType,
  callerName,
  callerAvatar,
  isIncoming = false,
  onAccept,
  onDecline,
  onEndCall,
}: CallInterfaceProps) {
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(!isIncoming)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const { socket, isConnected: socketConnected } = useSocket()
  const { subscribeToChat } = useSupabaseRealtime()

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const setupMediaDevices = async () => {
    try {
      const constraints = {
        audio: true,
        video: callType === "video",
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      return stream
    } catch (err) {
      console.error("Error accessing media devices:", err)
      return null
    }
  }

  const createPeerConnection = async (stream: MediaStream) => {
    try {
      const configuration = {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
      }

      const pc = new RTCPeerConnection(configuration)
      peerConnectionRef.current = pc

      // Add local tracks to the connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // Handle incoming tracks
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0]
        }
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("call:ice-candidate", {
            callId,
            candidate: event.candidate,
          })
        }
      }

      // Connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setIsConnected(true)
          setIsConnecting(false)
          startTimer()
        } else if (["disconnected", "failed", "closed"].includes(pc.connectionState)) {
          handleEndCall()
        }
      }

      return pc
    } catch (err) {
      console.error("Error creating peer connection:", err)
      return null
    }
  }

  const initiateCall = async () => {
    if (!socketConnected) return

    const stream = await setupMediaDevices()
    if (!stream) return

    const pc = await createPeerConnection(stream)
    if (!pc) return

    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socket?.emit("call:offer", {
        callId,
        offer,
      })
    } catch (err) {
      console.error("Error creating offer:", err)
    }
  }

  const handleAcceptCall = async () => {
    if (onAccept) onAccept()
    setIsConnecting(true)

    const stream = await setupMediaDevices()
    if (!stream) return

    const pc = await createPeerConnection(stream)
    if (!pc) return

    socket?.emit("call:accept", { callId })

    socket?.on("call:offer", async ({ offer }) => {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        socket?.emit("call:answer", {
          callId,
          answer,
        })
      } catch (err) {
        console.error("Error handling offer:", err)
      }
    })
  }

  const handleDeclineCall = () => {
    if (onDecline) onDecline()
    socket?.emit("call:decline", { callId })
  }

  const handleEndCall = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Close media streams
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
    }

    onEndCall(callDuration)
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleCamera = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks()
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsCameraOff(!isCameraOff)
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff)
    // In a real implementation, you would switch audio output devices here
  }

  useEffect(() => {
    if (!isIncoming && socketConnected) {
      initiateCall()
    }

    if (socketConnected) {
      socket?.on("call:answer", async ({ answer }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
          setIsConnected(true)
          setIsConnecting(false)
          startTimer()
        }
      })

      socket?.on("call:ice-candidate", async ({ candidate }) => {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        }
      })

      socket?.on("call:end", () => {
        handleEndCall()
      })
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current.close()
      }

      socket?.off("call:answer")
      socket?.off("call:ice-candidate")
      socket?.off("call:end")
    }
  }, [socketConnected])

  // Subscribe to Supabase for call updates
  useEffect(() => {
    const unsubscribe = subscribeToChat(callId, (payload) => {
      if (payload.event === "call:end") {
        handleEndCall()
      }
    })

    return () => unsubscribe()
  }, [callId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full max-w-lg p-6 bg-background rounded-lg shadow-lg">
        {callType === "video" && (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
                muted={isSpeakerOff}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={callerAvatar || "/placeholder.svg"} alt={callerName} />
                  <AvatarFallback>{callerName.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            )}

            {localStream && (
              <div className="absolute bottom-4 right-4 w-1/4 aspect-video bg-black rounded-lg overflow-hidden border-2 border-background">
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        )}

        {callType === "audio" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={callerAvatar || "/placeholder.svg"} alt={callerName} />
              <AvatarFallback>{callerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold mb-1">{callerName}</h3>
            {isConnecting ? (
              <p className="text-muted-foreground">Connecting...</p>
            ) : isConnected ? (
              <p className="text-muted-foreground">{formatDuration(callDuration)}</p>
            ) : (
              <p className="text-muted-foreground">{isIncoming ? "Incoming call" : "Calling..."}</p>
            )}
          </div>
        )}

        <div className="flex justify-center gap-4 mt-4">
          {isIncoming && !isConnected ? (
            <>
              <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={handleDeclineCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
                onClick={handleAcceptCall}
              >
                {callType === "video" ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant={isMuted ? "secondary" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {callType === "video" && (
                <Button
                  variant={isCameraOff ? "secondary" : "outline"}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={toggleCamera}
                >
                  {isCameraOff ? <CameraOff className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
                </Button>
              )}

              <Button
                variant={isSpeakerOff ? "secondary" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleSpeaker}
              >
                {isSpeakerOff ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
              </Button>

              <Button variant="destructive" size="icon" className="h-12 w-12 rounded-full" onClick={handleEndCall}>
                <PhoneOff className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
