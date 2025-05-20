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
interface CreateEventDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
  }
  type EventStep = 1 | 2 | 3
  interface EventData {
    title: string
    dateDebut: string
    dateFin: string
    numberParticipants: number
    maxParticipants: number
    status: string
    expenses: string
    type: string
    location: string
  }  


export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
    const [step, setStep] = useState<EventStep>(1)
    const { setMood, setIsVisible } = useMascotStore()
    const [eventData, setEventData] = useState<EventData>({
      title: "",
      dateDebut: "",
      dateFin: "",
      numberParticipants: 0,
      maxParticipants: 50,
      status: "planned",
      expenses: "",
      type: "",
      location: ""
    })
  
    const handleCreateEvent = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:8080/api/adherents/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(eventData)
        })
  
        if (!response.ok) throw new Error("Failed to create event")
        
        confetti({ particleCount: 100, spread: 70 })
        setMood('celebrating', 'Event created successfully! 🎉')
        setIsVisible(true)
        
        onOpenChange(false)
        setStep(1)
        setEventData({
          title: "",
          dateDebut: "",
          dateFin: "",
          numberParticipants: 0,
          maxParticipants: 50,
          status: "planned",
          expenses: "",
          type: "",
          location: ""
        })
      } catch (err) {
        console.error("Error creating event:", err)
        setMood('error', 'Failed to create event 😢')
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
                        <Calendar className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Create New Event</h2>
                        <p className="text-muted-foreground">Start with basic information</p>
                      </div>
                    </div>
  
                    <div className="grid gap-4">
                      <Input
                        placeholder="Event Title"
                        value={eventData.title}
                        onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Input
                        type="datetime-local"
                        label="Start Date"
                        value={eventData.dateDebut}
                        onChange={(e) => setEventData(prev => ({ ...prev, dateDebut: e.target.value }))}
                      />
                      <Input
                        type="datetime-local"
                        label="End Date"
                        value={eventData.dateFin}
                        onChange={(e) => setEventData(prev => ({ ...prev, dateFin: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
  
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Event Details</h2>
                        <p className="text-muted-foreground">Set participants and budget</p>
                      </div>
                    </div>
  
                    <div className="grid gap-4">
                      <Input
                        type="number"
                        label="Max Participants"
                        value={eventData.maxParticipants}
                        onChange={(e) => setEventData(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                      />
                      <Input
                        placeholder="Expenses"
                        value={eventData.expenses}
                        onChange={(e) => setEventData(prev => ({ ...prev, expenses: e.target.value }))}
                      />
                      <Input
                        placeholder="Event Type"
                        value={eventData.type}
                        onChange={(e) => setEventData(prev => ({ ...prev, type: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
  
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Location & Status</h2>
                        <p className="text-muted-foreground">Final event details</p>
                      </div>
                    </div>
  
                    <div className="grid gap-4">
                      <Input
                        placeholder="Location"
                        value={eventData.location}
                        onChange={(e) => setEventData(prev => ({ ...prev, location: e.target.value }))}
                      />
                      <Input
                        placeholder="Status"
                        value={eventData.status}
                        onChange={(e) => setEventData(prev => ({ ...prev, status: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
  
            <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={() => setStep(prev => Math.max(1, prev - 1) as EventStep)}
                disabled={step === 1}
              >
                Back
              </Button>
              
              <Button
                onClick={step === 3 ? handleCreateEvent : () => setStep(prev => Math.min(3, prev + 1) as EventStep)}
                disabled={step === 1 && !eventData.title.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
              >
                {step === 3 ? 'Create Event' : 'Next'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }