"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileHandlerProps {
  onFileSelect: (file: File) => void
  acceptedTypes?: string
  maxSize?: number // in MB
}

export default function FileHandler({ onFileSelect, acceptedTypes = "*", maxSize = 10 }: FileHandlerProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return false
    }

    // Check file type if specific types are required
    if (acceptedTypes !== "*") {
      const fileType = file.type
      const acceptedTypesArray = acceptedTypes.split(",")

      if (
        !acceptedTypesArray.some((type) => {
          if (type.includes("/*")) {
            const mainType = type.split("/")[0]
            return fileType.startsWith(`${mainType}/`)
          }
          return type === fileType
        })
      ) {
        setError("File type not supported")
        return false
      }
    }

    setError(null)
    return true
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (validateFile(file)) {
        setSelectedFile(file)
        onFileSelect(file)
      }
    }
  }

  const handleButtonClick = () => {
    inputRef.current?.click()
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      {selectedFile ? (
        <div className="border rounded-lg p-3 flex items-center justify-between">
          <div className="truncate">
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearSelectedFile}>
            <X size={16} />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input ref={inputRef} type="file" className="hidden" accept={acceptedTypes} onChange={handleChange} />
          <p className="mb-2 text-sm text-gray-500">
            Drag and drop a file here, or{" "}
            <button type="button" className="text-blue-500 hover:underline" onClick={handleButtonClick}>
              browse
            </button>
          </p>
          <p className="text-xs text-gray-400">Maximum file size: {maxSize}MB</p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  )
}
