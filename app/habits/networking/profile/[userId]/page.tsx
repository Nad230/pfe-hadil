"use client"

import { useParams } from "next/navigation"
import UserProfile from "@/components/networking/profile/user-profile"

export default function ProfilePage() {
  const { userId } = useParams() as { userId: string }

  return <UserProfile userId={userId} />
}
