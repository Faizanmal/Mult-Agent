'use client'

import React from 'react'
import { EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from 'reactflow'
import { Badge } from '@/components/ui/badge'

interface CustomEdgeData {
  label?: string
  condition?: string
  weight?: number
  status?: 'active' | 'inactive' | 'success' | 'failure'
  executionCount?: number
  dataFlow?: {
    type: string
    size: number
  }
}

const CustomEdge: React.FC<EdgeProps<CustomEdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
  selected
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const getEdgeColor = () => {
    switch (data?.status) {
      case 'active': return '#3b82f6'
      case 'success': return '#10b981' 
      case 'failure': return '#ef4444'
      case 'inactive': return '#9ca3af'
      default: return '#6b7280'
    }
  }

  const getEdgeWidth = () => {
    if (data?.weight) {
      return Math.max(2, Math.min(8, data.weight * 2))
    }
    return selected ? 3 : 2
  }

  const getAnimationClass = () => {
    if (data?.status === 'active') {
      return 'animate-pulse'
    }
    return ''
  }

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: getEdgeColor(),
          strokeWidth: getEdgeWidth(),
          strokeDasharray: data?.condition ? '5,5' : 'none',
        }}
        className={`fill-none ${getAnimationClass()} transition-all duration-200`}
        d={edgePath}
        markerEnd={markerEnd}
      />
      
      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {(data?.label || data?.condition || data?.executionCount || data?.dataFlow) && (
            <div className="flex flex-col items-center space-y-1">
              {/* Main Label */}
              {(data?.label || data?.condition) && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-white/90 backdrop-blur-sm border shadow-sm"
                >
                  {data?.label || data?.condition}
                </Badge>
              )}
              
              {/* Execution Count */}
              {data?.executionCount && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-white/90 backdrop-blur-sm"
                >
                  {data.executionCount}x
                </Badge>
              )}
              
              {/* Data Flow Info */}
              {data?.dataFlow && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-blue-50/90 backdrop-blur-sm text-blue-700 border-blue-200"
                >
                  {data.dataFlow.type}: {data.dataFlow.size}kb
                </Badge>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

export default CustomEdge