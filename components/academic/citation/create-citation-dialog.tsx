"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Calendar as CalendarIcon, Book, Users, Link, Hash, ChevronLeft, ChevronRight, Loader2, Clock, Sparkles, CheckCircle } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import Confetti from 'react-confetti'
import Cookies from "js-cookie";
import { useParams } from "next/navigation"

interface CreateCitationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 'title' | 'authors' | 'date' | 'journal' | 'doi' | 'tags' | 'usage'

const predefinedTags = [
  { value: 'research', label: 'Research', color: 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200' },
  { value: 'review', label: 'Review', color: 'bg-purple-100 dark:bg-purple-900 hover:bg-purple-200' },
  { value: 'case-study', label: 'Case Study', color: 'bg-green-100 dark:bg-green-900 hover:bg-green-200' },
  { value: 'innovation', label: 'Innovation', color: 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200' },
  { value: 'ai', label: 'AI', color: 'bg-red-100 dark:bg-red-900 hover:bg-red-200' },
  { value: 'methodology', label: 'Methodology', color: 'bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200' },
  { value: 'theory', label: 'Theory', color: 'bg-pink-100 dark:bg-pink-900 hover:bg-pink-200' },
  { value: 'experiment', label: 'Experiment', color: 'bg-orange-100 dark:bg-orange-900 hover:bg-orange-200' }
]

const usageOptions = [
  { value: 'research-paper', label: 'Research Paper', emoji: '📝' },
  { value: 'presentation', label: 'Presentation', emoji: '🎯' },
  { value: 'thesis', label: 'Thesis', emoji: '📚' },
  { value: 'blog', label: 'Blog Post', emoji: '✍️' },
  { value: 'journal', label: 'Academic Journal', emoji: '📰' }
]

const steps: Step[] = ['title', 'authors', 'date', 'journal', 'doi', 'tags', 'usage']


export function CreateCitationDialog({ open, onOpenChange }: CreateCitationDialogProps) {
  const [step, setStep] = useState<Step>('title')
  const [showConfetti, setShowConfetti] = useState(false)
  const [authorSearchOpen, setAuthorSearchOpen] = useState(false) // You can remove this state

  const [formData, setFormData] = useState({
    title: '',
    authors: [] as string[],
    date: new Date(),
    journal: '',
    doi: '',
    tags: [] as string[],
    usage: [] as string[],
    authorInput: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentStepIndex = steps.indexOf(step)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1])
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1])
    }
  }
  const [tasks, setTasks] = useState<any[]>([]);
const { id: courseId } = useParams(); // Add useParams import

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/academic/acadopentask/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch tasks");
      setTasks(await response.json());
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };
  
  if (courseId) fetchTasks();
}, [courseId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = Cookies.get("token");
  
      const response = await fetch("http://localhost:3000/citation", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          authors: formData.authors,
          publication_date: formData.date.toISOString(), // Convert Date to ISO string
          taskId: formData.journal,
          journal:"",
          doi: formData.doi,
          tags: formData.tags,
          usage_cases: formData.usage // Match your API's expected field name
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("Citation created:", data);
  
      setShowConfetti(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form and close dialog
      setIsSubmitting(false);
      onOpenChange(false);
      
      setTimeout(() => {
        setShowConfetti(false);
        setFormData({
          title: '',
          authors: [],
          date: new Date(),
          journal: '',
          doi: '',
          tags: [],
          usage: [],
          authorInput: ''
        });
        setStep('title');
      }, 1000);
  
    } catch (error) {
      console.error("Submission failed:", error);
      setIsSubmitting(false);
      // Add error handling UI here if needed
    }
  }
  const handleAddAuthor = () => {
    const trimmedAuthor = formData.authorInput.trim();
    if (trimmedAuthor && !formData.authors.includes(trimmedAuthor)) {
      updateField('authors', [...formData.authors, trimmedAuthor]);
      updateField('authorInput', '');
    }
  }
  

  const handleRemoveAuthor = (author: string) => {
    updateField('authors', formData.authors.filter(a => a !== author))
  }

  const handleToggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
      updateField('tags', formData.tags.filter(t => t !== tag))
    } else if (formData.tags.length < 8) {
      updateField('tags', [...formData.tags, tag])
    }
  }

  const handleToggleUsage = (usage: string) => {
    if (formData.usage.includes(usage)) {
      updateField('usage', formData.usage.filter(u => u !== usage))
    } else {
      updateField('usage', [...formData.usage, usage])
    }
  }

  const renderStep = () => {
    const commonClasses = "w-full transition-all duration-300"

    switch (step) {
      case 'title':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Book className="h-6 w-6 text-purple-500" />
                <h2 className="text-2xl font-bold">What's this masterpiece called?</h2>
              </div>
              <p className="text-muted-foreground">No pressure, just the name of the paper, book, or article!</p>
              <Input
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., The Future of Artificial Intelligence"
                className="text-lg p-6 rounded-xl shadow-sm"
                autoFocus
              />
            </motion.div>
          </div>
        )

        case 'authors':
            return (
              <div className={commonClasses}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    <h2 className="text-2xl font-bold">Who should we thank for this masterpiece?</h2>
                  </div>
                  <p className="text-muted-foreground">Add the brilliant minds behind this work (optional)</p>
                  
                  <div className="flex gap-2">
                    <Input
                      value={formData.authorInput}
                      onChange={(e) => updateField('authorInput', e.target.value)}
                      placeholder="Type an author's name and press Enter"
                      className="text-lg p-4 rounded-xl shadow-sm flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddAuthor()
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddAuthor}
                      type="button"
                      variant="secondary"
                    >
                      Add Author
                    </Button>
                  </div>
        
                  <div className="flex flex-wrap gap-2">
                    {formData.authors.map((author) => (
                      <Badge
                        key={author}
                        variant="secondary"
                        className="text-sm py-2 px-3"
                      >
                        {author}
                        <button
                          className="ml-2 hover:text-red-500"
                          onClick={() => handleRemoveAuthor(author)}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              </div>
            )
      case 'date':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold">When was this published?</h2>
              </div>
              <p className="text-muted-foreground">Pick the publication date</p>
              
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && updateField('date', date)}
                  className="rounded-md border shadow"
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                />
              </div>
            </motion.div>
          </div>
        )

        case 'journal':
          return (
            <div className={commonClasses}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Link className="h-6 w-6 text-blue-500" />
                  <h2 className="text-2xl font-bold">Link to Academic Task</h2>
                </div>
                <p className="text-muted-foreground">Connect this citation to a relevant task (optional)</p>
                
                <Command className="rounded-lg border">
                  <CommandInput placeholder="Search tasks..." />
                  <CommandList>
                    <CommandEmpty>No open tasks found</CommandEmpty>
                    <CommandGroup heading="Current Tasks">
                      {tasks
                        .filter(task => !task.isClosed)
                        .map((task) => (
                          <CommandItem
                            key={task.id}
                            value={task.title}
                            onSelect={() => updateField('journal', task.id)}
                          >
                            <div className="flex items-center gap-2">
                              <CheckCircle className={cn(
                                "h-4 w-4",
                                formData.journal === task.id ? "text-green-500" : "text-muted-foreground"
                              )} />
                              <span>{task.title}</span>
                              <Badge variant="outline" className="ml-2">
                                {new Date(task.deadline).toLocaleDateString()}
                              </Badge>
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
                
                {formData.journal && (
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-sm">
                      Linked to: {tasks.find(t => t.id === formData.journal)?.title}
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )

      case 'doi':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Link className="h-6 w-6 text-indigo-500" />
                <h2 className="text-2xl font-bold">Got a DOI or link for this work?</h2>
              </div>
              <p className="text-muted-foreground">Add a DOI or URL to help others find this work</p>
              <Input
                value={formData.doi}
                onChange={(e) => updateField('doi', e.target.value)}
                placeholder="e.g., 10.1000/xyz123 or https://..."
                className="text-lg p-6 rounded-xl shadow-sm"
              />
              <p className="text-sm text-muted-foreground italic">
                Don't worry if you don't have a DOI. You can always use the URL where this paper lives.
              </p>
            </motion.div>
          </div>
        )

      case 'tags':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-6 w-6 text-pink-500" />
                <h2 className="text-2xl font-bold">How would you describe this work?</h2>
              </div>
              <p className="text-muted-foreground">
                Select up to 8 tags ({formData.tags.length}/8)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {predefinedTags.map((tag) => (
                  <motion.button
                    key={tag.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleTag(tag.value)}
                    className={cn(
                      "p-4 rounded-xl transition-all text-left",
                      formData.tags.includes(tag.value)
                        ? "bg-primary/10 border-2 border-primary shadow-lg"
                        : cn("hover:bg-muted/80 border-2 border-transparent", tag.color)
                    )}
                    disabled={!formData.tags.includes(tag.value) && formData.tags.length >= 8}
                  >
                    {tag.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )

      case 'usage':
        return (
          <div className={commonClasses}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold">Where will you cite this work?</h2>
              <p className="text-muted-foreground">Select all that apply</p>
              <div className="grid gap-3">
                {usageOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleToggleUsage(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl transition-all text-left",
                      formData.usage.includes(option.value)
                        ? "bg-primary/10 border-2 border-primary shadow-lg"
                        : "hover:bg-muted/80 border-2 border-transparent"
                    )}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-medium">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )
    }
  }

  return (
    <>
      {showConfetti && <Confetti />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                </div>
                <Progress value={progress} className="w-[100px]" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  (step === 'title' && !formData.title) ||
                  (step === 'authors' && formData.authors.length === 0) ||
                  isSubmitting
                }
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : step === 'usage' ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Cite it like a pro!
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}