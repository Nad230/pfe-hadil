"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { useOnboarding } from "../onboarding-context"
import Cookies from "js-cookie";

interface LanguageStepProps {
  onNext: () => void
  onBack: () => void
}

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ar", name: "عربي", flag: "🇹🇳" },
]

export function LanguageStep({ onNext, onBack }: LanguageStepProps) {
  const { data, updateData } = useOnboarding();
  

  const handleLanguageSelect = async (code: string) => {
    updateData({ language: code }); // Update local state/context
    try {
      await updateUserProfile(code); // Call the API with the selected language
      onNext(); // Proceed to next step after successful update
    } catch (error) {
      console.error("Failed to update language:", error);
      // Optionally show an error message to the user
    }
  };

 
  const updateUserProfile = async (language: string) => {
    try {
      const token = Cookies.get("token");
  
      const res = await fetch("http://localhost:3000/auth/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          language: language, // Send the language parameter
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        console.error("Server responded with:", data);
        throw new Error("Failed to update profile");
      }
  
      return data;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      throw error; // Re-throw to handle in the component
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Choose your language</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {languages.map((language, index) => (
            <motion.div
              key={language.code}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
               <Button
        variant={data.language === language.code ? "default" : "outline"}
        className="w-full justify-between text-lg h-16"
        onClick={() => handleLanguageSelect(language.code)} // Trigger update
      >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">{language.flag}</span>
                  <span>{language.name}</span>
                </span>
                {data.language === language.code && (
                  <Check className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={onNext}>
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}