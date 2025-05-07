"use client"

import React, { createContext, useContext, useEffect, useRef } from 'react'
import { Howl } from 'howler'

interface AudioContextType {
  playHover: () => void
  playClick: () => void
  playTransition: () => void
}

const AudioContext = createContext<AudioContextType>({
  playHover: () => {},
  playClick: () => {},
  playTransition: () => {},
})

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const hoverSound = useRef<Howl>()
  const clickSound = useRef<Howl>()
  const transitionSound = useRef<Howl>()

  useEffect(() => {
    hoverSound.current = new Howl({
      src: ['/sounds/hover.mp3'],
      volume: 0.1,
    })

    clickSound.current = new Howl({
      src: ['/sounds/click.mp3'],
      volume: 0.2,
    })

    transitionSound.current = new Howl({
      src: ['/sounds/transition.mp3'],
      volume: 0.3,
    })
  }, [])

  const playHover = () => hoverSound.current?.play()
  const playClick = () => clickSound.current?.play()
  const playTransition = () => transitionSound.current?.play()

  return (
    <AudioContext.Provider value={{ playHover, playClick, playTransition }}>
      {children}
    </AudioContext.Provider>
  )
}

export const useAudio = () => useContext(AudioContext)