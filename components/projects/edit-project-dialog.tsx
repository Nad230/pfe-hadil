"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddTeamDialog } from "./add-team-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Users, Globe, Lock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Cookies from "js-cookie";

import { Alert, AlertDescription } from "@/components/ui/alert"

// Add the confirmation dialog component
function ConfirmationDialog({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description 
}: { 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface TeamMember {
  id: string;
  fullName?: string;
  avatar?: string;
  role?: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
}

interface Project {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  visibility?: string;
  teamId?: string;
  teamType?: string;
  team?: Team;
  // Add other project properties as needed
}

interface EditProjectDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Partial<Project>) => Promise<void>
}

interface FormData extends Partial<Project> {
  teamType: "solo" | "team"
  teamMembers: TeamMember[]
  teamName?: string
  teamDescription?: string
  newTeamMembers?: string[] // For tracking newly added members
}

export function EditProjectDialog({ project, open, onOpenChange, onSubmit }: EditProjectDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    status: 'active',
    visibility: 'private',
    teamType: 'solo',
    teamMembers: [],
    teamName: "",
    teamDescription: "",
    newTeamMembers: [] // Initialize new members array
  });
  const [existingMemberIds, setExistingMemberIds] = useState<string[]>([]);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsTeamCreation, setNeedsTeamCreation] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [searchedUser, setSearchedUser] = useState<any>(null);
const [errorMessage, setErrorMessage] = useState("");
const handleSearch = async () => {
  if (!searchQuery.trim()) return;
  try {
    const token = Cookies.get("token");
    const response = await fetch(
      `http://localhost:3000/auth/search?name=${encodeURIComponent(searchQuery)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (!response.ok) {
      setErrorMessage("No users found");
      setSearchedUser(null);
      return;
    }

    const data = await response.json();
    setSearchedUser(data);
    setErrorMessage("");
  } catch (error) {
    setErrorMessage("An error occurred. Please try again.");
  }
};
  
  // State for member removal confirmation
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

  // Initialize form data when project changes or dialog opens
  useEffect(() => {
    if (project && open) {
      console.log("Opening edit dialog for project:", project);
      
      // Determine if project has a team
      const hasTeam = !!project.teamId;
      const initialTeamType = hasTeam ? "team" : "solo";
      
     setFormData({
  ...project,
  status: project.status || 'Active',
  visibility: project.visibility || 'private',
  teamType: initialTeamType,
  teamMembers: project.team?.members || [],
  teamName: project.team?.name || "",
  teamDescription: project.team?.description || "",
  newTeamMembers: []
});

      
      setNeedsTeamCreation(false); // Reset team creation flag
      
      // Only fetch team members if a team exists
      if (project.teamId) {
        fetchTeamMembers(project.teamId);
      }
    }
  }, [project, open]);


   const createTeam = async (projectId: string): Promise<string | null> => {
    try {
      const token = Cookies.get("token");
      const response = await fetch("http://localhost:3000/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.teamName || `${formData.name} Team`,
          description: formData.teamDescription || `Team for ${formData.name}`,
          projectId: projectId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create team");
      
      const team = await response.json();
      return team.id;
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error creating team",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      return null;
    }
  };


  // Fetch team members
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

  // Fetch user details
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
        role: "member" // Default role
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

  // Handle showing confirmation dialog
  const showRemoveConfirmationDialog = (member: TeamMember) => {
    setMemberToRemove(member);
    setShowRemoveConfirmation(true);
  };

  // Handle team member removal
// Handle team member removal
const handleRemoveTeamMember = async (memberId: string) => {
  try {
    // Check if we're creating a new team or if the project doesn't have a team ID
    if (needsTeamCreation || !project?.teamId) {
      // Remove from local state
      setFormData(prev => ({
        ...prev,
        teamMembers: prev.teamMembers.filter(m => m.id !== memberId),
        newTeamMembers: prev.newTeamMembers?.filter(id => id !== memberId)
      }));
      return;
    }

    // For existing teams, remove from the team
    const response = await fetch(
      `http://localhost:3000/team/${project.teamId}/remove-member/${memberId}`, // FIXED: Use teamId from project
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to remove member");

    // Update local state and existing members
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== memberId)
    }));
    setExistingMemberIds(prev => prev.filter(id => id !== memberId));

    toast({ title: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error); // Add console log
    toast({
      title: "Error removing member",
      description: error instanceof Error ? error.message : "Unknown error",
      variant: "destructive"
    });
  }
};

  // Add members to team
 const handleAddMember = async () => {
  if (!searchedUser || !project?.teamId) return;
  
  try {
    const token = Cookies.get("token");
    const response = await fetch(
      `http://localhost:3000/team/${project.teamId}/add-member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: searchedUser.id }),
      }
    );

    if (!response.ok) throw new Error("Failed to add member");
    
    // Update local state
    setFormData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, {
        id: searchedUser.id,
        fullName: searchedUser.fullname,
        avatar: searchedUser.profile_photo,
        role: "member"
      }]
    }));
    
    setSearchedUser(null);
    setSearchQuery("");
    setIsAddingMember(false);
    toast({ title: "Member added successfully" });

  } catch (error) {
    console.error("Error adding member:", error);
    toast({
      title: "Error adding member",
      description: error instanceof Error ? error.message : "Something went wrong",
      variant: "destructive",
    });
  }
};
  // Remove members from team
  const removeMembersFromTeam = async (teamId: string, memberIds: string[]) => {
    try {
      const token = Cookies.get("token");
  
      for (const userId of memberIds) {
        const response = await fetch(`http://localhost:3000/team/${teamId}/remove-member/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
  
        if (!response.ok) throw new Error(`Failed to remove member ${userId}`);
      }
  
      console.log(`✅ Successfully removed ${memberIds.length} members from team ${teamId}`);
    } catch (error) {
      console.error("Error removing members from team:", error);
      toast({
        title: "Error removing members",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Update project with team ID
  const updateProjectWithTeam = async (projectId: string, teamId: string) => {
    try {
      const token = Cookies.get("token");
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teamId: teamId
        }),
      });

      if (!response.ok) throw new Error("Failed to update project with team ID");
      
    } catch (error) {
      console.error("Error updating project with team ID:", error);
      toast({
        title: "Error linking team to project",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    // Always update project core fields first
    if (project?.id) {
      // Update project details regardless of team type
      const projectResponse = await fetch(`http://localhost:3000/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          status: formData.status,
          visibility: formData.visibility,
          name: formData.name,
          description: formData.description,
          ...(formData.teamType === 'solo' && { teamId: null }), // Clear team if switching to solo
        }),
      });

      if (!projectResponse.ok) throw new Error("Failed to update project");
      const updatedProject = await projectResponse.json();

      // Handle team creation if needed
      if (formData.teamType === "team" && needsTeamCreation) {
        const teamResponse = await fetch("http://localhost:3000/team/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({
            name: formData.teamName,
            description: formData.teamDescription,
            projectId: project.id,
            members: formData.newTeamMembers // Changed from TeamMembers to members
          }),
        });

        if (!teamResponse.ok) throw new Error("Team creation failed");
        const team = await teamResponse.json();

        // Update project with new team ID
        await updateProjectWithTeam(project.id, team.id);
        await fetchTeamMembers(team.id);
      }

      // Propagate changes to parent component
      await onSubmit(updatedProject);
    }

    // Close dialog after all operations
    onOpenChange(false);
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
  // Render team members
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
              onClick={() => showRemoveConfirmationDialog(member)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    );
  };

  // Render visibility message
  const renderVisibilityMessage = () => {
    if (formData.visibility === 'public') {
      return (
        <Alert className="mt-2">
          <Globe className="h-4 w-4 mr-2" />
          <AlertDescription>
            This project will be visible on your public profile and others can view its details.
          </AlertDescription>
        </Alert>
      );
    } else if (formData.visibility === 'private') {
      return (
        <Alert className="mt-2">
          <Lock className="h-4 w-4 mr-2" />
          <AlertDescription>
            This project will only be visible to you and won't appear on your profile.
          </AlertDescription>
        </Alert>
      );
    } else if (formData.visibility === 'team') {
      return (
        <Alert className="mt-2">
          <Users className="h-4 w-4 mr-2" />
          <AlertDescription>
            This project will only be visible to team members and won't appear on your public profile.
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

 const handleTeamCreation = async (teamData: { name: string, description: string, members: string[] }) => {
  try {
    // Fetch details for all new members
    const membersWithDetails = await Promise.all(
      teamData.members.map(async (userId) => {
        const userDetails = await fetchUserDetails(userId);
        return {
          id: userId,
          fullName: userDetails.fullName,
          avatar: userDetails.avatar,
          role: "member"
        };
      })
    );

    setFormData(prev => ({
      ...prev,
      teamName: teamData.name,
      teamDescription: teamData.description,
      newTeamMembers: teamData.members,
      teamMembers: membersWithDetails
    }));
    
    setNeedsTeamCreation(true);
    setShowTeamDialog(false);
  } catch (error) {
    console.error("Error creating team with members:", error);
    toast({
      title: "Error creating team",
      description: "Failed to load member details",
      variant: "destructive",
    });
  }
};
  return (
    <>
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
                  visibility: value
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
              {renderVisibilityMessage()}
            </div>

            <div className="space-y-2">
              <Label>Collaboration Type</Label>
              <Select
                value={formData.teamType}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    teamType: value as "solo" | "team",
                    teamMembers: value === "solo" ? [] : prev.teamMembers,
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
  type="button"
  variant="outline"
  size="sm"
  onClick={() => project?.teamId ? setIsAddingMember(true) : setShowTeamDialog(true)}
>
  {project?.teamId ? "Add Members" : "Create Team"}
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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
          
          {/* Team Dialog */}
          {showTeamDialog && (
            <AddTeamDialog
              open={showTeamDialog}
              onOpenChange={setShowTeamDialog}
              onTeamCreated={handleTeamCreation}
              onAddMembers={(selectedMembers) => {
                // For existing teams
                if (project?.teamId) {
                  // Only update local state for now, actual API calls happen on form submit
                  const newMembers = selectedMembers.filter(id => 
                    !formData.teamMembers.some(m => m.id === id)
                  ).map(id => ({
                    id,
                    fullName: 'New Member', // Temporary placeholder
                    role: 'member'
                  }));
                  
                  setFormData(prev => ({
                    ...prev,
                    teamMembers: [...prev.teamMembers, ...newMembers]
                  }));
                }
              }}
              projectId={project?.id} // Pass the project ID for team creation
              existingMemberIds={existingMemberIds}
              isEditMode={!!project?.teamId} // True if editing an existing team
            />
          )}
          {/* Add Member Dialog */}
<Dialog open={isAddingMember} onOpenChange={(open) => {
  setIsAddingMember(open);
  if (!open) {
    setSearchQuery("");
    setSearchedUser(null);
    setErrorMessage("");
  }
}}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Team Member</DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search by full name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      {errorMessage && (
        <div className="text-red-500 text-sm">{errorMessage}</div>
      )}
      {searchedUser && (
        <div className="p-2 border rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{searchedUser.fullname}</p>
              <p className="text-sm text-gray-500">{searchedUser.email}</p>
            </div>
            <Button size="sm" onClick={handleAddMember}>
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  </DialogContent>
</Dialog>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for removing team members */}
      {memberToRemove && (
        <ConfirmationDialog
          open={showRemoveConfirmation}
          onOpenChange={setShowRemoveConfirmation}
          onConfirm={() => handleRemoveTeamMember(memberToRemove.id)}
          title="Remove Team Member"
          description={`Are you sure you want to remove ${memberToRemove.fullName || 'this member'} from the team? Any tasks or milestones assigned to them will be updated. This action cannot be undone.`}
        />
      )}
    </>
  );
}