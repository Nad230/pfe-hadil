// edit-project-dialog.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Project, TeamMember } from "@/lib/types/time-tracker" // Update your types
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddTeamDialog } from "./add-team-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Cookies from "js-cookie";


interface EditProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Project>) => Promise<void>
}

interface FormData extends Partial<Project> {
  teamType: "solo" | "team"
  teamMembers: TeamMember[]
}





export function EditProjectDialog({ project, open, onOpenChange, onSubmit }: EditProjectDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    status: 'active',
    visibility: 'private',
    teamType: 'solo',
    teamMembers: [],
    teamName: "",
    teamDescription: ""
  });
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);


  const addMembersToTeam = async (teamId: string, memberIds: string[]) => {
    try {
      const token = Cookies.get("token");
  
      for (const userId of memberIds) {
        const response = await fetch(`http://localhost:3000/team/${teamId}/add-member`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, role: "member" }), // Default role
        });
  
        if (!response.ok) throw new Error(`Failed to add member ${userId}`);
      }
  
      console.log(`✅ Successfully added ${memberIds.length} members to team ${teamId}`);
    } catch (error) {
      console.error("Error adding members to team:", error);
      toast({
        title: "Error adding members",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (project && open) {
      console.log("Opening edit dialog for project:", project);
      console.log("Project ID:", project.id); // Explicit ID logging
      
      const initialTeamType = project.teamType || (project.teamId ? "team" : "solo");
      
      setFormData({
        ...project,
        teamType: initialTeamType,
        teamMembers: project.team?.members || [],
        teamName: project.team?.name || "",
        teamDescription: project.team?.description || "",
      });
  
      if (project.teamId) {
        fetchTeamMembers(project.teamId);
      }
    }
  }, [project, open]);
  const fetchUserDetails = async (userId: string): Promise<TeamMember> => {
    try {
      const response = await fetch(`http://localhost:3000/auth/${userId}`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
      
      if (!response.ok) throw new Error("Failed to fetch user details");
      
      const userData = await response.json();
      return {
        id: userId,
        fullName: userData.fullname,
        avatar: userData.profile_photo,
        role: "member" // Default role, adjust if your API provides this
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        id: userId,
        fullName: "Unknown Member",
        avatar: undefined,
      };
    }
  };
  const fetchTeamMembers = async (teamId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/team/${teamId}/members`, {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` }
      });
  
      if (!response.ok) throw new Error("Failed to fetch team members");
      
      const members = await response.json();
      setExistingMemberIds(members.map((m: any) => m.userId)); 

      const membersWithDetails = await Promise.all(
        members.map(async (member: any) => fetchUserDetails(member.userId))
      );
  
      setFormData(prev => ({ 
        ...prev,
        teamMembers: membersWithDetails
      }));
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({ title: "Error fetching team", variant: "destructive" });
    }
  };
  

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (project?.id && open) {
        try {
          // Fetch latest project details
          const response = await fetch(`http://localhost:3000/projects/${project.id}`, {
            headers: { Authorization: `Bearer ${Cookies.get("token")}` }
          });
          
          if (!response.ok) throw new Error("Failed to fetch project details");
          
          const projectData = await response.json();
          
          // Determine team type
          const hasTeam = !!projectData.team?.id;
          const teamType = hasTeam ? "team" : "solo";
  
          setFormData({
            ...projectData,
            teamType,
            teamMembers: [],
            teamName: projectData.team?.name || "",
            teamDescription: projectData.team?.description || ""
          });
  
          if (hasTeam) {
            await fetchTeamMembers(projectData.team.id);
          }
        } catch (error) {
          console.error("Error fetching project:", error);
          toast({
            title: "Error loading project",
            description: error instanceof Error ? error.message : "Unknown error",
            variant: "destructive"
          });
        }
      }
    };
  
    fetchProjectDetails();
  }, [project, open]);

 
  
  
    // Only show suggestions after first section
    
    
    const handleRemoveTeamMember = async (memberId: string) => {
      if (!project?.team?.id) return
  
      try {
        // API call to remove member
        const response = await fetch(
          `http://localhost:3000/team/${project.team.id}/remove-member/${memberId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            credentials: "include",
          }
        )
  
        if (!response.ok) throw new Error("Failed to remove member")
  
        // Update local state
        setFormData(prev => ({
          ...prev,
          teamMembers: prev.teamMembers.filter(m => m.id !== memberId)
        }))
  
        toast({ title: "Member removed successfully" })
      } catch (error) {
        toast({
          title: "Error removing member",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        })
      }
    }
  
  const [showTeamDialog, setShowTeamDialog] = useState(false);

  useEffect(() => {
    if (project && open) {
      console.log("Opening edit dialog for project:", project);
      const initialTeamType = project.teamType || (project.teamId ? "team" : "solo");
  
      setFormData({
        ...project,
        teamType: initialTeamType,
        teamMembers: project.team?.members || [],
        teamName: project.team?.name || "",
        teamDescription: project.team?.description || "",
      });
  
      // ✅ Only fetch team members if a valid teamId exists
      if (project.teamId) {
        fetchTeamMembers(project.teamId);
      }
    }
  }, [project, open]);
  
  
  
  
  
 
  // In renderTeamMembers
  const renderTeamMembers = () => {
    if (formData.teamType !== 'team' || !formData.teamMembers?.length) return null;
  
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {formData.teamMembers.map(member => (
          <Badge key={member.id} variant="secondary" className="flex items-center gap-2 pl-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.fullName?.[0] || "?"}</AvatarFallback>
            </Avatar>
            <span>{member.fullName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 hover:bg-transparent"
              onClick={() => handleRemoveTeamMember(member.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    );
  };
  
const [isLoading, setIsLoading] = useState(false);
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    let teamId = formData.teamId;

   

    // Finally, update the project
    if (project?.id) {
      await onSubmit({
        ...formData,
        teamId: formData.teamType === "team" ? teamId : null,
        teamMembers: formData.teamType === "team" ? formData.teamMembers : [],
      });

      console.log("Project updated successfully");
      onOpenChange(false);
    }
  } catch (error) {
    console.error("Error saving project:", error);
    toast({
      title: "Error saving project",
      description: error instanceof Error ? error.message : "Something went wrong",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};





  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project Settings</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
  <Label htmlFor="status">Status</Label>
  <Select
    value={formData.status?.toLowerCase()} // Ensure lowercase matching
    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="idea">Idea</SelectItem>
      <SelectItem value="planning">Planning</SelectItem>
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="paused">Paused</SelectItem>
      <SelectItem value="completed">Completed</SelectItem>
    </SelectContent>
  </Select>
</div>

<div className="space-y-2">
  <Label htmlFor="visibility">Visibility</Label>
  <Select
    value={formData.visibility?.toLowerCase()}
    onValueChange={(value) => setFormData(prev => ({ 
      ...prev, 
      visibility: value.toUpperCase() === 'PUBLIC' ? 'public' : 
        value.toUpperCase() === 'TEAM' ? 'team' : 
        'private' 
    }))}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select visibility" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="private">Private</SelectItem>
      <SelectItem value="team">Team</SelectItem>
      <SelectItem value="public">Public</SelectItem>
    </SelectContent>
  </Select>
</div>

          <div className="space-y-2">
  <Label>Collaboration Type</Label>
  <Select
  value={formData.teamType ?? "solo"} // ✅ Ensure a default value is always set
  onValueChange={(value) =>
    setFormData((prev) => ({
      ...prev,
      teamType: value as "solo" | "team",
      teamMembers: value === "solo" ? [] : prev.teamMembers, // ✅ Clear team members if switching to solo
    }))
  }
>
  <SelectTrigger>
  <SelectValue placeholder="Select collaboration type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="solo">Working Solo</SelectItem>
    <SelectItem value="team">Team Collaboration</SelectItem>
  </SelectContent>
</Select>

{formData.teamType === "team" && (
  <div className="space-y-2 mt-4">
    <div className="flex items-center justify-between">
      <Label>Team Members</Label>
      <Button
  type="button" // Add this line
  variant="outline"
  size="sm"
  onClick={() => setShowTeamDialog(true)}
>
  Add Members
</Button>
    </div>

    {isLoading ? (
      <div className="text-muted-foreground text-sm">
        Loading team members...
      </div>
    ) : (
      renderTeamMembers()
    )}



    </div>
  )}
</div>

          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}