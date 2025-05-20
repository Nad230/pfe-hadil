"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Hash, Calendar as CalendarIcon, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { useRef, useState } from "react"
import Cookies from "js-cookie"

export default function SchedulerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPlatform, setSelectedPlatform] = useState("")
  const [selectedTime, setSelectedTime] = useState("12:00")
  const [caption, setCaption] = useState("")
  const [hashtags, setHashtags] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const platforms = [
    { value: "youtube", label: "YouTube" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" }
  ]

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleSchedulePost = async () => {
    if (!selectedPlatform || !selectedDate || !selectedTime || !file) {
      alert("Please fill in all required fields and select a file")
      return
    }

    const formData = new FormData()
    const token = Cookies.get("token")

    try {
      setIsSubmitting(true)

      // Combine date and time
      const [hours, minutes] = selectedTime.split(":")
      const scheduledAt = new Date(selectedDate)
      scheduledAt.setHours(parseInt(hours), parseInt(minutes))

      // Process hashtags
      const hashtagsArray = hashtags
        .split(/[\s,]+/)
        .map(tag => tag.replace(/^#/, ""))
        .filter(tag => tag.length > 0)

      // Build form data
      formData.append("file", file)
      formData.append("caption", caption)
      formData.append("platform", selectedPlatform)
      formData.append("hashtags", JSON.stringify(hashtagsArray))
      formData.append("scheduledAt", scheduledAt.toISOString())
      formData.append("status", "PENDING")

      const response = await fetch("http://localhost:3000/creator/createPost", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to schedule post")
      }

      // Reset form on success
      setSelectedPlatform("")
      setSelectedDate(new Date())
      setSelectedTime("12:00")
      setCaption("")
      setHashtags("")
      setFile(null)
      
      alert("Post scheduled successfully!")
    } catch (error) {
      console.error("Scheduling error:", error)
      alert(error.message || "An error occurred during scheduling")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Scheduler</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr,400px]">
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input 
                    type="date" 
                    value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""} 
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input 
                    type="time" 
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
        <label className="text-sm font-medium">Media</label>
        <div 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
          onClick={handleFileUpload}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Drag and drop or click to upload
          </p>
          {file && <p className="text-sm mt-2">{file.name}</p>}
        </div>
      </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Caption</label>
                <Textarea 
                  placeholder="Write your caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Hashtags</label>
                <Textarea 
                  placeholder="#yourbrand #marketing"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                  rows={2}
                />
                <Button variant="outline" className="w-full mt-2">
                  <Hash className="mr-2 h-4 w-4" />
                  Get AI Suggestions
                </Button>
              </div>

              <div className="flex gap-4">
      <Button className="flex-1" variant="outline">
        Save as Draft
      </Button>
      <Button 
        className="flex-1" 
        variant="default"
        onClick={handleSchedulePost}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Scheduling..." : "Schedule Post"}
      </Button>
    </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
          />

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
            </CardHeader>
            
          </Card>
        </div>
      </div>
    </div>
  )
}