"use client";

import { useState } from 'react';
import { EnhancedAgentPanel } from '@/components/agents/EnhancedAgentPanel';
import OrchestrationPanel from '@/components/orchestration/OrchestrationPanel';
import TaskTemplates from '@/components/tasks/TaskTemplates';
import { EnhancedChatInterface } from '@/components/chat/EnhancedChatInterface';
import { ChatStorage } from '@/components/chat/ChatStorage';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PanelLeftClose, PanelLeftOpen, MessageSquare, Users, BarChart3 } from 'lucide-react';

export default function MainWorkspace() {
  const [showSidebar, setShowSidebar] = useState(true);

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Main Content Area */}
        <div className={`${showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col space-y-6`}>
          {/* Main Workspace Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Multi-Agent Workspace
              </CardTitle>
              <CardDescription>
                Interact with AI agents, manage tasks, and monitor performance in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mx-6 mt-6">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat Interface
                  </TabsTrigger>
                  <TabsTrigger value="agents" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Agent Management
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="chat" className="p-6 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Chat Interface */}
                    <EnhancedChatInterface className="h-[600px]" />
                    
                    {/* Chat Storage & History */}
                    <ChatStorage />
                  </div>
                </TabsContent>
                
                <TabsContent value="agents" className="p-6 pt-4">
                  {/* Enhanced Agent Panel */}
                  <EnhancedAgentPanel />
                </TabsContent>
                
                <TabsContent value="analytics" className="p-6 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Task Templates */}
                    <TaskTemplates />
                    
                    {/* Performance Overview */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Overview</CardTitle>
                        <CardDescription>System metrics and agent performance</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Total Messages Processed</span>
                            <span className="font-bold">1,247</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Average Response Time</span>
                            <span className="font-bold">185ms</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Success Rate</span>
                            <span className="font-bold">98.7%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Active Sessions</span>
                            <span className="font-bold">12</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <div className="lg:col-span-1">
            <OrchestrationPanel />
          </div>
        )}

        {/* Sidebar Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="fixed top-1/2 right-4 z-10 lg:block hidden"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}