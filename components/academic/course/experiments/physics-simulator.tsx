"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, RotateCcw, Download, Settings2 } from "lucide-react"

export function PhysicsSimulator() {
  const [experiment, setExperiment] = useState("pendulum")
  const [isRunning, setIsRunning] = useState(false)
  const [gravity, setGravity] = useState(9.81)
  const [length, setLength] = useState(1)
  const [angle, setAngle] = useState(45)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={experiment} onValueChange={setExperiment}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select experiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendulum">Simple Pendulum</SelectItem>
              <SelectItem value="projectile">Projectile Motion</SelectItem>
              <SelectItem value="springs">Spring Oscillation</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isRunning ? "secondary" : "default"}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button variant="outline">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <Card className="relative">
          <CardContent className="p-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-muted-foreground">
                [Physics Simulation Viewport]
              </div>
            </div>
            <div className="aspect-video" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">Gravity (m/s²)</label>
                    <Input
                      type="number"
                      value={gravity}
                      onChange={(e) => setGravity(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Slider
                    value={[gravity]}
                    onValueChange={([value]) => setGravity(value)}
                    min={0}
                    max={20}
                    step={0.1}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">Length (m)</label>
                    <Input
                      type="number"
                      value={length}
                      onChange={(e) => setLength(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Slider
                    value={[length]}
                    onValueChange={([value]) => setLength(value)}
                    min={0.1}
                    max={5}
                    step={0.1}
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium">Initial Angle (°)</label>
                    <Input
                      type="number"
                      value={angle}
                      onChange={(e) => setAngle(parseFloat(e.target.value))}
                      className="w-20"
                    />
                  </div>
                  <Slider
                    value={[angle]}
                    onValueChange={([value]) => setAngle(value)}
                    min={0}
                    max={90}
                    step={1}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Measurements</h3>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Period:</span>
                    <span className="font-medium">2.01 s</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max Height:</span>
                    <span className="font-medium">0.85 m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Energy:</span>
                    <span className="font-medium">4.32 J</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Velocity:</span>
                    <span className="font-medium">1.24 m/s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}