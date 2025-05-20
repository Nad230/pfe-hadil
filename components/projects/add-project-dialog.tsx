
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import  ProjectForm  from "./project-form";
import Cookies from "js-cookie";
import { Achievement } from "@/components/ui/achievement"
import { toast } from "sonner";
interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshProjects: () => void; // Make sure this line exists
}

export function AddProjectDialog({ open, onOpenChange, refreshProjects }: AddProjectDialogProps) {
  const handleSubmit = async (data: any) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No authentication token found.");
  
      const projectResponse = await fetch("http://localhost:3000/projects/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          type: data.type,
          visibility: data.visibility,
          status:'Pending',
          vision: data.vision,
          impact: data.impact,
          revenueModel: data.revenueModel,
          BudgetRange: data.budgetRange, // Adjusted field name to match DTO
          TimeLine: data.timeline,
          fundingSource: data.fundingSource,
          teamId: data.teamId,
          teamMembers: data.teamMembers,
          location: data.location,
          strategyModel:data.strategyModel,
          mainGoal: data.mainGoal,
          estimatedCompletionDate: data.estimatedCompletionDate ? 
            new Date(data.estimatedCompletionDate).toISOString() : 
            null,

          collaborations: data.collaborations,
          projectMilestones: data.projectMilestones,
          teamType:data.teamType,
          aiInsights: data.aiInsights,
          planType: data.planType,
          tags:data.tags,
        }),
      });
  
      if (!projectResponse.ok) {
        const errorText = await projectResponse.text();
        throw new Error(`Failed to add project: ${errorText}`);
      }
  
      const projectData = await projectResponse.json();
      const projectId = projectData.id;
  
      // Then create team if members are selected
      if (data.teamMembers && data.teamMembers.length > 0) {
        await fetch("http://localhost:3000/team/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: data.teamName,
            description: data.teamDescription,
            projectId: projectId,
            TeamMembers: data.teamMembers
          }),
        });
      }
      
  
      onOpenChange(false);
      toast.success("Project created successfully!");
    
      // Refresh project list
      await refreshProjects();
    } catch (error: any) {
      console.error("Error adding project:", error.message || "Something went wrong");
    }
  };
  
  
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
        </DialogHeader>
        <ProjectForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}