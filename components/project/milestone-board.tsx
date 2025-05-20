"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MilestoneColumn } from "./milestone-column"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import Cookies from "js-cookie"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"


interface Milestone {
  id: string
  name: string
  description: string
  status: "planned" | "in_progress" | "completed"
  dueDate?: string
  priority: "low" | "medium" | "high"
  estimatedTime: number
  tasks: any[]
  assignedToId?: string
}
interface MilestoneBoardProps {
  project: {
    id: string
    milestones: Milestone[]
  }
  onMilestoneSelect: (id: string) => void
    userId: string

}

export function MilestoneBoard({ project, onMilestoneSelect, userId }: MilestoneBoardProps) {
  const params = useParams()
  const projectId = params.id as string
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)

  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    name: "",
    description: "",
    status: "planned",
    priority: "medium",
    estimatedTime: 0
  })
 
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [projectData, setProjectData] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [isAddingTeamMember, setIsAddingTeamMember] = useState(false)
  const [searchedUser, setSearchedUser] = useState<any>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const isOwner = currentUser?.sub === projectData?.userId;


  const UserChip = ({ user }: { user: any }) => {
    const isSelected = selectedAssignee === user.id
    const isCurrentlyAssigned = editingMilestone?.assignedToId === user.id
  
    return (
      <div
        className={cn(
          "flex items-center rounded-full px-4 py-2 cursor-pointer transition-colors",
          isSelected || isCurrentlyAssigned
            ? "bg-blue-100 border-2 border-blue-500 text-blue-800"
            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
        )}
        onClick={() => {
          if (isSelected) {
            // Unassign if clicking the already selected user
            setSelectedAssignee(null)
          } else {
            // Assign new user
            setSelectedAssignee(user.id)
          }
        }}
      >
        {user.profile_photo ? (
          <img
            src={user.profile_photo}
            className="h-6 w-6 rounded-full mr-2"
            alt={user.fullname}
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-gray-300 mr-2 flex items-center justify-center">
            {user.fullname?.[0]}
          </div>
        )}
        <span className="text-sm font-medium">{user.fullname}</span>
        {isCurrentlyAssigned && !isSelected && (
          <span className="ml-2 text-xs text-gray-500">(currently assigned)</span>
        )}
      </div>
    )
  }
  
  // Update handleAddMilestone and handleUpdateMilestone body formatting
  const handleAddMilestone = async () => {
    if (!newMilestone.name) {
      alert("Title is required")
      return
    }
  
    try {
      const token = Cookies.get("token")
      const response = await fetch('http://localhost:3000/milestones', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          name: newMilestone.name,
          description: newMilestone.description,
          status: newMilestone.status,
          priority: newMilestone.priority,
          estimatedTime: newMilestone.estimatedTime,
          startDate: newMilestone.startDate ? new Date(newMilestone.startDate).toISOString() : undefined,
          dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate).toISOString() : undefined,
          ...(selectedAssignee && { assignedToId: selectedAssignee }),
          assignedBy: currentUser?.id
        })
      })
  
      if (!response.ok) throw new Error("Failed to create milestone")
      
      setRefreshTrigger(prev => prev + 1)
      setShowAddDialog(false)
      setNewMilestone({
        name: "",
        description: "",
        status: "planned",
        priority: "medium",
        estimatedTime: 0
      })
      setSelectedAssignee(null)
    } catch (error) {
      console.error("Error adding milestone:", error)
      alert(error instanceof Error ? error.message : "Failed to create milestone")
    }
  }
  
  const handleUpdateMilestone = async () => {
  if (!editingMilestone) return

  // Check for unfinished tasks when trying to complete
  if (editingMilestone.status === "completed") {
    const hasUnfinishedTasks = editingMilestone.tasks.some(task => task.status !== "completed");
    if (hasUnfinishedTasks) {
      alert("Complete all tasks before marking milestone as completed");
      return;
    }
  }

  try {
    const token = Cookies.get("token")
    const response = await fetch(`http://localhost:3000/milestones/${editingMilestone.id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editingMilestone.name,
        description: editingMilestone.description,
        status: editingMilestone.status,
        priority: editingMilestone.priority,
        estimatedTime: editingMilestone.estimatedTime,
        startDate: editingMilestone.startDate ? new Date(editingMilestone.startDate).toISOString() : undefined,
        dueDate: editingMilestone.dueDate ? new Date(editingMilestone.dueDate).toISOString() : undefined,
        ...(selectedAssignee !== null && { assignedToId: selectedAssignee })
      })
    })

    if (!response.ok) throw new Error("Failed to update milestone")
    
    setRefreshTrigger(prev => prev + 1)
    setEditingMilestone(null)
    setSelectedAssignee(null)
  } catch (error) {
    console.error("Error updating milestone:", error)
    alert(error instanceof Error ? error.message : "Failed to update milestone")
  }
}
  
  // Update the useEffect for selectedAssignee
  useEffect(() => {
    if (editingMilestone) {
      // Initialize with current assignment
      setSelectedAssignee(editingMilestone.assignedToId || null)
    } else {
      // Reset when closing dialog
      setSelectedAssignee(null)
    }
  }, [editingMilestone])
  const AssignmentSection = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Assign To</label>
      <div className="flex flex-wrap gap-2">
        {teamMembers.map((member) => (
          <UserChip key={member.id} user={member} />
        ))}
{projectData?.team && (
  <button
    onClick={() => setIsAddingTeamMember(true)}
    className="flex items-center bg-blue-500 text-white rounded-full px-4 py-2 hover:bg-blue-600"
  >
    <Plus className="h-4 w-4 mr-1" /> Add Member
  </button>
)}

      </div>
      {!projectData?.team && (
        <div className="text-gray-500 text-sm">
          Your project is currently solo. Add a team first to assign members.
        </div>
      )}
    </div>
  );



  useEffect(() => {
    const fetchProjectAndTeam = async () => {
      try {
        const token = Cookies.get("token")
        const projectResponse = await fetch(`http://localhost:3000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const projectData = await projectResponse.json()
        setProjectData(projectData)

        if (projectData.team) {
          const members = await Promise.all(
            projectData.team.members.map(async (member: any) => {
              const userResponse = await fetch(`http://localhost:3000/auth/${member.userId}`, {
                headers: { Authorization: `Bearer ${token}` }
              })
              return userResponse.json()
            })
          )
          setTeamMembers(members)
        } else {
          setTeamMembers([])
        }
      } catch (error) {
        console.error("Error fetching project or team members:", error)
      }
    }

    if (projectId) fetchProjectAndTeam()
  }, [projectId, refreshTrigger])

  // Handle user search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const token = Cookies.get("token")
      const response = await fetch(
        `http://localhost:3000/auth/search?name=${encodeURIComponent(searchQuery)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()

      if (!response.ok) {
        setErrorMessage("No users found")
        isAddingTeamMember ? setSearchedUser(null) : setUser(null)
        return
      }

      if (isAddingTeamMember) {
        setSearchedUser(data)
      } else {
        setUser(data)
      }
      setErrorMessage("")
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.")
    }
  }

  // Add Team Member Dialog
 // Update the handleAddTeamMember function to properly refresh team data
const handleAddTeamMember = async () => {
  if (!searchedUser) return;
  try {
    const token = Cookies.get("token");
    
    // 1. Add member to team
    const addResponse = await fetch(
      `http://localhost:3000/team/${projectData.team.id}/add-member`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: searchedUser.id }),
      }
    );

    if (!addResponse.ok) throw new Error("Failed to add member");

    // 2. Refresh project data to get updated team information
    const projectResponse = await fetch(`http://localhost:3000/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const updatedProject = await projectResponse.json();

    // 3. Update project data state
    setProjectData(updatedProject);

    // 4. Fetch fresh team members list
    if (updatedProject.team) {
      const updatedMembers = await Promise.all(
        updatedProject.team.members.map(async (member: any) => {
          const userResponse = await fetch(`http://localhost:3000/auth/${member.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return userResponse.json();
        })
      );
      setTeamMembers(updatedMembers);
    }

    // 5. Reset dialog state
    setIsAddingTeamMember(false);
    setSearchedUser(null);
    setSearchQuery("");

  } catch (error) {
    console.error("Error adding member:", error);
    alert("Failed to add member");
  }
};

// Add useEffect to track selected assignee for editing
useEffect(() => {
  if (editingMilestone) {
    // Set initial selected assignee when opening edit dialog
    setSelectedAssignee(editingMilestone.assignedToId || null);
  } else {
    // Reset selection when closing dialog
    setSelectedAssignee(null);
  }
}, [editingMilestone]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("token")
      if (!token) return
      
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        setCurrentUser(data)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }
    fetchCurrentUser()
  }, [])

  // Fetch milestones from API
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch(
          `http://localhost:3000/milestones/project/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (!response.ok) throw new Error("Failed to fetch milestones")
        const data = await response.json()
        setMilestones(data)
      } catch (error) {
        console.error("Error loading milestones:", error)
      }
    }

    if (projectId) fetchMilestones()
  }, [projectId, refreshTrigger])

 
  const handleDeleteMilestone = async (id: string) => {
    try {
      const token = Cookies.get("token")
      const response = await fetch(`http://localhost:3000/milestones/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })

      if (!response.ok) throw new Error("Failed to delete milestone")
      
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error("Error deleting milestone:", error)
      alert(error instanceof Error ? error.message : "Failed to delete milestone")
    }
  }

const handleDragEnd = async (milestone: Milestone, newStatus: "planned" | "in_progress" | "completed") => {
  // Check if trying to complete with unfinished tasks
  if (newStatus === "completed") {
    const hasUnfinishedTasks = milestone.tasks.some(task => task.status !== "done");
    if (hasUnfinishedTasks) {
      alert("Complete all tasks before marking milestone as completed");
      return;
    }
  }

  const originalMilestones = [...milestones];
  
  // Optimistic update
  setMilestones(prev => 
    prev.map(m => 
      m.id === milestone.id ? { ...m, status: newStatus } : m
    )
  );

  try {
    const token = Cookies.get("token")
    const response = await fetch(`http://localhost:3000/milestones/${milestone.id}`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus })
    })

    if (!response.ok) throw new Error("Status update failed")
    
    setTimeout(() => setRefreshTrigger(prev => prev + 1), 500)
  } catch (error) {
    console.error("Error updating milestone:", error)
    setMilestones(originalMilestones)
  }
}

  return (
    <div className="space-y-8">
     
     <div className="flex items-center justify-between">
  <h2 className="text-2xl font-bold">Milestones</h2>
  {isOwner && (
    <Button onClick={() => setShowAddDialog(true)}>
      <Plus className="mr-2 h-4 w-4" />
      Add Milestone
    </Button>
  )}
</div>

      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          {editingMilestone && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingMilestone.name}
                  onChange={(e) => setEditingMilestone({ 
                    ...editingMilestone, 
                    name: e.target.value 
                  })}
                  placeholder="Milestone title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingMilestone.description}
                  onChange={(e) => setEditingMilestone({ 
                    ...editingMilestone, 
                    description: e.target.value 
                  })}
                  placeholder="Describe this milestone"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={editingMilestone.status}
                    onValueChange={(value) => setEditingMilestone({ 
                      ...editingMilestone, 
                      status: value as "planned" | "in_progress" | "completed" 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                          <span>Planned</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Completed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={editingMilestone.priority}
                    onValueChange={(value) => setEditingMilestone({ 
                      ...editingMilestone, 
                      priority: value as "low" | "medium" | "high" 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Start Date</label>
    <Input
      type="date"
      value={editingMilestone.startDate ? format(new Date(editingMilestone.startDate), 'yyyy-MM-dd') : ''}
      onChange={(e) => setEditingMilestone({
        ...editingMilestone,
        startDate: e.target.value
      })}
    />
  </div>
  <div className="space-y-2">
    <label className="text-sm font-medium">Due Date</label>
    <Input
      type="date"
      value={editingMilestone.dueDate ? format(new Date(editingMilestone.dueDate), 'yyyy-MM-dd') : ''}
      onChange={(e) => setEditingMilestone({
        ...editingMilestone,
        dueDate: e.target.value
      })}
    />
  </div>


                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Time (days)</label>
                  <Input
                    type="number"
                    value={editingMilestone.estimatedTime}
                    onChange={(e) => setEditingMilestone({
                      ...editingMilestone,
                      estimatedTime: Number(e.target.value)
                    })}
                  />
                </div>
               
              </div>

              <AssignmentSection />
              <Button onClick={handleUpdateMilestone}>
                Update Milestone
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
         {isOwner && (
  <DialogHeader>
    <DialogTitle>Add New Milestone</DialogTitle>
  </DialogHeader>
)}

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                placeholder="Milestone title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                placeholder="Describe this milestone"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={newMilestone.status}
                  onValueChange={(value) => setNewMilestone({ ...newMilestone, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newMilestone.priority}
                  onValueChange={(value) => setNewMilestone({ ...newMilestone, priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Start Date</label>
    <Input
      type="date"
      value={newMilestone.startDate ? format(new Date(newMilestone.startDate), 'yyyy-MM-dd') : ''}
      onChange={(e) => setNewMilestone({
        ...newMilestone,
        startDate: e.target.value
      })}
    />
  </div>
  <div className="space-y-2">
    <label className="text-sm font-medium">Due Date</label>
    <Input
      type="date"
      value={newMilestone.dueDate ? format(new Date(newMilestone.dueDate), 'yyyy-MM-dd') : ''}
      onChange={(e) => setNewMilestone({
        ...newMilestone,
        dueDate: e.target.value
      })}
    />
  </div>




              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Time (days)</label>
                <Input
                  type="number"
                  value={newMilestone.estimatedTime}
                  onChange={(e) => setNewMilestone({
                    ...newMilestone,
                    estimatedTime: Number(e.target.value)
                  })}
                />
              </div>
               

            </div>

            <AssignmentSection />
            <Button onClick={handleAddMilestone}>
              Add Milestone
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-6">
  <AnimatePresence>
{["planned", "in_progress", "completed"].map((status) => (
  <MilestoneColumn
    key={status}
    status={status as "planned" | "in_progress" | "completed"}
    milestones={milestones.filter(m => m.status === status)}
    onDragEnd={handleDragEnd}
    onSelect={onMilestoneSelect}
    onEdit={isOwner ? setEditingMilestone : undefined}
    onDelete={isOwner ? handleDeleteMilestone : undefined}
    currentUserId={currentUser?.sub}  // Add this line
  />
))}
  </AnimatePresence>
</div>
      <Dialog open={isAddingTeamMember} onOpenChange={(open) => {
        setIsAddingTeamMember(open)
        if (!open) {
          setSearchedUser(null)
          setSearchQuery("")
          setErrorMessage("")
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
                  <Button size="sm" onClick={handleAddTeamMember}>
                    Add
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}