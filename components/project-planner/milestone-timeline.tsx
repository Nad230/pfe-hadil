"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CalendarIcon, Plus, Edit, Trash2, CheckCircle, Clock, AlertCircle, Calendar as CalendarIcon2, ListChecks, PlayCircle, PauseCircle } from "lucide-react"
import { format, isAfter, isBefore, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import Cookies from "js-cookie";
import { Achievement } from "@/components/ui/achievement"

import { Milestone, MilestoneStatus } from "@/lib/types/project-planner"

import { useParams } from "next/navigation";


interface MilestoneTimelineProps {
  milestones: any[];
  onUpdate: (updatedMilestones: any[]) => void;
  projectId: string;
  teamType: "team" | "solo"; // Add teamType prop
}
interface ProjectListProps {
  key?: number; // Trigger refresh when key changes

}

export function MilestoneTimeline({ milestones, onUpdate, projectId,teamType,key }: MilestoneTimelineProps) {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState("")

  type MilestoneStatus = "completed" | "active" | "in_progress" | "paused"| "not_started"
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    title: "",
    description: "",
    status: "not_started",
    priority: "medium",
    estimatedTime: 0,
    tasks: [],
    visibility: "private",
   
  });
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievementId, setCurrentAchievementId] = useState<string | null>(null);
  const checkFirstProjectAchievement = async () => {
    try {
      const achievementsResponse = await fetch("http://localhost:3000/achivement", {
        headers: { Authorization: `Bearer ${Cookies.get("token")}` },
      });
  
      if (!achievementsResponse.ok) {
        console.error("Failed to fetch achievements");
        return;
      }
  
      const achievements = await achievementsResponse.json();
      const firstProjectAchievement = achievements.find(
        (a: any) => a.name === "First Milestone Created"
      );
  
      if (!firstProjectAchievement) {
        console.log("First Project achievement not found");
        return;
      }
  
      const showedStatusResponse = await fetch(
        `http://localhost:3000/achivement/showedStatus/${firstProjectAchievement.id}`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );
  
      if (!showedStatusResponse.ok) {
        console.error("Failed to fetch showed status");
        return;
      }
  
      const { showed } = await showedStatusResponse.json();
      console.log("Showed status:", showed);
  
      if (!showed) {
        console.log("Showing achievement");
        setShowAchievement(true);
        setCurrentAchievementId(firstProjectAchievement.id);
      }
    } catch (error) {
      console.error("Error checking achievements:", error);
    }
  };
  
  useEffect(() => {
   

    checkFirstProjectAchievement(); // Call it here

  },[key]); // Fetch projects when key changes

  const markAchievementAsShown = async (achievementId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/achivement/${achievementId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
  
      if (!response.ok) {
        console.error("Failed to update achievement status");
      }
    } catch (error) {
      console.error("Error updating achievement:", error);
    } finally {
      setCurrentAchievementId(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
      case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
      default: return ''
    }
  }


  const sortedMilestones = [...(milestones || [])].sort((a, b) => {
    const dateA = a.startDate ? new Date(a.startDate).getTime() : Infinity
    const dateB = b.startDate ? new Date(b.startDate).getTime() : Infinity
    return dateA - dateB
  })
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`http://localhost:3000/auth/${searchQuery}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        setUser(null);
        setErrorMessage("No user found with this ID.");
        return;
      }

      const data = await response.json();
      setUser(data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching user:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleAddMilestone = async () => {
    console.log("Button clicked!");
  
    if (!newMilestone.title) {
      console.error("Missing required fields!");
      return;
    }
  
    if (!projectId) { // ✅ Use projectId from top level
      console.error("Project ID not found in URL!");
      return;
    }
  
    const token = Cookies.get("token");
    if (!token) {
      console.error("No token found, authentication required!");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:3000/milestones', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          projectId,
          name: newMilestone.title,
          description: newMilestone.description,
          startDate: newMilestone.startDate ? new Date(newMilestone.startDate).toISOString() : undefined,
          dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate).toISOString() : new Date().toISOString(),
          progress: 0,
          status: newMilestone.status || "not_started",
          priority: newMilestone.priority || "medium",
          aiGenerated: false,
          visibility: newMilestone.visibility || "private",
          visibleTo: newMilestone.visibleTo || [],
          assignedToId: newMilestone.assignedToId,
          estimatedTime: newMilestone.estimatedTime,
          assignedBy: currentUser.id,

        })
      });
      // Directly call response.json() without calling response.text()
      const createdMilestone = await response.json();
      console.log("Milestone Created:", createdMilestone);
  
      if (!response.ok) {
        throw new Error(`Failed to create milestone: ${createdMilestone}`);
      }
  
      onUpdate([...milestones, createdMilestone]);
  
      setNewMilestone({
        title: "",
        description: "",
        status: "not_started",
        priority: "medium",
        estimatedTime: 0,
        tasks: []
      });
  
      setShowAddDialog(false);
      alert("Milestone added successfully!");
    } catch (error) {
      console.error("Error adding milestone:", error);
    }
  };

  
  const handleVisibilityChange = (value: string) => {
    setNewMilestone({
      ...newMilestone,
      visibility: value as "private" | "shared" | "public",
      visibleTo: value === "shared" ? [] : undefined
    });
  };
  const handleUpdateMilestone = async () => {
    console.log("Button clicked!"); // Debugging
  
    if (!editingMilestone) return;
  
    try {
      const requestBody = {
        ...editingMilestone,
        estimatedTime: Number(editingMilestone.estimatedTime),
      };
  
      // Remove tasks field if it's not needed
      delete requestBody.tasks;
  
      const response = await fetch(`http://localhost:3000/milestones/${editingMilestone.id}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      const responseBody = await response.text(); // Read the response body as text
      console.log("Response Status:", response.status);
      console.log("Response Body:", responseBody);
  
      if (!response.ok) {
        throw new Error(`Failed to update milestone: ${responseBody}`);
      }
  
      const updatedMilestone = JSON.parse(responseBody); // Parse the response body
      onUpdate(milestones.map(m =>
        m.id === updatedMilestone.id ? updatedMilestone : m
      ));
  
      setEditingMilestone(null);
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };
  
  
  const handleDeleteMilestone = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/milestones/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete milestone')
      onUpdate(milestones.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error deleting milestone:', error)
    }
  }


  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    let isMounted = true; // Prevents state updates if component unmounts
    console.log("useEffect triggered with projectId:", projectId);
  
    const fetchProjectOwner = async () => {
      console.log("fetchProjectOwner function is running");
  
      const token = Cookies.get("token");
      if (!token || !projectId) {
        console.log("Missing token or projectId:", { token, projectId });
        return;
      }
  
      try {
        console.log("Fetching project data...");
        const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!response.ok) throw new Error("Failed to fetch project data");
  
        const project = await response.json();
        console.log("Project data fetched:", project);
  
        console.log("Fetching user data...");
        const userResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        if (!userResponse.ok) throw new Error("Failed to fetch user data");
  
        const userData = await userResponse.json();
        console.log("User data fetched:", userData);
  
        if (isMounted) {
          setIsOwner(userData.sub === project.userId);
          console.log("isOwner set to:", userData.sub === project.userId);
        }
      } catch (error) {
        console.error("Error fetching project owner:", error);
      }
    };
  
    fetchProjectOwner();
  
    return () => {
      isMounted = false; // Prevents state update if component unmounts
    };
  }, [projectId]);
  


  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case "active": return <PlayCircle className="h-5 w-5 text-blue-500" />
      case "paused": return <PauseCircle className="h-5 w-5 text-red-500" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "not_started":
        return <AlertCircle className="h-5 w-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: MilestoneStatus) => {
    switch (status) {
       case "paused": return "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20"
       case"active": return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
      case "completed":
        return "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-900/20"
      case "in_progress":
        return "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20"
      case "not_started":
        return "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/20"
    }
  }
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = Cookies.get("token");
      if (!token) return;
      
      try {
        const response = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const getDateStatus = (milestone: Milestone) => {
    if (!milestone.dueDate) return null
    
    const today = new Date()
    const dueDate = new Date(milestone.dueDate)
    
    if (milestone.status === "completed") {
      return { color: "text-emerald-500", text: "Completed", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" }
    }
    
    if (isAfter(today, dueDate)) {
      return { color: "text-red-500", text: "Overdue", bgColor: "bg-red-100 dark:bg-red-900/30" }
    }
    
    if (isAfter(today, addDays(dueDate, -3))) {
      return { color: "text-amber-500", text: "Due soon", bgColor: "bg-amber-100 dark:bg-amber-900/30" }
    }
    
    return { color: "text-blue-500", text: "On track", bgColor: "bg-blue-100 dark:bg-blue-900/30" }
  }
  const safeFormat = (dateString?: string) => {
    if (!dateString) return 'No date'; // Return if no date provided
    const date = new Date(dateString); // Create a Date object
    return isNaN(date.getTime()) ? 'Invalid date' : format(date, 'MMM d, yyyy'); // Format or return 'Invalid date'
  };
  return (
    <div className="space-y-6">
      <Achievement
  show={showAchievement}
  title="First Project Created!"
  description="Your journey begins now!"
  onClose={() => {
    setShowAchievement(false);
    if (currentAchievementId) {
      // Mark as shown only after user has seen it
      markAchievementAsShown(currentAchievementId);
    }
  }}
/>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Project Timeline
        </h3>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            {isOwner && (
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
            </DialogHeader>
            <div className="flex gap-4 mb-6">
              <Button
                variant={activeTab === "basic" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("basic")}
                className={cn("w-1/2", activeTab === "basic" && "border-2 border-indigo-500")}
              >
                Basic Info
              </Button>
              <Button
                variant={activeTab === "advanced" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("advanced")}
                className={cn("w-1/2", activeTab === "advanced" && "border-2 border-indigo-500")}
              >
                Additional Settings
              </Button>
            </div>

            <div className="space-y-4 py-4">
              {activeTab === "basic" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={newMilestone.title || ""}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      placeholder="Milestone title"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description (Optional)</label>
                    <Textarea
                      value={newMilestone.description || ""}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      placeholder="Describe this milestone"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
  <div className="space-y-2">
    <label className="text-sm font-medium">Start Date</label>
    <input
      type="date"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      value={newMilestone.startDate ? new Date(newMilestone.startDate).toISOString().split('T')[0] : ''}
      onChange={(e) => setNewMilestone({
        ...newMilestone,
        startDate: new Date(e.target.value).toISOString()
      })}
    />
  </div>

  <div className="space-y-2">
    <label className="text-sm font-medium">Due Date</label>
    <input
      type="date"
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      value={newMilestone.dueDate ? new Date(newMilestone.dueDate).toISOString().split('T')[0] : ''}
      onChange={(e) => setNewMilestone({
        ...newMilestone,
        dueDate: new Date(e.target.value).toISOString()
      })}
    />
  </div>
</div>  </>
              ) : (
                <>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={newMilestone.status}
                      onValueChange={value => setNewMilestone({...newMilestone, status: value as MilestoneStatus})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Visibility</label>
                    <Select
                      value={newMilestone.visibility}
                      onValueChange={(value) => 
                        setNewMilestone({ 
                          ...newMilestone, 
                          visibility: value as "private" | "shared" | "public"
                        })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select visibility" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {teamType === "team" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Assign To</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Search user by ID"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button onClick={handleSearch}>Search</Button>
                      </div>
                      
                      {errorMessage && (
                        <div className="text-red-500 text-sm">{errorMessage}</div>
                      )}

                      {user && (
                        <div className="p-2 border rounded-lg mt-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{user.username}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setNewMilestone({ ...newMilestone, assignedToId: user.id });
                                setUser(null);
                                setSearchQuery("");
                              }}
                            >
                              Assign
                            </Button>
                          </div>
                        </div>
                      )}

                      {newMilestone.assignedToId && (
                        <div className="mt-2 text-sm text-green-600">
                          Assigned to: {user?.username || "User ID: " + newMilestone.assignedToId}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={newMilestone.priority} 
                    onValueChange={value => setNewMilestone({...newMilestone, priority: value as any})}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium">Estimated Time (days)</label>
                  <Input
                    type="number"
                    value={newMilestone.estimatedTime}
                    onChange={e => setNewMilestone({
                      ...newMilestone,
                      estimatedTime: Number(e.target.value)
                    })}
                  />
                </div>
              </div>

              <Button 
                onClick={handleAddMilestone} 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                Add Milestone
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-300 to-purple-300 rounded-full dark:from-indigo-700 dark:to-purple-700" />
        
        <div className="space-y-8">
          {sortedMilestones.map((milestone, index) => {
            const dateStatus = getDateStatus(milestone)
            
            return (
              <div key={milestone.id} className="relative pl-12">
                <div className="absolute left-0 top-1.5 w-12 flex items-center justify-center">
                  <div className="z-10 rounded-full border-2 border-background bg-background shadow-sm">
                    {getStatusIcon(milestone.status)}
                  </div>
                </div>
                
                <Card className={cn("border-2 shadow-md transition-all hover:shadow-lg", getStatusColor(milestone.status))}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{milestone.title}</h4>
                        {milestone.description && (
                          <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => setEditingMilestone(milestone)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
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
                                      title: e.target.value 
                                    })}
                                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700"
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea
                                    value={editingMilestone.description || ""}
                                    onChange={(e) => setEditingMilestone({ 
                                      ...editingMilestone, 
                                      description: e.target.value 
                                    })}
                                    className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700"
                                  />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Start Date</label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700",
                                            !editingMilestone.startDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4 text-indigo-500" />
                                          {editingMilestone.startDate ? (
                                            format(new Date(editingMilestone.startDate), "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={editingMilestone.startDate ? new Date(editingMilestone.startDate) : undefined}
                                          onSelect={(date) => 
                                            setEditingMilestone({ 
                                              ...editingMilestone, 
                                              startDate: date ? date.toISOString() : undefined 
                                            })
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>

                                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
    {/* Add these new elements */}
    <div className={`px-2 py-1 rounded-full ${getPriorityColor(milestone.priority)}`}>
      Priority: {milestone.priority}
    </div>
    <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
      Est. Time: {milestone.estimatedTime} days
    </div>
  </div>
                                  
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-full justify-start text-left font-normal border-indigo-200 hover:border-indigo-300 dark:border-indigo-800 dark:hover:border-indigo-700",
                                            !editingMilestone.dueDate && "text-muted-foreground"
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                                          {editingMilestone.dueDate ? (
                                            format(new Date(editingMilestone.dueDate), "PPP")
                                          ) : (
                                            <span>Pick a date</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={editingMilestone.dueDate ? new Date(editingMilestone.dueDate) : undefined}
                                          onSelect={(date) => 
                                            setEditingMilestone({ 
                                              ...editingMilestone, 
                                              dueDate: date ? date.toISOString() : undefined 
                                            })
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">Status</label>
                                  <Select 
                                    value={editingMilestone.status} 
                                    onValueChange={(value) => 
                                      setEditingMilestone({ 
                                        ...editingMilestone, 
                                        status: value as MilestoneStatus,
                                        completedDate: value === "completed" ? new Date().toISOString() : editingMilestone.completedDate
                                      })
                                    }
                                  >
                                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 dark:border-indigo-800 dark:focus:border-indigo-700">
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not_started" className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-slate-400" />
                                        <span>Not Started</span>
                                      </SelectItem>
                                      <SelectItem value="in_progress" className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-blue-500" />
                                        <span>In Progress</span>
                                      </SelectItem>
                                      <SelectItem value="completed" className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                        <span>Completed</span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex justify-end gap-2 mt-4">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setEditingMilestone(null)}
                                    className="border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={handleUpdateMilestone}
                                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                                  >
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                          onClick={() => handleDeleteMilestone(milestone.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    {milestone.startDate && (
  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
    <CalendarIcon2 className="h-4 w-4 text-indigo-500" />
    <span>Start: {safeFormat(milestone.startDate)}</span>
  </div>
)}

{milestone.dueDate && (
  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
    <CalendarIcon className="h-4 w-4 text-amber-500" />
    <span>Due: {safeFormat(milestone.dueDate)}</span>
  </div>
)}
                      
                      {dateStatus && (
                        <div className={cn("ml-auto font-medium px-2 py-1 rounded-full", dateStatus.color, dateStatus.bgColor)}>
                          {dateStatus.text}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
  <ListChecks className="h-3 w-3 text-indigo-400" />
  {milestone.tasks?.length || 0} tasks
</div>

                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}