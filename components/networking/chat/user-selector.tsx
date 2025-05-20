"use client"

import type React from "react"

import { useState } from "react"
import { X, Search, Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  avatar: string
}

interface UserSelectorProps {
  selectedUsers: User[]
  searchResults: User[]
  isSearching: boolean
  onSearch: (query: string) => void
  onSelectUser: (user: User) => void
  onRemoveUser: (userId: string) => void
}

export default function UserSelector({
  selectedUsers,
  searchResults,
  isSearching,
  onSearch,
  onSelectUser,
  onRemoveUser,
}: UserSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {selectedUsers.map((user) => (
          <div key={user.id} className="flex items-center gap-1 bg-gray-100 rounded-full pl-1 pr-2 py-1">
            <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-6 h-6 rounded-full" />
            <span className="text-sm">{user.name}</span>
            <button onClick={() => onRemoveUser(user.id)} className="text-gray-500 hover:text-gray-700">
              <X size={14} />
            </button>
          </div>
        ))}

        <div className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {isSearching ? (
                <Loader2 size={16} className="text-gray-400 animate-spin" />
              ) : (
                <Search size={16} className="text-gray-400" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for people..."
              className="w-full pl-10 pr-4 py-2 border-0 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {searchQuery && searchResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border mt-1 max-h-60 overflow-y-auto">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => {
                onSelectUser(user)
                setSearchQuery("")
              }}
            >
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-10 h-10 rounded-full" />
              <span>{user.name}</span>
            </div>
          ))}
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-4 text-gray-500">No users found</div>
      )}
    </div>
  )
}
