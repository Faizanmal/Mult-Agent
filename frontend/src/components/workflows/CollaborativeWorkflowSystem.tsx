'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  MessageSquare,
  Share2,
  UserPlus,
  Video,
  Phone,
  Send,
  Paperclip,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
  History,
  Lock,
  Unlock,
  Activity
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  status: 'online' | 'offline' | 'away'
  lastActive: string
  permissions: string[]
}

interface Comment {
  id: string
  authorId: string
  authorName: string
  content: string
  timestamp: string
  replies?: Comment[]
  resolved: boolean
  nodeId?: string
}

interface WorkflowActivity {
  id: string
  userId: string
  userName: string
  action: string
  description: string
  timestamp: string
  type: 'edit' | 'comment' | 'share' | 'execute'
}

interface CollaborativeWorkflowSystemProps {
  workflowId: string
  currentUserId: string
  onCollaborationUpdate?: (data: unknown) => void
}

const CollaborativeWorkflowSystem: React.FC<CollaborativeWorkflowSystemProps> = ({
  workflowId,
  currentUserId,
  onCollaborationUpdate
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: '/api/placeholder/32/32',
      role: 'owner',
      status: 'online',
      lastActive: 'Active now',
      permissions: ['read', 'write', 'delete', 'share']
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: 'editor',
      status: 'online',
      lastActive: '2 minutes ago',
      permissions: ['read', 'write', 'comment']
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      role: 'viewer',
      status: 'away',
      lastActive: '15 minutes ago',
      permissions: ['read', 'comment']
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david@example.com',
      role: 'editor',
      status: 'offline',
      lastActive: '2 hours ago',
      permissions: ['read', 'write', 'comment']
    }
  ])

  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      authorId: '2',
      authorName: 'Bob Smith',
      content: 'Should we add error handling to the API call node?',
      timestamp: '10 minutes ago',
      resolved: false,
      nodeId: 'api_call_1'
    },
    {
      id: '2',
      authorId: '3',
      authorName: 'Carol Davis',
      content: 'The workflow looks good overall. Performance seems optimal.',
      timestamp: '1 hour ago',
      resolved: true
    }
  ])

  const [activities, setActivities] = useState<WorkflowActivity[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Bob Smith',
      action: 'edited',
      description: 'Modified the API call configuration',
      timestamp: '5 minutes ago',
      type: 'edit'
    },
    {
      id: '2',
      userId: '3',
      userName: 'Carol Davis',
      action: 'commented',
      description: 'Added a comment on node optimization',
      timestamp: '1 hour ago',
      type: 'comment'
    },
    {
      id: '3',
      userId: '1',
      userName: 'Alice Johnson',
      action: 'executed',
      description: 'Ran the workflow successfully',
      timestamp: '2 hours ago',
      type: 'execute'
    }
  ])

  const [newComment, setNewComment] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('viewer')
  const [isLocked, setIsLocked] = useState(false)
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    // Simulate real-time updates
    if (realTimeEnabled) {
      const interval = setInterval(() => {
        // Simulate new activity
        if (Math.random() > 0.7) {
          const newActivity: WorkflowActivity = {
            id: `activity_${Date.now()}`,
            userId: teamMembers[Math.floor(Math.random() * teamMembers.length)].id,
            userName: teamMembers[Math.floor(Math.random() * teamMembers.length)].name,
            action: 'viewed',
            description: 'Viewed the workflow',
            timestamp: 'Just now',
            type: 'edit'
          }
          
          setActivities(prev => [newActivity, ...prev.slice(0, 9)])
        }
      }, 10000)

      return () => clearInterval(interval)
    }
  }, [realTimeEnabled, teamMembers])

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      authorId: currentUserId,
      authorName: 'Current User',
      content: newComment,
      timestamp: 'Just now',
      resolved: false
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')

    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted successfully',
    })
  }

  const inviteMember = () => {
    if (!newMemberEmail.trim()) return

    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: selectedRole as any,
      status: 'offline',
      lastActive: 'Never',
      permissions: selectedRole === 'owner' ? ['read', 'write', 'delete', 'share'] :
                  selectedRole === 'editor' ? ['read', 'write', 'comment'] :
                  ['read', 'comment']
    }

    setTeamMembers(prev => [...prev, newMember])
    setNewMemberEmail('')

    toast({
      title: 'Invitation Sent',
      description: `Invitation sent to ${newMemberEmail}`,
    })
  }

  const toggleCommentResolution = (commentId: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, resolved: !comment.resolved }
          : comment
      )
    )
  }

  const updateMemberRole = (memberId: string, newRole: string) => {
    setTeamMembers(prev => 
      prev.map(member => 
        member.id === memberId 
          ? { 
              ...member, 
              role: newRole as any,
              permissions: newRole === 'owner' ? ['read', 'write', 'delete', 'share'] :
                          newRole === 'editor' ? ['read', 'write', 'comment'] :
                          ['read', 'comment']
            }
          : member
      )
    )

    toast({
      title: 'Role Updated',
      description: `Member role updated to ${newRole}`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'editor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Collaborative Workspace
          </h2>
          <p className="text-muted-foreground">
            Real-time collaboration and team workflow management
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsLocked(!isLocked)}
            className={isLocked ? 'text-red-600' : 'text-green-600'}
          >
            {isLocked ? <Lock className="w-4 h-4 mr-2" /> : <Unlock className="w-4 h-4 mr-2" />}
            {isLocked ? 'Locked' : 'Unlocked'}
          </Button>
          
          <Button size="sm" variant="outline">
            <Video className="w-4 h-4 mr-2" />
            Start Meeting
          </Button>
          
          <Button size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          {/* Team Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{teamMembers.length}</p>
                    <p className="text-xs text-muted-foreground">Team Members</p>
                  </div>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {teamMembers.filter(m => m.status === 'online').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Online Now</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{activities.length}</p>
                    <p className="text-xs text-muted-foreground">Recent Activities</p>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add Member Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Invite Team Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={inviteMember}>Invite</Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Members List */}
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <Card key={member.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(member.status)} border-2 border-white`} />
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{member.name}</h4>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getRoleColor(member.role)}>
                            {member.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {member.lastActive}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select
                        value={member.role}
                        onValueChange={(value) => updateMemberRole(member.id, value)}
                        disabled={member.id === currentUserId}
                      >
                        <SelectTrigger className="w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button size="sm" variant="ghost">
                        <Phone className="w-4 h-4" />
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {/* New Comment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts about this workflow..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach File
                  </Button>
                  <Button onClick={addComment}>
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className={comment.resolved ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {comment.authorName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-sm">{comment.authorName}</h5>
                            <span className="text-xs text-muted-foreground">
                              {comment.timestamp}
                            </span>
                            {comment.nodeId && (
                              <Badge variant="outline" className="text-xs">
                                Node: {comment.nodeId}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleCommentResolution(comment.id)}
                        >
                          {comment.resolved ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                        </Button>
                        
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Track all team activities and workflow changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={activity.id}>
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            {activity.userName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.userName}</span>
                            {' '}
                            <span className="text-muted-foreground">{activity.action}</span>
                            {' '}
                            <span>{activity.description}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {activity.type}
                        </Badge>
                      </div>
                      
                      {index < activities.length - 1 && (
                        <Separator className="my-3" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collaboration Settings</CardTitle>
              <CardDescription>
                Configure collaboration preferences and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Real-time Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable live collaboration and activity updates
                    </p>
                  </div>
                  <Button
                    variant={realTimeEnabled ? "default" : "outline"}
                    onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  >
                    {realTimeEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Default Member Role</Label>
                  <Select defaultValue="viewer">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Notification Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-notifications" defaultChecked />
                      <label htmlFor="email-notifications" className="text-sm">
                        Email notifications for comments
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="workflow-changes" defaultChecked />
                      <label htmlFor="workflow-changes" className="text-sm">
                        Notify on workflow changes
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="execution-alerts" />
                      <label htmlFor="execution-alerts" className="text-sm">
                        Execution status alerts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CollaborativeWorkflowSystem