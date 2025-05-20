"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Users, 
  BarChart2, 
  Calendar,
  MessageSquare,
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Clock,
  Plus
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { CreatorHeader } from "@/components/creator/creator-header"
import Cookies from "js-cookie";
import { useEffect, useState } from "react"
import { AddGoalDialog } from "@/components/creator/goals/add-goal-dialog"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [growthData, setGrowthData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const token = Cookies.get("token");
  const [stats, setStats] = useState({
    followers: 0,
    comments: 0,
    posts: 0,
    engagementRate: "0",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const authResponse = await fetch("http://localhost:3000/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const authData = await authResponse.json();
        const userId = authData.sub;
        console.log(userId);
  
        const profileResponse = await fetch(`http://localhost:3000/creator/profiles/user/${userId}`);
        const profiles = await profileResponse.json();
        const instaProfile = profiles.find((p) => p.platform.toLowerCase() === "instagram");
  
        if (!instaProfile) {
          console.warn("No Instagram profile found.");
          return;
        }
  
        console.log("Instagram Profile ID:", instaProfile.id);
        const profileId = instaProfile.id;
  
        const statsResponse = await fetch(`http://localhost:3000/creator/state-social/profile/${profileId}`);
        const statsData = await statsResponse.json();
        console.log("Stats Data:", statsData);
  
        if (statsData.length > 0) {
          console.log("Updating State with:", statsData[0]);
          setStats({
            followers: statsData[0].followers ?? 0,
            comments: statsData[0].comments ?? 0,
            posts: statsData[0].posts ?? 0,
            engagementRate: "0",
          });
  
          const engagementResponse = await fetch(`http://localhost:3000/creator/engagement/${profileId}`);
          const engagementData = await engagementResponse.json();
          setStats((prevStats) => ({
            ...prevStats,
            engagementRate: engagementData?.averageEngagement ?? "0",
          }));

          // Fetch goals data
          const goalsResponse = await fetch(`http://localhost:3000/creator-goals`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const goalsData = await goalsResponse.json();
          setGoals(goalsData);
          setLoadingGoals(false);
          
        } else {
          console.warn("No stats data found.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoadingGoals(false);
      }
    }
  
    if (token) {
      fetchData();
    }
  }, [token, isDialogOpen]); // Added isDialogOpen to refetch goals when a new one is added

  useEffect(() => {
    console.log("Updated Stats in State:", stats);
  }, [stats]);

  const platformStats = [
    {
      platform: "YouTube",
      icon: Youtube,
      color: "text-red-500",
      bgColor: "bg-red-100 dark:bg-red-900/20",
      stats: {
        followers: "125K",
        growth: "+12.5%",
        engagement: "4.8"
      }
    },
    {
      platform: "Instagram",
      icon: Instagram,
      color: "text-pink-500",
      bgColor: "bg-pink-100 dark:bg-pink-900/20",
      stats: {
        followers: stats.followers,
        growth: "+12.5%",
        engagement: stats.engagementRate,
      }
    },
    {
      platform: "Twitter",
      icon: Twitter,
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      stats: {
        followers: "28.9K",
        growth: "+15.7%",
        engagement: "3.9"
      }
    },
    {
      platform: "LinkedIn",
      icon: Linkedin,
      color: "text-blue-700",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      stats: {
        followers: "12.4K",
        growth: "+6.2%",
        engagement: "4.1"
      }
    }
  ]

  const upcomingPosts = [
    {
      platform: "Instagram",
      time: "Today, 2:00 PM",
      title: "Product Feature Highlight"
    },
    {
      platform: "YouTube",
      time: "Tomorrow, 6:00 PM",
      title: "Weekly Tutorial"
    }
  ]

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      default:
        return <Sparkles className="h-5 w-5 text-purple-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Dashboard</h1>
          <p className="text-muted-foreground">Manage your social media presence</p>
        </div>
        <CreatorHeader />
         <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Goal
                </Button>
                <AddGoalDialog 
                        open={isDialogOpen} 
                        onOpenChange={setIsDialogOpen} 
                      />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {platformStats.map((platform, index) => (
          <motion.div
            key={platform.platform}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                    <platform.icon className={`h-5 w-5 ${platform.color}`} />
                  </div>
                  <Badge variant="outline" className={platform.color}>
                    {platform.stats.growth}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h2 className="font-semibold">{platform.platform}</h2>
                  <p className="text-2xl font-bold">{platform.stats.followers}</p>
                  <p className="text-sm text-muted-foreground">
                    {platform.stats.engagement}  % engagement rate
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/scheduler" className="w-full">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Schedule Post</span>
                </Button>
              </Link>
              <Link href="/hashtag-generator" className="w-full">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Generate Content</span>
                </Button>
              </Link>
              <Link href="/analytics" className="w-full">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <BarChart2 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </Link>
              <Link href="/ai-assistant" className="w-full">
                <Button variant="outline" className="w-full h-24 flex flex-col gap-2">
                  <Sparkles className="h-6 w-6" />
                  <span>AI Assistant</span>
                </Button>
              </Link>
              
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPosts.map((post, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="font-medium">{post.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {post.time}
                      </div>
                    </div>
                    <Badge>{post.platform}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Your Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingGoals ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading goals...</p>
                </div>
              ) : goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 space-y-2 text-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No goals yet</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map??((goal) => (
                    <motion.div 
                      key={goal.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(goal.platform)}
                            <h3 className="font-medium">{goal.title}</h3>
                            <Badge variant="outline" className="ml-2">
                              {goal.goalId}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{goal.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="font-medium">{goal.currentValue}</span>
                              <span className="text-muted-foreground"> / {goal.targetValue}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Deadline: {formatDate(goal.deadline)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold">
                            {Math.round(goal.progress)}%
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={goal.progress} 
                        className="mt-3 h-2" 
                      />
                      {goal.metrics && goal.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {goal.metrics.map((metric, index) => (
                            <Badge key={index} variant="secondary">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}