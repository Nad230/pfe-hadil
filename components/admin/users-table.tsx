"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search } from "lucide-react"
import { toast } from "sonner"
import Cookies from "js-cookie"

interface User {
  id: string
  fullname: string
  email: string
  package: "SILVER" | "GOLD" | "DIAMOND"
  isActive: boolean
  createdAt: string
}

const packageColors = {
  SILVER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  GOLD: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  DIAMOND: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100"
}

export function UsersTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch("http://localhost:3000/auth", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch users")
        const data = await response.json()
        setUsers(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load users")
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => 
    user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    const originalUsers = [...users]
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: newStatus } : user
      ))

      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/auth/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: newStatus })
      })

      if (!response.ok) throw new Error("Failed to update status")
      toast.success(`User status updated to ${newStatus ? "active" : "suspended"}`)
    } catch (err) {
      setUsers(originalUsers)
      toast.error("Failed to update user status")
    }
  }

  const handlePackageChange = async (userId: string, newPackage: "SILVER" | "GOLD" | "DIAMOND") => {
    const originalUsers = [...users]
    try {
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, package: newPackage } : user
      ))

      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/auth/${userId}/package`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ package: newPackage })
      })

      if (!response.ok) throw new Error("Failed to update package")
      toast.success(`User package updated to ${newPackage}`)
    } catch (err) {
      setUsers(originalUsers)
      toast.error("Failed to update user package")
    }
  }

  if (loading) return <div className="p-4 text-center">Loading users...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={packageColors[user.package]} variant="secondary">
                    {user.package}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.isActive ? "default" : "destructive"}
                  >
                    {user.isActive ? "active" : "suspended"}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(user.id, !user.isActive)}
                      >
                        {user.isActive ? "Suspend" : "Activate"} User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePackageChange(user.id, "SILVER")}>
                        Set to Silver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePackageChange(user.id, "GOLD")}>
                        Set to Gold
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePackageChange(user.id, "DIAMOND")}>
                        Set to Diamond
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}