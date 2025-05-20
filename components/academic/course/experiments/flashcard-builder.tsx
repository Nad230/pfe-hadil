"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Save,
  Download,
  Upload,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Edit2
} from "lucide-react"

interface Flashcard {
  id: string
  front: string
  back: string
  tags: string[]
}

export function FlashcardBuilder() {
  const [cards, setCards] = useState<Flashcard[]>([
    {
      id: "1",
      front: "What is the law of conservation of energy?",
      back: "Energy cannot be created or destroyed, only transformed from one form to another.",
      tags: ["physics", "energy", "fundamental"]
    },
    {
      id: "2",
      front: "Define potential energy",
      back: "The energy possessed by an object due to its position or configuration.",
      tags: ["physics", "energy", "mechanics"]
    }
  ])
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studyProgress, setStudyProgress] = useState(0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
          <Button variant="outline">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Card className="relative min-h-[300px]">
            <CardContent className="absolute inset-0 flex items-center justify-center p-6">
              <div 
                className={`w-full space-y-4 transition-all duration-500 ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Card {currentCard + 1} of {cards.length}
                    </span>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-x-2">
                    {cards[currentCard].tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="min-h-[150px] text-center text-lg">
                  {isFlipped ? cards[currentCard].back : cards[currentCard].front}
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Click to flip
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentCard((prev) => (prev > 0 ? prev - 1 : prev))
                setIsFlipped(false)
              }}
              disabled={currentCard === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentCard((prev) =>
                  prev < cards.length - 1 ? prev + 1 : prev
                )
                setIsFlipped(false)
              }}
              disabled={currentCard === cards.length - 1}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 font-medium">Study Progress</h3>
                  <Progress value={studyProgress} className="h-2" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {studyProgress}% complete
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted p-4">
                    <div>
                      <div className="text-2xl font-bold">{cards.length}</div>
                      <div className="text-sm text-muted-foreground">
                        Total Cards
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3</div>
                      <div className="text-sm text-muted-foreground">
                        Mastered
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="rounded-lg bg-muted p-4">
                    <Button className="w-full" variant="outline">
                      <RotateCw className="mr-2 h-4 w-4" />
                      Shuffle Cards
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <h3 className="font-medium">Add New Card</h3>
                <div className="space-y-2">
                  <Input placeholder="Front side..." />
                  <Textarea placeholder="Back side..." />
                  <Input placeholder="Tags (comma separated)" />
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Card
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}