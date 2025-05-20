"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react"

interface PresentModeProps {
  params: {
    id: string
  }
}

export default function PresentMode({ params }: PresentModeProps) {
  const [currentSlide, setCurrentSlide] = useState(1)
  const [totalSlides, setTotalSlides] = useState(10) // Example total
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide(prev => Math.min(prev + 1, totalSlides))
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide(prev => Math.max(prev - 1, 1))
      } else if (e.key === 'f') {
        toggleFullscreen()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [totalSlides])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black text-white">
      <div className="relative h-full flex items-center justify-center">
        {/* Example slide content */}
        <div className="w-full max-w-6xl aspect-[16/9] bg-white rounded-lg p-8">
          <h1 className="text-4xl font-bold text-black">Slide {currentSlide}</h1>
        </div>

        {/* Navigation controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 1))}
            disabled={currentSlide === 1}
            className="text-white border-white hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm">
            {currentSlide} / {totalSlides}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides))}
            disabled={currentSlide === totalSlides}
            className="text-white border-white hover:bg-white/20"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Fullscreen toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 text-white border-white hover:bg-white/20"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}