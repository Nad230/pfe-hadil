"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, User, Briefcase, Eye, EyeOff, X } from "lucide-react"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import Cookies from 'js-cookie'

interface EditClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: any
  onSuccess?: () => void
}

interface ClientData {
  id: string
  name: string
  hasAccount: boolean
  userId?: string
  user?: any
  visibility: "public" | "private"
  projectIds: string[]
  originalHasAccount: boolean
}

interface User {
  id: string
  fullname: string
  profile_photo?: string
}

interface Project {
  id: string
  name: string
}

export function EditClientDialog({ open, onOpenChange, client, onSuccess }: EditClientDialogProps) {
  const [step, setStep] = useState<number>(1)
  const [clientData, setClientData] = useState<ClientData>({
    id: client.id,
    name: client.name,
    hasAccount: client.userId ? true : false,
    userId: client.userId,
    user: client.user,
    visibility: client.visibility || "private",
    projectIds: client.projects?.map((p: any) => p.id) || [],
    originalHasAccount: !!client.userId
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedUsers, setSearchedUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [searchError, setSearchError] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch('http://localhost:3000/projects', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Failed to fetch projects")
        setProjects(await response.json())
      } catch (error) {
        console.error("Error loading projects:", error)
      }
    }
    if (open) fetchProjects()
  }, [open])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchError("")
    setSearchedUsers([])

    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/auth/search?name=${encodeURIComponent(searchQuery)}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )

      if (!response.ok) {
        setSearchError("No users found with this name. Please try again.")
        return
      }

      const data = await response.json()
      const users = Array.isArray(data) ? data : [data]
      if (users.length === 0) {
        setSearchError("No users found with this name.")
        return
      }

      setSearchedUsers(users.map(user => ({
        id: user.id,
        fullname: user.fullname,
        profile_photo: user.profile_photo || ""
      })))
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleNext = () => {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
  }

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const toggleProjectSelection = (projectId: string) => {
    setClientData(prev => ({
      ...prev,
      projectIds: prev.projectIds.includes(projectId)
        ? prev.projectIds.filter(id => id !== projectId)
        : [...prev.projectIds, projectId]
    }))
  }

  const handleDisassociateUser = () => {
    setClientData(prev => ({
      ...prev,
      hasAccount: false,
      userId: undefined,
      user: undefined,
      name: prev.originalHasAccount ? "" : prev.name
    }))
  }

  const handleUpdateClient = async () => {
    try {
      const token = Cookies.get("token")
      const payload = {
        name: clientData.name,
        visibility: clientData.visibility,
        userId: clientData.hasAccount ? clientData.userId : null,
        projectIds: clientData.projectIds
      }

      const response = await fetch(`http://localhost:3000/client/${clientData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to update client")

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      console.error("Error updating client:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Step 1: Account Status */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Client Account</h2>
                      <p className="text-muted-foreground">
                        {clientData.originalHasAccount ? 
                          "Linked to user account" : 
                          "No linked user account"}
                      </p>
                    </div>
                  </div>

                  {clientData.hasAccount ? (
                    <div className="space-y-4">
                      {clientData.user && (
                        <div className="p-4 border rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={clientData.user.profile_photo} />
                              <AvatarFallback>{clientData.user.fullname[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{clientData.user.fullname}</p>
                              <p className="text-sm text-muted-foreground">User ID: {clientData.user.id}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDisassociateUser}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      
                      {!clientData.user && (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Search users..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                              className="flex-1"
                            />
                            <Button 
                              onClick={handleSearch}
                              variant="outline"
                              disabled={isSearching}
                            >
                              {isSearching ? "Searching..." : "Search"}
                            </Button>
                          </div>
                          
                          {searchedUsers.length > 0 && (
                            <div className="border rounded-md divide-y">
                              {searchedUsers.map(user => (
                                <div
                                  key={user.id}
                                  onClick={() => setClientData(prev => ({
                                    ...prev,
                                    userId: user.id,
                                    user: user
                                  }))}
                                  className={`p-3 flex items-center cursor-pointer hover:bg-accent ${
                                    clientData.userId === user.id ? 'bg-accent/50' : ''
                                  }`}
                                >
                                  <Avatar className="h-8 w-8 mr-3">
                                    <AvatarImage src={user.profile_photo} />
                                    <AvatarFallback>{user.fullname[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium">{user.fullname}</p>
                                  </div>
                                  {clientData.userId === user.id && <Check className="h-5 w-5 text-green-500" />}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input
                        placeholder="Client name"
                        value={clientData.name}
                        onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                        className="text-lg"
                      />
                      <p className="text-sm text-muted-foreground">
                        {clientData.originalHasAccount
                          ? "This client was previously linked to a user account"
                          : "This client doesn't have a linked user account"}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Project Association */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-indigo-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Associated Projects</h2>
                      <p className="text-muted-foreground">Update project associations</p>
                    </div>
                  </div>

                  <Command className="border rounded-lg">
                    <CommandInput placeholder="Search projects..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandGroup>
                        {projects.map((project) => (
                          <CommandItem
                            key={project.id}
                            onSelect={() => toggleProjectSelection(project.id)}
                          >
                            <Check className={`mr-2 h-4 w-4 ${
                              clientData.projectIds.includes(project.id) ? "opacity-100" : "opacity-0"
                            }`} />
                            {project.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      <CommandEmpty>No projects found</CommandEmpty>
                    </CommandList>
                  </Command>
                </div>
              )}

              {/* Step 3: Visibility Settings */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      {clientData.visibility === "public" ? (
                        <Eye className="h-6 w-6 text-orange-500" />
                      ) : (
                        <EyeOff className="h-6 w-6 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Visibility Settings</h2>
                      <p className="text-muted-foreground">Update client visibility</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Button
                      onClick={() => setClientData(prev => ({ ...prev, visibility: "public" }))}
                      className="h-16 text-lg"
                      variant={clientData.visibility === "public" ? 'default' : 'outline'}
                    >
                      <Eye className="mr-2 h-5 w-5" />
                      Public
                    </Button>
                    <Button
                      onClick={() => setClientData(prev => ({ ...prev, visibility: "private" }))}
                      className="h-16 text-lg"
                      variant={clientData.visibility === "private" ? 'default' : 'outline'}
                    >
                      <EyeOff className="mr-2 h-5 w-5" />
                      Private
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            <Button
              onClick={step === 3 ? handleUpdateClient : handleNext}
              disabled={
                (step === 1 && !clientData.hasAccount && !clientData.name.trim()) ||
                (step === 1 && clientData.hasAccount && !clientData.userId)
              }
            >
              {step === 3 ? 'Save Changes' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}