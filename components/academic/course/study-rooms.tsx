"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Lock,
  Globe,
  Mic,
  Video,
  MessageSquare,
  UserPlus,
  Settings
} from "lucide-react"
import { CreateRoomDialog } from "../study-rooms/create-room-dialog"

interface Room {
  id: string
  name: string
  type: "public" | "private" | "team"
  participants: number
  maxParticipants: number
  features: ("voice" | "video" | "chat")[]
  active: boolean
}

const mockRooms: Room[] = [
  {
    id: "1",
    name: "Linear Algebra Study Group",
    type: "public",
    participants: 8,
    maxParticipants: 15,
    features: ["voice", "chat"],
    active: true
  },
  {
    id: "2",
    name: "Matrix Operations Team",
    type: "team",
    participants: 4,
    maxParticipants: 6,
    features: ["voice", "video", "chat"],
    active: true
  },
  {
    id: "3",
    name: "Eigenvalues Discussion",
    type: "private",
    participants: 2,
    maxParticipants: 4,
    features: ["chat"],
    active: false
  }
]

export function CourseStudyRooms() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDialog, setShowDialog] = useState(false)

  const filteredRooms = mockRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const typeColors = {
    public: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    private: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
    team: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
  }

  const typeIcons = {
    public: Globe,
    private: Lock,
    team: Users
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Study Rooms</h2>
          
          <Button onClick={() => setShowDialog(true)} variant="outline" >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Room
                    </Button>
                    <CreateRoomDialog open={showDialog} onOpenChange={setShowDialog} />

        </div>

        <div className="mb-6">
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredRooms.map((room, index) => {
            const TypeIcon = typeIcons[room.type]
            
            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{room.name}</h3>
                        <Badge className={typeColors[room.type]}>
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                        </Badge>
                        {room.active && (
                          <Badge variant="outline" className="text-green-500">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {room.participants}/{room.maxParticipants}
                        </div>
                        <div className="flex items-center gap-2">
                          {room.features.includes("voice") && (
                            <Mic className="h-4 w-4" />
                          )}
                          {room.features.includes("video") && (
                            <Video className="h-4 w-4" />
                          )}
                          {room.features.includes("chat") && (
                            <MessageSquare className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join
                      </Button>
                      {room.type === "team" && (
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Room Types</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Globe className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h4 className="font-medium">Public Rooms</h4>
                <p className="text-sm text-muted-foreground">
                  Open to all course participants
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <h4 className="font-medium">Team Rooms</h4>
                <p className="text-sm text-muted-foreground">
                  For group projects and collaboration
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <Lock className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <h4 className="font-medium">Private Rooms</h4>
                <p className="text-sm text-muted-foreground">
                  Invite-only study sessions
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-muted-foreground">Active Rooms</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}