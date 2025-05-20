
"use client"

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Instagram, Users, MessageSquare, Share2, Activity } from "lucide-react";

export function EngagementStats() {
  const [growthData, setGrowthData] = useState([]);
  const token = Cookies.get("token");
  const [stats, setStats] = useState({
    followers: 0,
    comments: 0,
    posts: 0,
    engagementRate: "0",
  });
  
  const engagementData = [
    { date: "Mon", instagram: 2400, youtube: 1398, tiktok: 3908 },
    { date: "Tue", instagram: 1398, youtube: 2800, tiktok: 4800 },
    { date: "Wed", instagram: 9800, youtube: 3908, tiktok: 2800 },
    { date: "Thu", instagram: 3908, youtube: 4800, tiktok: 1398 },
    { date: "Fri", instagram: 4800, youtube: 3800, tiktok: 2400 },
    { date: "Sat", instagram: 3800, youtube: 4300, tiktok: 2400 },
    { date: "Sun", instagram: 4300, youtube: 4300, tiktok: 3908 },
  ]
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
          return; // Stop execution if no profile is found
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
            engagementRate: "0", // Will update below
          });
  
          // Fetch engagement rate only after setting initial stats
          const engagementResponse = await fetch(`http://localhost:3000/creator/engagement/${profileId}`);
          const engagementData = await engagementResponse.json();
          setStats((prevStats) => ({
            ...prevStats,
            engagementRate: engagementData?.averageEngagement ?? "0",
          }));
          
        } else {
          console.warn("No stats data found.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  
    if (token) {
      fetchData();
    }
  }, [token]);
  
  
  useEffect(() => {
    console.log("Updated Stats in State:", stats);
  }, [stats]);
  

  const statsList = [
    {
      title: "Total Followers",
      value: stats.followers,  // No need for `?`
      icon: Users,
    },
    {
      title: "Engagement Rate",
      value: `${stats.engagementRate}%`,
      icon: Instagram,
    },
    {
      title: "Comments",
      value: stats.comments,
      icon: MessageSquare,
    },
    {
      title: "Posts",
      value: stats.posts,
      icon: Share2,
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        {statsList.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daily Growth Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 300]} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#E1306C" 
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
