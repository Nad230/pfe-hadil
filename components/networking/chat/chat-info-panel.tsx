"use client"

import { useState } from "react"
import {
  Users,
  ImageIcon,
  FileText,
  UserMinus,
  UserPlus,
  MoreVertical,
  X,
  Download,
  Calendar,
  ArrowLeft,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

interface User {
  id: string
  fullname: string
  profile_photo?: string | null
  email?: string
  role?: "admin" | "member"
}

interface ChatParticipant {
  userId: string
  chatId: string
  joinedAt: string
  user: User
}

interface Chat {
  id: string
  name: string | null
  isGroup: boolean
  adminId: string | null
  createdAt: string
  updatedAt: string
  users: ChatParticipant[]
}

interface ChatInfoPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chat: Chat | null
  participants: ChatParticipant[]
  currentUserId: string
  isAdmin: boolean
  imageMessages: any[]
  videoMessages: any[]
  fileMessages: any[]
  onRemoveParticipant: (userId: string) => Promise<void>
  onNavigateToProfile: (userId: string) => void
}

export default function ChatInfoPanel({
  open,
  onOpenChange,
  chat,
  participants,
  currentUserId,
  isAdmin,
  imageMessages,
  videoMessages,
  fileMessages,
  onRemoveParticipant,
  onNavigateToProfile,
}: ChatInfoPanelProps) {
  const [activeTab, setActiveTab] = useState("participants")
  const [isRemoving, setIsRemoving] = useState<Record<string, boolean>>({})

  const handleRemoveParticipant = async (userId: string) => {
    if (!isAdmin || userId === currentUserId) return

    setIsRemoving((prev) => ({ ...prev, [userId]: true }))

    try {
      await onRemoveParticipant(userId)
    } finally {
      setIsRemoving((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr })
  }

  const chatName = chat?.name || (chat?.isGroup ? "Groupe" : "Conversation")
  const isGroup = chat?.isGroup || false

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative h-[90vh] w-full max-w-md rounded-lg bg-background shadow-lg border overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-500/10 to-purple-500/5">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="mr-2 rounded-full hover:bg-blue-500/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold">Informations</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="rounded-full hover:bg-blue-500/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-500/5 to-purple-500/5">
          <Avatar className="h-24 w-24 border-4 border-blue-500/20 shadow-lg">
            <AvatarImage src={"/placeholder.svg?height=96&width=96"} alt={chatName} />
            <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500/60 to-purple-500/30 text-white">
              {chatName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-4 text-xl font-bold">{chatName}</h3>
          <p className="text-sm text-muted-foreground">
            {isGroup ? `Groupe · ${participants.length} participants` : "Conversation privée"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Créé le {chat?.createdAt ? formatDate(chat.createdAt) : ""}
          </p>

          {isGroup && isAdmin && (
            <Button
              variant="default"
              className="mt-6 flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white transition-all"
              onClick={() => {
                document.dispatchEvent(new CustomEvent("open-add-participants"))
                onOpenChange(false)
              }}
            >
              <UserPlus className="h-4 w-4" />
              Ajouter des participants
            </Button>
          )}
        </div>

        <Tabs defaultValue="participants" className="flex-1">
          <TabsList className="grid w-full grid-cols-3 p-0 bg-muted/30">
            <TabsTrigger
              value="participants"
              onClick={() => setActiveTab("participants")}
              className="data-[state=active]:bg-blue-500/10 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              <Users className="h-4 w-4 mr-2" />
              Participants
            </TabsTrigger>
            <TabsTrigger
              value="media"
              onClick={() => setActiveTab("media")}
              className="data-[state=active]:bg-blue-500/10 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Médias
            </TabsTrigger>
            <TabsTrigger
              value="files"
              onClick={() => setActiveTab("files")}
              className="data-[state=active]:bg-blue-500/10 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Fichiers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="h-[calc(90vh-280px)]">
            <ScrollArea className="h-full">
              {isGroup && isAdmin && (
                <div className="p-4 sticky top-0 z-10 bg-white border-b">
                  <Button
                    variant="default"
                    className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => {
                      document.dispatchEvent(new CustomEvent("open-add-participants"))
                      onOpenChange(false)
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter des participants
                  </Button>
                </div>
              )}
              <div className="space-y-2 p-4">
                {participants.map((participant) => (
                  <motion.div
                    key={participant.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between rounded-lg p-3 hover:bg-blue-50 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onNavigateToProfile(participant.userId)}
                    >
                      <Avatar className="border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
                        <AvatarImage
                          src={participant.user.profile_photo || "/placeholder.svg?height=40&width=40"}
                          alt={participant.user.fullname}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500/60 to-purple-500/30 text-white">
                          {participant.user.fullname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {participant.user.fullname}
                          {participant.userId === currentUserId && (
                            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Vous
                            </Badge>
                          )}
                          {participant.userId === chat?.adminId && (
                            <Badge
                              variant="outline"
                              className="ml-2 text-xs bg-purple-50 text-purple-700 border-purple-200"
                            >
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Membre depuis {formatDate(participant.joinedAt)}
                        </div>
                      </div>
                    </div>

                    {isAdmin && participant.userId !== currentUserId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRemoveParticipant(participant.userId)}
                            disabled={isRemoving[participant.userId]}
                            className="text-red-600 focus:text-red-600"
                          >
                            <UserMinus className="mr-2 h-4 w-4" />
                            {isRemoving[participant.userId] ? "Suppression..." : "Supprimer du groupe"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="media" className="h-[calc(90vh-280px)]">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="mb-3 text-lg font-semibold flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2 text-blue-500" />
                  Images ({imageMessages.length})
                </h3>
                {imageMessages.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imageMessages.slice(0, 9).map((message) => (
                      <motion.div
                        key={message.id}
                        className="aspect-square overflow-hidden rounded-md border hover:shadow-md transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <img
                          src={message.attachment[0]?.url || "/placeholder.svg?height=100&width=100"}
                          alt="Image"
                          className="h-full w-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-blue-50 rounded-lg">
                    <ImageIcon className="h-12 w-12 text-blue-300 mb-2" />
                    <p className="text-blue-700">Aucune image partagée</p>
                  </div>
                )}

                <h3 className="mb-3 mt-6 text-lg font-semibold flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-film mr-2 text-purple-500"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
                    <line x1="7" x2="7" y1="2" y2="22" />
                    <line x1="17" x2="17" y1="2" y2="22" />
                    <line x1="2" x2="22" y1="12" y2="12" />
                    <line x1="2" x2="7" y1="7" y2="7" />
                    <line x1="2" x2="7" y1="17" y2="17" />
                    <line x1="17" x2="22" y1="17" y2="17" />
                    <line x1="17" x2="22" y1="7" y2="7" />
                  </svg>
                  Vidéos ({videoMessages.length})
                </h3>
                {videoMessages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {videoMessages.slice(0, 4).map((message) => (
                      <motion.div
                        key={message.id}
                        className="aspect-video overflow-hidden rounded-md bg-muted border hover:shadow-md transition-all"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <video
                          src={message.attachment[0]?.url}
                          className="h-full w-full object-cover"
                          poster="/placeholder.svg?height=120&width=200"
                          controls
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center bg-purple-50 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-film text-purple-300 mb-2"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
                      <line x1="7" x2="7" y1="2" y2="22" />
                      <line x1="17" x2="17" y1="2" y2="22" />
                      <line x1="2" x2="22" y1="12" y2="12" />
                      <line x1="2" x2="7" y1="7" y2="7" />
                      <line x1="2" x2="7" y1="17" y2="17" />
                      <line x1="17" x2="22" y1="17" y2="17" />
                      <line x1="17" x2="22" y1="7" y2="7" />
                    </svg>
                    <p className="text-purple-700">Aucune vidéo partagée</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="h-[calc(90vh-280px)]">
            <ScrollArea className="h-full">
              <div className="space-y-2 p-4">
                {fileMessages.length > 0 ? (
                  fileMessages.map((message) => (
                    <motion.div
                      key={message.id}
                      className="flex items-center gap-3 rounded-lg border p-3 hover:shadow-md transition-all"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{message.attachment[0]?.fileName || "Fichier"}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), "d MMM yyyy", { locale: fr })}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="mb-2 h-12 w-12 text-blue-300" />
                    <p className="text-blue-700">Aucun fichier partagé dans cette conversation</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
