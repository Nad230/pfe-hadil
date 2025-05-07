"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { Check, ChevronRight, Sparkles, Users, Hash, Palette, Rocket, X, Lock, BookOpen } from "lucide-react"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'
import EmojiPicker from 'emoji-picker-react'

interface CreateCourseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3 | 4 | 5 | 6

interface CourseData {
  title: string
  memberIds: string[]
  tags: string[]
  visibility: "public" | "private" | "invite-only"
  theme: "clean" | "space" | "chill" | "energetic"
  description: string
  emoji: string
}

interface User {
  id: string
  fullname: string
  avatar: string
}

const themeColors = {
  clean: { primary: "bg-blue-500", secondary: "bg-blue-100", accent: "text-blue-700" },
  space: { primary: "bg-purple-500", secondary: "bg-purple-100", accent: "text-purple-700" },
  chill: { primary: "bg-teal-500", secondary: "bg-teal-100", accent: "text-teal-700" },
  energetic: { primary: "bg-orange-500", secondary: "bg-orange-100", accent: "text-orange-700" }
}

export function CreateCourseDialog({ open, onOpenChange }: CreateCourseDialogProps) {
  const [step, setStep] = useState<Step>(1)
  const { setMood, setIsVisible } = useMascotStore()
  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    memberIds: [],
    tags: [],
    visibility: "private",
    theme: "clean",
    description: "",
    emoji: "🎓"
  })
  const [currentTag, setCurrentTag] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedUser, setSearchedUser] = useState<User | null>(null)
  const [searchError, setSearchError] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchedUser(null);

    try {
      const response = await fetch(`http://localhost:3000/auth/${searchQuery}`);
      if (!response.ok) {
        setSearchError("No user found with this ID. Please try again.");
        return;
      }

      const data = await response.json();
      if (!data.fullname) {
        setSearchError("Invalid user data received.");
        return;
      }

      setSearchedUser(data);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError("Something went wrong. Try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleNext = () => {
    if (step < 7) {
      setMood('happy', `Moving to step ${step + 1}!`)
      setStep(prev => (prev + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setMood('teaching', `Returning to step ${step - 1}`)
      setStep(prev => (prev - 1) as Step)
    }
  }

  const handleCreateCourse = async () => {
    try {
      const token = Cookies.get("token")
      const response = await fetch("http://localhost:3000/academic/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(courseData)
      })

      if (!response.ok) throw new Error("Failed to create course")
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      setMood('celebrating', 'Course created successfully! 🎉')
      setIsVisible(true)
      
      onOpenChange(false)
      setStep(1)
      setCourseData({
        title: "",
        memberIds: [],
        tags: [],
        visibility: "private",
        theme: "clean",
        description: "",
        emoji: "🎓"
      })
    } catch (err) {
      console.error("Error creating course:", err)
      setMood('error', 'Failed to create course 😢')
      setIsVisible(true)
    }
  }

  const addTag = () => {
    if (currentTag && !courseData.tags.includes(currentTag)) {
      setCourseData(prev => ({ ...prev, tags: [...prev.tags, currentTag] }))
      setCurrentTag("")
    }
  }

  const removeTag = (tag: string) => {
    setCourseData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const addMember = (userId: string) => {
    if (!courseData.memberIds.includes(userId)) {
      setCourseData(prev => ({ ...prev, memberIds: [...prev.memberIds, userId] }))
    }
  }

  const removeMember = (userId: string) => {
    setCourseData(prev => ({ ...prev, memberIds: prev.memberIds.filter(id => id !== userId) }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <div className="relative min-h-[400px]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"
              animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute right-0 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-xl"
              animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <motion.button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="text-4xl hover:scale-110 transition-transform"
                      whileHover={{ rotate: 15 }}
                    >
                      {courseData.emoji}
                    </motion.button>
                    <div>
                      <h2 className="text-2xl font-bold">Create New Course</h2>
                      <p className="text-muted-foreground">Start with a captivating name</p>
                    </div>
                  </div>

                  {showEmojiPicker && (
                    <div className="absolute z-50">
                      <EmojiPicker
                        onEmojiClick={(emoji) => {
                          setCourseData(prev => ({ ...prev, emoji: emoji.emoji }))
                          setShowEmojiPicker(false)
                        }}
                      />
                    </div>
                  )}

                  <Input
                    placeholder="e.g. 'Advanced Quantum Mechanics'"
                    value={courseData.title}
                    onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Course Description</h2>
                      <p className="text-muted-foreground">Explain what this course is about</p>
                    </div>
                  </div>

                  <textarea
                    placeholder="Write a short summary of the course..."
                    value={courseData.description}
                    onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-md border p-3 min-h-[120px] resize-none"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Add Members</h2>
                      <p className="text-muted-foreground">Search users by ID</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Command className="flex-1 rounded-lg border shadow-md">
                      <CommandInput 
                        placeholder="Enter user ID..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <CommandList>
                        {isSearching ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Searching...
                          </div>
                        ) : (
                          <>
                            {searchError && (
                              <CommandItem className="text-destructive">
                                {searchError}
                              </CommandItem>
                            )}

                            {!searchError && !searchedUser && (
                              <CommandEmpty>
                                Enter a user ID and press Enter to search
                              </CommandEmpty>
                            )}

                            {searchedUser && (
                              <CommandGroup heading="Search Result">
                                <CommandItem
                                  onSelect={() => {
                                    addMember(searchedUser.id);
                                    setSearchQuery("");
                                    setSearchedUser(null);
                                  }}
                                  className="flex items-center gap-2 p-2 cursor-pointer"
                                >
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={searchedUser.avatar} />
                                    <AvatarFallback>
                                      {searchedUser.fullname?.[0] ?? "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <p className="font-medium">{searchedUser.fullname}</p>
                                    <p className="text-sm text-muted-foreground">
                                      User ID: {searchedUser.id}
                                    </p>
                                  </div>
                                  {courseData.memberIds.includes(searchedUser.id) ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </CommandItem>
                              </CommandGroup>
                            )}
                          </>
                        )}
                      </CommandList>
                    </Command>
                    <Button onClick={handleSearch} variant="outline">Search</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {courseData.memberIds.map((userId) => (
                      <motion.div
                        key={userId}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Badge
                          variant="secondary"
                          className="pl-3 pr-2 py-1.5 flex items-center gap-1"
                        >
                          <span className="truncate max-w-[120px]">{userId}</span>
                          <button
                            onClick={() => removeMember(userId)}
                            className="ml-1 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4&& (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                      <Hash className="h-6 w-6 text-teal-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Course Tags</h2>
                      <p className="text-muted-foreground">Add relevant topics</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} variant="outline">Add</Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {courseData.tags.map((tag) => (
                      <motion.div
                        key={tag}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        <Badge
                          variant="secondary"
                          className="pl-3 pr-2 py-1.5 flex items-center gap-1"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Course Visibility</h2>
                      <p className="text-muted-foreground">Control access to your course</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { id: 'public', label: 'Public', icon: '🌍', desc: 'Visible to everyone' },
                      { id: 'private', label: 'Private', icon: '🔒', desc: 'Only enrolled students' },
                      { id: 'invite-only', label: 'Invite Only', icon: '✉️', desc: 'By invitation only' }
                    ].map(({ id, label, icon, desc }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCourseData(prev => ({ ...prev, visibility: id as any }))}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          courseData.visibility === id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{icon}</span>
                          <div className="text-left">
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{desc}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Palette className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Course Theme</h2>
                      <p className="text-muted-foreground">Choose visual style</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {(Object.keys(themeColors) as (keyof typeof themeColors)[]).map((theme) => (
                      <motion.button
                        key={theme}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setCourseData(prev => ({ ...prev, theme }))}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          courseData.theme === theme
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className={`h-20 rounded-lg ${themeColors[theme].primary} mb-3`} />
                        <div className="font-medium capitalize">{theme}</div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Ready to Launch!</h2>
                      <p className="text-muted-foreground">Review your course details</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-4xl">{courseData.emoji}</span>
                      <h3 className="text-2xl font-bold">{courseData.tile}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {courseData.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>

                    <div className="grid gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4" />
                        <span className="capitalize">{courseData.visibility}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Palette className="h-4 w-4" />
                        <span className="capitalize">{courseData.theme} theme</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
            >
              Back
            </Button>
            
            <Button
              onClick={step === 7 ? handleCreateCourse : handleNext}
              disabled={step === 1 && !courseData.title.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              {step === 7 ? 'Create Course 🚀' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}