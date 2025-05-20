"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Loader2, Check, UserPlus, Users } from "lucide-react"
import { motion } from "framer-motion"

interface User {
  id: string
  fullname: string
  profile_photo: string | null
  email?: string
}

interface AddParticipantsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddParticipants: (userIds: string[]) => void
  existingParticipantIds: string[]
  chatId?: string // Make chatId optional to avoid type errors
}

export default function AddParticipantsDialog({
  open,
  onOpenChange,
  onAddParticipants,
  existingParticipantIds,
  chatId,
}: AddParticipantsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      console.log("AddParticipantsDialog opened", { existingParticipantIds, chatId })
      fetchUsers()
    } else {
      // Reset state when dialog closes
      setSearchQuery("")
      setSelectedUsers([])
    }
  }, [open, existingParticipantIds, chatId])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.fullname.toLowerCase().includes(query) || (user.email && user.email.toLowerCase().includes(query)),
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, users])

  const getAccessToken = () => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        "dummy-token"
      )
    }
    return "dummy-token" // Fallback token
  }

  const fetchUsers = async () => {
    try {
      setLoading(true)

      const token = getAccessToken()
      if (!token) {
        setLoading(false)
        return
      }

      // Get all users from the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()

      // Filter out existing participants
      const filteredUsers = data.filter((user: User) => !existingParticipantIds.includes(user.id))

      // Sort users alphabetically by name
      filteredUsers.sort((a: User, b: User) => a.fullname.localeCompare(b.fullname))

      setUsers(filteredUsers)
      setFilteredUsers(filteredUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleAddParticipants = async () => {
    if (selectedUsers.length === 0) return

    setIsSubmitting(true)
    try {
      onAddParticipants(selectedUsers)
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding participants:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-500" />
            Ajouter des participants
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Seuls les utilisateurs qui ne sont pas déjà dans la conversation sont affichés.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher des utilisateurs..."
              className="pl-9 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredUsers.length > 0 ? (
            <ScrollArea className="h-60">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? "bg-primary/10 border border-primary/20"
                        : "border border-transparent"
                    }`}
                    onClick={() => handleToggleUser(user.id)}
                  >
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleToggleUser(user.id)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Avatar>
                      <AvatarImage
                        src={user.profile_photo || "/placeholder.svg?height=40&width=40"}
                        alt={user.fullname}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary/60 to-primary/30 text-white">
                        {user.fullname.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                      <div className="font-medium">{user.fullname}</div>
                      {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                    </Label>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? (
                <>
                  <div className="mb-2">Aucun utilisateur trouvé pour "{searchQuery}"</div>
                  <div className="text-xs">Essayez un autre terme de recherche</div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <div className="mb-2">Tous les utilisateurs sont déjà dans la conversation</div>
                    <div className="text-xs">Vous ne pouvez pas ajouter d'autres participants</div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="default"
            onClick={handleAddParticipants}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Ajouter ({selectedUsers.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
