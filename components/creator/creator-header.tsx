"use client";

import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export function CreatorHeader() {
  const [isConnected, setIsConnected] = useState(false);
 
  
  const handleConnect = async () => {
    window.location.href = "http://localhost:3000/creator/login";
  };
  
  useEffect(() => {
    const checkConnection = async () => {
      const token = Cookies.get("token"); // Retrieve token from cookies
  
      if (!token) {
        console.error("No token found!");
        return;
      }
  
      try {
        const res = await fetch("http://localhost:3000/creator/account", {
          method: "GET",
          credentials: "include", // Ensure cookies are sent
          headers: {
            "Authorization": `Bearer ${token}`, // Send token in header
            "Content-Type": "application/json",
          },
        });
  
        if (res.ok) {
          setIsConnected(true);
        } else {
          const errorData = await res.json();
          console.error("Failed to connect:", errorData);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    };
  
    checkConnection();
  }, []);
  

  return (
    <div className="flex items-center justify-between">
     
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleConnect}>
          <Users className="mr-2 h-4 w-4" />
          {isConnected ? "Connected" : "Connect Platforms"}
        </Button>
        
      </div>
    </div>
  );
} 