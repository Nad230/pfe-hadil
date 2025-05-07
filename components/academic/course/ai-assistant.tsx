"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bot, Send, Sparkles, Brain, Book, HelpCircle } from "lucide-react"

const suggestions = [
  {
    icon: Sparkles,
    text: "Explain eigenvalues in simple terms",
    color: "text-purple-500"
  },
  {
    icon: Brain,
    text: "Create a quiz about matrices",
    color: "text-blue-500"
  },
  {
    icon: Book,
    text: "Summarize today's lesson",
    color: "text-green-500"
  },
  {
    icon: HelpCircle,
    text: "Help me understand determinants",
    color: "text-red-500"
  }
]

interface Message {
  role: "user" | "assistant"
  content: string
}

export function CourseAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI study buddy. How can I help you with your math course today?"
    }
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (!input.trim()) return

    setMessages(prev => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: "I'm processing your request..." }
    ])
    setInput("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
      <Card className="p-6">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-3 ${
                  message.role === "assistant" ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`
                  flex-1 rounded-lg p-4
                  ${message.role === "assistant" 
                    ? "bg-muted" 
                    : "bg-primary text-primary-foreground"
                  }
                `}>
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-sm">You</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the course..."
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    setInput(suggestion.text)
                  }}
                >
                  <suggestion.icon className={`h-4 w-4 ${suggestion.color}`} />
                  {suggestion.text}
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Features</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• Personalized explanations</p>
            <p>• Practice problem generation</p>
            <p>• Study schedule optimization</p>
            <p>• Progress tracking insights</p>
          </div>
        </Card>
      </div>
    </div>
  )
}