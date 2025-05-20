"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useAudio } from "@/components/audio/audio-provider"
import { Button } from "@/components/ui/button"
import { Play, BookOpen, Star, Users, Plus, UserPlus } from "lucide-react"
import { useEffect, useState } from "react"
import { CreateCourseDialog } from "./create-course-dialog"
import Cookies from 'js-cookie'
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
  progress: number
  rating: number
  students: number
  tags: string[]
  instructor: string
  createdById: string  // Add createdById to interface
  coverPhoto?: string | null
}

interface UserProfile {
  sub: string
  // Add other user properties if needed
}

export function CourseGrid() {
  const { playClick } = useAudio()
  const [showDialog, setShowDialog] = useState(false)
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [showMemberDialog, setShowMemberDialog] = useState(false)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!response.ok) throw new Error("Failed to fetch user profile")
        const userData = await response.json()
        setCurrentUser(userData)
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    const fetchCourses = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/academic/courses/by-me", {
          headers: { Authorization: `Bearer ${token}` }
        })

        if (!response.ok) throw new Error("Failed to fetch courses")
        const data = await response.json()
        
        const baseCourses = data.map((course: any) => ({
          id: course.id,
          title: course.title,
          progress: course.progress || 0,
          rating: course.rating || 0,
          students: 0,
          tags: Array.isArray(course.tags) ? course.tags : [],
          instructor: course.instructor?.name || "Unknown Instructor",
          createdById: course.createdById,  // Add createdById from API
          coverPhoto: course.coverPhoto
        }))

        const coursesWithStudents = await Promise.all(
          baseCourses.map(async (course) => {
            try {
              const membersResponse = await fetch(
                `http://localhost:3000/academic/members/${course.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              
              if (!membersResponse.ok) return course
              const studentCount = await membersResponse.json()
              
              return { ...course, students: Number(studentCount) || 0 }
            } catch (error) {
              console.error(`Error fetching members for course ${course.id}:`, error)
              return course
            }
          })
        )

        setCourses(coursesWithStudents)
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setLoading(false)
        }
      }

    fetchUserProfile().then(fetchCourses)
  }, [])

  // Add rating stars display component
  const handleAddMember = (courseId: string) => {
    setSelectedCourseId(courseId)
    setShowMemberDialog(true)
  }
  
  const updateCourseMembers = async (courseId: string, memberIds: string[]) => {
    try {
      const token = Cookies.get('token')
      const response = await fetch(`http://localhost:3000/academic/course/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ memberIds })
      })
  
      if (!response.ok) throw new Error('Failed to update members')
      
      setCourses(prev => prev.map(course => 
        course.id === courseId ? { ...course, students: memberIds.length } : course
      ))
    } catch (error) {
      console.error('Error updating members:', error)
    }
  }
  
  // Modified RatingStars component with click handler
  const RatingStars = ({ 
    rating,
    onClick 
  }: { 
    rating: number 
    onClick?: (rating: number) => void 
  }) => (
    <div className="flex items-center gap-1">
      {[...Array(10)].map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} 
            ${onClick ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => onClick?.(index + 1)}
        />
      ))}
    </div>
  )
  
  
  const getCourseImage = (title: string, coverImage?: string | null) => {
    // Priority 1: Use existing cover photo
    if (coverImage) return coverImage
    
    // Priority 2: Try to find image based on course title
    const sanitizedTitle = title.trim().replace(/[^a-zA-Z0-9 ]/g, '')
    
    // Check if title is viable for search (at least 3 meaningful characters)
    if (sanitizedTitle.length >= 3) {
      const keywords = encodeURIComponent(sanitizedTitle)
      return `https://source.unsplash.com/featured/800x400/?${keywords},education`
    }

    // Fallback: Use default mathematics image
    return "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop"
  }

  if (loading) {
    return <div className="p-6 text-center">Loading courses...</div>
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Courses</h2>
        <Button onClick={() => setShowDialog(true)} variant="outline">
          <BookOpen className="mr-2 h-4 w-4" />
          New Course
        </Button>
        <CreateCourseDialog open={showDialog} onOpenChange={setShowDialog} />
      </div>

      <div className="grid gap-6">
        <AnimatePresence>
          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No courses found. Create your first course!
            </div>
          ) : (
            courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl"
                onHoverStart={() => setHoveredCourse(course.id)}
                onHoverEnd={() => setHoveredCourse(null)}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ 
                    backgroundImage: `url(${getCourseImage(course.title, course.coverPhoto)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40" />

              <div className="relative p-6 flex flex-col h-full">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                  {course.tags.map((tag) => (
  <span
    key={tag.id || tag.name}
    className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white"
  >
    {typeof tag === 'string' ? tag : tag.name}
  </span>
))}

                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {course.title}
                  </h3>

                  <p className="text-sm text-white/80 mb-4">
                    by {course.instructor}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400" />
                      {course.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {course.students.toLocaleString()} students
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">
                      {course.progress}% Complete
                    </span>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => playClick()}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                </div>

                {hoveredCourse === course.id && (
              <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm gap-4"
            >
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-black hover:bg-white/90 w-48"
                onClick={() => {
                  playClick()
                  router.push(`http://localhost:3001/academic/${course.id}`)
                }}
              >
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </Button>
          
              {currentUser?.sub === course.createdById ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent text-white hover:bg-white/10 w-48"
                  onClick={() => {
                    playClick()
                    handleAddMember(course.id)
                  }}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Member
                </Button>
              ) : (
                <div className="bg-white/10 p-4 rounded-lg w-48 text-center">
                  <h4 className="text-sm font-medium text-white mb-2">Course Rating</h4>
                  <RatingStars 
                    rating={course.rating}
                    onClick={async (newRating) => {
                      try {
                        const token = Cookies.get('token')
                        const response = await fetch(
                          `http://localhost:3000/academic/course/${course.id}`,
                          {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ rating: newRating })
                          }
                        )
          
                        if (!response.ok) throw new Error('Failed to update rating')
                        
                        setCourses(prev => prev.map(c => 
                          c.id === course.id ? { ...c, rating: newRating } : c
                        ))
                      } catch (error) {
                        console.error('Rating update error:', error)
                      }
                    }}
                  />
                  <span className="text-xs text-white/60 mt-1 block">
                    ({course.rating}/10)
                  </span>
                </div>
              )}
            </motion.div>
                )}
              </div>
            </motion.div>
         ))
        )}
        </AnimatePresence>
      </div>
    </div>
  )
}
