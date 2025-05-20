"use client"

import { useState } from "react"
import { useAudio } from "@/lib/utils/audio-context"
import { useTheme } from "@/lib/utils/theme-context"
import { Volume2, VolumeX, Music, Settings } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function AudioControls() {
  const { isMuted, setMuted, volume, setVolume, playAmbient, stopAmbient, currentAmbient, availableSounds } = useAudio()
  const { mood, setMood } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  const ambientSounds = availableSounds.filter((sound) => sound.category === "ambient" && sound.unlocked)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex items-center gap-4 bg-background/80 backdrop-blur-md p-3 rounded-lg shadow-lg"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  <Slider
                    value={[volume * 100]}
                    min={0}
                    max={100}
                    step={1}
                    className="w-24"
                    onValueChange={(value) => setVolume(value[0] / 100)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Music size={18} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs">
                        {currentAmbient
                          ? availableSounds.find((s) => s.id === currentAmbient)?.name || "Ambient"
                          : "Choose Ambient"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Ambient Sounds</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {ambientSounds.map((sound) => (
                        <DropdownMenuItem
                          key={sound.id}
                          onClick={() => playAmbient(sound.id)}
                          className={currentAmbient === sound.id ? "bg-accent" : ""}
                        >
                          {sound.name}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => stopAmbient()}>Turn Off</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium">Mood</span>
                <div className="flex flex-wrap gap-1">
                  {(["joyful", "calm", "focused", "dreamy", "energetic", "mysterious"] as const).map((m) => (
                    <Button
                      key={m}
                      size="sm"
                      variant={mood === m ? "default" : "outline"}
                      className="h-7 text-xs px-2 py-1"
                      onClick={() => setMood(m)}
                    >
                      {m}
                    </Button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Settings size={18} />
        </Button>

        <Button
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-lg"
          onClick={() => setMuted(!isMuted)}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
      </div>
    </motion.div>
  )
}
