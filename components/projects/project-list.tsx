"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Project } from "@/lib/types/time-tracker"
import { ProjectActions } from "./project-actions"
import { EditProjectDialog } from "./edit-project-dialog"
import { DeleteProjectDialog } from "./delete-project-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Archive, BarChart, CheckCircle2, Clock, Folder, LineChart, TrendingUp, Trash, Pencil, Circle,Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { mockTasks } from "@/lib/mock-data/time-tracker"
import Cookies from "js-cookie";
import { useTranslation } from "@/components/context/translation-context";
import { Achievement } from "@/components/ui/achievement"






interface ProjectListProps {
  key?: number; // Trigger refresh when key changes

}


export function ProjectList({ key }: ProjectListProps) {
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);

  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievementId, setCurrentAchievementId] = useState<string | null>(null);


  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }; const checkFirstProjectAchievement = async () => {
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
        (a: any) => a.name === "First Project Created"
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
    fetchProjects();
    fetchStats();
    fetchMonthly();
    console.log("Calling checkFirstProjectAchievement"); // Debugging log

    checkFirstProjectAchievement(); // Call it here

  },[key]); // Fetch projects when key changes

  
  const fetchStats = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  const fetchMonthly = async () => {
    try {
      const response = await fetch("http://localhost:3000/projects/monthly", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
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


  const { t } = useTranslation();

  const deleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
        credentials: "include",
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete project");
      }
  
      // Refresh data after deletion
      await fetchProjects();
      await fetchStats();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };


  // Add this in your ProjectList component
const updateProject = async (projectId: string, data: Partial<Project>) => {
  try {
    const response = await fetch(`http://localhost:3000/projects/${projectId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      credentials: "include",
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error("Failed to update project");
    }

    // Refresh data after update
    await fetchProjects();
    await fetchStats();
  } catch (error) {
    console.error("Error updating project:", error);
  }
};
useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
    
      if (!response.ok) throw new Error("Failed to fetch user");
    
      const user = await response.json();
      console.log("user data:", user);  // Log the actual user object
    
      if (user && user.sub) {
        setCurrentUserId(user.sub);  // Use user.sub instead of user.id
        console.log("userid", user.sub);  // Log the user sub (id)
      } else {
        console.log("No user sub found in the response");
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
    
  };

  fetchCurrentUser();
}, []);



  

  return (
    <div className="space-y-8">
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
      {/* Project Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Total Projects")}</p>
                <h3 className="text-2xl font-bold">{stats?.totalProjects || 0}</h3>
              </div>
              <Folder className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Active Projects")}</p>
                <h3 className="text-2xl font-bold">{stats?.activeProjects || 0}</h3>
              </div>
              <Clock className="h-8 w-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Completed")}</p>
                <h3 className="text-2xl font-bold">{stats?.completedProjects || 0}</h3>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("Monthly Growth")}</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{stats?.monthlyGrowth ? `${stats.monthlyGrowth.toFixed(0)}%` : "0%"}
                  </h3>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <LineChart className="h-8 w-8 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Project Progress Overview")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("In Progress")}</span>
                  <span className="font-medium">{stats?.InProgressProjects || 0}</span>
                </div>
                <Progress value={stats?.activeProjects ? 
                    (stats.InProgressProjects / stats.activeProjects) * 100 : 0
                  }  className="bg-blue-100 dark:bg-blue-900">
                  <div className="bg-blue-500" style={{ width: stats?.InProgressProjects && stats?.activeProjects > 0 ? `${(stats.InProgressProjects / stats.activeProjects) * 100}%`:'0%' }} />
                </Progress>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("Completed")}</span>
                  <span className="font-medium">{stats?.completedProjects || 0}</span>
                </div>
                <Progress value={stats?.totalProjects ? 
                    (stats.completedProjects / stats.totalProjects) * 100 : 0
                  }  className="bg-green-100 dark:bg-green-900">
                  <div className="bg-green-500" style={{ width:stats?.completedProjects && stats?.totalProjects > 0  ? `${(stats.completedProjects / stats.totalProjects) * 100}%` :'0%' }} />
                </Progress>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("Archived")}</span>
                  <span className="font-medium">{stats?.archivedProjects || 0}</span>
                </div>
                <Progress 
                  value={stats?.totalProjects ? 
                    (stats.archivedProjects / stats.totalProjects) * 100 : 0
                  }  
                  className="bg-gray-100 dark:bg-gray-900"
                >
                  <div 
                    className="bg-gray-500" 
                    style={{ 
                      width: stats?.totalProjects && stats.totalProjects > 0
                        ? `${(stats.archivedProjects / stats.totalProjects) * 100}%`
                        : '0%'
                    }} 
                  />
                </Progress>
              </div>
            </div>

            {/* Project List */}
            <div className="grid gap-4 md:grid-cols-3">
            {Array.isArray(projects) && projects.map((project) => {
              const isOwner = currentUserId === project.userId;
    const projectTasks = mockTasks.filter(t => t.projectId === project.id)
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length
    const progress = projectTasks.length > 0 
      ? (completedTasks / projectTasks.length) * 100 
      : 0


                return (
                  <Link 
                  key={project.id} 
                  href={`/projects/${project.id}`} 
                  className="block"
                >
                
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${project.color}15`,
                              color: project.color 
                            }}
                          >
                            <BarChart className="h-5 w-5" />
                          </div>
                          
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">{project.name}</h3>
                            <div className="flex items-center gap-2">
                            {isOwner && (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-100/50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setSelectedProject(project);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                 
                                </>
                              )}
                              {isOwner && (
                                <>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-100/50 delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  setSelectedProject(project);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />  {/* Add this line */}
                            </Button>
                            </>
                              )}
                              {project.teamId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-purple-500 hover:bg-purple-100/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      router.push(`/team?teamId=${project.teamId}`);
                    }}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}

<Badge variant="default" className="gap-1">
  {project.status === "archived" ? (
    <>
      <Archive className="h-3 w-3" />
      {t("Archived")}
    </>
  ) : project.status === "active" ? (
    <>
      <Clock className="h-3 w-3" />
      {t("Active")}
    </>
  ) : (
    <>
      <Circle className="h-3 w-3" />
      {t(project.status)} {/* Show other statuses dynamically */}
    </>
  )}
</Badge>

                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{t("Progress")}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <Progress value={progress} className="h-2">
                              <div 
                                className="h-full transition-all duration-300"
                                style={{ 
                                  width: `${progress}%`,
                                  backgroundColor: project.color
                                }}
                              />
                            </Progress>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{projectTasks.length} tasks</span>
                            <span>{completedTasks} completed</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <EditProjectDialog
  project={selectedProject}
  open={showEditDialog}
  onOpenChange={setShowEditDialog}
  onSubmit={async (data) => {
    if (selectedProject) {
      await updateProject(selectedProject.id, data);
    }
  }}
/>

<DeleteProjectDialog
  project={selectedProject}
  open={showDeleteDialog}
  onOpenChange={setShowDeleteDialog}
  onConfirm={(project) => {
    if (project) {
      deleteProject(project.id);
    }
    setShowDeleteDialog(false);
  }}
/>

    </div>
  )
}




