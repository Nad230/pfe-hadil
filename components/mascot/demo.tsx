"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mascot } from "./mascot"
import { useMascotState } from "./use-mascot-state"
import { MascotMood } from "./animations"

const demoMessages = {
  happy: "Yay! I'm so excited to help you today! 🎉",
  sad: "Oh no! Don't worry, we'll figure this out together 💪",
  thinking: "Hmm... Let me think about that for a moment 🤔",
  waving: "Hello there! Welcome to our app! 👋",
  loading: "Just a moment while I fetch that for you... ⚡️"
}

export function MascotDemo() {
  const { mood, message, showMessage } = useMascotState()

  const handleMoodChange = (newMood: MascotMood) => {
    showMessage(demoMessages[newMood], newMood, 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mascot Demo</CardTitle>
        <CardDescription>
          Click the buttons below to see different mascot moods and animations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => handleMoodChange("happy")}>
            Happy 😊
          </Button>
          <Button onClick={() => handleMoodChange("sad")}>
            Sad 😢
          </Button>
          <Button onClick={() => handleMoodChange("thinking")}>
            Thinking 🤔
          </Button>
          <Button onClick={() => handleMoodChange("waving")}>
            Waving 👋
          </Button>
          <Button onClick={() => handleMoodChange("loading")}>
            Loading ⚡️
          </Button>
        </div>

        <div className="mt-8 relative h-[300px] border rounded-lg">
          <Mascot
            mood={mood}
            message={message}
            className="relative inset-auto"
            isFloating={true}
          />
        </div>
      </CardContent>
    </Card>
  )
}