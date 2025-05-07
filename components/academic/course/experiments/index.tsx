"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeSandbox } from "./code-sandbox"
import { PhysicsSimulator } from "./physics-simulator"
import { FlashcardBuilder } from "./flashcard-builder"
import { Code2, Atom, Brain, Beaker, Lightbulb, BookOpen } from "lucide-react"

export function CourseExperiments() {
  const [activeExperiment, setActiveExperiment] = useState<string>("code")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Experiments & Explorations</h2>
          <p className="text-muted-foreground">
            Interactive learning environments to explore course concepts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Beaker className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">Virtual Lab</span>
        </div>
      </div>

      <Tabs value={activeExperiment} onValueChange={setActiveExperiment}>
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            <span>Code Sandbox</span>
          </TabsTrigger>
          <TabsTrigger value="physics" className="flex items-center gap-2">
            <Atom className="h-4 w-4" />
            <span>Physics Lab</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span>Flashcards</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-6">
          <CodeSandbox />
        </TabsContent>

        <TabsContent value="physics" className="mt-6">
          <PhysicsSimulator />
        </TabsContent>

        <TabsContent value="flashcards" className="mt-6">
          <FlashcardBuilder />
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              Learning Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Active Learning</h4>
              <p className="text-sm text-muted-foreground">
                Experiment with different approaches and observe the results.
                Hands-on practice helps reinforce theoretical concepts.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Track Your Progress</h4>
              <p className="text-sm text-muted-foreground">
                Save your experiments and review them later. Build a portfolio of
                your learning journey.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">Documentation</h4>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• Code Sandbox API Reference</li>
                  <li>• Physics Simulator Guide</li>
                  <li>• Flashcard Best Practices</li>
                </ul>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">Community Examples</h4>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• Featured Student Projects</li>
                  <li>• Experiment Templates</li>
                  <li>• Shared Flashcard Decks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}