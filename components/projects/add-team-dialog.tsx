"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { X, Check, Search } from "lucide-react";
import Cookies from "js-cookie";

interface User {
  id: string;
  fullname: string;
  email: string;
  profile_photo?: string;
}

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: (teamData: { name: string; description: string; members: string[] }) => void;
  projectId: string;
}

export function AddTeamDialog({ open, onOpenChange, onTeamCreated, projectId }: AddTeamDialogProps) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `http://localhost:3000/auth/search?name=${encodeURIComponent(searchQuery)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.id) {
        setUser(null);
        setErrorMessage("No users found with that name");
        return;
      }

      setUser(data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching user:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleCreateTeam = () => {
    if (selectedMembers.length === 0) {
      console.warn("No members selected!");
      return;
    }
    onTeamCreated({ 
      name: teamName, 
      description: teamDescription, 
      members: selectedMembers 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-md">
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              placeholder="Search by full name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              className="absolute right-2 top-1/2 transform -translate-y-1/2" 
              onClick={handleSearch}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          
          {user && (
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.profile_photo} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user.fullname[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.fullname}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button
                className="ml-auto bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  if (!selectedMembers.includes(user.id)) {
                    setSelectedMembers((prev) => [...prev, user.id]);
                  }
                }}
              >
                Add
              </Button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((userId) => (
              <Badge 
                key={userId} 
                variant="secondary" 
                className="pl-1 pr-2 bg-blue-100 border-blue-200"
              >
                {user?.fullname || "Unknown User"}
                <X 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => setSelectedMembers(prev => prev.filter(id => id !== userId))} 
                />
              </Badge>
            ))}
          </div>
          
          <div className="space-y-2">
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
            />
            <Input
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              placeholder="Enter team description"
            />
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleCreateTeam} 
              disabled={selectedMembers.length === 0} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Create Team
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}