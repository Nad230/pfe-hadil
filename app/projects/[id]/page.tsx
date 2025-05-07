"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation";

import { ProjectOverview } from "@/components/project-planner/project-overview"
import { MilestoneTimeline } from "@/components/project-planner/milestone-timeline"
import { TaskBreakdown } from "@/components/project-planner/task-breakdown"
import { ProjectProgress } from "@/components/project-planner/project-progress"
import { mockProject } from "@/lib/mock-data/project-planner"
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { toast } from "sonner"

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
interface PageProps {
  params: {
    id: string;
  };
}




export default function ProjectPlannerPage({ params }: PageProps) {
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null); // Added user ID state

  const [isLoadingPackage, setIsLoadingPackage] = useState(true);
  const [userPackage, setUserPackage] = useState<"SILVER" | "GOLD" | "DIAMOND">("SILVER")
  const isOwner = userId && project?.userId ? project.userId === userId : false;
  const isAllowedPackage = userPackage === "GOLD" || userPackage === "DIAMOND";


useEffect(() => {
  console.log("User ID:", userId);
  console.log("Project Owner ID:", project?.userId);
  console.log("Is Owner:", isOwner);
}, [userId, project]);



useEffect(() => {
  console.log("User ID updated:", userId);
}, [userId]);

useEffect(() => {
  console.log("Project fetched:", project);
}, [project]);

const fetchProjectById = async (id: string) => {
  try {
    const response = await fetch(`http://localhost:3000/projects/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });

    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
};





  useEffect(() => {
    const fetchUserPackage = async () => {
      try {
        // Step 1: Get the basic user info
        const response = await fetch('http://localhost:3000/auth/me', {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
    
        if (!response.ok) throw new Error("Failed to fetch user data");
    
        const data = await response.json();
        console.log("Fetched profile data:", data);
    
        // Use `data.id` if available, otherwise use `data.sub`
        const userId = data.id || data.sub;
        setUserId(userId);
        console.log("User ID set to:", userId);
    
        // Step 2: Get full user details including packageType
        const userDetailsResponse = await fetch(`http://localhost:3000/auth/${userId}`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });
    
        if (!userDetailsResponse.ok) throw new Error("Failed to fetch full user details");
    
        const userDetails = await userDetailsResponse.json();
        console.log("Full user details:", userDetails);
    
        // Use `packageType` or default to "SILVER"
        setUserPackage(userDetails.packageType || "SILVER");
        console.log("Package type:", userDetails.packageType || "SILVER");
    
      } catch (error) {
        console.error("Failed to fetch user package:", error);
        toast.error("Failed to verify subscription");
      } finally {
        setIsLoadingPackage(false);
      }
    };
  
    fetchUserPackage();
  }, []);
  

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true);
  
      const token = Cookies.get("token");
      console.log("Token used:", token);
      console.log("Logged in userId:", userId);
      if (!token) {
        console.error("No auth token found");
        setLoading(false);
        return;
      }
  
      const data = await fetchProjectById(params.id);
      if (!data) {
        setLoading(false);
        return;
      }
  
      try {
        const milestonesRes = await fetch(`http://localhost:3000/milestones/project/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
              
        if (!milestonesRes.ok) {
          throw new Error(`Failed to fetch milestones: ${milestonesRes.statusText}`);
        }
        
        const milestones = await milestonesRes.json();
        console.log("Fetched Milestones:", milestones);
  
        setProject({ ...data, milestones: Array.isArray(milestones) ? milestones : [] });
  
      } catch (error) {
        console.error("Failed to fetch milestones:", error);
        setProject({ ...data, milestones: [] });
      }
  
      setLoading(false);
    };
  
    loadProject();
  }, [params.id, userId]);
  

  if (loading) return <div>Loading...</div>;
  if (!project) return <div>Project not found</div>;

  const handleProjectUpdate = (updatedProject: typeof project) => {
    setProject(updatedProject)
  }
  const generateRoadmap = async () => {
    try {
      setGenerating(true);
      const response = await fetch('http://localhost:3000/ai/roadmap', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        body: JSON.stringify({
          projectId: params.id,  // Match backend expectation
          projectData: {
            name: project?.name || "",
            description: project?.description || "",
            type: project?.type || "",
            visionImpact: project?.visionImpact || "",
            revenueModel: project?.revenueModel || "",
            budget: project?.budget || "",
            timeline: project?.timeline || "",
            teamType: "solo",  // If applicable, ensure this matches backend expectations
            team: project?.team || "",
            visibility: project?.visibility || "",
            location: project?.location || "",
            status: project?.status || "",
            fundingSource: project?.fundingSource || "",
            tags: project?.tags || [],
            collaborations: project?.collaborations || "",
            media: project?.media || [],
            mainGoal: project?.mainGoal || "",
            milestones: [],
            strategyModel: "Business strategy"  // If applicable
          }
        })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate roadmap');
      }
  
      // Fetch updated data without reload
      const token = Cookies.get("token");
      const [updatedProject, milestonesRes] = await Promise.all([
        fetchProjectById(params.id),
        fetch(`http://localhost:3000/milestones/project/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
      ]);
      
  
      if (!milestonesRes.ok) throw new Error('Failed to fetch updated milestones');
      
      const updatedMilestones = await milestonesRes.json();
      
      setProject({
        ...updatedProject,
        milestones: Array.isArray(updatedMilestones) ? updatedMilestones : []
      });
  
    } catch (error: any) {
      console.error('Roadmap generation error:', error);
      alert(error.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };
  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Project Planner</h1>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={generateRoadmap}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {generating ? "Generating AI Roadmap..." : "Generate AI Roadmap"}
              </Button>
            </TooltipTrigger>
            {!isAllowedPackage && !isLoadingPackage && (
              <TooltipContent>
                <p>Upgrade to GOLD or DIAMOND package to unlock this feature</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

    <ProjectOverview 
        project={project} 
        onUpdate={(updatedOverview) => {
          setProject({
            ...project,
            name: updatedOverview.name,
            description: updatedOverview.description,
            tags: updatedOverview.tags,
            mainGoal: updatedOverview.mainGoal,
            estimatedCompletionDate: updatedOverview.CompletionDate
          })
        }}
        isOwner={isOwner} // Pass ownership status
      />

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Milestones & Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
            <MilestoneTimeline 
  milestones={project?.milestones || []} 
  projectId={params.id}  // Make sure this is correct
  onUpdate={(updatedMilestones) => {
    setProject({
      ...project,
      milestones: updatedMilestones
    });
  }}
  isOwner={isOwner} // Pass ownership status

/>



            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <TaskBreakdown 
            milestones={project.milestones}
            onUpdate={(updatedMilestones) => {
              setProject({
                ...project,
                milestones: updatedMilestones
              })
            }}
            isOwner={isOwner} // Pass ownership status
          />
        </TabsContent>
        
        <TabsContent value="progress">
          <ProjectProgress project={project} />
        </TabsContent>
      </Tabs>
      </div>
  </TooltipProvider>
);

}