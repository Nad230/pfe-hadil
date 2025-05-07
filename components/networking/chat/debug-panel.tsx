"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, RefreshCw, Wifi, WifiOff, CheckCircle, XCircle, Clock, Database } from "lucide-react"
import { cn } from "@/lib/utils"

interface DebugPanelProps {
  isOpen: boolean
  onClose: () => void
  apiCalls: {
    id: string
    url: string
    method: string
    status: number
    duration: number
    timestamp: Date
    request?: any
    response?: any
    error?: any
  }[]
  messages: any[]
  connectionStatus: {
    websocket: boolean
    api: boolean
    internet: boolean
  }
  pendingMessages: string[]
  onRetryAll: () => void
  onClearLogs: () => void
}

export function DebugPanel({
  isOpen,
  onClose,
  apiCalls,
  messages,
  connectionStatus,
  pendingMessages,
  onRetryAll,
  onClearLogs,
}: DebugPanelProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen) return null

  const failedApiCalls = apiCalls.filter((call) => call.status >= 400)
  const successfulApiCalls = apiCalls.filter((call) => call.status >= 200 && call.status < 400)

  const averageApiTime =
    apiCalls.length > 0 ? apiCalls.reduce((sum, call) => sum + call.duration, 0) / apiCalls.length : 0

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-center h-full max-w-7xl">
        <Card className="w-full max-h-[90vh] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Debug Mode
              </CardTitle>
              <CardDescription>Troubleshoot and monitor your chat application in real-time</CardDescription>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </CardHeader>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            <CardContent className="flex-1 p-0">
              <TabsContent value="overview" className="p-4 h-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Connection Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Internet</span>
                          {connectionStatus.internet ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Wifi className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <WifiOff className="h-3 w-3 mr-1" />
                              Offline
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">WebSocket</span>
                          {connectionStatus.websocket ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Disconnected
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">API</span>
                          {connectionStatus.api ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Database className="h-3 w-3 mr-1" />
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unavailable
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Message Queue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Pending Messages</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              pendingMessages.length > 0
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-green-50 text-green-700 border-green-200",
                            )}
                          >
                            {pendingMessages.length}
                          </Badge>
                        </div>
                        {pendingMessages.length > 0 && (
                          <Button size="sm" variant="outline" onClick={onRetryAll} className="w-full">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry All
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">API Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Average Response Time</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              averageApiTime < 300
                                ? "bg-green-50 text-green-700 border-green-200"
                                : averageApiTime < 1000
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200",
                            )}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {averageApiTime.toFixed(0)}ms
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Success Rate</span>
                          <Badge
                            variant="outline"
                            className={cn(
                              apiCalls.length === 0
                                ? "bg-gray-50 text-gray-700 border-gray-200"
                                : successfulApiCalls.length / apiCalls.length > 0.9
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : successfulApiCalls.length / apiCalls.length > 0.7
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-red-50 text-red-700 border-red-200",
                            )}
                          >
                            {apiCalls.length === 0
                              ? "N/A"
                              : `${((successfulApiCalls.length / apiCalls.length) * 100).toFixed(0)}%`}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Recent Errors</h3>
                    {failedApiCalls.length > 0 ? (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {failedApiCalls.slice(0, 5).map((call) => (
                            <div key={call.id} className="p-2 border rounded-md bg-red-50 text-red-900 text-xs">
                              <div className="font-medium">
                                {call.method} {call.url}
                              </div>
                              <div>Status: {call.status}</div>
                              <div>{call.error?.message || "Unknown error"}</div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground text-sm">No errors detected</div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClearLogs}>
                      Clear Logs
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="network" className="p-4 h-full">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {apiCalls.map((call) => (
                      <div
                        key={call.id}
                        className={cn(
                          "p-3 border rounded-md text-xs",
                          call.status >= 400
                            ? "bg-red-50 border-red-200"
                            : call.status >= 300
                              ? "bg-yellow-50 border-yellow-200"
                              : "bg-green-50 border-green-200",
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium">
                            {call.method} {call.url}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{call.status}</Badge>
                            <Badge variant="outline">{call.duration}ms</Badge>
                          </div>
                        </div>
                        <div className="text-muted-foreground">{new Date(call.timestamp).toLocaleTimeString()}</div>
                        <details className="mt-2">
                          <summary className="cursor-pointer">Details</summary>
                          <div className="mt-2 space-y-2">
                            <div>
                              <div className="font-medium">Request:</div>
                              <pre className="bg-background p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(call.request, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <div className="font-medium">Response:</div>
                              <pre className="bg-background p-2 rounded-md overflow-x-auto">
                                {JSON.stringify(call.response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="messages" className="p-4 h-full">
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {messages.map((message) => (
                      <div key={message.id} className="p-3 border rounded-md text-xs">
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-medium">{message.sender.fullname}</div>
                          <Badge variant="outline">{message.status}</Badge>
                        </div>
                        <div>{message.content}</div>
                        <div className="text-muted-foreground mt-1">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="performance" className="p-4 h-full">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] flex items-center justify-center">
                        <p className="text-muted-foreground">Memory usage data not available in browser environment</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Render Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Messages Rendered</span>
                          <Badge variant="outline">{messages.length}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">API Calls</span>
                          <Badge variant="outline">{apiCalls.length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
