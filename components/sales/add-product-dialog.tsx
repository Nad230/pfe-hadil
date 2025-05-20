"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Cookies from "js-cookie"
import { useTranslation } from "@/components/context/translation-context";

const predefinedIcons = ["🍓", "☕", "🛒", "🎂", "📦", "🍕", "🎁", "✈️"] as const
const iconEnum = z.enum(predefinedIcons)

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
  icon: z.union([iconEnum, z.string().min(1, "Icon is required")]),
})

interface AddProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProductAdded: () => void // ❗️REMOVE the `?` (optional mark)
}

export function AddProductDialog({
  open,
  onOpenChange,
  onProductAdded, // 👈 Add this
}: AddProductDialogProps){
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: "🍓",
    },
  })
    const { t } = useTranslation();
  

  const currentIcon = form.watch("icon")
  const isCustomIcon = !predefinedIcons.includes(currentIcon as any)

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const token = Cookies.get("token")
      if (!token) throw new Error("No authentication token found")

      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.name,
          price: parseFloat(values.price),
          icon: values.icon,
        }),
      })

      if (!response.ok) throw new Error("Failed to create product")

      form.reset()
      onOpenChange(false)
      onProductAdded() // 👈 Call this after adding product
    } catch (error) {
      console.error("Submission error:", error)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Add New Product")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Price")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={() => (
                <FormItem>
                  <FormLabel>{t("Icon")}</FormLabel>
                  <Select
                    value={isCustomIcon ? "other" : currentIcon}
                    onValueChange={(value) => {
                      if (value === "other") {
                        form.setValue("icon", "")
                      } else {
                        form.setValue("icon", value as typeof predefinedIcons[number])
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select icon" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedIcons.map((icon) => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                      <SelectItem value="other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {isCustomIcon && (
                    <FormControl>
                      <Input
                        placeholder="Enter custom emoji or text"
                        value={currentIcon}
                        onChange={(e) => form.setValue("icon", e.target.value)}
                        className="mt-2"
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {t("Add Product")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}