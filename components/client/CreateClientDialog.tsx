"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, Eye, EyeOff, User, Briefcase } from "lucide-react"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ClientData {
  name: string
  hasAccount?: boolean
  userId?: string
  visibility?: "public" | "private"
  projectIds?: string[]
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

export function CreateClientDialog({ open, onOpenChange, onSuccess }: CreateClientDialogProps) {
  const [step, setStep] = useState<number>(1)
  const { setMood, setIsVisible } = useMascotStore()
  const [clientData, setClientData] = useState<ClientData>({ 
    name: '', 
    visibility: "private",
    projectIds: []
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
  if (step === 1) {
    if (clientData.hasAccount === true) setStep(2)
    else setStep(3)
  } else if (step === 2) {
    setStep(4) // Move to project association after user search
  } else if (step === 3) {
    setStep(4) // Move to project association after name entry
  } else if (step < 5) {
    setStep(prev => prev + 1)
  }
}

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const toggleProjectSelection = (projectId: string) => {
    setClientData(prev => {
      const ids = prev.projectIds || []
      return {
        ...prev,
        projectIds: ids.includes(projectId)
          ? ids.filter(id => id !== projectId)
          : [...ids, projectId]
      }
    })
  }

  const handleCreateClient = async () => {
    try {
      const token = Cookies.get("token")
      const payload = { 
        
        name: clientData.name,
        visibility: clientData.visibility,
        userId: clientData.userId,
        projectIds: clientData.projectIds
      }

      const response = await fetch("http://localhost:3000/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to create client")

      confetti({ particleCount: 100, spread: 70 })
      setIsVisible(true)
      onOpenChange(false)
      setStep(1)
      setClientData({ name: '', visibility: "private", projectIds: [] })
      onSuccess?.()
    } catch (err) {
      console.error("Error creating client:", err)
      setIsVisible(true)
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
                      <h2 className="text-2xl font-bold">Account Status</h2>
                      <p className="text-muted-foreground">Does this client have an account?</p>
                    </div>
                  </div>
                  <div className="grid gap-4">
                    <Button
                      onClick={() => setClientData(prev => ({ ...prev, hasAccount: true }))}
                      className="h-16 text-lg"
                      variant={clientData.hasAccount === true ? 'default' : 'outline'}
                    >
                      Yes, Existing Account
                    </Button>
                    <Button
                      onClick={() => setClientData(prev => ({ ...prev, hasAccount: false }))}
                      className="h-16 text-lg"
                      variant={clientData.hasAccount === false ? 'default' : 'outline'}
                    >
                      No, New Client
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: User Search */}
              {step === 2 && clientData.hasAccount && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-teal-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Find Client</h2>
                      <p className="text-muted-foreground">Search by name</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter client name..."
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
                    <div className="border rounded-md">
                      {isSearching ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          <div className="animate-pulse">Searching...</div>
                        </div>
                      ) : (
                        <>
                          {searchError && (
                            <div className="py-6 text-center text-sm text-destructive">
                              {searchError}
                            </div>
                          )}
                          {searchedUsers.length > 0 ? (
                            <div className="divide-y">
                              {searchedUsers.map(user => (
                                <div
                                  key={user.id}
                                  onClick={() => setClientData(prev => ({ ...prev, userId: user.id,name: user.fullname }))}
                                  className={`p-3 flex items-center cursor-pointer hover:bg-accent ${
                                    clientData.userId === user.id ? 'bg-accent/50' : ''
                                  }`}
                                >
                                  <Avatar className="h-10 w-10 mr-3">
                                    <AvatarImage src={user.profile_photo} />
                                    <AvatarFallback>{user.fullname[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium">{user.fullname}</p>
                                    <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
                                  </div>
                                  {clientData.userId === user.id && <Check className="h-5 w-5 text-green-500" />}
                                </div>
                              ))}
                            </div>
                          ) : !searchError && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              {searchQuery.trim() ? 'No results found' : 'Enter a name and press Search'}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Client Name */}
              {step === 3 && clientData.hasAccount === false && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Client Name</h2>
                      <p className="text-muted-foreground">Enter the new client's name</p>
                    </div>
                  </div>
                  <Input
                    placeholder="Client name"
                    value={clientData.name}
                    onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg"
                  />
                </div>
              )}

              {/* Step 4: Project Association */}
             {step === 4 && (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
        <Briefcase className="h-6 w-6 text-indigo-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Associated Projects</h2>
        <p className="text-muted-foreground">Select projects to associate with this client (optional)</p>
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
                clientData.projectIds?.includes(project.id) ? "opacity-100" : "opacity-0"
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
              {/* Step 5: Visibility Settings */}
              {step === 5 && (
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
                      <h2 className="text-2xl font-bold">Client Visibility</h2>
                      <p className="text-muted-foreground">Choose who can see this client</p>
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
                    <p className="text-sm text-muted-foreground pl-4">
                      The client will be able to see this record and the revenue, but cannot update or delete it.
                    </p>
                    
                    <Button
                      onClick={() => setClientData(prev => ({ ...prev, visibility: "private" }))}
                      className="h-16 text-lg"
                      variant={clientData.visibility === "private" ? 'default' : 'outline'}
                    >
                      <EyeOff className="mr-2 h-5 w-5" />
                      Private
                    </Button>
                    <p className="text-sm text-muted-foreground pl-4">
                      The client will not be able to see this record.
                    </p>
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
              onClick={step === 5 ? handleCreateClient : handleNext}
              disabled={
  (step === 1 && clientData.hasAccount === undefined) ||
  (step === 2 && !clientData.userId) ||
  (step === 3 && !clientData.name.trim())
  // Removed project selection requirement
}
            >
              {step === 5 ? 'Create Client 🚀' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}