
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronRight, User, X } from "lucide-react"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'

interface CreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ClientData {
  name: string
  hasAccount?: boolean
  userId?: string
  photo?: File | null
}

interface User {
  id: string
  fullname: string
  avatar: string
}

export function CreateClientDialog({ open, onOpenChange }: CreateClientDialogProps) {
  const [step, setStep] = useState<number>(1)
  const { setMood, setIsVisible } = useMascotStore()
  const [clientData, setClientData] = useState<ClientData>({ name: '', photo: null })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedUser, setSearchedUser] = useState<User | null>(null)
  const [searchError, setSearchError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setSearchError("")
    setSearchedUser(null)

    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/auth/${searchQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        setSearchError("No user found with this ID. Please try again.")
        return
      }

      const data = await response.json()
      if (!data.fullname) {
        setSearchError("Invalid user data received.")
        return
      }

      // Map API response to User interface
      setSearchedUser({
        id: data.id,
        fullname: data.fullname,
        avatar: data.profile_photo || "" // Use actual profile photo field from API
      })
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleNext = () => {
    if (step === 2 && clientData.hasAccount === false) {
      setStep(4) // Skip to photo step
    } else if (step === 3 && clientData.hasAccount === true) {
      setStep(4) // Photo step after user selection
    } else if (step < 5) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1)
  }

  const handleCreateClient = async () => {
    try {
      const token = Cookies.get("token")
  
      // build a plain object instead of FormData
      const payload: Record<string,string> = { name: clientData.name }
      if (clientData.userId) payload.userId = clientData.userId
      if (clientData.photo)  payload.photo  = clientData.photo
  
      const response = await fetch("http://localhost:3000/client", {
        method: "POST",
        headers: {
          "Content-Type":  "application/json",        // <-- important
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),                // <-- send JSON
      })
  
      if (!response.ok) throw new Error("Failed to create client")
  
      confetti({ particleCount: 100, spread: 70 })
      setIsVisible(true)
      onOpenChange(false)
      setStep(1)
      setClientData({ name: '', photo: null })
    } catch (err) {
      console.error("Error creating client:", err)
      setIsVisible(true)
    }
  }
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setClientData(prev => ({ ...prev, photo: file }))
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
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Create New Client</h2>
                      <p className="text-muted-foreground">Start with the client's name</p>
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

{step === 2 && (
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
{step === 3 && clientData.hasAccount && (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
        <User className="h-6 w-6 text-teal-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold">Find Client</h2>
        <p className="text-muted-foreground">Search by user ID</p>
      </div>
    </div>

    <div className="flex gap-2">
      <Command className="flex-1">
        <CommandInput 
          placeholder="Enter user ID..."
          value={searchQuery}
          onValueChange={(value) => {
            setSearchQuery(value);
            setSearchedUser(null); // Clear previous results on new input
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <CommandList className="max-h-[200px] overflow-y-auto">
          {isSearching ? (
            <div className="py-2 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          ) : (
            <>
              {searchError && (
                <div className="py-2 text-center text-sm text-destructive">
                  {searchError}
                </div>
              )}
              {searchedUser && (
                <CommandGroup>
                  <CommandItem
                    key={searchedUser.id}
                    value={searchedUser.id}
                    onSelect={() => setClientData(prev => ({
                      ...prev,
                      userId: searchedUser.id
                    }))}
                    className="cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={searchedUser.avatar} />
                      <AvatarFallback>
                        {searchedUser.fullname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{searchedUser.fullname}</p>
                      <p className="text-sm text-muted-foreground">
                        User ID: {searchedUser.id}
                      </p>
                    </div>
                    {clientData.userId === searchedUser.id && (
                      <Check className="h-4 w-4 text-green-500 ml-2" />
                    )}
                  </CommandItem>
                </CommandGroup>
              )}
              {!searchedUser && !searchError && !isSearching && (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  Enter a user ID and press Search
                </div>
              )}
            </>
          )}
        </CommandList>
      </Command>
      <Button 
        onClick={handleSearch}
        variant="outline"
        disabled={isSearching}
      >
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </div>
  </div>
)}
              {(step === 4 || (step === 3 && !clientData.hasAccount)) && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Client Photo</h2>
                      <p className="text-muted-foreground">Upload a profile picture (optional)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer border rounded-lg p-4 hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-6 w-6" />
                        <span>{clientData.photo ? "Change Photo" : "Upload Photo"}</span>
                      </div>
                    </label>
                    {clientData.photo && (
                      <div className="relative">
                        <img 
                          src={URL.createObjectURL(clientData.photo)} 
                          className="h-16 w-16 rounded-full object-cover"
                          alt="Client preview"
                        />
                        <button
                          onClick={() => setClientData(prev => ({ ...prev, photo: null }))}
                          className="absolute -top-2 -right-2 bg-destructive rounded-full p-1"
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <User className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Review Client</h2>
                      <p className="text-muted-foreground">Confirm client details</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {clientData.photo && (
                        <img
                          src={URL.createObjectURL(clientData.photo)}
                          className="h-16 w-16 rounded-full object-cover"
                          alt="Client preview"
                        />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{clientData.name}</h3>
                        {clientData.userId && (
                          <p className="text-muted-foreground">User ID: {clientData.userId}</p>
                        )}
                      </div>
                    </div>
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
              onClick={step >= 4 ? handleCreateClient : handleNext}
              disabled={step === 1 && !clientData.name.trim()}
            >
              {step >= 4 ? 'Create Client 🚀' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}