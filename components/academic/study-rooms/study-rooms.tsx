/*"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Users, Video, Mic, MessageSquare, Crown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/components/audio/audio-provider"
import { useState } from "react"
import { CreateRoomDialog } from "./create-room-dialog"
import Cookies from 'js-cookie'

const rooms = [
  {
    id: "1",
    name: "Mathematics Study Group",
    participants: 12,
    status: "active",
    image: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800&h=400&fit=crop",
    host: {
      name: "Dr. Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    topic: "Advanced Calculus",
    duration: "2 hours",
    startTime: "10:00 AM",
  },
  {
    id: "2",
    name: "Physics Lab Discussion",
    participants: 8,
    status: "active",
    image: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop",
    host: {
      name: "Prof. Michael Brown",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    topic: "Quantum Mechanics",
    duration: "1.5 hours",
    startTime: "11:30 AM",
  },
  {
    id: "3",
    name: "Computer Science Projects",
    participants: 15,
    status: "active",
    image: "https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=800&h=400&fit=crop",
    host: {
      name: "Dr. Emily Watson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    topic: "Algorithm Design",
    duration: "3 hours",
    startTime: "2:00 PM",
  },
]

export function StudyRooms() {
  const { playClick } = useAudio()
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)   
   const [showDialog, setShowDialog] = useState(false)


  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Rooms</h2>
        <Button onClick={() => setShowDialog(true)} variant="outline" >
                    <Users className="mr-2 h-4 w-4" />
                    Create Room
                    </Button>
                    <CreateRoomDialog open={showDialog} onOpenChange={setShowDialog} />
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-xl group"
              onHoverStart={() => setHoveredRoom(room.id)}
              onHoverEnd={() => setHoveredRoom(null)}
              onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${room.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={room.host.avatar}
                      alt={room.host.name}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {room.name}
                        </h3>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-sm text-white/60">
                        Hosted by {room.host.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                      <Users className="h-4 w-4" />
                      {room.participants}
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                      <Clock className="h-4 w-4" />
                      {room.duration}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedRoom === room.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                          <div>
                            <span className="block text-white/60">Topic</span>
                            {room.topic}
                          </div>
                          <div>
                            <span className="block text-white/60">Start Time</span>
                            {room.startTime}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40"
                      />
                    ))}
                    {room.participants > 3 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-xs text-white">
                        +{room.participants - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        playClick()
                      }}
                    >
                      <Video className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        playClick()
                      }}
                    >
                      <Mic className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        playClick()
                      }}
                    >
                      <MessageSquare className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>

                {hoveredRoom === room.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white text-black hover:bg-white/90"
                      onClick={(e) => {
                        e.stopPropagation()
                        playClick()
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Join Room
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}*/
"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Users, Video, Mic, MessageSquare, Crown, Clock, Loader2, Dot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudio } from "@/components/audio/audio-provider"
import { useState, useEffect } from "react"
import { CreateRoomDialog } from "./create-room-dialog"
import Cookies from 'js-cookie'

interface Room {
  id: string
  name: string
  type: string
  description: string
  hostId: string
  host?: {
    name: string
    avatar: string
  }
  participants?: number
  createdAt: string
  members?: any[]
}

export function StudyRooms() {
  const { playClick } = useAudio()
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [activeRooms, setActiveRooms] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        const token = Cookies.get("token")
        
        // Fetch current user
        const userResponse = await fetch('http://localhost:3000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!userResponse.ok) throw new Error('Failed to fetch user')
        const userData = await userResponse.json()
        setCurrentUserId(userData.sub)

        // Fetch rooms
        const roomsResponse = await fetch('http://localhost:3000/academic/rooms/by-me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!roomsResponse.ok) throw new Error('Failed to fetch rooms')
        const roomsData: Room[] = await roomsResponse.json()
        const initiallyActive = new Set(
          roomsData.filter(r => r.status).map(r => r.id)
        )
        setActiveRooms(initiallyActive)

        const roomsWithDetails = await Promise.all(
          roomsData.map(async (room) => {
            const [hostResponse, membersResponse] = await Promise.all([
              fetch(`http://localhost:3000/auth/${room.createdById}`, {
                headers: { Authorization: `Bearer ${token}` }
              }),
              fetch(`http://localhost:3000/academic/members/${room.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
            ])

            const hostData = await hostResponse.json()
            const membersData = await membersResponse.json()

            return {
              ...room,
              host: {
                name: hostData.fullname,
                avatar: hostData.profile_photo ? 
                  `https://yourdomain.com/assets/avatars/${hostData.profile_photo}.png` : 
                  '/default-avatar.png'
              },
              participants: membersData.length
            }
          })
        )

        setRooms(roomsWithDetails)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndRooms()
  }, [])
  const updateRoomStatus = async (roomId: string, status: boolean) => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/academic/status/${roomId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update room status')
      
      setActiveRooms(prev => {
        const newSet = new Set(prev)
        status ? newSet.add(roomId) : newSet.delete(roomId)
        return newSet
      })
    } catch (error) {
      console.error("Error updating room status:", error)
      // Optionally show error to user
    }
  }

  const handleRoomAction = async (roomId: string) => {
    playClick()
    const isActive = activeRooms.has(roomId)
    await updateRoomStatus(roomId, !isActive)
  }

  // Update the room status check to use both local state and API data
  const isRoomActive = (roomId: string) => {
    return activeRooms.has(roomId) || rooms.find(r => r.id === roomId)?.status
  }



  const isHost = (room: Room) => currentUserId === room.createdById

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  }

 

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Study Rooms</h2>
        <Button onClick={() => setShowDialog(true)} variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Create Room
        </Button>
        <CreateRoomDialog open={showDialog} onOpenChange={setShowDialog} />
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-xl group"
              onHoverStart={() => setHoveredRoom(room.id)}
              onHoverEnd={() => setHoveredRoom(null)}
              onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
            >
              {/* Status Indicator */}
              {isRoomActive(room.id) && (
                <div className="absolute top-2 right-2 z-10">
                  <Dot className="h-8 w-8 text-green-500 animate-pulse" />
                </div>
              )}

              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ 
                  backgroundImage: `url(https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&h=400&fit=crop)` 
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

              <div className="relative p-6">
                {/* Room Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={room.host?.avatar || '/default-avatar.png'}
                      alt={room.host?.name}
                      className="w-10 h-10 rounded-full border-2 border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {room.name}
                        </h3>
                        <Crown className="h-4 w-4 text-yellow-500" />
                      </div>
                      <p className="text-sm text-white/60">
                        Hosted by {room.host?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                      <Users className="h-4 w-4" />
                      {room.participants || 0}
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                      <Clock className="h-4 w-4" />
                      {new Date(room.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedRoom === room.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4"
                    >
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                          <div>
                            <span className="block text-white/60">Type</span>
                            {room.type}
                          </div>
                          <div>
                            <span className="block text-white/60">Created</span>
                            {new Date(room.createdAt).toLocaleDateString()}
                          </div>
                          <div className="col-span-2">
                            <span className="block text-white/60">Description</span>
                            {room.description}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Participants and Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {room.members?.slice(0, 3).map((member, i) => (
                      <img
                        key={i}
                        src={member.profile_photo ? 
                          `https://yourdomain.com/assets/avatars/${member.profile_photo}.png` : 
                          '/default-avatar.png'}
                        alt={member.fullname}
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                      />
                    ))}
                    {(room.participants || 0) > 3 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-xs text-white">
                        +{(room.participants || 0) - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="bg-white/10 hover:bg-white/20">
                      <Video className="h-4 w-4 text-white" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/10 hover:bg-white/20">
                      <Mic className="h-4 w-4 text-white" />
                    </Button>
                    <Button size="icon" variant="secondary" className="bg-white/10 hover:bg-white/20">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>

                {/* Hover Overlay */}
                {hoveredRoom === room.id && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      {isHost(room) ? (
        <Button
          variant="secondary"
          size="lg"
          className="bg-white text-black hover:bg-white/90"
          onClick={async (e) => {
            e.stopPropagation()
            await handleRoomAction(room.id)
          }}
          disabled={!isHost(room)}
        >
          {isRoomActive(room.id) ? (
            <>
              <Video className="mr-2 h-4 w-4" />
              End Session
            </>
          ) : (
            <>
              <Video className="mr-2 h-4 w-4" />
              Start Room
            </>
          )}
        </Button>
      ) : isRoomActive(room.id) ? (
        <Button
          variant="secondary"
          size="lg"
          className="bg-white text-black hover:bg-white/90"
          onClick={(e) => {
            e.stopPropagation()
            // Add your join room logic here
          }}
        >
          <Users className="mr-2 h-4 w-4" />
          Join Room
        </Button>
      ) : (
        <div className="text-white text-center p-4">
          Waiting for host to start the session
        </div>
      )}
    </motion.div>
  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}