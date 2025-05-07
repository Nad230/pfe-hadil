"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Upload, Download, Search, Folder, File, ExternalLink } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Cookies from "js-cookie"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useParams, useSearchParams } from "next/navigation"
import { useMascotStore } from "@/lib/stores/mascot-store"
interface Task {
  id: string
  title: string
  isClosed: boolean
}

export function CourseResources() {
  const { setMood } = useMascotStore()
  const { id: courseId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [resources, setResources] = useState<any[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState("")
  const token = Cookies.get("token")
  const searchParams = useSearchParams()
  useEffect(() => {
    const autoUpload = searchParams.get('upload')
    if (autoUpload === 'true') {
      setShowUploadDialog(true)
    }
  }, [searchParams])

  useEffect(() => {
    fetchFiles()
    fetchOpenTasks()
  }, [])

  const fetchOpenTasks = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/academic/acadopentask/${courseId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) throw new Error("Failed to fetch tasks")
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchFiles = async () => {
    try {
      const res = await fetch("http://localhost:3000/files", {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setResources(data)
    } catch (err) {
      console.error("Error fetching files:", err)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setFileName(file.name) // Set default to original filename
    setShowUploadDialog(true)
  }

  const confirmUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('fileName', fileName)
    
    if (selectedTaskId) {
      formData.append('taskId', selectedTaskId)
    }

    try {
      const response = await fetch('http://localhost:3000/files/upload', {
        method: 'POST',
        body: formData,
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      setMood('celebrating', 'File uploaded successfully! 🎉')
      setTimeout(() => setMood('idle', ''), 3000)
  
      setShowUploadDialog(false)
      fetchFiles()
 
    } catch (error: any) {
      setMood('error', `Upload failed: ${error.message}`)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (mime: string) => {
    if (mime.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (mime.includes("word")) return <FileText className="h-4 w-4" />;
    if (mime.includes("presentation")) return <ExternalLink className="h-4 w-4" />;
    if (mime.includes("image")) return <File className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };


  return (
    <div className="space-y-6">
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
      <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>File Name</Label>
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter file name"
              />
            </div>

            <div>
              <Label>Link to Task (optional)</Label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a task</option>
                {tasks
                  .filter(task => !task.isClosed)
                  .map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
              </select>
            </div>

            <Button 
              onClick={confirmUpload} 
              disabled={uploading}
              className="w-full"
            >
              {uploading ? "Uploading..." : "Confirm Upload"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resource Hub</h2>
          <p className="text-muted-foreground">Manage your research materials and documents</p>
        </div>
        <Button onClick={handleUploadClick} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Files'}
        </Button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Files</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search files..." className="pl-8" />
              </div>
              <Button variant="outline">
                <Folder className="mr-2 h-4 w-4" />
                Browse All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-muted">
                    {getFileIcon(resource.type)}
                  </div>
                  <div>
                    <h3 className="font-medium">{resource.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{resource.type}</span>
                      <span>•</span>
                      <span>{formatSize(resource.size)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => window.open(resource.url, "_blank")}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}