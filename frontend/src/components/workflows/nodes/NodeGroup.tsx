'use client'

import React, { memo, useState } from 'react'
import { NodeProps } from 'reactflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  Settings, 
  FolderOpen, 
  FolderClosed,
  Plus,
  Minus
} from 'lucide-react'

interface NodeGroupData {
  label: string
  description?: string
  childNodes: string[]
  isCollapsed: boolean
  groupType: 'container' | 'sequence' | 'parallel' | 'conditional'
  status?: 'idle' | 'running' | 'completed' | 'failed'
  color?: string
}

const NodeGroup: React.FC<NodeProps<NodeGroupData>> = ({ 
  data, 
  selected
}) => {
  const [localCollapsed, setLocalCollapsed] = useState(data.isCollapsed)
  
  const getGroupIcon = () => {
    if (localCollapsed) {
      return <FolderClosed className="w-4 h-4" />
    }
    return <FolderOpen className="w-4 h-4" />
  }
  
  const getStatusColor = () => {
    switch (data.status) {
      case 'running': return 'border-blue-500 bg-blue-50'
      case 'completed': return 'border-green-500 bg-green-50'
      case 'failed': return 'border-red-500 bg-red-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }
  
  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLocalCollapsed(!localCollapsed)
    // This would trigger a callback to update the parent workflow
  }

  return (
    <div 
      className={`min-w-[250px] ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{ 
        backgroundColor: data.color ? `${data.color}10` : undefined,
        borderColor: data.color,
      }}
    >
      <Card className={`shadow-lg border-2 ${getStatusColor()} transition-all duration-200`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="h-6 w-6 p-0"
              >
                {localCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </Button>
              
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                {getGroupIcon()}
              </div>
              
              <div>
                <CardTitle className="text-sm font-semibold">{data.label}</CardTitle>
                <div className="text-xs text-muted-foreground">
                  {data.groupType} • {data.childNodes.length} nodes
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                Group
              </Badge>
              
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {data.description && !localCollapsed && (
            <div className="text-xs text-muted-foreground mt-2">
              {data.description}
            </div>
          )}
        </CardHeader>
        
        {!localCollapsed && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Group Configuration */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Type:</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {data.groupType}
                </Badge>
              </div>
              
              {/* Child Nodes List */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2">
                  Child Nodes ({data.childNodes.length})
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {data.childNodes.map((nodeId, index) => (
                    <div 
                      key={nodeId}
                      className="flex items-center justify-between px-2 py-1 rounded bg-background/50 text-xs"
                    >
                      <span>Node {index + 1}</span>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <Minus className="w-2 h-2" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 h-6 text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Node
                </Button>
              </div>
              
              {/* Group Actions */}
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1 h-6 text-xs">
                  Configure
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-6 text-xs">
                  Ungroup
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default memo(NodeGroup)