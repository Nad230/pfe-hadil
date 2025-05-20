"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronRight, X, Calendar, Users, MapPin, Wallet, ClipboardList } from "lucide-react"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'

interface CreateActivityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}


type ActivityStep = 1 | 2 | 3 | 4

interface ActivityData {
  titre: string
  description: string
  responsable: string
  dateDebut: string
  dateFin: string
  lieu: string
  typeActivite: string
}



interface Responsable {
  id: string
  fullName: string
  email: string
}

export function CreateActivityDialog({ open, onOpenChange }: CreateActivityDialogProps) {
  const [step, setStep] = useState<ActivityStep>(1)
  const { setMood, setIsVisible } = useMascotStore()
  const [activityData, setActivityData] = useState<ActivityData>({
    titre: "",
    description: "",
    responsable: "",
    dateDebut: "",
    dateFin: "",
    lieu: "",
    typeActivite: ""
  })
  const [responsables, setResponsables] = useState<Responsable[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchResponsables = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:8080/api/adherents/responsables", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
        const data = await response.json()
        setResponsables(data)
      } catch (error) {
        console.error("Error fetching responsables:", error)
      }
    }
    fetchResponsables()
  }, [])

  const handleCreateActivity = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch("http://localhost:8080/api/activites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      })

      if (!response.ok) throw new Error("Failed to create activity")
      
      confetti({ particleCount: 100, spread: 70 })
      setMood('celebrating', 'Activity created successfully! 🎉')
      setIsVisible(true)
      
      onOpenChange(false)
      setStep(1)
      setActivityData({
        titre: "",
        description: "",
        responsable: "",
        dateDebut: "",
        dateFin: "",
        lieu: "",
        typeActivite: ""
      })
    } catch (err) {
      console.error("Error creating activity:", err)
      setMood('error', 'Failed to create activity 😢')
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
              className="relative"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Create New Activity</h2>
                      <p className="text-muted-foreground">Start with a clear title</p>
                    </div>
                  </div>

                  <Input
                    placeholder="e.g. 'Summer Workshop'"
                    value={activityData.titre}
                    onChange={(e) => setActivityData(prev => ({ ...prev, titre: e.target.value }))}
                    className="text-lg"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Select Responsable</h2>
                      <p className="text-muted-foreground">Choose activity leader</p>
                    </div>
                  </div>

                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder="Search responsables..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandGroup heading="Responsables">
                        {responsables
                          .filter(r => 
                            r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.email.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map(responsable => (
                            <CommandItem
                              key={responsable.id}
                              onSelect={() => setActivityData(prev => ({
                                ...prev,
                                responsable: responsable.id
                              }))}
                              className="flex items-center gap-2 p-2 cursor-pointer"
                            >
                              <div className="flex-1">
                                <p className="font-medium">{responsable.fullName}</p>
                                <p className="text-sm text-muted-foreground">{responsable.email}</p>
                              </div>
                              {activityData.responsable === responsable.id && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Activity Dates</h2>
                      <p className="text-muted-foreground">Set start and end dates</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Input
                      type="datetime-local"
                      label="Start Date"
                      value={activityData.dateDebut}
                      onChange={(e) => setActivityData(prev => ({ ...prev, dateDebut: e.target.value }))}
                    />
                    <Input
                      type="datetime-local"
                      label="End Date"
                      value={activityData.dateFin}
                      onChange={(e) => setActivityData(prev => ({ ...prev, dateFin: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Activity Details</h2>
                      <p className="text-muted-foreground">Finalize location and type</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <Input
                      placeholder="Location"
                      value={activityData.lieu}
                      onChange={(e) => setActivityData(prev => ({ ...prev, lieu: e.target.value }))}
                    />
                    <Input
                      placeholder="Activity Type"
                      value={activityData.typeActivite}
                      onChange={(e) => setActivityData(prev => ({ ...prev, typeActivite: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={() => setStep(prev => Math.max(1, prev - 1) as ActivityStep)}
              disabled={step === 1}
            >
              Back
            </Button>
            
            <Button
              onClick={step === 4 ? handleCreateActivity : () => setStep(prev => Math.min(4, prev + 1) as ActivityStep)}
              disabled={step === 1 && !activityData.titre.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              {step === 4 ? 'Create Activity' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}