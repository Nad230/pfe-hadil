"use client"

import type React from "react"
import { createContext, useContext, useState, useRef, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Sound {
  id: string
  name: string
  path: string
  howl?: any // Howler.Howl
  category: "reaction" | "notification" | "ambient" | "interaction" | "special"
  unlocked: boolean
}

interface AudioContextType {
  isMuted: boolean
  setMuted: (muted: boolean) => void
  volume: number
  setVolume: (volume: number) => void
  playSound: (id: string) => void
  stopSound: (id: string) => void
  playAmbient: (id: string) => void
  stopAmbient: () => void
  currentAmbient: string | null
  unlockedSounds: string[]
  unlockSound: (id: string) => void
  availableSounds: Sound[]
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

const defaultSounds: Sound[] = [
  {
    id: "message-sent",
    name: "Message Sent",
    path: "/sounds/message-sent.mp3",
    category: "interaction",
    unlocked: true,
  },
  {
    id: "message-received",
    name: "Message Received",
    path: "/sounds/message-received.mp3",
    category: "notification",
    unlocked: true,
  },
  {
    id: "reaction-heart",
    name: "Heart Reaction",
    path: "/sounds/reaction-heart.mp3",
    category: "reaction",
    unlocked: true,
  },
  {
    id: "reaction-laugh",
    name: "Laugh Reaction",
    path: "/sounds/reaction-laugh.mp3",
    category: "reaction",
    unlocked: true,
  },
  {
    id: "reaction-wow",
    name: "Wow Reaction",
    path: "/sounds/reaction-wow.mp3",
    category: "reaction",
    unlocked: true,
  },
  {
    id: "ambient-calm",
    name: "Calm Ambient",
    path: "/sounds/ambient-calm.mp3",
    category: "ambient",
    unlocked: true,
  },
  {
    id: "ambient-focus",
    name: "Focus Mode",
    path: "/sounds/ambient-focus.mp3",
    category: "ambient",
    unlocked: true,
  },
  {
    id: "ambient-night",
    name: "Night Mode",
    path: "/sounds/ambient-night.mp3",
    category: "ambient",
    unlocked: true,
  },
  {
    id: "special-secret",
    name: "Secret Discovery",
    path: "/sounds/special-secret.mp3",
    category: "special",
    unlocked: false,
  },
]

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setMuted] = useLocalStorage("audio-muted", false)
  const [volume, setVolume] = useLocalStorage("audio-volume", 0.5)
  const [sounds, setSounds] = useState<Sound[]>(defaultSounds)
  const [currentAmbient, setCurrentAmbient] = useState<string | null>(null)
  const [unlockedSounds, setUnlockedSounds] = useLocalStorage<string[]>("unlocked-sounds", [])

  const ambientRef = useRef<any | null>(null)

  // Initialize sounds
  useEffect(() => {
    // In a real implementation, we would initialize Howler.js here
    // For now, we'll just simulate the functionality
    const initializedSounds = sounds.map((sound) => {
      // Check if sound is already unlocked from localStorage
      const isUnlocked = unlockedSounds.includes(sound.id) || sound.unlocked

      return {
        ...sound,
        unlocked: isUnlocked,
        // In a real implementation, we would create a Howl instance here
        howl: {
          play: () => console.log(`Playing sound: ${sound.id}`),
          stop: () => console.log(`Stopping sound: ${sound.id}`),
          volume: (vol: number) => console.log(`Setting volume to ${vol} for sound: ${sound.id}`),
        },
      }
    })

    setSounds(initializedSounds)
  }, [])

  // Update volume when it changes
  useEffect(() => {
    sounds.forEach((sound) => {
      if (sound.howl) {
        sound.howl.volume(sound.category === "ambient" ? volume * 0.3 : volume)
      }
    })
  }, [volume, sounds])

  const playSound = (id: string) => {
    if (isMuted) return

    const sound = sounds.find((s) => s.id === id)
    if (sound?.howl && sound.unlocked) {
      sound.howl.play()
    }
  }

  const stopSound = (id: string) => {
    const sound = sounds.find((s) => s.id === id)
    if (sound?.howl) {
      sound.howl.stop()
    }
  }

  const playAmbient = (id: string) => {
    if (isMuted) return

    // Stop current ambient if playing
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
    }

    const sound = sounds.find((s) => s.id === id && s.category === "ambient")
    if (sound?.howl && sound.unlocked) {
      sound.howl.play()
      ambientRef.current = sound.howl
      setCurrentAmbient(id)
    }
  }

  const stopAmbient = () => {
    if (ambientRef.current) {
      ambientRef.current.stop()
      ambientRef.current = null
      setCurrentAmbient(null)
    }
  }

  const unlockSound = (id: string) => {
    if (!unlockedSounds.includes(id)) {
      setUnlockedSounds([...unlockedSounds, id])

      setSounds((prevSounds) =>
        prevSounds.map((sound) => {
          if (sound.id === id) {
            return { ...sound, unlocked: true }
          }
          return sound
        }),
      )
    }
  }

  return (
    <AudioContext.Provider
      value={{
        isMuted,
        setMuted,
        volume,
        setVolume,
        playSound,
        stopSound,
        playAmbient,
        stopAmbient,
        currentAmbient,
        unlockedSounds,
        unlockSound,
        availableSounds: sounds,
      }}
    >
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider")
  }
  return context
}
