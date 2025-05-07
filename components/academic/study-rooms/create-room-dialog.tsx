"use client"

import { useState,useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import EmojiPicker from 'emoji-picker-react';
import { MessageCircle, Users, Lock, FileText, Share2, Calendar, Edit3, Monitor, Sparkles, Check, BookOpen, GraduationCap } from "lucide-react"
import confetti from 'canvas-confetti'
import Cookies from 'js-cookie'
import { useMascotStore } from '@/lib/stores/mascot-store'


interface CreateRoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type RoomType = "voice" | "text" | "resource" | "office"
type RoomPrivacy = "public" | "private" | "personal" | "specific"

interface RoomData {
  name: string
  types: RoomType[]
  privacy: RoomPrivacy
  members: string[]
  description: string
  icon: string
  courseId?: string  // Add new field for course connection
}
const mockCourses = [
  { id: "phy101", name: "Physics 101 🚀", code: "PHY-101", description: "Introduction to Classical Mechanics" },
  { id: "math201", name: "Calculus II 📈", code: "MATH-201", description: "Advanced Integration Techniques" },
  { id: "cs301", name: "Algorithms 💻", code: "CS-301", description: "Data Structures & Algorithm Analysis" },
]

const ROOM_TYPES = [
  { id: "voice", label: "Voice Chat", icon: MessageCircle },
  { id: "text", label: "Text Chat", icon: FileText },
  { id: "resource", label: "Resource Sharing", icon: Share2 },
  { id: "office", label: "Teacher's Office", icon: Users }
] as const

const mockUsers = [
  { id: "1", name: "Alice Cooper", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50" },
  { id: "2", name: "Bob Wilson", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50" },
  { id: "3", name: "Carol Smith", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" }
]

export function CreateRoomDialog({ open, onOpenChange }: CreateRoomDialogProps) {
  const [step, setStep] = useState(1)
  const { setMood, setIsVisible } = useMascotStore();

  const [roomData, setRoomData] = useState<RoomData>({
    name: "",
    types: [],
    privacy: "private",
    members: [],
    description: "",
    icon: "🎯",
    courseId: ""  // Changed from connectedCourse to courseId

  })
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [courseSearch, setCourseSearch] = useState("")
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const handleNext = () => {
    if (step < 7) {
      setMood('happy', `Let's move to step ${step + 1}!`);
      setStep(step + 1);
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setMood('teaching', `Going back to step ${step - 1}`);
      setStep(step - 1);
    }
  }
 
  const [realUsers, setRealUsers] = useState([]);
  const getAvatarUrl = (profilePhoto: string) => 
    `https://yourdomain.com/assets/avatars/${profilePhoto}.png`;

 
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = Cookies.get("token");
        const selectedCourse = courses.find(c => c.id === roomData.courseId);
        
        if (!selectedCourse) return;
  
        // Get all member IDs from the CourseMember array
        const memberIds = selectedCourse.CourseMember?.map(member => member.userId) || [];
  
        // Fetch details for all members
        const userRequests = memberIds.map(async (id) => {
          const response = await fetch(`http://localhost:3000/auth/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) throw new Error('Failed to fetch user');
          return response.json();
        });
  
        const users = await Promise.all(userRequests);
        setRealUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
  
    if (step === 6 && roomData.courseId) {
      fetchUserDetails();
    }
  }, [step, roomData.courseId, courses]);


  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token");
        const response = await fetch("http://localhost:3000/academic/courses/by-me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (open) fetchCourses();
  }, [open]);

  const handleCreateRoom = async () => {
    try {
      const token = Cookies.get("token") // Adjust the key if your token cookie is named differently
  
      const response = await fetch("http://localhost:3000/academic/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(roomData)
      })
  
      if (!response.ok) {
        throw new Error("Failed to create room")
      }
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMood('celebrating', 'Room created successfully! 🎉');
      setIsVisible(true);
  
      const data = await response.json()
      console.log("Room created successfully:", data)
  
      // success feedback
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
      onOpenChange(false)
      setStep(1)
      setRoomData({
        name: "",
        types: [],
        privacy: "private",
        members: [],
        description: "",
        icon: "🎯",
        courseId: '',

      })
    } catch (err) {
      console.error("Error creating room:", err);
      setMood('error', 'Failed to create room 😢');
      setIsVisible(true);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-visible">
        <div className="relative min-h-[400px]">
          {/* Floating Orbs Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"
              animate={{
                x: [0, 100, 0],
                y: [0, 50, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute right-0 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-teal-500/20 blur-xl"
              animate={{
                x: [0, -100, 0],
                y: [0, 100, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Content */}
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
                      {roomData.icon}
                    </motion.button>
                    <div>
                      <h2 className="text-2xl font-bold">Create a New Room</h2>
                      <p className="text-muted-foreground">Give your room a name and personality</p>
                    </div>
                  </div>

                  {showEmojiPicker && (
                    <div className="absolute z-50">
                      <EmojiPicker
                        onEmojiClick={(emoji) => {
                          setRoomData(prev => ({ ...prev, icon: emoji.emoji }))
                          setShowEmojiPicker(false)
                        }}
                      />
                    </div>
                  )}

                  <Input
                    placeholder="e.g. 'Physics Study Group'"
                    value={roomData.name}
                    onChange={(e) => setRoomData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Room Type</h2>
                      <p className="text-muted-foreground">What kind of room is this?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {ROOM_TYPES.map(({ id, label, icon: Icon }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setRoomData(prev => ({
                            ...prev,
                            types: prev.types.includes(id as RoomType)
                              ? prev.types.filter(t => t !== id)
                              : [...prev.types, id as RoomType]
                          }))
                        }}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          roomData.types.includes(id as RoomType)
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <Icon className={`h-8 w-8 ${
                            roomData.types.includes(id as RoomType)
                              ? 'text-purple-500'
                              : 'text-gray-500'
                          }`} />
                          <span className="font-medium">{label}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Privacy Settings</h2>
                      <p className="text-muted-foreground">Who can join this room?</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    {[
                      { id: 'public', label: 'Public', description: 'Anyone can join', icon: '🌍' },
                      { id: 'private', label: 'Private', description: 'Only invited members', icon: '🔒' },
                      { id: 'personal', label: 'Only Me', description: 'Personal workspace', icon: '👤' },
                      { id: 'specific', label: 'Specific People', description: 'Choose who can join', icon: '👥' }
                    ].map(({ id, label, description, icon }) => (
                      <motion.button
                        key={id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setRoomData(prev => ({ ...prev, privacy: id as RoomPrivacy }))}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          roomData.privacy === id
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                            : 'border-gray-200 hover:border-teal-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{icon}</span>
                          <div className="text-left">
                            <div className="font-medium">{label}</div>
                            <div className="text-sm text-muted-foreground">{description}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Room Description</h2>
                      <p className="text-muted-foreground">Describe your room's purpose and guidelines</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid w-full gap-1.5">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        value={roomData.description}
                        onChange={(e) => setRoomData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter a detailed description of your room..."
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      />
                    </div>
                  </div>
                </div>
              )}
              {step === 5 && (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Connect to Course 📚</h2>
          <p className="text-muted-foreground">Link this room to an academic course</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            <span className="font-medium">Not required, but recommended for study groups! 🎓</span>
          </div>
          
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Search courses..." 
              value={courseSearch}
              onValueChange={setCourseSearch}
            />
            <CommandList>
              <CommandEmpty>No courses found. Try a different search? 🔍</CommandEmpty>
              <CommandGroup heading="Available Courses">
        {coursesLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading courses... 📚
          </div>
        ) : (
          courses
            .filter(course => 
              course.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
              course.description.toLowerCase().includes(courseSearch.toLowerCase())
            )
            .map(course => (
              <CommandItem
                key={course.id}
                onSelect={() => {
                  setRoomData(prev => ({
                    ...prev,
                    courseId: prev.courseId === course.id ? undefined : course.id
                 
                  }))
                }}
                className="flex items-center gap-2 p-2"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div className="flex-1">
                    <div className="font-medium">{course.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {course.description}
                      {course.tags?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {course.tags.map((tag: any) => (
                            <span 
                              key={tag.id}
                              className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {roomData.courseId && (
  <div className="flex items-center gap-2 text-sm">
    <BookOpen className="h-4 w-4" />
    <span className="font-medium">
      Connected to: {courses.find(c => c.id === roomData.courseId)?.title}
    </span>
  </div>
)}
              </CommandItem>
            ))
        )}
      </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </div>
    </div>
  )}


              {step === 6 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Add Members</h2>
                      <p className="text-muted-foreground">Invite people to your room</p>
                    </div>
                  </div>

                  <Command className="rounded-lg border shadow-md">
                    <CommandInput placeholder="Search people..." />
                    <CommandList>
                      <CommandEmpty>No people found.</CommandEmpty>
                      <CommandGroup heading="Course Members">
      {realUsers.length === 0 ? (
        <CommandEmpty>No members found in this course</CommandEmpty>
      ) : (
        realUsers.map(user => (
          <CommandItem
            key={user.id}
            onSelect={() => {
              setRoomData(prev => ({
                ...prev,
                members: prev.members.includes(user.id)
                  ? prev.members.filter(id => id !== user.id)
                  : [...prev.members, user.id]
              }));
            }}
            className="flex items-center gap-2 p-2"
          >
            <div className="flex items-center gap-2 flex-1">
              <img
                src={getAvatarUrl(user.profile_photo)}
                alt={user.fullname}
                className="w-8 h-8 rounded-full"
              />
              <div>
                <span>{user.fullname}</span>
                <div className="text-xs text-muted-foreground">
                  {user.role} • {user.packageType}
                </div>
              </div>
            </div>
            {roomData.members.includes(user.id) && (
              <div className="text-green-500">
                <Check className="h-4 w-4" />
              </div>
            )}
          </CommandItem>
        ))
      )}
    </CommandGroup>
                    </CommandList>
                  </Command>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Ready to Launch!</h2>
                      <p className="text-muted-foreground">Your room is ready to go</p>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{roomData.icon}</span>
                        <h3 className="text-2xl font-bold">{roomData.name}</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {roomData.types.map(type => (
                          <span
                            key={type}
                            className="px-3 py-1 rounded-full bg-white/50 dark:bg-white/10 text-sm font-medium"
                          >
                            {type}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Lock className="h-4 w-4" />
                        <span className="capitalize">{roomData.privacy}</span>
                      </div>

                      {roomData.description && (
                        <p className="text-sm text-muted-foreground">
                          {roomData.description}
                        </p>
                      )}
                      {roomData.connectedCourse && (
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="h-4 w-4" />
          <span className="font-medium">
            Connected to: {mockCourses.find(c => c.id === roomData.connectedCourse)?.name}
          </span>
        </div>
      )}
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
    onClick={step === 7 ? handleCreateRoom : handleNext}
    disabled={step === 1 && !roomData.name.trim()}
    className="bg-gradient-to-r from-violet-500 to-purple-500 text-white"
  >
    {step === 7 ? (
      'Create Room ✨'
    ) : (
      'Next'
    )}
  </Button>
</div>

{roomData.connectedCourse && (
  <div className="flex items-center gap-2 text-sm">
    <BookOpen className="h-4 w-4" />
    <span className="font-medium">
      Connected to: {courses.find(c => c.id === roomData.connectedCourse)?.title}
    </span>
  </div>
)}
        </div>
      </DialogContent>
    </Dialog>
  )
}