"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ChevronDown, ChevronRight, Brain, Book, CheckCircle2, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import Cookies from "js-cookie"
import { toast } from "sonner"
import confetti from "canvas-confetti"

interface Question {
  question: string
  answerAdvice: {
    steps: string[]
    examplePhrase: string
  }
}

interface JobDetails {
  id: string
  title: string
  companyName: string
  description: string
  tags: string[]
}

export default function InterviewPrepPage() {
  const { id } = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobDetails | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [showExample, setShowExample] = useState<string | null>(null)
  const [studiedQuestions, setStudiedQuestions] = useState<Set<string>>(new Set())
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (questions.length > 0 && studiedQuestions.size === questions.length) {
      setShowCelebration(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }, [studiedQuestions, questions.length])
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token")
        
        // Fetch job details
        const jobResponse = await fetch(
          `http://localhost:3000/project-offline-ai/aijobs/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        )

        if (!jobResponse.ok) throw new Error('Failed to fetch job details')
        const jobData = await jobResponse.json()

        // Fetch interview questions
        const questionsResponse = await fetch(
          "http://localhost:3000/project-offline-ai/InterviewQuations",
          {
            method: "POST",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              description: jobData.description,
              tags: jobData.tags
            })
          }
        )

        if (!questionsResponse.ok) throw new Error('Failed to fetch interview questions')
        const questionsData = await questionsResponse.json()

        setJob(jobData)
        setQuestions(questionsData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load interview preparation data")
        toast.error("Failed to load interview preparation data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const toggleStudied = (questionText: string) => {
    setStudiedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionText)) {
        newSet.delete(questionText)
      } else {
        newSet.add(questionText)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background/80 backdrop-blur-sm p-8">
        <div className="max-w-4xl mx-auto text-center py-8">
          Loading interview preparation...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background/80 backdrop-blur-sm p-8">
        <div className="max-w-4xl mx-auto text-center py-8 text-red-500">
          {error}
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background/80 backdrop-blur-sm p-8">
        <div className="max-w-4xl mx-auto text-center py-8">
          Job not found
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80')] bg-cover bg-center bg-no-repeat">
      <div className="min-h-screen bg-background/80 backdrop-blur-sm p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            <h1 className="text-3xl font-bold">{job.title} Interview Preparation</h1>
            <p className="text-muted-foreground">
              Study common interview questions for {job.companyName}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Questions</p>
                      <p className="text-2xl font-bold">{questions.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Questions Studied</p>
                      <p className="text-2xl font-bold">{studiedQuestions.size}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Job Tags</p>
                      <p className="text-2xl font-bold">{job.tags.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Question {index + 1}
                          </Badge>
                          {studiedQuestions.has(question.question) && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Studied
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{question.question}</p>
                        
                        <AnimatePresence>
                          {showExample === question.question && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-4 mt-4"
                            >
                              <div className="bg-background/50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Answer Guidance:</h3>
                                <ul className="list-disc pl-6 space-y-2">
                                  {question.answerAdvice.steps.map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="bg-background/50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Example Answer:</h3>
                                <p className="italic">{question.answerAdvice.examplePhrase}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowExample(
                            showExample === question.question ? null : question.question
                          )}
                        >
                          {showExample === question.question ? "Hide" : "Show"} Guidance
                        </Button>
                        <Button
                          variant={studiedQuestions.has(question.question) ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleStudied(question.question)}
                        >
                          {studiedQuestions.has(question.question) ? "Unmark" : "Mark"} as Studied
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
                onClick={() => setShowCelebration(false)}
              >
                <Card className="max-w-lg mx-4">
                  <CardContent className="p-6 text-center space-y-4">
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    >
                      <Sparkles className="h-12 w-12 mx-auto text-yellow-500" />
                    </motion.div>
                    <h2 className="text-2xl font-bold">You're Ready! 🎉</h2>
                    <p className="text-muted-foreground">
                      You've studied all the questions thoroughly. I believe in you and wish you the best of luck in your interview! Remember, I'm always here if you need more preparation help.
                    </p>
                    <Button 
                      onClick={() => setShowCelebration(false)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    >
                      Thank you!
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}