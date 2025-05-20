"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Presentation as FilePresentation, Upload, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
})

interface CreatePresentationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreatePresentationDialog({ open, onOpenChange }: CreatePresentationDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Here you would typically create the presentation
    console.log(values)
    toast.success("Presentation created successfully")
    onOpenChange(false)
    form.reset()
  }

  const createOptions = [
    {
      title: "Blank Presentation",
      description: "Start from scratch with a blank presentation",
      icon: FilePresentation,
      onClick: () => form.handleSubmit(onSubmit)(),
    },
    {
      title: "Import from PowerPoint",
      description: "Upload an existing PowerPoint presentation",
      icon: Upload,
      onClick: () => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.pptx,.ppt'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            toast.success(`Importing ${file.name}`)
            onOpenChange(false)
          }
        }
        input.click()
      },
    },
    {
      title: "Import from Google Slides",
      description: "Connect and import from Google Slides",
      icon: FileSpreadsheet,
      onClick: () => {
        // Here you would implement Google Slides OAuth flow
        toast.success("Connecting to Google Slides...")
        onOpenChange(false)
      },
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Presentation</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter presentation title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter presentation description"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              {createOptions.map((option) => (
                <Button
                  key={option.title}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-2 text-center p-4"
                  onClick={option.onClick}
                >
                  <option.icon className="h-8 w-8" />
                  <div>
                    <div className="font-semibold">{option.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}