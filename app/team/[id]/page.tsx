"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notFound } from "next/navigation"
import { Clock, CheckCircle2, MessageSquare, Target } from "lucide-react"
import { formatDuration } from "@/lib/utils/time"
import Cookies from "js-cookie"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams } from "next/navigation"


interface MemberStats {
  totalHours: number
  totalComments: number
  completedMilestones: number
}

interface Member {
  id: string
  fullName: string
  role: string
  email: string
  avatar?: string
  stats: MemberStats
  completedTasks: number
  tasks: any[]
  milestones: any[]
  recentActivity: any[]
}

export default function MemberPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const [member, setMember] = useState<Member | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const teamId = searchParams.get("teamId")

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
       
        
        // Then get team membership details (you'll need teamId from somewhere)
        const teamResponse = await fetch(`http://localhost:3000/team/${teamId}/member/${params.id}`, {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        });
  
        if ( !teamResponse.ok) throw new Error("Failed to fetch data");
        
        const teamData = await teamResponse.json();
        const milestonesResponse = await fetch(
          `http://localhost:3000/milestones/member/${params.id}`,
          {
            headers: {
                        Authorization: `Bearer ${Cookies.get("token")}`,
                      },
          }
        );
  
        const milestones =
          milestonesResponse.ok ? await milestonesResponse.json() : [];
  
        // Fetch tasks
        const tasksResponse = await fetch(
          `http://localhost:3000/tasks/member/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );
  
        const tasks = tasksResponse.ok ? await tasksResponse.json() : [];
  
        // Map the fetched data into the member state
        const mappedMember: Member = {
          id: params.id,
          fullName: teamData.user.fullname,
          role: teamData.role,
          email: teamData.user.email,
          avatar: teamData.user.profile_photo,
          stats: {
            totalHours: teamData.hoursLogged || 0,
            totalComments: teamData.commentsCount || 0,
            completedMilestones: milestones.filter((m: any) => m.completed)
              .length,
          },
          completedTasks: tasks.filter((t: any) => t.status === "completed")
            .length,
          tasks,
          milestones,
          recentActivity: teamData.activity || [],
        };
  
        setMember(mappedMember);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Unknown error");
        toast({
          title: "Error loading member",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMemberData();
  }, [params.id, toast]);

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!member) notFound()

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={member.avatar} alt={member.fullName} />
              <AvatarFallback>
                {member.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{member.fullName}</h1>
              <p className="text-lg text-muted-foreground">{member.role}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(member.stats.totalHours * 3600)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{member.completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{member.stats.totalComments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Milestones</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{member.stats.completedMilestones}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Current Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {member.tasks.map((task) => (
                  <div key={task.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{task.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        {formatDuration(task.timeSpent * 3600)}
                      </span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{task.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {member.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-3 h-3 mt-1.5 rounded-full ${
                      milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <h3 className="font-medium">{milestone.name}</h3>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      {milestone.completed && (
                        <p className="text-sm text-green-600">
                          Completed on {new Date(milestone.completedAt!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {member.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="min-w-[100px] text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                    <div>
                      <p className="text-sm">{activity.description}</p>
                      {activity.comment && (
                        <p className="mt-1 text-sm text-muted-foreground italic">
                          "{activity.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}